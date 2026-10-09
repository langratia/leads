"use client";

import { useState, useMemo } from "react";
import {
  Compass,
  MapPin,
  Navigation,
  Clock,
  ArrowUp,
  ArrowDown,
  Trash2,
  ExternalLink,
  MessageSquare,
  Printer,
  Copy,
  Check,
  Building,
  Phone,
  CheckCircle2,
  X,
  Share2,
  Car,
  Layers,
  Sparkles,
} from "lucide-react";
import type { Lead } from "./model/types";

export interface TerritoryZone {
  id: string;
  name: string;
  tagline: string;
  keywords: string[];
  optimalHours: string;
  trafficTip: string;
  color: string;
}

export const KAMPALA_ZONES: TerritoryZone[] = [
  {
    id: "cbd_nakasero",
    name: "Zone 1: CBD & Nakasero Hill",
    tagline: "Central Business District, Kololo, Lumumba Ave, Parliamentary Ave",
    keywords: ["nakasero", "kololo", "kampala road", "lumumba", "kyaggwe", "city square", "jinja road", "central", "parliament"],
    optimalHours: "09:00 AM – 12:30 PM",
    trafficTip: "Arrive before 08:30 AM to secure Nakasero parking; avoid Clock Tower during evening rush.",
    color: "#38bdf8",
  },
  {
    id: "industrial_east",
    name: "Zone 2: Industrial Area & East Corridor",
    tagline: "Nakawa, Bugolobi, Luzira, Jinja Road Industrial Park, Banda",
    keywords: ["nakawa", "bugolobi", "luzira", "banda", "industrial", "lugogo", "port bell", "kyambogo", "mutungo"],
    optimalHours: "10:00 AM – 03:00 PM",
    trafficTip: "Use Lugogo Bypass or Port Bell road to avoid heavy Jinja Road truck bottlenecks.",
    color: "#f59e0b",
  },
  {
    id: "tech_northern",
    name: "Zone 3: Tech Hub & Northern Suburbs",
    tagline: "Ntinda, Bukoto, Naguru, Kiwatule, Kisaasi, Naalya",
    keywords: ["ntinda", "bukoto", "naguru", "kiwatule", "kisaasi", "naalya", "kyanja", "kamwokya", "kulambiro"],
    optimalHours: "10:30 AM – 04:30 PM",
    trafficTip: "Northern Bypass provides fast corridor transitions between Bukoto, Kiwatule, and Naalya.",
    color: "#10b981",
  },
  {
    id: "south_entebbe",
    name: "Zone 4: South Corridor & Entebbe Road",
    tagline: "Kibuye, Najjanankumbi, Namasuba, Lubowa, Kajjansi, Entebbe",
    keywords: ["kibuye", "najjanankumbi", "namasuba", "lubowa", "seguku", "kajjansi", "entebbe", "makindye", "katwe"],
    optimalHours: "09:30 AM – 02:00 PM",
    trafficTip: "Utilize Entebbe Expressway at Kajjansi/Busega to avoid notorious Kibuye roundabout traffic.",
    color: "#a78bfa",
  },
  {
    id: "west_makerere",
    name: "Zone 5: West Corridor & Makerere",
    tagline: "Old Kampala, Mengo, Rubaga, Wandegeya, Bwaise, Kawempe",
    keywords: ["old kampala", "mengo", "rubaga", "wandegeya", "makerere", "bwaise", "kawempe", "kasubi", "namirembe"],
    optimalHours: "10:00 AM – 03:30 PM",
    trafficTip: "Avoid Bwaise roundabouts after 04:30 PM; use Sir Apollo Kaggwa road for swift Mengo access.",
    color: "#fb7185",
  },
];

interface TerritoryRoutePlannerModalProps {
  leads: Lead[];
  isOpen: boolean;
  onClose: () => void;
}

