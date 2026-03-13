import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatWidget } from "@/components/ChatWidget";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportIssue from "./pages/ReportIssue";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import MapView from "./pages/MapView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
          <Route path="/map" element={<MapView />} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/dashboard/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ChatWidget />
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
