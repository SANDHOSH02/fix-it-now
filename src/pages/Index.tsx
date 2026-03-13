import { Link } from "react-router-dom";
import { MapPin, ArrowRight, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CTASection } from "@/components/home/CTASection";
import { useComplaints } from "@/hooks/useComplaints";

const statusIcon: Record<string, React.ReactNode> = {
  resolved:      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
  "in-progress": <Clock className="h-3.5 w-3.5 text-violet-500" />,
  assigned:      <Clock className="h-3.5 w-3.5 text-teal-500" />,
  pending:       <AlertCircle className="h-3.5 w-3.5 text-amber-500" />,
  reported:      <AlertCircle className="h-3.5 w-3.5 text-slate-400" />,
};

const statusColor: Record<string, string> = {
  resolved:      "bg-emerald-100 text-emerald-700",
  "in-progress": "bg-violet-100 text-violet-700",
  assigned:      "bg-teal-100 text-teal-700",
  pending:       "bg-amber-100 text-amber-700",
  reported:      "bg-slate-100 text-slate-600",
};

function LiveIssuesSection() {
  const { data: apiData, isLoading } = useComplaints({ pageSize: "6" });

  const source = apiData?.data ?? [];
  const total  = apiData?.meta?.total ?? 0;

  const resolvedCount    = source.filter((c) => c.status === "resolved").length;
  const inProgressCount  = source.filter((c) => c.status === "in-progress").length;
  const resolutionPct    = total > 0 ? Math.round((resolvedCount / (source.length || 1)) * 100) : 0;

  const recentCards = source.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            Live Dashboard
          </span>
          <h2 className="text-3xl font-bold mb-2">Tamil Nadu — Active Issues</h2>
          <p className="text-muted-foreground">Real-time snapshot of civic complaints across the state.</p>
        </div>

        {/* Live stat pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl px-5 py-3 text-center min-w-[120px]">
            <p className="text-2xl font-bold text-primary">{total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Reports</p>
          </div>
          <div className="bg-card border border-border rounded-xl px-5 py-3 text-center min-w-[120px]">
            <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Resolved</p>
          </div>
          <div className="bg-card border border-border rounded-xl px-5 py-3 text-center min-w-[120px]">
            <p className="text-2xl font-bold text-violet-600">{inProgressCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">In Progress</p>
          </div>
          <div className="bg-card border border-border rounded-xl px-5 py-3 text-center min-w-[120px]">
            <p className="text-2xl font-bold text-accent">{resolutionPct}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Resolution Rate</p>
          </div>
        </div>

        {/* Recent issues grid */}
        {recentCards.length === 0 ? (
          <p className="text-center text-muted-foreground mb-8">No complaints reported yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {recentCards.map((c) => {
              const date = new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
              return (
                <div key={c.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-muted-foreground">{c.refId ?? c.id}</span>
                    <Badge className={`text-[10px] capitalize ${statusColor[c.status] ?? ""}`}>
                      <span className="flex items-center gap-1">
                        {statusIcon[c.status]}
                        {c.status}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-sm font-medium leading-snug mb-2 line-clamp-2">{c.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{c.address}, {c.city}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="capitalize">{c.category}</span>
                    <span>{date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/map">
              View All on Map <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Blurred background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
        }}
      />
      {/* Content overlay */}
      <div className="relative z-10" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <FeaturesSection />
          <LiveIssuesSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
