import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  Mic,
  MicOff,
  MapPin,
  X,
  CheckCircle2,
  Loader2,
  Brain,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { aiPipelineSteps, tnDistricts } from "@/lib/mockData";

//  Zod schema 
const schema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  category: z.enum(["roads", "water", "garbage", "lighting", "drainage", "other"], {
    required_error: "Please select a category",
  }),
  description: z.string().min(30, "Description must be at least 30 characters"),
  district: z.string().min(1, "Please select a district"),
  address: z.string().min(5, "Please enter a more specific address"),
});

type FormValues = z.infer<typeof schema>;

//  AI pipeline simulation 
interface AiResult {
  category: string;
  confidence: number;
  isDuplicate: boolean;
  priority: "low" | "medium" | "high";
  department: string;
}

function simulateAI(values: FormValues): Promise<AiResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const priorities: Record<string, "low" | "medium" | "high"> = {
        roads: "high", water: "high", drainage: "high", garbage: "medium", lighting: "medium", other: "low",
      };
      const depts: Record<string, string> = {
        roads: "Roads Dept.", water: "TWAD Board / CMWSSB", garbage: "Sanitation Dept.",
        lighting: "Electrical Dept.", drainage: "Public Works Dept.", other: "Urban Development",
      };
      resolve({
        category: values.category,
        confidence: Math.floor(Math.random() * 15) + 82,
        isDuplicate: Math.random() < 0.1,
        priority: priorities[values.category] ?? "medium",
        department: depts[values.category] ?? "Municipal Corp.",
      });
    }, aiPipelineSteps.reduce((a, s) => a + s.duration, 0));
  });
}

