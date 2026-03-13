import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  MapPin,
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  Locate,
  X,
  Info,
  Satellite,
  Map as MapIcon,
  Search,
  Loader2,
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
import type { IssueCategory } from "@/lib/mockData";
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
  all:      { label: "All Categories", color: "#475569" },
  roads:    { label: "Roads",          color: "#dc2626" },
  water:    { label: "Water",          color: "#0d9488" },
  garbage:  { label: "Garbage",        color: "#d97706" },
  lighting: { label: "Lighting",       color: "#059669" },
  drainage: { label: "Drainage",       color: "#7c3aed" },
  other:    { label: "Other",          color: "#64748b" },
} as const;

const statusClass: Record<string, string> = {
  reported:      "text-slate-500 border-slate-400/40",
  pending:       "text-amber-600 border-amber-400/40",
  assigned:      "text-teal-600 border-teal-400/40",
  "in-progress": "text-violet-600 border-violet-400/40",
  resolved:      "text-emerald-600 border-emerald-400/40",
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

function AutoLocate() {
  const map = useMap();
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 13, { duration: 1.5 }),
      () => {}, // silently fall back to default center
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

const TILE_LAYERS = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  street: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
} as const;

type TileLayerType = keyof typeof TILE_LAYERS;

// ─── Nominatim result shape ───────────────────────────────────────────────────
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Generate heatmap zones from complaint data — group by city, count, and color by density
function buildHeatZones(complaints: MapComplaint[]) {
  const groups: Record<string, { lat: number; lng: number; count: number }> = {};
  for (const c of complaints) {
    const key = `${c.location.lat.toFixed(2)},${c.location.lng.toFixed(2)}`;
    if (!groups[key]) groups[key] = { lat: c.location.lat, lng: c.location.lng, count: 0 };
    groups[key].count++;
  }
  return Object.values(groups).map((g) => ({
    lat: g.lat,
    lng: g.lng,
    radius: Math.min(800 + g.count * 400, 3000),
    color: g.count >= 3 ? "#ef4444" : g.count >= 2 ? "#f97316" : "#f59e0b",
  }));
}

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
  const { data: apiData } = useComplaints({ pageSize: "100" });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<MapComplaint | null>(null);
  const [tileLayer, setTileLayer] = useState<TileLayerType>("satellite");
  const mapRef = useRef<L.Map | null>(null);

  const allComplaints: MapComplaint[] = (apiData?.data ?? []).map(fromApiComplaint);
  const heatZones = useMemo(() => buildHeatZones(allComplaints), [allComplaints]);

  const filtered =
    selectedCategory === "all"
      ? allComplaints
      : allComplaints.filter((c) => c.category === selectedCategory);

  // ── Place search state ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced Nominatim query
  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); setSearchOpen(false); return; }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=6`,
          { headers: { "Accept-Language": "en" } },
        );
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
        setSearchOpen(data.length > 0);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const flyToResult = (r: NominatimResult) => {
    mapRef.current?.flyTo([parseFloat(r.lat), parseFloat(r.lon)], 14, { duration: 1.2 });
    setSearchQuery(r.display_name.split(",")[0]);
    setSearchOpen(false);
  };

  const locateMe = useCallback(() => {
    if (!mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => mapRef.current!.flyTo([pos.coords.latitude, pos.coords.longitude], 14),
      () => {},
    );
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 relative" style={{ minHeight: 0 }}>
        <MapContainer
          center={[10.9, 78.5]}
          zoom={7}
          style={{ position: "absolute", inset: 0, zIndex: 0 }}
          zoomControl={false}
        >
          <MapController onReady={(m) => { mapRef.current = m; }} />
          <AutoLocate />
          <TileLayer
            key={tileLayer}
            attribution={TILE_LAYERS[tileLayer].attribution}
            url={TILE_LAYERS[tileLayer].url}
            maxZoom={tileLayer === "satellite" ? 19 : 20}
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

        {/* Search Bar */}
        <div
          ref={searchRef}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] w-96 max-w-[calc(100vw-2rem)]"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {!searchLoading && searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchOpen(false); }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              placeholder="Search for a place…"
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-border bg-card/95 backdrop-blur shadow-lg outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
            />
          </div>

          {searchOpen && searchResults.length > 0 && (
            <div className="mt-1.5 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
              {searchResults.map((r) => (
                <button
                  key={r.place_id}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors flex items-start gap-2.5"
                  onClick={() => flyToResult(r)}
                >
                  <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2 leading-snug">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

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

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant={tileLayer === "satellite" ? "default" : "outline"}
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setTileLayer("satellite")}
              >
                <Satellite className="h-3.5 w-3.5" />
                Satellite
              </Button>
              <Button
                variant={tileLayer === "street" ? "default" : "outline"}
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setTileLayer("street")}
              >
                <MapIcon className="h-3.5 w-3.5" />
                Street
              </Button>
            </div>

            <div className="mt-2">
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
