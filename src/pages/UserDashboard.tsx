import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Bell,
  User,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Calendar,
  ChevronRight,
  Plus,
  Brain,
  TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useMyComplaints } from "@/hooks/useComplaints";
import { complaints as mockComplaints, getComplaintsForUser } from "@/lib/mockData";
import type { ApiComplaintDetail } from "@/lib/api";

const sidebarItems = [
  { icon: FileText, label: "My Reports",     path: "/dashboard" },
  { icon: Bell,     label: "Notifications",  path: "/dashboard/notifications" },
  { icon: User,     label: "Profile",        path: "/dashboard/profile" },
  { icon: Settings, label: "Settings",       path: "/dashboard/settings" },
];

const statusClass: Record<string, string> = {
  reported:      "bg-muted text-muted-foreground",
  pending:       "bg-yellow-100 text-yellow-700",
  assigned:      "bg-blue-100 text-blue-700",
  "in-progress": "bg-sky-100 text-sky-700",
  resolved:      "bg-green-100 text-green-700",
};

const priorityClass: Record<string, string> = {
  high:   "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low:    "bg-green-100 text-green-700",
};

// Shape that works for both API and mock data
type ReportItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  date?: string;
  location: { city: string; district: string; address: string };
  description: string;
  department?: string | null;
  aiConfidence?: number;
  statusHistory: { status: string; date?: string; note?: string; createdAt?: string }[];
};

