import { useState } from "react";
import { MapPin, Filter, Layers, ZoomIn, ZoomOut, Locate } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "all", label: "All Categories", color: "bg-primary" },
  { value: "roads", label: "Roads", color: "bg-destructive" },
  { value: "water", label: "Water", color: "bg-info" },
  { value: "garbage", label: "Garbage", color: "bg-warning" },
  { value: "lighting", label: "Lighting", color: "bg-accent" },
  { value: "drainage", label: "Drainage", color: "bg-success" },
];

const mockMarkers = [
  { id: 1, category: "roads", title: "Pothole", location: "Main St", status: "pending" },
  { id: 2, category: "lighting", title: "Broken light", location: "Oak Ave", status: "resolved" },
  { id: 3, category: "water", title: "Leak", location: "River Rd", status: "in-progress" },
  { id: 4, category: "garbage", title: "Overflow", location: "Park Blvd", status: "pending" },
  { id: 5, category: "roads", title: "Crack", location: "Hill St", status: "in-progress" },
];

export default function MapView() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 relative">
        {/* Map Container */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5">
          {/* Placeholder for actual map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Interactive City Map</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                View all reported issues across the city with real-time updates and clustering
              </p>
            </div>
          </div>

          {/* Mock map markers */}
          <div className="absolute top-1/4 left-1/4 h-4 w-4 bg-destructive rounded-full animate-pulse-soft" title="Roads issue" />
          <div className="absolute top-1/3 left-1/2 h-4 w-4 bg-info rounded-full" title="Water issue" />
          <div className="absolute top-1/2 left-1/3 h-4 w-4 bg-warning rounded-full animate-pulse-soft" title="Garbage issue" />
          <div className="absolute top-2/3 left-2/3 h-4 w-4 bg-accent rounded-full" title="Lighting issue" />
          <div className="absolute bottom-1/4 right-1/4 h-4 w-4 bg-success rounded-full" title="Drainage issue" />

          {/* Cluster indicator */}
          <div className="absolute top-1/2 right-1/3 h-10 w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold shadow-elevated">
            12
          </div>
        </div>

        {/* Filter Panel */}
        <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80">
          <div className="card-civic">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Filter Issues</span>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${cat.color}`} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant={showHeatmap ? "default" : "outline"}
                size="sm"
                className="w-full gap-2"
                onClick={() => setShowHeatmap(!showHeatmap)}
              >
                <Layers className="h-4 w-4" />
                {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
              </Button>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Issue Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(1).map((cat) => (
                  <div key={cat.value} className="flex items-center gap-2 text-xs">
                    <div className={`h-2 w-2 rounded-full ${cat.color}`} />
                    <span className="text-muted-foreground">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <Button variant="secondary" size="icon" className="shadow-card">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="shadow-card">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="shadow-card">
            <Locate className="h-4 w-4" />
          </Button>
        </div>

        {/* Issues List Panel */}
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
          <div className="card-civic max-h-64 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm">Nearby Issues</span>
              <Badge variant="secondary">{mockMarkers.length}</Badge>
            </div>
            <div className="space-y-2">
              {mockMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div
                    className={`h-3 w-3 rounded-full ${
                      categories.find((c) => c.value === marker.category)?.color || "bg-primary"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{marker.title}</p>
                    <p className="text-xs text-muted-foreground">{marker.location}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${
                      marker.status === "resolved"
                        ? "text-success border-success/30"
                        : marker.status === "in-progress"
                        ? "text-info border-info/30"
                        : "text-warning border-warning/30"
                    }`}
                  >
                    {marker.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