export default function TerritoryRoutePlannerModal({
  leads,
  isOpen,
  onClose,
}: TerritoryRoutePlannerModalProps) {
  const [selectedZone, setSelectedZone] = useState<TerritoryZone>(KAMPALA_ZONES[0]);
  const [showAllLeads, setShowAllLeads] = useState(false);
  const [routeStops, setRouteStops] = useState<Lead[]>([]);
  const [repName, setRepName] = useState("Sales Rep 1");
  const [plannedDate, setPlannedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Filter leads matching the selected territory zone
  const matchingLeads = useMemo(() => {
    if (showAllLeads) return leads;
    const kw = selectedZone.keywords;
    return leads.filter((lead) => {
      const text = `${lead.address || ""} ${lead.business_name} ${lead.notes || ""}`.toLowerCase();
      return kw.some((k) => text.includes(k));
    });
  }, [leads, selectedZone, showAllLeads]);

  if (!isOpen) return null;

  const isStopSelected = (leadId: string) => routeStops.some((s) => s.id === leadId);

  const toggleStop = (lead: Lead) => {
    if (isStopSelected(lead.id)) {
      setRouteStops((prev) => prev.filter((s) => s.id !== lead.id));
    } else {
      if (routeStops.length >= 8) {
        alert("Maximum of 8 stops per day recommended for optimal meeting quality and Kampala traffic management.");
        return;
      }
      setRouteStops((prev) => [...prev, lead]);
    }
  };

  const moveStop = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= routeStops.length) return;
    const copy = [...routeStops];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setRouteStops(copy);
  };

  const removeStop = (leadId: string) => {
    setRouteStops((prev) => prev.filter((s) => s.id !== leadId));
  };

  // Build Multi-Stop Google Maps Directions URL
  const generateGoogleMapsUrl = () => {
    if (routeStops.length === 0) return "#";
    if (routeStops.length === 1) {
      const stop = routeStops[0];
      const query = encodeURIComponent(`${stop.business_name}, ${stop.address || "Kampala, Uganda"}`);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    const origin = "Current+Location";
    const lastStop = routeStops[routeStops.length - 1];
    const destination = encodeURIComponent(`${lastStop.business_name}, ${lastStop.address || "Kampala, Uganda"}`);

    // Intermediate stops (waypoints)
    const waypoints = routeStops
      .slice(0, routeStops.length - 1)
      .map((s) => encodeURIComponent(`${s.business_name}, ${s.address || "Kampala, Uganda"}`))
      .join("|");

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
  };

  // Pre-calculate meeting timeline hours
  const getTimeSlot = (index: number) => {
    const slots = [
      "09:30 AM – 10:30 AM",
      "11:15 AM – 12:15 PM",
      "01:45 PM – 02:45 PM",
      "03:30 PM – 04:30 PM",
      "05:00 PM – 06:00 PM",
    ];
    return slots[index] || `Stop ${index + 1} Slot`;
  };

  const handleLaunchGoogleMaps = () => {
    const url = generateGoogleMapsUrl();
    if (url !== "#") {
      window.open(url, "_blank");
    }
  };

  const handleWhatsAppDispatch = () => {
    if (routeStops.length === 0) {
      alert("Please add at least one stop to your route.");
      return;
    }

    const mapsUrl = generateGoogleMapsUrl();
    let message = `📍 *LANGRATIA FIELD SALES ROUTE*
----------------------------------------
*Rep:* ${repName}
*Date:* ${plannedDate}
*Territory:* ${selectedZone.name}
*Stops:* ${routeStops.length} Client Visits

*ITINERARY:*
`;

    routeStops.forEach((stop, idx) => {
      message += `\n*Stop ${idx + 1} (${getTimeSlot(idx)}):*
• *Company:* ${stop.business_name}
• *Address:* ${stop.address || "Kampala"}
• *Contact:* ${stop.contact_person || "Manager"} (${stop.phone || "No phone"})
• *Deal Value:* ${stop.estimated_value ? "UGX " + stop.estimated_value.toLocaleString() : "Custom"}
`;
    });

    message += `\n🗺️ *Turn-by-Turn Google Maps Route:*
${mapsUrl}

*FIELD CHECKLIST:*
✓ Tablet / Laptop with live demo
✓ Company brochure & proposal forms
✓ MTN MoMo / Bank account details
✓ Professional business cards

Good luck in the field! Drive safely.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const handleCopyItinerary = () => {
    if (routeStops.length === 0) return;
    const mapsUrl = generateGoogleMapsUrl();
    let text = `LANGRATIA FIELD ROUTE: ${selectedZone.name} (${plannedDate})\n`;
    routeStops.forEach((s, idx) => {
      text += `${idx + 1}. ${s.business_name} - ${s.address || "Kampala"} (${getTimeSlot(idx)}) [Tel: ${s.phone || "—"}]\n`;
    });
    text += `Google Maps Navigation: ${mapsUrl}\n`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-sky-500/30 bg-[#0d121d] shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-gradient-to-r from-sky-950/30 via-[#07090e] to-indigo-950/20">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-slate-950 font-black shadow-lg shadow-sky-500/20">
              <Compass className="h-5 w-5 fill-current" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Kampala Territory Route Planner & Navigation
                </h2>
                <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-sky-300 border border-sky-500/30">
                  Field Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cluster client visits geographically, avoid Kampala traffic bottlenecks, and launch 1-click turn-by-turn navigation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* TERRITORY ZONE TABS */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 bg-[#07090e] px-6 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            Commercial Zone:
          </span>
          {KAMPALA_ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedZone.id === zone.id
                  ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>{zone.name}</span>
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ZONE TRAFFIC & CONTEXT BANNER */}
          <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-white flex items-center gap-2">
                <Car className="h-4 w-4 text-sky-400" />
                <span>{selectedZone.tagline}</span>
              </div>
              <p className="text-slate-400">
                💡 <span className="font-medium text-slate-300">Traffic Advisory:</span> {selectedZone.trafficTip}
              </p>
            </div>

            <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-4">
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Optimal Windows</div>
                <div className="font-mono font-bold text-sky-300">{selectedZone.optimalHours}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Zone Leads</div>
                <div className="font-mono font-bold text-emerald-400">{matchingLeads.length} Available</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: AVAILABLE LEADS IN ZONE (5 Cols) */}
            <div className="lg:col-span-5 space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Available Prospects ({matchingLeads.length})
                  </span>
                </div>

                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllLeads}
                    onChange={(e) => setShowAllLeads(e.target.checked)}
                    className="rounded border-slate-800 bg-[#07090e] text-sky-500 focus:ring-0"
                  />
                  <span>Show all areas</span>
                </label>
              </div>

              {/* LIST OF PROSPECTS */}
              <div className="rounded-xl border border-slate-800 bg-[#07090e] p-2 space-y-2 max-h-[380px] overflow-y-auto">
                {matchingLeads.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No leads found matching this zone&apos;s location keywords. Check &quot;Show all areas&quot; or discover new leads in Finder.
                  </div>
                ) : (
                  matchingLeads.map((lead) => {
                    const selected = isStopSelected(lead.id);
                    return (
                      <div
                        key={lead.id}
                        className={`rounded-lg border p-3 transition-all flex items-start justify-between gap-2 ${
                          selected
                            ? "border-sky-500/40 bg-sky-950/20"
                            : "border-slate-800/80 bg-[#0d121d] hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="font-bold text-xs text-white truncate">
                            {lead.business_name}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                            <span className="truncate">{lead.address || "Kampala"}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span>{lead.category || "General"}</span>
                            {lead.phone && <span>• {lead.phone}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleStop(lead)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all shrink-0 ${
                            selected
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                              : "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm"
                          }`}
                        >
                          {selected ? "Remove" : "+ Add"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: ACTIVE ROUTE ITINERARY (7 Cols) */}
            <div className="lg:col-span-7 space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Navigation className="h-4 w-4" /> Selected Field Sequence ({routeStops.length} Stops)
                </span>

                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    placeholder="Field Rep Name"
                    className="rounded-lg border border-slate-800 bg-[#07090e] px-2 py-1 text-xs text-slate-200 w-28"
                  />
                  <input
                    type="date"
                    value={plannedDate}
                    onChange={(e) => setPlannedDate(e.target.value)}
                    className="rounded-lg border border-slate-800 bg-[#07090e] px-2 py-1 text-xs text-slate-200"
                  />
                </div>
              </div>

              {/* STOPS LIST */}
              <div className="rounded-xl border border-slate-800 bg-[#07090e] p-3 space-y-2 min-h-[260px] max-h-[380px] overflow-y-auto">
                {routeStops.length === 0 ? (
                  <div className="h-56 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs space-y-2">
                    <Navigation className="h-8 w-8 text-slate-700" />
                    <p className="font-semibold text-slate-400">No stops added to today&apos;s route yet</p>
                    <p className="max-w-xs text-[11px]">
                      Select accounts from the left panel to build your daily sequenced route itinerary along Kampala corridors.
                    </p>
                  </div>
                ) : (
                  routeStops.map((stop, idx) => (
                    <div
                      key={stop.id}
                      className="rounded-xl border border-slate-800 bg-[#0d121d] p-3.5 flex items-center justify-between gap-3 shadow-sm hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 font-bold text-xs border border-emerald-500/20 shrink-0">
                          {idx + 1}
                        </div>

                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white truncate">
                              {stop.business_name}
                            </span>
                            <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-mono text-slate-400">
                              {getTimeSlot(idx)}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                            <span className="truncate">{stop.address || "Kampala"}</span>
                          </div>

                          <div className="text-[10px] text-slate-500">
                            Attn: {stop.contact_person || "Manager"} • Tel: {stop.phone || "—"}
                          </div>
                        </div>
                      </div>

                      {/* REORDER & REMOVE CONTROLS */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveStop(idx, "up")}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === routeStops.length - 1}
                          onClick={() => moveStop(idx, "down")}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStop(stop.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                          title="Remove stop"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ROUTE ACTIONS & NAVIGATION BAR */}
              <div className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-white">{routeStops.length} stops</span> sequenced for{" "}
                  <span className="font-semibold text-sky-400">{repName}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={routeStops.length === 0}
                    onClick={handleCopyItinerary}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0d121d] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors disabled:opacity-40"
                  >
                    {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSummary ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={routeStops.length === 0}
                    onClick={handleWhatsAppDispatch}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Send to Rep WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    disabled={routeStops.length === 0}
                    onClick={handleLaunchGoogleMaps}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-all shadow-md shadow-sky-500/20 disabled:opacity-40 cursor-pointer"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Launch Google Maps Route</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="border-t border-slate-800 px-6 py-3.5 bg-[#07090e]/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Powered by LANGRATIA Google Maps Multi-Stop Waypoint Routing Engine
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-800 bg-[#0d121d] px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Close Planner
          </button>
        </div>
      </div>
    </div>
  );
}
