import { useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  Eye,
  MoreHorizontal,
  ChevronDown,
  X,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
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

const adminStats = [
  { label: "Total Complaints", value: 1248, icon: AlertTriangle, change: "+12%", color: "text-primary" },
  { label: "Pending Review", value: 89, icon: Clock, change: "-5%", color: "text-warning" },
  { label: "Resolved Today", value: 34, icon: CheckCircle2, change: "+18%", color: "text-success" },
  { label: "Active Citizens", value: 3421, icon: Users, change: "+8%", color: "text-info" },
];

const complaints = [
  {
    id: "CPL-5678",
    title: "Major road damage near school",
    category: "Roads",
    location: "456 School Road",
    reporter: "Jane Doe",
    priority: "high",
    status: "pending",
    date: "2024-01-15",
    department: null,
  },
  {
    id: "CPL-5677",
    title: "Water main leak",
    category: "Water",
    location: "789 Water Lane",
    reporter: "John Smith",
    priority: "high",
    status: "in-progress",
    date: "2024-01-15",
    department: "Water Dept.",
  },
  {
    id: "CPL-5676",
    title: "Street light outage",
    category: "Lighting",
    location: "123 Dark Avenue",
    reporter: "Bob Wilson",
    priority: "medium",
    status: "assigned",
    date: "2024-01-14",
    department: "Electrical",
  },
  {
    id: "CPL-5675",
    title: "Overflowing garbage bin",
    category: "Garbage",
    location: "321 Trash Street",
    reporter: "Alice Brown",
    priority: "low",
    status: "resolved",
    date: "2024-01-14",
    department: "Sanitation",
  },
  {
    id: "CPL-5674",
    title: "Blocked drainage",
    category: "Drainage",
    location: "555 Flood Road",
    reporter: "Charlie Green",
    priority: "medium",
    status: "in-progress",
    date: "2024-01-13",
    department: "Public Works",
  },
];

const departments = [
  "Roads Dept.",
  "Water Dept.",
  "Electrical",
  "Sanitation",
  "Public Works",
  "Parks & Rec",
];

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge className="status-badge priority-high">High</Badge>;
    case "medium":
      return <Badge className="status-badge priority-medium">Medium</Badge>;
    case "low":
      return <Badge className="status-badge priority-low">Low</Badge>;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="status-badge status-reported">Pending</Badge>;
    case "assigned":
      return <Badge className="status-badge bg-accent/10 text-accent">Assigned</Badge>;
    case "in-progress":
      return <Badge className="status-badge status-in-progress">In Progress</Badge>;
    case "resolved":
      return <Badge className="status-badge status-resolved">Resolved</Badge>;
    default:
      return null;
  }
};

export default function AdminDashboard() {
  const [selectedComplaint, setSelectedComplaint] = useState<typeof complaints[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage and track all civic complaints</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {adminStats.map((stat) => (
              <div key={stat.label} className="card-civic">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                    <p className={`text-xs mt-1 ${stat.change.startsWith("+") ? "text-success" : "text-destructive"}`}>
                      {stat.change} from last week
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Complaints Table */}
            <div className="lg:col-span-2 card-civic">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search complaints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] bg-background">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px] bg-background">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((complaint) => (
                      <TableRow key={complaint.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{complaint.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{complaint.title}</p>
                            <p className="text-xs text-muted-foreground">{complaint.category}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(complaint.priority)}</TableCell>
                        <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                        <TableCell>
                          {complaint.department || (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedComplaint(complaint)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card">
                                <DropdownMenuItem>Assign Department</DropdownMenuItem>
                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                                <DropdownMenuItem>View on Map</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Mark as Spam
                                </DropdownMenuItem>
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

            {/* Heatmap Panel */}
            <div className="card-civic">
              <h3 className="font-semibold mb-4">Issue Heatmap</h3>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Interactive heatmap</p>
                  <p className="text-xs">Showing issue density</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">High density areas</span>
                  <span className="font-medium text-destructive">5 zones</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Medium density</span>
                  <span className="font-medium text-warning">12 zones</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Low density</span>
                  <span className="font-medium text-success">28 zones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Complaint Detail Modal */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Complaint Details</span>
              <Badge variant="outline">{selectedComplaint?.id}</Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-lg">{selectedComplaint.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  {getPriorityBadge(selectedComplaint.priority)}
                  {getStatusBadge(selectedComplaint.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedComplaint.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reporter</p>
                  <p className="font-medium">{selectedComplaint.reporter}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedComplaint.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reported Date</p>
                  <p className="font-medium">{selectedComplaint.date}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">Assign to Department</p>
                <Select defaultValue={selectedComplaint.department || undefined}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  View on Map
                </Button>
                <Button variant="success" className="flex-1">
                  Mark Resolved
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
