import { useState } from "react";
import { Upload, Mic, MapPin, Camera, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { value: "roads", label: "Roads & Potholes" },
  { value: "water", label: "Water Supply" },
  { value: "garbage", label: "Garbage Collection" },
  { value: "lighting", label: "Street Lighting" },
  { value: "drainage", label: "Drainage Issues" },
  { value: "other", label: "Other" },
];

export default function ReportIssue() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast({
            title: "Location captured",
            description: "Your current location has been added to the report.",
          });
        },
        () => {
          toast({
            title: "Location error",
            description: "Unable to get your location. Please try again.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Report Submitted!",
      description: "Your civic issue has been reported successfully. Track it in your dashboard.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Report an Issue</h1>
            <p className="text-muted-foreground">
              Help improve your city by reporting civic issues. Our AI will process and prioritize your report.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Form Section */}
              <div className="lg:col-span-3 space-y-6">
                {/* Image Upload */}
                <div className="card-civic">
                  <Label className="text-base font-semibold mb-4 block">Upload Photo</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      isDragging
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
                        <Upload className="h-7 w-7 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">Drag and drop or click to upload</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PNG, JPG up to 0MB
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button type="button" variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div className="card-civic">
                  <Label htmlFor="description" className="text-base font-semibold mb-4 block">
                    Describe the Issue
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe the issue in detail. Include any relevant information that might help in resolving it..."
                    className="min-h-[120px] resize-none"
                  />
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    className="mt-3 gap-2"
                    onClick={() => setIsRecording(!isRecording)}
                  >
                    <Mic className={`h-4 w-4 ${isRecording ? "animate-pulse-soft" : ""}`} />
                    {isRecording ? "Stop Recording" : "Voice Input"}
                  </Button>
                </div>

                {/* Category & Location */}
                <div className="card-civic">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Category</Label>
                      <Select>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Location</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Address or coordinates"
                          value={location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : ""}
                          readOnly
                          className="flex-1 bg-background"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={getLocation}>
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Map placeholder */}
                  <div className="mt-4 h-48 bg-muted rounded-lg flex items-center justify-center border border-border">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Click "Get Location" to pin your issue</p>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <Button type="submit" size="lg" className="w-full">
                  Submit Report
                </Button>
              </div>

              {/* Preview Panel */}
              <div className="lg:col-span-2">
                <div className="card-civic sticky top-24">
                  <h3 className="font-semibold mb-4">Report Preview</h3>
                  
                  {/* Image Preview */}
                  <div className="aspect-video rounded-lg bg-muted mb-4 overflow-hidden relative">
                    {image ? (
                      <>
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Camera className="h-10 w-10 opacity-30" />
                      </div>
                    )}
                  </div>

                  {/* Location Preview */}
                  <div className="p-3 rounded-lg bg-muted/50 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span className={location ? "text-foreground" : "text-muted-foreground"}>
                        {location
                          ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                          : "No location selected"}
                      </span>
                    </div>
                  </div>

                  {/* AI Processing Note */}
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <p className="text-sm text-accent font-medium mb-1">🤖 AI Processing</p>
                    <p className="text-xs text-muted-foreground">
                      Once submitted, our AI will categorize, prioritize, and check for duplicates automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
