import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  Locate,
  X,
  Info,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
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
import { complaints as mockComplaints, type Complaint, type IssueCategory } from "@/lib/mockData";
import { useComplaints } from "@/hooks/useComplaints";
import type { ApiComplaint } from "@/lib/api";

// Fix Leaflet default icon path issue with Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const categoryConfig = {
  all:      { label: "All Categories", color: "#2563EB" },
  roads:    { label: "Roads",          color: "#EF4444" },
  water:    { label: "Water",          color: "#0EA5E9" },
  garbage:  { label: "Garbage",        color: "#F59E0B" },
  lighting: { label: "Lighting",       color: "#10B981" },
  drainage: { label: "Drainage",       color: "#8B5CF6" },
  other:    { label: "Other",          color: "#6B7280" },
} as const;

const statusClass: Record<string, string> = {
  reported:      "text-muted-foreground border-muted-foreground/40",
  pending:       "text-yellow-600 border-yellow-400/40",
  assigned:      "text-blue-500 border-blue-400/40",
  "in-progress": "text-sky-500 border-sky-400/40",
  resolved:      "text-green-600 border-green-400/40",
};

function createCategoryIcon(category: IssueCategory) {
  const color = categoryConfig[category]?.color ?? "#2563EB";
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

function MapController({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

const heatZones = [
  { lat: 13.0598, lng: 80.2478, radius: 2000, color: "#ef4444" },
  { lat: 13.0418, lng: 80.2341, radius: 1500, color: "#f97316" },
  { lat: 11.0183, lng: 76.9622, radius: 1800, color: "#f59e0b" },
  { lat: 9.9195,  lng: 78.1193, radius: 1200, color: "#ef4444" },
  { lat: 10.7834, lng: 79.1318, radius: 1000, color: "#f59e0b" },
  { lat: 11.6651, lng: 78.1464, radius: 900,  color: "#fb923c" },
];

// ─── Normalised map complaint type ───────────────────────────────────────────
type MapComplaint = {
  id: string;
  title: string;
  category: IssueCategory;
  status: string;
  priority: string;
  description: string;
  aiConfidence: number;
  upvotes: number;
  location: { lat: number; lng: number; address: string; city: string; district: string };
  statusHistory: { status: string; date: string; note: string }[];
};

function fromMockComplaint(c: Complaint): MapComplaint {
  return {
    id:           c.id,
    title:        c.title,
    category:     c.category,
    status:       c.status,
    priority:     c.priority,
    description:  c.description,
    aiConfidence: c.aiConfidence,
    upvotes:      c.upvotes,
    location:     c.location,
    statusHistory: c.statusHistory,
  };
}

function fromApiComplaint(c: ApiComplaint): MapComplaint {
  return {
    id:           c.refId ?? c.id,
    title:        c.title,
    category:     c.category as IssueCategory,
    status:       c.status,
    priority:     c.priority,
    description:  "",
    aiConfidence: c.aiConfidence,
    upvotes:      c.upvotes,
    location:     { lat: c.lat, lng: c.lng, address: c.address, city: c.city, district: c.district },
    statusHistory: [],
  };
}

export default function MapView() {
  const { data: apiData } = useComplaints();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<MapComplaint | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Use API data when available, otherwise fall back to mockData
  const allComplaints: MapComplaint[] = apiData?.data
    ? apiData.data.map(fromApiComplaint)
    : mockComplaints.map(fromMockComplaint);

  const filtered =
    selectedCategory === "all"
      ? allComplaints
      : allComplaints.filter((c) => c.category === selectedCategory);

  const locateMe = () => {
    if (!mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => mapRef.current!.flyTo([pos.coords.latitude, pos.coords.longitude], 14),
      () => {},
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 relative" style={{ height: "calc(100vh - 64px)" }}>
        <MapContainer
          center={[10.9, 78.5]}
          zoom={7}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          zoomControl={false}
        >
          <MapController onReady={(m) => { mapRef.current = m; }} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {showHeatmap &&
            heatZones.map((z, i) => (
              <Circle
                key={i}
                center={[z.lat, z.lng]}
                radius={z.radius}
                pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: 0.25, weight: 1 }}
              />
            ))}

          {filtered.map((c) => (
            <Marker
              key={c.id}
              position={[c.location.lat, c.location.lng]}
              icon={createCategoryIcon(c.category)}
              eventHandlers={{ click: () => setSelectedComplaint(c) }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>{c.title}</p>
                  <p style={{ color: "#6b7280", fontSize: 12, marginBottom: 4 }}>
                    {c.location.address}, {c.location.city}
                  </p>
                  <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 9999, background: "#f3f4f6", marginRight: 4 }}>
                    {c.category}
                  </span>
                  <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 9999, background: "#f3f4f6" }}>
                    {c.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Filter Panel */}
        <div className="absolute top-4 left-4 z-[400] w-72 max-w-[calc(100vw-2rem)]">
          <div className="bg-card/95 backdrop-blur border border-border rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Filter Issues</span>
              <Badge variant="secondary" className="ml-auto text-xs">{filtered.length} shown</Badge>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-background text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-card z-[500]">
                {Object.entries(categoryConfig).map(([val, cfg]) => (
                  <SelectItem key={val} value={val}>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                      {cfg.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-3">
              <Button
                variant={showHeatmap ? "default" : "outline"}
                size="sm"
                className="w-full gap-2"
                onClick={() => setShowHeatmap((p) => !p)}
              >
                <Layers className="h-4 w-4" />
                {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
              </Button>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Category Legend</p>
              <div className="grid grid-cols-2 gap-y-1.5">
                {Object.entries(categoryConfig).filter(([v]) => v !== "all").map(([val, cfg]) => (
                  <div key={val} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                    <span className="text-muted-foreground">{cfg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute right-4 top-20 z-[400] flex flex-col gap-2">
          <Button variant="secondary" size="icon" className="shadow-md h-9 w-9" onClick={() => mapRef.current?.zoomIn()}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="shadow-md h-9 w-9" onClick={() => mapRef.current?.zoomOut()}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="shadow-md h-9 w-9" onClick={locateMe} title="Locate me">
            <Locate className="h-4 w-4" />
          </Button>
        </div>

        {/* Issue List panel – bottom right (only shown when no complaint selected) */}
        {!selectedComplaint && (
          <div className="absolute bottom-4 right-4 z-[400] w-80 max-w-[calc(100vw-2rem)]">
            <div className="bg-card/95 backdrop-blur border border-border rounded-xl p-4 shadow-lg max-h-64 overflow-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" /> Tamil Nadu Issues
                </span>
                <Badge variant="secondary" className="text-xs">{filtered.length}</Badge>
              </div>
              <div className="space-y-1.5">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedComplaint(c);
                      mapRef.current?.flyTo([c.location.lat, c.location.lng], 14, { duration: 1 });
                    }}
                  >
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: categoryConfig[c.category]?.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground">{c.location.city}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 capitalize ${statusClass[c.status] ?? ""}`}>
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Complaint Detail Panel */}
        {selectedComplaint && (
          <div className="absolute top-4 right-4 z-[400] w-80 max-w-[calc(100vw-2rem)]">
            <div className="bg-card border border-border rounded-xl p-4 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className="text-[10px]">{selectedComplaint.id}</Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1" onClick={() => setSelectedComplaint(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <h3 className="font-semibold text-sm mb-1 leading-snug">{selectedComplaint.title}</h3>
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <div className="h-2 w-2 rounded-full" style={{ background: categoryConfig[selectedComplaint.category]?.color }} />
                <span className="text-xs text-muted-foreground capitalize">{selectedComplaint.category}</span>
                <span className="text-muted-foreground/40">•</span>
                <Badge variant="outline" className={`text-[10px] capitalize ${statusClass[selectedComplaint.status] ?? ""}`}>
                  {selectedComplaint.status}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{selectedComplaint.location.address}, {selectedComplaint.location.city}, {selectedComplaint.location.district} District</span>
                </div>
                <div className="flex gap-2">
                  <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground line-clamp-3">{selectedComplaint.description}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <p className={`font-semibold capitalize ${selectedComplaint.priority === "high" ? "text-destructive" : selectedComplaint.priority === "medium" ? "text-yellow-600" : "text-green-600"}`}>
                    {selectedComplaint.priority}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">AI Score</p>
                  <p className="font-semibold text-primary">{selectedComplaint.aiConfidence}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Upvotes</p>
                  <p className="font-semibold">{selectedComplaint.upvotes}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Status Timeline</p>
                <div className="space-y-1.5">
                  {selectedComplaint.statusHistory.map((h, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className={`h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 ${i === selectedComplaint.statusHistory.length - 1 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                      <div>
                        <p className="text-[11px] font-medium capitalize">{h.status}</p>
                        <p className="text-[10px] text-muted-foreground">{h.date} — {h.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
