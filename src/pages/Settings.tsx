import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Bell, Eye, LogOut, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLogoutMutation } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogoutMutation();
  const { toast } = useToast();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate("/"),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" size="sm" className="gap-1 mb-4" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>

          <h1 className="text-2xl font-bold mb-6">Settings</h1>

          {/* Notifications Settings */}
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Notification Preferences</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive updates about your complaints via email</p>
                </div>
                <button
                  onClick={() => { setEmailNotifs(!emailNotifs); toast({ title: `Email notifications ${!emailNotifs ? "enabled" : "disabled"}` }); }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifs ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifs ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get real-time alerts for status changes</p>
                </div>
                <button
                  onClick={() => { setPushNotifs(!pushNotifs); toast({ title: `Push notifications ${!pushNotifs ? "enabled" : "disabled"}` }); }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushNotifs ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifs ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Privacy</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Public Profile</Label>
                <p className="text-xs text-muted-foreground">Allow other citizens to see your name on reports</p>
              </div>
              <button
                onClick={() => { setPublicProfile(!publicProfile); toast({ title: `Public profile ${!publicProfile ? "enabled" : "disabled"}` }); }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${publicProfile ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${publicProfile ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-card border border-border rounded-xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Account</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium">{user?.role?.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">District</span>
                <span className="font-medium">{user?.district ?? "Not set"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-card border border-destructive/30 rounded-xl p-6">
            <h2 className="font-semibold text-destructive mb-3">Sign Out</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sign out of your Fix It Now account on this device.
            </p>
            <Button variant="destructive" className="gap-2" onClick={handleLogout} disabled={logout.isPending}>
              {logout.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
