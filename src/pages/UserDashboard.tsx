import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Bell,
  User,
  Settings,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sidebarItems = [
  { icon: FileText, label: "My Reports", path: "/dashboard" },
  { icon: Bell, label: "Notifications", path: "/dashboard/notifications" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const stats = [
  { label: "Total Reports", value: 12, icon: FileText, color: "bg-primary/10 text-primary" },
  { label: "In Progress", value: 4, icon: Loader2, color: "bg-info/10 text-info" },
  { label: "Resolved", value: 6, icon: CheckCircle2, color: "bg-success/10 text-success" },
  { label: "Pending", value: 2, icon: AlertCircle, color: "bg-warning/10 text-warning" },
];

const reports = [
  {
    id: "RPT-1234",
    title: "Large pothole on Main Street",
    category: "Roads",
    status: "in-progress",
    date: "2 hours ago",
    location: "123 Main St",
  },
  {
    id: "RPT-1233",
    title: "Broken street light",
    category: "Lighting",
    status: "resolved",
    date: "1 day ago",
    location: "45 Oak Avenue",
  },
  {
    id: "RPT-1232",
    title: "Garbage not collected",
    category: "Garbage",
    status: "reported",
    date: "2 days ago",
    location: "78 Park Road",
  },
  {
    id: "RPT-1231",
    title: "Water leakage from pipe",
    category: "Water",
    status: "in-progress",
    date: "3 days ago",
    location: "12 River Lane",
  },
  {
    id: "RPT-1230",
    title: "Drainage blocked",
    category: "Drainage",
    status: "resolved",
    date: "5 days ago",
    location: "99 Hill Street",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "reported":
      return <Badge className="status-badge status-reported">Reported</Badge>;
    case "in-progress":
      return <Badge className="status-badge status-in-progress">In Progress</Badge>;
    case "resolved":
      return <Badge className="status-badge status-resolved">Resolved</Badge>;
    default:
      return null;
  }
};

export default function UserDashboard() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-16"
          } bg-sidebar border-r border-sidebar-border transition-all duration-200 hidden md:block`}
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-sidebar-primary" />
              </div>
              {sidebarOpen && (
                <div>
                  <p className="font-medium text-sidebar-foreground">John Citizen</p>
                  <p className="text-xs text-sidebar-foreground/60">john@email.com</p>
                </div>
              )}
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold">My Dashboard</h1>
                <p className="text-muted-foreground">Track and manage your reported issues</p>
              </div>
              <Button asChild>
                <Link to="/report">+ New Report</Link>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="card-civic">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reports Timeline */}
            <div className="card-civic">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Recent Reports</h2>
                <Button variant="ghost" size="sm" className="text-accent">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {reports.map((report, index) => (
                  <div
                    key={report.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                  >
                    {/* Timeline dot */}
                    <div className="relative">
                      <div
                        className={`h-3 w-3 rounded-full mt-1.5 ${
                          report.status === "resolved"
                            ? "bg-success"
                            : report.status === "in-progress"
                            ? "bg-info"
                            : "bg-warning"
                        }`}
                      />
                      {index !== reports.length - 1 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-full bg-border" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">
                            {report.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground/80">{report.id}</span>
                            <span>•</span>
                            <span>{report.category}</span>
                            <span>•</span>
                            <span>{report.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {getStatusBadge(report.status)}
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {report.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
