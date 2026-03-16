import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Camera,
  Brain,
  MapPin,
  Tags,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Sparkles,
  FileText,
  BarChart3,
  Users,
  Zap,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Pipeline step definitions                                          */
/* ------------------------------------------------------------------ */
const pipelineSteps = [
  {
    icon: Upload,
    title: "Upload / Capture",
    desc: "Citizen uploads a photo or describes the civic issue via text, voice, or camera.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/30",
    detail:
      "Supports JPEG, PNG, and WebP images up to 10 MB. Voice input is transcribed using the browser's Speech Recognition API before entering the pipeline.",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    desc: "Our local LLM (Llama 3.2 via Ollama) analyses the complaint text and image context.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/30",
    detail:
      "The model extracts key entities, assesses sentiment, and determines the nature of the problem — all running locally so your data never leaves the server.",
  },
  {
    icon: Tags,
    title: "Auto-Categorisation",
    desc: "The AI classifies the issue into predefined categories — roads, water, sanitation, electricity, etc.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/30",
    detail:
      "Categories map directly to government department codes so routing is instant. Confidence scores are attached for human review if needed.",
  },
  {
    icon: AlertTriangle,
    title: "Priority Scoring",
    desc: "Urgency is computed based on severity keywords, affected population, and historical patterns.",
    color: "from-red-500 to-rose-500",
    bg: "bg-red-500/10",
    ring: "ring-red-500/30",
    detail:
      "A three-tier system (Low / Medium / High) with an optional Critical override when safety-related terms are detected.",
  },
  {
    icon: MapPin,
    title: "Geo-Tagging",
    desc: "Location is extracted from GPS metadata, address text, or the user's pin on the map.",
    color: "from-emerald-500 to-green-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/30",
    detail:
      "PostGIS stores precise coordinates and district polygons, enabling spatial queries like 'all potholes within 2 km' or heatmap generation.",
  },
  {
    icon: CheckCircle2,
    title: "Route & Resolve",
    desc: "The enriched complaint is dispatched to the relevant department and tracked until resolution.",
    color: "from-teal-500 to-cyan-600",
    bg: "bg-teal-500/10",
    ring: "ring-teal-500/30",
    detail:
      "Real-time status updates (Reported → Assigned → In-Progress → Resolved) are pushed to the citizen's dashboard and notification feed.",
  },
];

/* ------------------------------------------------------------------ */
/*  Stat cards                                                         */
/* ------------------------------------------------------------------ */
const stats = [
  { icon: Zap, label: "Avg Processing Time", value: "< 3 s" },
  { icon: BarChart3, label: "Classification Accuracy", value: "94 %" },
  { icon: Users, label: "Issues Resolved", value: "12,400+" },
  { icon: Brain, label: "AI Model", value: "Llama 3.2" },
];

