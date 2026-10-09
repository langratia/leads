import { useEffect, useMemo, useState } from "react";
import { Download, MessageSquare, Mail, Phone, Users } from "lucide-react";
import { Card, DataTable, Avatar, Toolbar, btnGhost, type Column } from "@/core/ui";
import { StatusBadge, PriorityBadge, SourceBadge, leadContact } from "./lead-ui";
import { formatDate, formatValue } from "@/core/format";
import { exportToCSV, exportToVCard } from "@/core/export-utils";
import { LEAD_STATUSES, LEAD_PRIORITIES, type Lead } from "@/crm/leads";
import WhatsAppModal from "./WhatsAppModal";
import BulkWhatsAppModal from "./BulkWhatsAppModal";
import BulkEmailModal from "./BulkEmailModal";

export default function AllLeads({
  leads,
  onOpenLead,
  onBulkUpdate,
  query,
  setQuery,
}: {
  leads: Lead[];
  onOpenLead: (id: string) => void;
  onBulkUpdate: (ids: string[], patch: { status?: string; priority?: string }) => Promise<void>;
  query: string;
  setQuery: (q: string) => void;
}) {
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [source, setSource] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [whatsAppLead, setWhatsAppLead] = useState<Lead | null>(null);
  const [bulkWhatsAppOpen, setBulkWhatsAppOpen] = useState(false);
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);

  const selectedLeads = useMemo(
    () => leads.filter((l) => selected.includes(l.id)),
    [leads, selected]
  );

  const doVCardExport = () => {
    const target = selectedLeads.length > 0 ? selectedLeads : filtered;
    exportToVCard(target, "langratia_contacts");
  };

  const sources = useMemo(
    () => Array.from(new Set(leads.map((l) => l.lead_source))).sort(),
    [leads],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (status && l.status !== status) return false;
      if (priority && l.priority !== priority) return false;
      if (source && l.lead_source !== source) return false;
      if (!q) return true;
      return [l.business_name, l.contact_person, l.phone, l.email, l.address, (l.tags || []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [leads, query, status, priority, source]);

  /* Filters changing invalidates the selection — otherwise a bulk action silently
     applies to rows the user can no longer see. */
  useEffect(() => {
    setSelected([]);
  }, [query, status, priority, source]);

  const allVisibleSelected = filtered.length > 0 && selected.length === filtered.length;
  const toggleAll = () =>
    setSelected(allVisibleSelected ? [] : filtered.map((l) => l.id));
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const runBulk = (field: "status" | "priority") => async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value || selected.length === 0) return;
    await onBulkUpdate(selected, { [field]: value });
    setSelected([]);
  };

  const doExport = () => {
    exportToCSV(
      filtered.map((l) => ({
        Business: l.business_name,
        Contact: l.contact_person || "",
        Category: l.category || "",
        Phone: l.phone || "",
        Email: l.email || "",
        Address: l.address || "",
        Status: l.status,
        Priority: l.priority,
        Score: l.lead_score,
        Source: l.lead_source,
        "Est. value": l.estimated_value ?? "",
        "Next follow-up": l.next_followup_date || "",
        Created: l.created_at,
      })),
      "leads.csv",
    );
  };

  const columns: Column<Lead>[] = [
    {
      key: "sel",
      header: allVisibleSelected ? "☑" : "☐",
      width: "44px",
      render: (r) => (
        <input
          type="checkbox"
          checked={selected.includes(r.id)}
          onChange={() => toggle(r.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${r.business_name}`}
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
          <div className="min-w-0">
            <p className="font-medium text-white">{r.business_name}</p>
            <p className="truncate text-xs text-slate-500">
              {leadContact(r) || (r.tags || []).join(", ") || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (r) => <span className="text-slate-400">{r.category || "—"}</span>,
    },
    { key: "source", header: "Source", render: (r) => <SourceBadge source={r.lead_source} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "priority", header: "Priority", render: (r) => <PriorityBadge priority={r.priority} /> },
    {
      key: "score",
      header: "Score",
      render: (r) => (
        <span
          className={`font-semibold tabular-nums ${
            r.lead_score >= 60
              ? "text-emerald-400"
              : r.lead_score >= 35
                ? "text-amber-400"
                : "text-slate-400"
          }`}
        >
          {r.lead_score}
        </span>
      ),
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      render: (r) => <span className="font-semibold text-white">{formatValue(r.estimated_value)}</span>,
    },
    {
      key: "followup",
      header: "Next follow-up",
      render: (r) => (
        <span className={r.next_followup_date ? "text-slate-300" : "text-slate-500"}>
          {r.next_followup_date ? formatDate(r.next_followup_date) : "—"}
        </span>
      ),
    },
    { key: "created", header: "Created", render: (r) => <span className="text-slate-500">{formatDate(r.created_at)}</span> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => {
        const hasPhone = Boolean(r.whatsapp || r.phone);
        return (
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              disabled={!hasPhone}
              onClick={() => setWhatsAppLead(r)}
              title={hasPhone ? `WhatsApp outreach to ${r.business_name}` : "No phone available"}
              className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
                hasPhone
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 cursor-pointer"
                  : "border-slate-800/60 bg-transparent text-slate-600 opacity-30 cursor-not-allowed"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  const bulkCls =
    "cursor-pointer rounded-lg border border-slate-800 bg-[#0b0f19] px-2.5 py-2 text-xs font-medium text-slate-300 outline-none transition-colors hover:border-slate-700";

  return (
    <div>
      <Toolbar
        query={query}
        onQuery={setQuery}
        placeholder="Search business, contact, phone…"
        selects={[
          { value: status, onChange: setStatus, allLabel: "All statuses", options: LEAD_STATUSES.map((s) => ({ value: s, label: s })) },
          { value: priority, onChange: setPriority, allLabel: "All priorities", options: LEAD_PRIORITIES.map((p) => ({ value: p, label: p })) },
          { value: source, onChange: setSource, allLabel: "All sources", options: sources.map((s) => ({ value: s, label: s })) },
        ]}
        actions={
          <div className="ml-auto flex items-center gap-2.5">
            <span className="text-[11px] tabular-nums text-slate-500">
              {filtered.length} of {leads.length}
            </span>
            <button onClick={doExport} disabled={filtered.length === 0} className={`${btnGhost} py-1.5`}>
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
            <button onClick={doVCardExport} disabled={filtered.length === 0} className={`${btnGhost} py-1.5`} title="Export all filtered leads directly to phone contacts file (.vcf)">
              <Phone className="h-3.5 w-3.5 text-emerald-400" /> Contacts (.vcf)
            </button>
            <button onClick={toggleAll} disabled={filtered.length === 0} className={`${btnGhost} py-1.5`}>
              {allVisibleSelected ? "Clear selection" : "Select all"}
            </button>
          </div>
        }
      />

      <Card bodyClassName="p-0">
        <DataTable
          columns={columns}
          rows={filtered}
          empty="No leads match your filters."
          onRowClick={(r) => onOpenLead(r.id)}
        />
      </Card>

      {/* Reserve the row whether or not a selection is active, so the table
          does not jump down the first time a row is ticked. */}
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-slate-800/80 bg-[#0d121d] px-4 py-3">
        {selected.length > 0 ? (
          <>
            <span className="text-xs font-semibold text-sky-300">
              {selected.length} selected
            </span>
            <select className={bulkCls} value="" onChange={runBulk("status")} aria-label="Change status">
              <option value="">Change status…</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select className={bulkCls} value="" onChange={runBulk("priority")} aria-label="Set priority">
              <option value="">Set priority…</option>
              {LEAD_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <div className="h-4 w-px bg-slate-800" />

            <button
              type="button"
              onClick={() => setBulkWhatsAppOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all active:scale-95"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              WhatsApp Queue ({selected.length})
            </button>

            <button
              type="button"
              onClick={() => setBulkEmailOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-2.5 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-all active:scale-95"
            >
              <Mail className="h-3.5 w-3.5" />
              Email Campaign ({selected.length})
            </button>

            <button
              type="button"
              onClick={doVCardExport}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all active:scale-95"
            >
              <Phone className="h-3.5 w-3.5" />
              Export Contacts (.vcf)
            </button>

            <button onClick={() => setSelected([])} className="text-[11px] font-semibold text-slate-500 hover:text-slate-300 ml-auto">
              Clear
            </button>
          </>
        ) : (
          <span className="text-[11px] text-slate-500">
            Tick rows to launch bulk WhatsApp queues, email campaigns, or export contacts. Click a row to open the lead.
          </span>
        )}
      </div>

      <WhatsAppModal
        lead={whatsAppLead}
        isOpen={!!whatsAppLead}
        onClose={() => setWhatsAppLead(null)}
      />

      <BulkWhatsAppModal
        leads={selectedLeads}
        isOpen={bulkWhatsAppOpen}
        onClose={() => setBulkWhatsAppOpen(false)}
      />

      <BulkEmailModal
        leads={selectedLeads}
        isOpen={bulkEmailOpen}
        onClose={() => setBulkEmailOpen(false)}
      />
    </div>
  );
}