function apiToReportItem(c: ApiComplaintDetail): ReportItem {
  return {
    id: c.refId ?? c.id,
    title: c.title,
    status: c.status,
    priority: c.priority,
    category: c.category,
    date: new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    location: { city: c.city, district: c.district, address: c.address },
    description: c.description,
    department: c.department?.name ?? null,
    aiConfidence: c.aiConfidence,
    statusHistory: c.statusHistory.map((h) => ({
      status: h.status,
      date: new Date(h.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      note: h.note ?? "",
    })),
  };
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "reported" | "pending" | "assigned" | "in-progress" | "resolved">("all");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const { data: apiData, isLoading: apiLoading } = useMyComplaints();

  // Use API data if available, otherwise fall back to mock data for the demo user
  const fallbackUser = { name: "Arjun Ravi", email: "arjun@example.com", district: "Chennai" };
  const displayUser = user
    ? { name: user.name, email: user.email, district: user.district ?? "Tamil Nadu" }
    : fallbackUser;

  const myReports: ReportItem[] = apiData?.data
    ? apiData.data.map(apiToReportItem)
    : getComplaintsForUser("USR-001");

  const allTNComplaints = mockComplaints;

  const stats = [
    { label: "Total Reports",  value: myReports.length,                                       icon: FileText,     color: "bg-primary/10 text-primary" },
    { label: "In Progress",    value: myReports.filter((r) => r.status === "in-progress").length, icon: Loader2,  color: "bg-sky-100 text-sky-600" },
    { label: "Resolved",       value: myReports.filter((r) => r.status === "resolved").length, icon: CheckCircle2, color: "bg-green-100 text-green-600" },
    { label: "Reported",       value: myReports.filter((r) => r.status === "reported").length, icon: AlertCircle, color: "bg-yellow-100 text-yellow-600" },
  ];

  const displayed = activeTab === "all"
    ? myReports
    : myReports.filter((r) => r.status === activeTab);

  const tabs = ["all", "reported", "pending", "assigned", "in-progress", "resolved"] as const;

  if (apiLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="flex-1 flex">

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-60" : "w-16"} bg-card border-r border-border transition-all duration-200 hidden md:block`}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6 mt-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm truncate">{displayUser.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayUser.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayUser.district}, TN</p>
                </div>
              )}
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-colors hover:bg-muted ${item.path === "/dashboard" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6">
              <Button
                className="w-full gap-2"
                size="sm"
                onClick={() => navigate("/report")}
              >
                <Plus className="h-4 w-4" />
                {sidebarOpen && "New Report"}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">My Dashboard</h1>
                <p className="text-muted-foreground text-sm">Welcome back, {displayUser.name.split(" ")[0]} — {displayUser.district} District, Tamil Nadu</p>
              </div>
              <Button onClick={() => navigate("/report")} className="gap-2 hidden sm:flex">
                <Plus className="h-4 w-4" /> Report Issue
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex gap-3 items-start">
              <Brain className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm mb-1">AI Insights for your area</p>
                <p className="text-xs text-muted-foreground">
                  Roads & Potholes are the most reported category in Chennai this week (+34%). Your report{" "}
                  <strong>#FIX-2026-001</strong> has been upvoted by 34 residents and flagged as high-priority.
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary/60 flex-shrink-0 mt-0.5" />
            </div>

            {/* Reports List */}
            <div className="bg-card border border-border rounded-xl">
              <div className="p-5 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-semibold">My Reports</h2>
                <div className="flex gap-1 flex-wrap">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                    >
                      {tab === "all"
                        ? `All (${myReports.length})`
                        : `${tab} (${myReports.filter((r) => r.status === tab).length})`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-border">
                {displayed.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground text-sm">No reports found</div>
                ) : (
                  displayed.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 hover:bg-muted/40 cursor-pointer transition-colors"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs text-muted-foreground font-mono">{report.id}</span>
                            <Badge className={`text-xs capitalize ${statusClass[report.status]}`}>{report.status}</Badge>
                            <Badge className={`text-xs capitalize ${priorityClass[report.priority]}`}>{report.priority}</Badge>
                          </div>
                          <p className="font-medium text-sm truncate">{report.title}</p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {report.location.city}, TN
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" /> {report.date}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {report.category}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2.5">
                        {(() => {
                          const steps = ["reported", "pending", "assigned", "in-progress", "resolved"];
                          const idx = steps.indexOf(report.status);
                          const pct = ((idx + 1) / steps.length) * 100;
                          return (
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${report.status === "resolved" ? "bg-success" : "bg-primary"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent TN Activity */}
            <div className="mt-6 bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-4">Recent Activity — Tamil Nadu</h3>
              <div className="space-y-2">
                {allTNComplaints.slice(0, 6).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 text-sm">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      c.status === "resolved" ? "bg-success" :
                      c.status === "in-progress" ? "bg-info" :
                      "bg-warning"
                    }`} />
                    <p className="flex-1 truncate text-muted-foreground">
                      <span className="text-foreground font-medium">{c.location.city}</span> — {c.title}
                    </p>
                    <Badge className={`text-[10px] capitalize flex-shrink-0 ${statusClass[c.status] ?? ""}`}>{c.status}</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => navigate("/map")}>
                View All on Map
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Report Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Report Details</span>
              {selectedReport && <Badge variant="outline" className="font-mono text-xs">{selectedReport.id}</Badge>}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedReport.title}</h4>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge className={`capitalize text-xs ${statusClass[selectedReport.status]}`}>{selectedReport.status}</Badge>
                  <Badge className={`capitalize text-xs ${priorityClass[selectedReport.priority]}`}>{selectedReport.priority} priority</Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{selectedReport.description}</p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Category</p>
                  <p className="font-medium capitalize">{selectedReport.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Date Reported</p>
                  <p className="font-medium">{selectedReport.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                  <p className="font-medium">{selectedReport.location.address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">City / District</p>
                  <p className="font-medium">{selectedReport.location.city}, {selectedReport.location.district}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Department</p>
                  <p className="font-medium">{selectedReport.department ?? "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">AI Confidence</p>
                  <p className="font-medium text-primary">{selectedReport.aiConfidence}%</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Status History</p>
                <div className="space-y-2">
                  {selectedReport.statusHistory.map((h, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${i === selectedReport.statusHistory.length - 1 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      <div>
                        <p className="text-sm font-medium capitalize">{h.status}</p>
                        <p className="text-xs text-muted-foreground">{h.date} — {h.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setSelectedReport(null); navigate("/map"); }}>
                  View on Map
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
