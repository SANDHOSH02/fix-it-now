import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, MapPin, Phone, Save, Loader2, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi } from "@/lib/api";
import { tnDistricts } from "@/lib/mockData";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [district, setDistrict] = useState(user?.district ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({ name: name || undefined, phone: phone || undefined, district: district || undefined });
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch {
      toast({ title: "Update failed", description: "Could not save profile changes.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const roleBadge: Record<string, string> = {
    CITIZEN: "bg-blue-100 text-blue-700",
    ADMIN: "bg-amber-100 text-amber-700",
    SUPER_ADMIN: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" size="sm" className="gap-1 mb-4" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>

          <div className="bg-card border border-border rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{user?.name}</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge className={`mt-1 text-xs ${roleBadge[user?.role ?? "CITIZEN"]}`}>
                  {user?.role?.replace("_", " ")}
                </Badge>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                  <User className="h-3.5 w-3.5" /> Full Name
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
              </div>

              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input value={user?.email ?? ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone Number
                </Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="bg-background" />
              </div>

              <div>
                <Label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                  <MapPin className="h-3.5 w-3.5" /> District
                </Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent className="bg-card max-h-60">
                    {tnDistricts.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Account Created</p>
                  <p className="font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-medium">{user?.role?.replace("_", " ")}</p>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
