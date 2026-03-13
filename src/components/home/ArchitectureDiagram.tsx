import {
  Smartphone,
  Brain,
  Building2,
  Bell,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Users,
  ShieldCheck,
  MapPin,
  Copy,
  Gauge,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

const categories = [
  { label: "Roads", color: "#ef4444" },
  { label: "Water", color: "#0d9488" },
  { label: "Garbage", color: "#d97706" },
  { label: "Lighting", color: "#16a34a" },
  { label: "Drainage", color: "#7c3aed" },
];

const departments = [
  { label: "Roads Dept.", color: "#ef4444" },
  { label: "CMWSSB", color: "#0d9488" },
  { label: "Sanitation", color: "#d97706" },
  { label: "Electrical", color: "#16a34a" },
  { label: "Public Works", color: "#7c3aed" },
];

export function ArchitectureDiagram() {
  return (
    <div className="w-full select-none">
      <div className="relative bg-slate-50/80 rounded-2xl border border-slate-200 p-6 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }} />

        <div className="relative space-y-5">

          {/* Row 1: Citizens */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Citizens</p>
                <p className="text-[10px] text-slate-400">Mobile / Web App</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Report Issue</p>
                <div className="flex gap-1 mt-0.5">
                  {categories.map((c) => (
                    <span key={c.label} className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Arrow down */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-px h-3 bg-slate-300" />
              <ArrowDown className="h-3.5 w-3.5 text-slate-300 -mt-0.5" />
            </div>
          </div>

          {/* Row 2: AI Pipeline */}
          <div className="bg-blue-50/80 rounded-xl border border-blue-100 p-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Brain className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">AI Classification Pipeline</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Brain, label: "Auto-Classify", sub: "Category" },
                { icon: Copy, label: "Duplicate", sub: "Detection" },
                { icon: Gauge, label: "Priority", sub: "Scoring" },
                { icon: MapPin, label: "Geo-Route", sub: "to Dept." },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-1.5">
                  {i > 0 && <div className="w-2 h-px bg-blue-200 flex-shrink-0 hidden sm:block" />}
                  <div className="bg-white rounded-lg border border-blue-100 p-2 flex-1 text-center">
                    <step.icon className="h-3.5 w-3.5 text-blue-500 mx-auto mb-1" />
                    <p className="text-[10px] font-semibold text-slate-600 leading-tight">{step.label}</p>
                    <p className="text-[9px] text-slate-400">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow down */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-px h-3 bg-slate-300" />
              <ArrowDown className="h-3.5 w-3.5 text-slate-300 -mt-0.5" />
            </div>
          </div>

          {/* Row 3: Department Routing */}
          <div className="flex gap-2 justify-center flex-wrap">
            {departments.map((dept) => (
              <div key={dept.label} className="bg-white rounded-lg border border-slate-200 px-2.5 py-2 text-center shadow-sm min-w-[72px]">
                <div className="h-6 w-6 rounded-full mx-auto mb-1 flex items-center justify-center" style={{ background: `${dept.color}15` }}>
                  <Building2 className="h-3 w-3" style={{ color: dept.color }} />
                </div>
                <p className="text-[10px] font-medium text-slate-600 leading-tight">{dept.label}</p>
              </div>
            ))}
          </div>

          {/* Arrow down */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-px h-3 bg-slate-300" />
              <ArrowDown className="h-3.5 w-3.5 text-slate-300 -mt-0.5" />
            </div>
          </div>

          {/* Row 4: Resolution + Feedback */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-amber-50/80 rounded-lg border border-amber-100 p-2.5 text-center">
              <Bell className="h-4 w-4 text-amber-500 mx-auto mb-1" />
              <p className="text-[10px] font-semibold text-slate-600">Notifications</p>
              <p className="text-[9px] text-slate-400">Real-time updates</p>
            </div>
            <div className="bg-emerald-50/80 rounded-lg border border-emerald-100 p-2.5 text-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-[10px] font-semibold text-slate-600">Resolved</p>
              <p className="text-[9px] text-slate-400">Issue fixed</p>
            </div>
            <div className="bg-violet-50/80 rounded-lg border border-violet-100 p-2.5 text-center">
              <ShieldCheck className="h-4 w-4 text-violet-500 mx-auto mb-1" />
              <p className="text-[10px] font-semibold text-slate-600">Admin</p>
              <p className="text-[9px] text-slate-400">Oversight</p>
            </div>
          </div>

          {/* Bottom: Citizen feedback loop */}
          <div className="flex items-center justify-center gap-4 pt-1">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <ThumbsUp className="h-3 w-3" /> Upvote
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <MessageSquare className="h-3 w-3" /> Feedback
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <MapPin className="h-3 w-3" /> Track on Map
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
