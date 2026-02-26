import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  MapPin,
  Eye,
  MoreHorizontal,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Brain,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useComplaints, useUpdateComplaintStatus, useAssignDepartment } from "@/hooks/useComplaints";
import { useDepartments } from "@/hooks/useDepartments";
import { complaints as mockComplaints, departments as mockDepts } from "@/lib/mockData";
import type { ApiComplaint } from "@/lib/api";

// ─── Normalised complaint shape ───────────────────────────────────────────────
type AdminComplaint = {
  _apiId:       string;
  id:           string;
  title:        string;
  category:     string;
  status:       string;
  priority:     string;
  city:         string;
  district:     string;
  reporterName: string;
  aiConfidence: number;
  department:   string | null;
  isDuplicate:  boolean;
  upvotes:      number;
  date:         string;
  description:  string;
};

function fromApi(c: ApiComplaint): AdminComplaint {
  return {
    _apiId:       c.id,
    id:           c.refId ?? c.id,
    title:        c.title,
    category:     c.category,
    status:       c.status,
    priority:     c.priority,
    city:         c.city,
    district:     c.district,
    reporterName: c.reporter.name,
    aiConfidence: c.aiConfidence,
    department:   c.department?.name ?? null,
    isDuplicate:  c.isDuplicate,
    upvotes:      c.upvotes,
    date:         new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    description:  "",
  };
}

function fromMock(c: typeof mockComplaints[0]): AdminComplaint {
  return {
    _apiId:       c.id,
    id:           c.id,
    title:        c.title,
    category:     c.category,
    status:       c.status,
    priority:     c.priority,
    city:         c.location.city,
    district:     c.location.district,
    reporterName: c.reporter.name,
    aiConfidence: c.aiConfidence,
    department:   c.department ?? null,
    isDuplicate:  c.isDuplicate,
    upvotes:      c.upvotes,
    date:         c.date,
    description:  c.description,
  };
}

