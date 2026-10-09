"use client";

import { useState, useMemo } from "react";
import { config } from "@/config";
import { MapPin, Search, TrendingUp, X, Plus } from "lucide-react";
import { formatValue } from "@/core/format";
import { LEAD_STATUSES, type Lead } from "@/crm/leads";
import { PriorityBadge, stageColor } from "./lead-ui";
import WhatsAppModal from "./WhatsAppModal";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [whatsAppLead, setWhatsAppLead] = useState<Lead | null>(null);

  /* Sectors come from the deployment config, not a hardcoded list, so a
     client deployment filters for the sectors it actually sells into. */
  const sectors = useMemo(
    () =>
      config.targetCategories.map((c) => ({
        id: c,
        label: c.charAt(0).toUpperCase() + c.slice(1),
      })),
    [],
  );

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const matchSearch =
        !q ||
        l.business_name.toLowerCase().includes(q) ||
        (l.contact_person && l.contact_person.toLowerCase().includes(q)) ||
        (l.category && l.category.toLowerCase().includes(q)) ||
        (l.phone && l.phone.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q));

      const matchCategory =
        !selectedCategory ||
        (l.category && l.category.toLowerCase().includes(selectedCategory.toLowerCase()));

      const matchPriority = !selectedPriority || l.priority === selectedPriority;

      return matchSearch && matchCategory && matchPriority;
    });
  }, [leads, search, selectedCategory, selectedPriority]);

  const byStatus = (status: string) => filteredLeads.filter((l) => l.status === status);

  const openDeals = useMemo(
    () => leads.filter((l) => l.status !== "Won" && l.status !== "Lost"),
    [leads],
  );
  const totalPipelineValue = useMemo(
    () => openDeals.reduce((sum, l) => sum + (l.estimated_value || 0), 0),
    [openDeals],
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-[#0d121d] p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, contact, category…"
              aria-label="Search pipeline"
              className="w-full rounded-lg border border-slate-800 bg-[#0b0f19] py-2 pl-8 pr-8 text-xs text-slate-200 placeholder:text-slate-500 outline-none transition-colors focus:border-sky-500/60"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory("")}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                !selectedCategory ? "bg-slate-800 font-bold text-white" : "text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              All sectors
            </button>
            {sectors.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedCategory(selectedCategory === s.id ? "" : s.id)}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  selectedCategory === s.id ? "bg-slate-800 font-bold text-white" : "text-slate-400 hover:bg-slate-800/60"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            aria-label="Filter by priority"
            className="cursor-pointer rounded-lg border border-slate-800 bg-[#0b0f19] px-2.5 py-2 text-xs text-slate-300 outline-none transition-colors hover:border-slate-700"
          >
            <option value="">All priorities</option>
            {["Hot", "High", "Medium", "Low"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0b0f19] px-3 py-2">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <div>
              <span className="mr-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Pipeline
              </span>
              <span className="text-xs font-bold tabular-nums text-emerald-300">
                {formatValue(totalPipelineValue)}
              </span>
              <span className="ml-1 text-[10px] text-slate-500">({openDeals.length} open)</span>
            </div>
          </div>
          {onAddLead && (
            <button
              onClick={onAddLead}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-2 text-xs font-bold text-slate-950 shadow-sm shadow-sky-500/20 transition-colors hover:bg-sky-400"
            >
              <Plus className="h-3.5 w-3.5" /> New lead
            </button>
          )}
        </div>
      </div>

      {/* Kanban */}
      <div className="flex min-h-[60vh] gap-4 overflow-x-auto pb-2">
        {LEAD_STATUSES.map((stage) => {
          const stageLeads = byStatus(stage);
          const stageValue = stageLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
          const isOver = dragOverStage === stage;

          return (
            <div
              key={stage}
              className="flex w-80 min-w-[300px] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-[#0d121d]"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#090d16] px-3.5 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: stageColor(stage) }}
                  />
                  <span className="text-xs font-bold tracking-tight text-white">{stage}</span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-300">
                    {stageLeads.length}
                  </span>
                </div>
                {stageValue > 0 && (
                  <span className="text-[11px] font-bold tabular-nums text-slate-400">
                    {formatValue(stageValue)}
                  </span>
                )}
              </div>

              <div
                className={`flex flex-1 flex-col gap-2.5 overflow-y-auto p-2.5 transition-colors ${
                  isOver ? "bg-sky-500/10 ring-2 ring-inset ring-sky-500/40" : ""
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
                      className="group cursor-grab rounded-lg border border-slate-800 bg-[#090d16] p-3.5 transition-colors hover:border-slate-700 hover:bg-[#141b29] active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-[10px] font-bold text-sky-400">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold tracking-tight text-white">
                              {lead.business_name}
                            </p>
                            {lead.contact_person && (
                              <p className="truncate text-[11px] font-medium text-slate-400">
                                {lead.contact_person}
                              </p>
                            )}
                          </div>
                        </div>

                        {lead.estimated_value != null && (
                          <span className="shrink-0 rounded-md border border-emerald-800/40 bg-emerald-950/30 px-2 py-0.5 text-[11px] font-bold tabular-nums text-emerald-400">
                            {formatValue(lead.estimated_value)}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                        {lead.category && (
                          <span className="max-w-[140px] truncate rounded border border-slate-700/50 bg-slate-800/80 px-1.5 py-0.5 font-medium text-slate-300">
                            {lead.category}
                          </span>
                        )}
                        {lead.address && (
                          <span className="flex min-w-0 items-center gap-1 text-slate-500">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">{lead.address.split(",")[0]}</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <PriorityBadge priority={lead.priority} />
                        {lead.lead_score >= 60 && (
                          <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-emerald-400">
                            {lead.lead_score}
                          </span>
                        )}
                        <span className="ml-auto rounded border border-slate-800 bg-[#07090e] px-1.5 py-0.5 text-[10px] text-slate-500">
                          {lead.lead_source}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-800/60 pt-2.5">
                        {lead.phone || lead.whatsapp ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWhatsAppLead(lead);
                            }}
                            className="flex cursor-pointer items-center gap-1 rounded-md border border-emerald-800/40 bg-emerald-950/40 px-2 py-1 text-[10px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-900/50"
                          >
                            <WhatsAppIcon className="h-3 w-3" /> WhatsApp
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">No phone</span>
                        )}

                        {/* Also the keyboard route for changing stage — drag
                            alone is not reachable without a mouse. */}
                        <select
                          value={stage}
                          aria-label={`Move ${lead.business_name} to another stage`}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            if (e.target.value && e.target.value !== stage && !moving) {
                              setMoving(lead.id);
                              onMove(lead.id, e.target.value).finally(() => setMoving(null));
                            }
                          }}
                          className="max-w-[120px] cursor-pointer rounded-md border border-slate-800 bg-[#07090e] px-2 py-1 text-[10px] font-semibold text-slate-300 outline-none hover:border-slate-700"
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800/80 px-4 py-10 text-center">
                    <span className="text-xs font-semibold text-slate-500">No leads in {stage}</span>
                    <span className="mt-0.5 text-[10px] text-slate-500">Drop a card here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <WhatsAppModal
        lead={whatsAppLead}
        isOpen={!!whatsAppLead}
        onClose={() => setWhatsAppLead(null)}
      />
    </div>
  );
}