/* ------------------------------------------------------------------ */
/*  Animated connector (vertical pulse)                                */
/* ------------------------------------------------------------------ */
function Connector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="relative h-10 w-px">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-primary/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-primary/30 animate-ping" />
      </div>
      <ArrowDown className="h-4 w-4 text-primary/50 -mt-1" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [demoPreview, setDemoPreview] = useState<string | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStage, setDemoStage] = useState(-1);
  const fileRef = useRef<HTMLInputElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  /* Intersection observer — fade-in on scroll */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-6");
          }
        });
      },
      { threshold: 0.15 }
    );

    stepsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* Handle file pick */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDemoFile(file);
    setDemoPreview(URL.createObjectURL(file));
    setDemoStage(-1);
    setDemoRunning(false);
  };

  /* Simulated demo run */
  const runDemo = () => {
    if (!demoFile) return;
    setDemoRunning(true);
    setDemoStage(0);

    let stage = 0;
    const timer = setInterval(() => {
      stage += 1;
      if (stage >= pipelineSteps.length) {
        clearInterval(timer);
        setDemoRunning(false);
      }
      setDemoStage(stage);
    }, 1200);
  };

  const clearDemo = () => {
    setDemoFile(null);
    setDemoPreview(null);
    setDemoStage(-1);
    setDemoRunning(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="gradient-hero py-20 md:py-28 relative overflow-hidden">
        {/* floating decorative blobs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

        <div className="container relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" /> Powered by Local AI
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            How the{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              AI Workflow
            </span>{" "}
            Works
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            From a citizen's photo to a resolved civic issue — see every step
            the AI takes to classify, prioritise, and route complaints in
            real-time.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button size="lg" asChild>
              <a href="#pipeline">
                Explore the Pipeline <ArrowDown className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#demo">
                Try a Demo <Upload className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pipeline flow ────────────────────────────────────── */}
      <section id="pipeline" className="py-20 scroll-mt-20">
        <div className="container max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            End-to-End Pipeline
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Each complaint passes through six AI-powered stages before reaching
            the responsible department.
          </p>

          <div className="space-y-0">
            {pipelineSteps.map((step, i) => (
              <div key={step.title}>
                {/* Step card */}
                <div
                  ref={(el) => { stepsRef.current[i] = el; }}
                  onClick={() =>
                    setActiveStep(activeStep === i ? null : i)
                  }
                  className={`
                    opacity-0 translate-y-6 transition-all duration-700 ease-out
                    cursor-pointer group relative
                    rounded-xl border border-border p-5 md:p-6
                    ${activeStep === i ? "ring-2 " + step.ring + " shadow-elevated" : "shadow-card hover:shadow-elevated hover:-translate-y-0.5"}
                  `}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* icon */}
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 text-white shadow-md`}
                    >
                      <step.icon className="h-6 w-6" />
                    </div>

                    {/* text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-muted-foreground">
                          STEP {i + 1}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-sm font-semibold text-foreground">
                          {step.title}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>

                      {/* expanded detail */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          activeStep === i
                            ? "max-h-40 opacity-100 mt-3"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className={`text-sm p-3 rounded-lg ${step.bg} leading-relaxed`}>
                          {step.detail}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* connector between steps */}
                {i < pipelineSteps.length - 1 && <Connector />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Try it - Demo upload section ─────────────────────── */}
      <section
        id="demo"
        className="py-20 scroll-mt-20 bg-gradient-to-b from-background to-secondary/30"
      >
        <div className="container max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            See It in Action
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Upload a photo of a civic issue and watch the AI pipeline process it
            step by step.
          </p>

          <div className="card-civic space-y-6">
            {/* upload area */}
            {!demoPreview ? (
              <label
                htmlFor="demo-upload"
                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="h-7 w-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">
                    Drop an image here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPEG, PNG, WebP — max 10 MB
                  </p>
                </div>
                <input
                  ref={fileRef}
                  id="demo-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFile}
                />
              </label>
            ) : (
              <div className="space-y-4">
                {/* preview */}
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img
                    src={demoPreview}
                    alt="Preview"
                    className="w-full max-h-64 object-cover"
                  />
                  <button
                    onClick={clearDemo}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate text-muted-foreground">
                    {demoFile?.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {demoFile && (demoFile.size / 1024).toFixed(0)} KB
                  </span>
                </div>

                {/* pipeline progress */}
                <div className="space-y-3 pt-2">
                  {pipelineSteps.map((step, i) => {
                    const done = demoStage > i;
                    const active = demoStage === i;
                    return (
                      <div
                        key={step.title}
                        className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-500 ${
                          done
                            ? "bg-emerald-500/10"
                            : active
                            ? step.bg + " ring-1 " + step.ring
                            : "bg-muted/50"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        ) : active ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20 shrink-0" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            done
                              ? "text-emerald-600"
                              : active
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </span>
                        {done && (
                          <span className="ml-auto text-xs text-emerald-500 font-medium">
                            Done
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* result banner */}
                {demoStage >= pipelineSteps.length && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Pipeline Complete!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        The issue would be classified, prioritised, geo-tagged,
                        and dispatched to the appropriate department in under 3
                        seconds.
                      </p>
                    </div>
                  </div>
                )}

                {/* action buttons */}
                <div className="flex gap-3 pt-2">
                  {demoStage < pipelineSteps.length && (
                    <Button
                      onClick={runDemo}
                      disabled={demoRunning}
                      className="gap-2"
                    >
                      {demoRunning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          Processing…
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" /> Run AI Pipeline
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" onClick={clearDemo}>
                    <ImageIcon className="h-4 w-4 mr-2" /> Upload Another
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Tech stack callout ───────────────────────────────── */}
      <section className="py-16 border-t border-border">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Built with Privacy-First AI
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "100 % Local",
                desc: "Ollama runs on your own server — no data sent to third-party clouds.",
                icon: "🔒",
              },
              {
                title: "Open-Source Model",
                desc: "Llama 3.2 by Meta — transparent, auditable, and community-reviewed.",
                icon: "🧠",
              },
              {
                title: "Real-Time Results",
                desc: "End-to-end processing in under 3 seconds for most complaints.",
                icon: "⚡",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="card-civic-hover text-center space-y-3"
              >
                <span className="text-3xl">{c.icon}</span>
                <h3 className="font-semibold text-foreground">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