// ─── Badge helpers ────────────────────────────────────────────────────────────
const priorityCls: Record<string, string> = {
  high:   "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low:    "bg-green-100 text-green-700",
};
const statusCls: Record<string, string> = {
  reported:      "bg-gray-100 text-gray-600",
  pending:       "bg-yellow-100 text-yellow-700",
  assigned:      "bg-blue-100 text-blue-700",
  "in-progress": "bg-sky-100 text-sky-700",
  resolved:      "bg-green-100 text-green-700",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  // ── API hooks ──
  const { data: complaintsData } = useComplaints();
  const { data: deptsData }      = useDepartments();
  const updateStatus             = useUpdateComplaintStatus();
  const assignDept               = useAssignDepartment();

  // ── Data source: API when available, mockData otherwise ──
  const baseComplaints: AdminComplaint[] = useMemo(
    () => complaintsData?.data
      ? complaintsData.data.map(fromApi)
      : mockComplaints.map(fromMock),
    [complaintsData],
  );

  const deptList: string[] = useMemo(
    () => deptsData?.data
      ? deptsData.data.map((d) => d.name)
      : mockDepts,
    [deptsData],
  );

  // ── Local optimistic overrides ──
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [deptOverrides,   setDeptOverrides]   = useState<Record<string, string>>({});

  const allComplaints: AdminComplaint[] = useMemo(
    () => baseComplaints.map((c) => ({
      ...c,
      status:     statusOverrides[c.id] ?? c.status,
      department: deptOverrides[c.id]   !== undefined ? deptOverrides[c.id] : c.department,
    })),
    [baseComplaints, statusOverrides, deptOverrides],
  );

  // ── Mutation wrappers: optimistic + API ──
  const handleSetStatus = (c: AdminComplaint, status: string) => {
    setStatusOverrides((prev) => ({ ...prev, [c.id]: status }));
    updateStatus.mutate({ id: c._apiId, status }, { onError: () => { /* optimistic already applied */ } });
  };

  const handleAssignDept = (c: AdminComplaint, deptName: string) => {
    setDeptOverrides((prev) => ({ ...prev, [c.id]: deptName }));
    // find dept id from API data if available
    const deptId = deptsData?.data?.find((d) => d.name === deptName)?.id ?? deptName;
    assignDept.mutate({ id: c._apiId, departmentId: deptId }, { onError: () => { /* optimistic already applied */ } });
  };

  // ── Filters ──
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaint | null>(null);
  const [assignDeptValue,   setAssignDeptValue]   = useState<string>("");
  const [searchQuery,       setSearchQuery]       = useState("");
  const [filterStatus,      setFilterStatus]      = useState("all");
  const [filterPriority,    setFilterPriority]    = useState("all");
  const [filterCategory,    setFilterCategory]    = useState("all");
  const [filterDept,        setFilterDept]        = useState("all");
  const [activeTab,         setActiveTab]         = useState<"table" | "analytics">("table");

  const filtered = useMemo(
    () => allComplaints.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.title.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.reporterName.toLowerCase().includes(q);
      const matchesStatus   = filterStatus   === "all" || c.status   === filterStatus;
      const matchesPriority = filterPriority === "all" || c.priority === filterPriority;
      const matchesCategory = filterCategory === "all" || c.category === filterCategory;
      const matchesDept     =
        filterDept === "all" ||
        c.department === filterDept ||
        (filterDept === "unassigned" && !c.department);
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDept;
    }),
    [allComplaints, searchQuery, filterStatus, filterPriority, filterCategory, filterDept],
  );

  // ── Derived stats ──
  const totalComplaints = allComplaints.length;
  const pendingReview   = allComplaints.filter((c) => c.status === "pending" || c.status === "reported").length;
  const resolved        = allComplaints.filter((c) => c.status === "resolved").length;
  const activeCitizens  = new Set(mockComplaints.map((c) => c.reporter.userId)).size;
  const avgAiScore      = Math.round(allComplaints.reduce((a, c) => a + c.aiConfidence, 0) / (allComplaints.length || 1));

  const adminStats = [
    { label: "Total Complaints", value: totalComplaints, icon: AlertTriangle, change: "+5",  color: "text-primary" },
    { label: "Pending Review",   value: pendingReview,   icon: Clock,         change: "+3",  color: "text-yellow-600" },
    { label: "Resolved",         value: resolved,        icon: CheckCircle2,  change: "+2",  color: "text-green-600" },
    { label: "Active Citizens",  value: activeCitizens,  icon: Users,         change: `+${activeCitizens}`, color: "text-sky-600" },
  ];

  // ── Chart data ──
  const catCount = (cat: string) => allComplaints.filter((c) => c.category === cat).length;
  const barData = [
    { name: "Roads",    count: catCount("roads") },
    { name: "Water",    count: catCount("water") },
    { name: "Garbage",  count: catCount("garbage") },
    { name: "Lighting", count: catCount("lighting") },
    { name: "Drainage", count: catCount("drainage") },
    { name: "Other",    count: catCount("other") },
  ];
  const pieData = [
    { name: "Resolved",    value: allComplaints.filter((c) => c.status === "resolved").length,    color: "#22c55e" },
    { name: "In Progress", value: allComplaints.filter((c) => c.status === "in-progress").length, color: "#0ea5e9" },
    { name: "Assigned",    value: allComplaints.filter((c) => c.status === "assigned").length,    color: "#3b82f6" },
    { name: "Pending",     value: allComplaints.filter((c) => c.status === "pending").length,     color: "#f59e0b" },
    { name: "Reported",    value: allComplaints.filter((c) => c.status === "reported").length,    color: "#9ca3af" },
  ];
  const cityCount: Record<string, number> = {};
  allComplaints.forEach((c) => { cityCount[c.city] = (cityCount[c.city] ?? 0) + 1; });
  const cityData = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([city, count]) => ({ city, count }));

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Tamil Nadu Civic Complaint Management — {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 text-xs">
                <Brain className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-primary">AI Avg. Confidence: {avgAiScore}%</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {adminStats.map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-success mt-0.5">{stat.change} this week</p>
                  </div>
                  <div className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("table")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "table" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              Complaints Table
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === "analytics" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              <BarChart2 className="h-4 w-4" /> Analytics
            </button>
          </div>

          {activeTab === "table" && (
            <div className="bg-card border border-border rounded-xl">
              {/* Filters */}
              <div className="p-5 border-b border-border flex flex-col sm:flex-row gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, city, reporter"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36 bg-background">
                    <Filter className="h-4 w-4 mr-1.5" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-36 bg-background">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-36 bg-background">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="roads">Roads</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="garbage">Garbage</SelectItem>
                    <SelectItem value="lighting">Lighting</SelectItem>
                    <SelectItem value="drainage">Drainage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger className="w-40 bg-background">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {deptList.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="self-center">{filtered.length} results</Badge>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AI%</TableHead>
                      <TableHead>Dept.</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id} className="cursor-pointer hover:bg-muted/30">
                        <TableCell className="font-mono text-xs">{c.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm max-w-[200px] truncate">{c.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{c.category}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {c.city}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{c.reporterName}</TableCell>
                        <TableCell>
                          <Badge className={`capitalize text-xs ${priorityCls[c.priority]}`}>{c.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize text-xs ${statusCls[c.status]}`}>{c.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-primary font-semibold text-sm">{c.aiConfidence}%</span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {c.department ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => { setSelectedComplaint(c); setAssignDeptValue(c.department ?? ""); }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card">
                                <DropdownMenuItem onClick={() => { setSelectedComplaint(c); setAssignDeptValue(c.department ?? ""); }}>
                                  Assign Department
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSetStatus(c, "in-progress")}
                                  disabled={c.status === "in-progress" || c.status === "resolved"}
                                >
                                  Set In-Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleSetStatus(c, "resolved")}
                                  disabled={c.status === "resolved"}
                                >
                                  Mark Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Mark as Spam</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="grid lg:grid-cols-2 gap-6">

              {/* Category bar chart */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Complaints by Category</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status pie chart */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Status Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={75}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* City volume */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Top Cities by Complaint Volume</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={cityData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 60 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="city" type="category" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Stats */}
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">AI Pipeline Statistics</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Avg. Classification Confidence", value: `${avgAiScore}%`,                                                                                         sub: "Based on all reports" },
                    { label: "Duplicate Detection Rate",       value: `${Math.round((allComplaints.filter((c) => c.isDuplicate).length / (allComplaints.length || 1)) * 100)}%`, sub: "Duplicates found" },
                    { label: "Auto-routed to Departments",     value: `${allComplaints.filter((c) => c.department !== null).length}/${allComplaints.length}`,                    sub: "AI department routing" },
                    { label: "High Priority AI Flags",         value: `${allComplaints.filter((c) => c.priority === "high").length}`,                                           sub: "Urgent issues identified" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{stat.label}</p>
                        <p className="text-xs text-muted-foreground">{stat.sub}</p>
                      </div>
                      <p className="text-xl font-bold text-primary">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Complaint Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Complaint Details</span>
              {selectedComplaint && <Badge variant="outline" className="font-mono text-xs">{selectedComplaint.id}</Badge>}
            </DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedComplaint.title}</h4>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge className={`capitalize text-xs ${priorityCls[selectedComplaint.priority]}`}>{selectedComplaint.priority} priority</Badge>
                  <Badge className={`capitalize text-xs ${statusCls[selectedComplaint.status]}`}>{selectedComplaint.status}</Badge>
                  <Badge variant="outline" className="text-xs text-primary">AI: {selectedComplaint.aiConfidence}%</Badge>
                </div>
              </div>

              {selectedComplaint.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedComplaint.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{selectedComplaint.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reporter</p>
                  <p className="font-medium">{selectedComplaint.reporterName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedComplaint.city}, {selectedComplaint.district}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedComplaint.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Upvotes</p>
                  <p className="font-medium">{selectedComplaint.upvotes}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duplicate</p>
                  <p className={`font-medium ${selectedComplaint.isDuplicate ? "text-warning" : "text-success"}`}>
                    {selectedComplaint.isDuplicate ? "Yes" : "None"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Assign to Department</p>
                <Select
                  value={assignDeptValue || undefined}
                  onValueChange={(v) => {
                    setAssignDeptValue(v);
                    handleAssignDept(selectedComplaint, v);
                  }}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {deptList.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedComplaint(null)}>Close</Button>
                <Button
                  className="flex-1 bg-success hover:bg-success/90"
                  disabled={selectedComplaint.status === "resolved"}
                  onClick={() => {
                    handleSetStatus(selectedComplaint, "resolved");
                    setSelectedComplaint(null);
                  }}
                >
                  {selectedComplaint.status === "resolved" ? "Already Resolved" : "Mark Resolved"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
