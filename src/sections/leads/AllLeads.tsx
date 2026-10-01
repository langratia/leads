"use client";

import { useMemo, useState } from "react";
import { Search, ArrowDownUp, UserPlus } from "lucide-react";
import { Card, DataTable, Badge, Avatar, type Column } from "@/app/admin/ui";
import { StatusBadge, PriorityBadge, SourceBadge, leadContact } from "./lead-ui";
import {
  formatDate,
  formatValue,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  type Lead,
} from "@/lib/leads";

export default function AllLeads({
  leads,
  onOpenLead,
  onAddLead,
  onBulkStatus,
  query,
  setQuery,
}: {
  leads: Lead[];
  onOpenLead: (id: string) => void;
  onAddLead: () => void;
  onBulkStatus: (ids: string[], status: string) => Promise<void>;
  query: string;
  setQuery: (q: string) => void;
}) {
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [source, setSource] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);

  const sources = useMemo(() => Array.from(new Set(leads.map((l) => l.lead_source))).sort(), [leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (status !== "All" && l.status !== status) return false;
      if (priority !== "All" && l.priority !== priority) return false;
      if (source !== "All" && l.lead_source !== source) return false;
      if (!q) return true;
      return [l.business_name, l.contact_person, l.phone, l.email, l.address, (l.tags || []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [leads, query, status, priority, source]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const columns: Column<Lead>[] = [
    {
      key: "sel",
      header: "",
      width: "40px",
      render: (r) => (
        <input
          type="checkbox"
          checked={selected.includes(r.id)}
          onChange={() => toggle(r.id)}
          onClick={(e) => e.stopPropagation()}
          className="h-3.5 w-3.5 cursor-pointer accent-sky-500"
        />
      ),
    },
    {
      key: "business",
      header: "Business",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.business_name} />
          <div>
            <p className="font-medium text-white">{r.business_name}</p>
            <p className="text-xs text-[#737373]">{leadContact(r) || (r.tags || []).join(", ") || "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (r) => <span className="text-[#a3a3a3]">{r.category || "—"}</span> },
    { key: "source", header: "Source", render: (r) => <SourceBadge source={r.lead_source} /> },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    { key: "priority", header: "Priority", render: (r) => <PriorityBadge priority={r.priority} /> },
    {
      key: "score",
      header: "Score",
      render: (r) => (
        <span className={`font-semibold ${r.lead_score >= 60 ? "text-emerald-400" : r.lead_score >= 35 ? "text-amber-400" : "text-[#a3a3a3]"}`}>
          {r.lead_score}
        </span>
      ),
    },
    { key: "value", header: "Value", align: "right", render: (r) => <span className="font-semibold text-white">{formatValue(r.estimated_value)}</span> },
    {
      key: "followup",
      header: "Next follow-up",
      render: (r) => (
        <span className="text-[#a3a3a3]">
          {r.next_followup_date ? formatDate(r.next_followup_date) : "—"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: (r) => <span className="text-[#737373]">{formatDate(r.created_at)}</span>,
    },
  ];

  const selectCls =
    "cursor-pointer rounded-lg border border-[#2b2b2b] bg-[#0a0a0a] px-2.5 py-1.5 text-xs font-semibold text-[#d4d4d4] outline-none focus:border-sky-500/60";

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-3">
          <span className="text-xs font-semibold text-sky-300">{selected.length} selected</span>
          <select
            className={selectCls}
            value=""
            onChange={async (e) => {
              if (e.target.value) {
                await onBulkStatus(selected, e.target.value);
                setSelected([]);
              }
            }}
          >
            <option value="">Change status…</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className={selectCls} value="" onChange={async (e) => { if (e.target.value) { await onBulkStatus(selected, e.target.value); setSelected([]); } }}>
            <option value="">Set priority…</option>
            {LEAD_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}

      <Card
        title="All leads"
        subtitle={`${filtered.length} shown of ${leads.length} total`}
        bodyClassName="p-0"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c5c5c]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search business, contact, phone…"
                className="w-60 rounded-lg border border-[#2b2b2b] bg-[#0a0a0a] py-2 pl-9 pr-3 text-[13px] text-[#e5e5e5] placeholder:text-[#5c5c5c] outline-none focus:border-sky-500/60"
              />
            </label>
            <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All statuses</option>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className={selectCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="All">All priorities</option>
              {LEAD_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className={selectCls} value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="All">All sources</option>
              {sources.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={onAddLead} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-500/20 hover:bg-sky-400">
              <UserPlus className="h-3.5 w-3.5" /> Add Lead
            </button>
          </div>
        }
      >
        <div
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target instanceof HTMLInputElement) return;
          }}
        >
          <DataTable
            columns={columns}
            rows={filtered}
            empty="No leads match your filters."
            onRowClick={(r) => onOpenLead(r.id)}
          />
        </div>
      </Card>

      {filtered.length > 0 && (
        <p className="mt-2 px-1 text-[11px] text-[#5c5c5c]">
          <ArrowDownUp className="mr-1 inline h-3 w-3" />
          Click any row to open the lead profile.
        </p>
      )}
    </div>
  );
}