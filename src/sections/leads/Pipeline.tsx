"use client";

import { useState, useMemo } from "react";
import {
  GripVertical,
  MapPin,
  UserPlus,
  Search,
  Filter,
  DollarSign,
  Phone,
  Mail,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  X,
  Plus,
} from "lucide-react";
import { LEAD_STATUSES, formatValue, type Lead } from "@/lib/leads";
import { PriorityBadge, stageColor } from "./lead-ui";

function WhatsAppIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.779.98-.955 1.18-.176.2-.352.226-.653.075-1.636-.821-2.708-1.464-3.79-3.32-.286-.492.286-.456.818-1.52.09-.18.045-.338-.023-.488-.068-.15-.678-1.636-.93-2.242-.244-.59-.493-.51-.678-.52-.176-.008-.377-.01-.578-.01-.2 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511 0 1.482 1.08 2.912 1.23 3.113.15.201 2.126 3.247 5.151 4.554 1.776.767 2.479.799 3.364.667.545-.082 1.78-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.578-.352z" />
      <path d="M12.004 0C5.373 0 0 5.373 0 12c0 2.118.552 4.107 1.516 5.839L.055 23.44l5.772-1.492A11.94 11.94 0 0012.004 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 21.84c-1.84 0-3.567-.5-5.06-1.37l-.362-.213-3.754.97.99-3.66-.234-.374A9.816 9.816 0 012.164 12c0-5.426 4.414-9.84 9.84-9.84 5.426 0 9.84 4.414 9.84 9.84 0 5.426-4.414 9.84-9.84 9.84z" />
    </svg>
  );
}

