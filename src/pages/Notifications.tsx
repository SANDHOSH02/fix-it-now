import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Check, Inbox } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usersApi, type ApiNotification } from "@/lib/api";

export default function Notifications() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: usersApi.getNotifications,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => usersApi.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications: ApiNotification[] = data?.data ?? [];
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" size="sm" className="gap-1 mb-4" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unread > 0 && (
                <Badge className="bg-primary text-primary-foreground">{unread} new</Badge>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-center text-muted-foreground text-sm">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll receive updates here when your complaint status changes.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 flex items-start gap-3 transition-colors ${n.isRead ? "" : "bg-primary/5"}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.isRead ? "bg-muted" : "bg-primary/10"}`}>
                      <Bell className={`h-4 w-4 ${n.isRead ? "text-muted-foreground" : "text-primary"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.isRead ? "text-muted-foreground" : "font-medium"}`}>{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {n.refId && (
                          <Badge variant="outline" className="text-[10px]">{n.refId}</Badge>
                        )}
                      </div>
                    </div>
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={() => markRead.mutate(n.id)}
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
