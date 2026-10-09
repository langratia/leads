"use client";

import { useState } from "react";
import {
  Users,
  Handshake,
  AlarmClock,
  TrendingUp,
  Search,
  ArrowRight,
  CalendarClock,
  Inbox,
  FileSpreadsheet,
} from "lucide-react";
import { Card, StatCard, Avatar, btnGhost } from "@/core/ui";
import { StatusBadge, PriorityBadge } from "./lead-ui";
import { formatDateTime, formatDate, formatValue, todayIso } from "@/core/format";
import { type Lead, type LeadFollowup } from "@/crm/leads";
import { navigateSection } from "./leads-hooks";
import ExecutiveReportModal from "./ExecutiveReportModal";

export interface RecentEvent {
  lead: Lead;
  at: string;
  text: string;
}

const MAX_RECENT = 10;

export default function Overview({
  leads,
  followups,
  recent,
  onAddLead,
  onOpenLead,
}: {
  leads: Lead[];
  followups: LeadFollowup[];
  recent: RecentEvent[];
  onAddLead: () => void;
  onOpenLead: (id: string) => void;
}) {
  const [showReportModal, setShowReportModal] = useState(false);

  const today = todayIso();
  const count = (s: string) => leads.filter((l) => l.status === s).length;
  const total = leads.length;
  const won = count("Won");
  const open = leads.filter((l) => l.status !== "Won" && l.status !== "Lost");
  const conversion = total ? Math.round((won / total) * 100) : 0;
  const pipelineValue = open.reduce((a, l) => a + (l.estimated_value || 0), 0);

  const dueFollowups = followups
    .filter((f) => !f.completed && f.followup_date <= today)
    .sort((a, b) => a.followup_date.localeCompare(b.followup_date));

  /* The list reps actually open the CRM to work through. Everything here is
     derived from rows that already exist — no separate task list to maintain. */
  const untouched = leads
    .filter((l) => l.status === "New" && (l.lead_score ?? 0) >= 60)
    .sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0))
    .slice(0, 5);

  const sortedRecent = [...recent]
    .sort((a, b) => +new Date(b.at) - +new Date(a.at))
    .slice(0, MAX_RECENT);

  return (
    <div className="space-y-6">
      {/* COMMAND & EXECUTIVE REPORT BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#0d121d] p-3.5 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
              Commercial Operations & Revenue Velocity
            </h3>
            <p className="text-[11px] text-slate-400">
              Live pipeline metrics, closed-won conversions, and executive board intelligence.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 px-3.5 py-1.5 text-xs font-bold text-sky-300 transition-colors cursor-pointer shadow-xs"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-sky-400" />
          <span>Executive Board Report</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pipeline value"
          value={formatValue(pipelineValue)}
          icon={<TrendingUp className="h-4 w-4" />}
          footer={`${open.length} open deals`}
        />
        <StatCard
          label="Won"
          value={String(won)}
          delta={`${conversion}% of all leads`}
          icon={<Handshake className="h-4 w-4" />}
        />
        <StatCard
          label="Due today"
          value={String(dueFollowups.length)}
          icon={<AlarmClock className="h-4 w-4" />}
          footer={dueFollowups.length ? "Includes overdue" : "Nothing overdue"}
        />
        <StatCard
          label="Total leads"
          value={String(total)}
          icon={<Users className="h-4 w-4" />}
          footer={`${count("New")} not yet contacted`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ---------- Today ---------- */}
        <Card
          title="Work through today"
          subtitle="Overdue and due-today follow-ups"
          bodyClassName="p-0"
          className="flex flex-col"
          actions={
            <button
              onClick={() => navigateSection("followups")}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 transition-colors hover:text-sky-300"
            >
              All follow-ups <ArrowRight className="h-3 w-3" />
            </button>
          }
        >
          {dueFollowups.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              Nothing due. Every follow-up is scheduled ahead.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {dueFollowups.slice(0, 6).map((f) => {
                const lead = leads.find((l) => l.id === f.lead_id);
                if (!lead) return null;
                const overdue = f.followup_date < today;
                return (
                  <button
                    key={f.id}
                    onClick={() => onOpenLead(lead.id)}
                    className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-800/40"
                  >
                    <Avatar name={lead.business_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-white">
                        {lead.business_name}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {f.method || "Call"}
                        {f.followup_time ? ` · ${f.followup_time}` : ""} ·{" "}
                        {overdue ? "overdue since " : "due "}
                        {formatDate(f.followup_date)}
                      </p>
                    </div>
                    {overdue && (
                      <span className="shrink-0 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                        Overdue
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* ---------- Best untouched leads ---------- */}
        <Card
          title="Strong leads not yet contacted"
          subtitle="Score 60 or above, still in New"
          bodyClassName="p-0"
          className="flex flex-col"
          actions={
            <button
              onClick={() => navigateSection("all")}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 transition-colors hover:text-sky-300"
            >
              All leads <ArrowRight className="h-3 w-3" />
            </button>
          }
        >
          {untouched.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              No high-scoring leads waiting. Search for more businesses to fill the top of the funnel.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {untouched.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onOpenLead(l.id)}
                  className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-800/40"
                >
                  <Avatar name={l.business_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-white">{l.business_name}</p>
                    <p className="truncate text-[11px] text-slate-500">
                      {[l.category, l.address].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={l.priority} />
                    <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-400">
                      {l.lead_score}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ---------- Activity ---------- */}
      <Card
        title="Recent activity"
        subtitle="Follow-ups completed and conversions"
        bodyClassName="p-0"
      >
        {sortedRecent.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            No activity yet. Add a lead to get started.
          </p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {sortedRecent.map((r, i) => (
              <button
                key={i}
                onClick={() => onOpenLead(r.lead.id)}
                className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-800/40"
              >
                <Avatar name={r.lead.business_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-white">
                    <span className="text-slate-400">{r.text} — </span>
                    {r.lead.business_name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={r.lead.status} />
                  <span className="hidden w-28 text-right text-[11px] text-slate-500 sm:inline">
                    {formatDateTime(r.at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <div className="flex flex-wrap items-center gap-2.5">
        <button onClick={onAddLead} className={btnGhost}>
          <Users className="h-3.5 w-3.5" /> Add a lead manually
        </button>
        <button onClick={() => navigateSection("finder")} className={btnGhost}>
          <Search className="h-3.5 w-3.5" /> Find businesses
        </button>
        <button onClick={() => navigateSection("inquiries")} className={btnGhost}>
          <Inbox className="h-3.5 w-3.5" /> Website inquiries
        </button>
        <button onClick={() => navigateSection("followups")} className={btnGhost}>
          <CalendarClock className="h-3.5 w-3.5" /> Follow-ups
        </button>
      </div>

      <ExecutiveReportModal
        leads={leads}
        followups={followups}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