export default function Pipeline({
  leads,
  onOpenLead,
  onMove,
  onAddLead,
}: {
  leads: Lead[];
  onOpenLead: (id: string) => void;
  onMove: (id: string, status: string) => Promise<void>;
  onAddLead?: () => void;
}) {
  const [moving, setMoving] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        l.business_name.toLowerCase().includes(q) ||
        (l.contact_person && l.contact_person.toLowerCase().includes(q)) ||
        (l.category && l.category.toLowerCase().includes(q)) ||
        (l.phone && l.phone.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q));

      const matchCategory =
        selectedCategory === "ALL" ||
        (l.category && l.category.toLowerCase().includes(selectedCategory.toLowerCase()));

      const matchPriority = selectedPriority === "ALL" || l.priority === selectedPriority;

      return matchSearch && matchCategory && matchPriority;
    });
  }, [leads, search, selectedCategory, selectedPriority]);

  const byStatus = (status: string) => filteredLeads.filter((l) => l.status === status);

  // Financial summary
  const totalPipelineValue = useMemo(() => {
    return leads
      .filter((l) => l.status !== "Lost")
      .reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  }, [leads]);

  const activeDealsCount = useMemo(() => {
    return leads.filter((l) => l.status !== "Won" && l.status !== "Lost").length;
  }, [leads]);

  return (
    <div className="space-y-4">
      {/* PIPELINE TOP COMMAND BAR & METRICS */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-[#0d121d] p-3.5 rounded-2xl border border-slate-800/80 shadow-xl">
        {/* Left: Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by name, contact, category..."
              className="w-full rounded-xl border border-slate-800 bg-[#07090e] py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/60 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {[
              { id: "ALL", label: "All Sectors" },
              { id: "hospital", label: "Hospital" },
              { id: "school", label: "School" },
              { id: "pharmacy", label: "Pharmacy" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-slate-700 text-white shadow-sm font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-lg border border-slate-800 bg-[#07090e] px-2.5 py-1 text-xs text-slate-300 outline-none cursor-pointer hover:border-slate-700"
          >
            <option value="ALL">Priority: All</option>
            <option value="Hot">Priority: Hot 🔥</option>
            <option value="High">Priority: High</option>
            <option value="Medium">Priority: Medium</option>
            <option value="Low">Priority: Low</option>
          </select>
        </div>

        {/* Right: Metrics & Add Lead Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-[#07090e] px-3 py-1.5 rounded-xl border border-slate-800">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-1.5">
                Pipeline Value:
              </span>
              <span className="text-xs font-bold text-emerald-300 font-mono">
                {formatValue(totalPipelineValue)}
              </span>
              <span className="text-[10px] text-slate-500 ml-1">({activeDealsCount} active)</span>
            </div>
          </div>

          {onAddLead && (
            <button
              onClick={onAddLead}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-sky-500/20 hover:from-sky-400 hover:to-sky-300 transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" /> New Lead
            </button>
          )}
        </div>
      </div>

      {/* HORIZONTAL SCROLLING KANBAN BOARD */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[calc(100vh-250px)] custom-scrollbar">
        {LEAD_STATUSES.map((stage) => {
          const stageLeads = byStatus(stage);
          const stageValue = stageLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
          const isOver = dragOverStage === stage;

          return (
            <div
              key={stage}
              className="w-80 min-w-[320px] flex flex-col rounded-2xl border border-slate-800/80 bg-[#0d121d] shadow-xl overflow-hidden shrink-0"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 px-3.5 py-3 bg-[#0a0e17] shrink-0">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shadow-sm"
                    style={{ background: stageColor(stage), boxShadow: `0 0 8px ${stageColor(stage)}` }}
                  />
                  <span className="text-xs font-bold text-white tracking-tight">{stage}</span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    {stageLeads.length}
                  </span>
                </div>

                {stageValue > 0 && (
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {formatValue(stageValue)}
                  </span>
                )}
              </div>

              {/* Column Cards Drop Area */}
              <div
                className={`flex-1 flex flex-col gap-2.5 p-2.5 overflow-y-auto transition-all ${
                  isOver ? "bg-sky-500/10 ring-2 ring-sky-500/40" : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverStage !== stage) setDragOverStage(stage);
                }}
                onDragLeave={() => {
                  if (dragOverStage === stage) setDragOverStage(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverStage(null);
                  const id = e.dataTransfer.getData("text/lead-id");
                  if (id && !moving) {
                    setMoving(id);
                    onMove(id, stage).finally(() => setMoving(null));
                  }
                }}
              >
                {stageLeads.map((lead) => {
                  const initials = lead.business_name
                    ? lead.business_name.slice(0, 2).toUpperCase()
                    : "LD";

                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/lead-id", lead.id)}
                      onClick={() => onOpenLead(lead.id)}
                      className="group cursor-grab active:cursor-grabbing rounded-xl border border-slate-800 bg-[#090d16] p-3.5 hover:border-slate-700 hover:bg-[#0c111a] transition-all shadow-md relative"
                    >
                      {/* Top Row: Avatar + Business Name */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-[10px] shrink-0 shadow-inner">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-white tracking-tight">
                              {lead.business_name}
                            </p>
                            {lead.contact_person && (
                              <p className="truncate text-[11px] text-slate-400 font-medium">
                                {lead.contact_person}
                              </p>
                            )}
                          </div>
                        </div>

                        {lead.estimated_value != null && (
                          <span className="shrink-0 text-[11px] font-bold text-emerald-400 font-mono bg-emerald-950/30 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                            {formatValue(lead.estimated_value)}
                          </span>
                        )}
                      </div>

                      {/* Middle: Category & Location */}
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                        {lead.category && (
                          <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-slate-300 font-medium truncate max-w-[140px] border border-slate-700/50">
                            {lead.category}
                          </span>
                        )}
                        {lead.address && (
                          <span className="flex items-center gap-1 truncate text-slate-500">
                            <MapPin className="h-2.5 w-2.5 shrink-0 text-slate-500" />
                            {lead.address.split(",")[0]}
                          </span>
                        )}
                      </div>

                      {/* Badges Row */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <PriorityBadge priority={lead.priority} />
                        {lead.lead_score >= 60 && (
                          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                            {lead.lead_score}/100
                          </span>
                        )}
                        <span className="ml-auto rounded bg-[#07090e] px-1.5 py-0.5 text-[10px] text-slate-500 font-mono border border-slate-800">
                          {lead.lead_source}
                        </span>
                      </div>

                      {/* Bottom Actions: WhatsApp & Stage Mover */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
                        {lead.phone || lead.whatsapp ? (
                          <a
                            href={`https://wa.me/${(lead.whatsapp || lead.phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Hello ${lead.contact_person || lead.business_name}, following up from LANGRATIA regarding your ${lead.category || "software"} project.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 px-2 py-1 rounded-md transition-colors"
                            title="Direct WhatsApp Chat"
                          >
                            <WhatsAppIcon className="h-3 w-3 text-emerald-400" /> WhatsApp
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-600">No phone</span>
                        )}

                        <select
                          value={stage}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.value && e.target.value !== stage && !moving) {
                              setMoving(lead.id);
                              onMove(lead.id, e.target.value).finally(() => setMoving(null));
                            }
                          }}
                          className="cursor-pointer rounded-md border border-slate-800 bg-[#07090e] px-2 py-0.5 text-[10px] font-semibold text-slate-300 outline-none hover:border-slate-700 max-w-[120px]"
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s === stage ? `✓ ${s}` : `Move → ${s}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/80 py-10 px-4 text-center">
                    <span className="text-xs font-semibold text-slate-500">No leads in {stage}</span>
                    <span className="text-[10px] text-slate-600 mt-0.5">Drag and drop cards here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}