// 
export default function ReportIssue() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);

  // AI pipeline state
  const [aiStep, setAiStep] = useState<number>(-1); // -1 = idle, 0..n = running, n+1 = done
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const categoryValue = watch("category");

  //  Photo handlers 
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  }, []);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  //  Geolocation 
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationCaptured(true);
        toast({ title: "Location captured", description: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}` });
      },
      () => toast({ title: "Location error", description: "Could not get location. Enter address manually.", variant: "destructive" }),
    );
  };

  //  AI pipeline runner 
  async function runAIPipeline(values: FormValues) {
    setIsSubmitting(true);
    setAiStep(0);
    let elapsed = 0;
    for (let i = 0; i < aiPipelineSteps.length; i++) {
      setTimeout(() => setAiStep(i), elapsed);
      elapsed += aiPipelineSteps[i].duration;
    }
    const result = await simulateAI(values);
    setAiResult(result);
    setAiStep(aiPipelineSteps.length); // done
    setTimeout(() => {
      toast({ title: "Report Submitted!", description: "Your issue has been reported. Track it in your dashboard." });
      navigate("/dashboard");
    }, 1800);
  }

  const onSubmit = (values: FormValues) => runAIPipeline(values);

  const isProcessing = isSubmitting && aiStep < aiPipelineSteps.length;
  const isDone = isSubmitting && aiStep >= aiPipelineSteps.length && !!aiResult;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Report a Civic Issue</h1>
            <p className="text-muted-foreground">
              Help improve Tamil Nadu by reporting civic issues. Our AI will auto-categorise, check for duplicates, and assign priority.
            </p>
          </div>

          {/* AI Processing overlay */}
          {isSubmitting && (
            <div className="mb-6 bg-card border border-border rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">AI Processing Pipeline</p>
                  <p className="text-xs text-muted-foreground">Powered by Fix It Now AI Engine</p>
                </div>
                {isDone && (
                  <Badge className="ml-auto bg-success/10 text-success border-success/30">Complete</Badge>
                )}
              </div>

              <div className="space-y-3">
                {aiPipelineSteps.map((step, i) => {
                  const done = aiStep > i;
                  const active = aiStep === i;
                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${done ? "bg-success/10" : active ? "bg-primary/10" : "bg-muted"}`}>
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : active ? (
                          <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      <p className={`text-sm flex-1 ${done ? "text-foreground" : active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      {done && <CheckCircle2 className="h-4 w-4 text-success/60" />}
                    </div>
                  );
                })}
              </div>

              {isDone && aiResult && (
                <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="font-semibold capitalize text-sm">{aiResult.category}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">AI Confidence</p>
                    <p className="font-semibold text-primary text-sm">{aiResult.confidence}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Priority</p>
                    <p className={`font-semibold capitalize text-sm ${aiResult.priority === "high" ? "text-destructive" : aiResult.priority === "medium" ? "text-yellow-600" : "text-success"}`}>
                      {aiResult.priority}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Duplicate</p>
                    <p className={`font-semibold text-sm ${aiResult.isDuplicate ? "text-warning" : "text-success"}`}>
                      {aiResult.isDuplicate ? "Yes" : "None Found"}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Routing to Department</p>
                    <p className="font-semibold text-sm">{aiResult.department}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to your dashboard
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left column */}
              <div className="lg:col-span-3 space-y-6">

                {/* Title */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <Label htmlFor="title" className="text-base font-semibold mb-3 block">
                    Issue Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Large pothole on Anna Salai near Gemini Flyover"
                    {...register("title")}
                    className="bg-background"
                    disabled={isSubmitting}
                  />
                  {errors.title && <p className="text-destructive text-xs mt-1.5">{errors.title.message}</p>}
                </div>

                {/* Category */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <Label className="text-base font-semibold mb-3 block">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={categoryValue}
                    onValueChange={(v) => setValue("category", v as FormValues["category"], { shouldValidate: true })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {[
                        { value: "roads",    label: "Roads & Potholes" },
                        { value: "water",    label: "Water Supply" },
                        { value: "garbage",  label: "Garbage Collection" },
                        { value: "lighting", label: "Street Lighting" },
                        { value: "drainage", label: "Drainage Issues" },
                        { value: "other",    label: "Other" },
                      ].map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-destructive text-xs mt-1.5">{errors.category.message}</p>}
                </div>

                {/* Description */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <Label htmlFor="description" className="text-base font-semibold mb-3 block">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail. Include when you noticed it, how many people are affected, and any immediate dangers."
                    rows={5}
                    {...register("description")}
                    className="bg-background resize-none"
                    disabled={isSubmitting}
                  />
                  {errors.description && <p className="text-destructive text-xs mt-1.5">{errors.description.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1.5">AI uses this text to auto-classify and prioritise the issue.</p>
                </div>

                {/* Photo */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <Label className="text-base font-semibold mb-3 block">Upload Photo (Optional)</Label>
                  {image ? (
                    <div className="relative rounded-lg overflow-hidden">
                      <img src={image} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => setImage(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      onClick={() => document.getElementById("photoInput")?.click()}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Drop image here or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
                      <input id="photoInput" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                  )}
                </div>

                {/* Voice Note */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <Label className="text-base font-semibold mb-3 block">Voice Note (Optional)</Label>
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    className="gap-2 w-full"
                    onClick={() => setIsRecording(!isRecording)}
                    disabled={isSubmitting}
                  >
                    {isRecording ? <><MicOff className="h-4 w-4" /> Stop Recording</> : <><Mic className="h-4 w-4" /> Start Recording</>}
                  </Button>
                  {isRecording && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                      <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                      Recording... Tap to stop when done
                    </div>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="lg:col-span-2 space-y-6">

                {/* Location */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <Label className="text-base font-semibold mb-3 block">
                    Location <span className="text-destructive">*</span>
                  </Label>

                  <Button
                    type="button"
                    variant={locationCaptured ? "default" : "outline"}
                    className="w-full gap-2 mb-3"
                    onClick={getLocation}
                    disabled={isSubmitting}
                  >
                    <MapPin className="h-4 w-4" />
                    {locationCaptured ? `Captured (${geoCoords?.lat.toFixed(4)}, ${geoCoords?.lng.toFixed(4)})` : "Auto-detect GPS Location"}
                  </Button>

                  <p className="text-xs text-muted-foreground mb-3 text-center">— or enter manually —</p>

                  {/* District */}
                  <div className="mb-3">
                    <Label className="text-sm mb-1.5 block">District <span className="text-destructive">*</span></Label>
                    <Select
                      onValueChange={(v) => setValue("district", v, { shouldValidate: true })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="bg-background text-sm">
                        <SelectValue placeholder="Select Tamil Nadu district" />
                      </SelectTrigger>
                      <SelectContent className="bg-card max-h-60">
                        {tnDistricts.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district && <p className="text-destructive text-xs mt-1">{errors.district.message}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address" className="text-sm mb-1.5 block">
                      Street / Landmark <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="e.g. Near Meenakshi Amman Temple, Big Street"
                      {...register("address")}
                      className="bg-background text-sm"
                      disabled={isSubmitting}
                    />
                    {errors.address && <p className="text-destructive text-xs mt-1">{errors.address.message}</p>}
                  </div>
                </div>

                {/* AI Info card */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm">AI Pipeline</span>
                    <Badge className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/20">Active</Badge>
                  </div>
                  <div className="space-y-2">
                    {aiPipelineSteps.map((step) => (
                      <div key={step.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ChevronRight className="h-3 w-3 text-primary/60 flex-shrink-0" />
                        {step.label}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3">
                    Your report will be auto-classified and assigned to the correct Tamil Nadu municipal department.
                  </p>
                </div>

                {/* Warning */}
                <div className="flex gap-2 bg-warning/10 border border-warning/20 rounded-xl p-4 text-sm text-warning-foreground">
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    For life-threatening emergencies call <strong>112</strong>. Do not use this platform for medical / fire / police emergencies.
                  </p>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing</>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
