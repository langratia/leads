"use client";

import { Users, UserPlus, MessageSquare, Target, TrendingUp, Handshake, XCircle, AlarmClock } from "lucide-react";
import { Card, StatCard, Avatar } from "@/app/admin/ui";
import { StatusBadge, PriorityBadge } from "./lead-ui";
import { formatDateTime, formatValue, todayIso, type Lead } from "@/lib/leads";

export interface RecentEvent {
  lead: Lead;
  at: string;
  text: string;
}

export default function Overview({
  leads,
  recent,
  onAddLead,
  onOpenLead,
  onFinder,
}: {
  leads: Lead[];
  recent: RecentEvent[];
  onAddLead: () => void;
  onOpenLead: (id: string) => void;
  onFinder: () => void;
}) {
  const statusCount = (s: string) => leads.filter((l) => l.status === s).length;
  const total = leads.length;
  const won = statusCount("Won");
  const lost = statusCount("Lost");
  const active = leads.filter((l) => !["Won", "Lost"].includes(l.status)).length;
  const conversion = total ? Math.round((won / total) * 100) : 0;
  const thisMonth = leads.filter((l) => {
    const d = new Date(l.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const dueToday = leads.filter((l) => l.next_followup_date === todayIso()).length;

  const sortedRecent = [...recent].sort((a, b) => +new Date(b.at) - +new Date(a.at));

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total leads" value={String(total)} icon={<Users className="h-4 w-4" />} footer="All time" />
        <StatCard label="New" value={String(statusCount("New"))} delta={`${thisMonth} this month`} icon={<UserPlus className="h-4 w-4" />} />
        <StatCard label="Active pipeline" value={String(active)} icon={<Target className="h-4 w-4" />} footer={`${statusCount("Contacted")} contacted · ${statusCount("Qualified")} qualified`} />
        <StatCard label="Won" value={String(won)} delta={`${conversion}% conversion`} deltaTone="green" icon={<Handshake className="h-4 w-4" />} />
        <StatCard label="Lost" value={String(lost)} deltaTone="red" icon={<XCircle className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Follow-ups due today" value={String(dueToday)} icon={<AlarmClock className="h-4 w-4" />} />
        <StatCard label="High priority" value={String(leads.filter((l) => ["High", "Hot"].includes(l.priority)).length)} icon={<TrendingUp className="h-4 w-4" />} footer="Hot or High" />
        <StatCard label="Pipeline value" value={formatValue(leads.filter((l) => !["Won", "Lost"].includes(l.status)).reduce((a, l) => a + (l.estimated_value || 0), 0))} icon={<Handshake className="h-4 w-4" />} footer="Active pipeline only" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button onClick={onAddLead} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-500/20 hover:bg-sky-400">
          <UserPlus className="h-3.5 w-3.5" /> Add Lead
        </button>
        <button onClick={onFinder} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#2b2b2b] bg-transparent px-3.5 py-2 text-xs font-semibold text-[#d4d4d4] hover:border-[#3a3a3a] hover:bg-[#141414]">
          <Target className="h-3.5 w-3.5" /> Find Businesses
        </button>
      </div>

      <div className="mt-6">
        <Card title="Recent activity" subtitle="New leads, contact, follow-ups, and conversions" bodyClassName="p-0">
          {sortedRecent.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-[#737373]">No activity yet — add your first lead.</p>
          ) : (
            <div className="divide-y divide-[#161616]">
              {sortedRecent.slice(0, 12).map((r, i) => (
                <button
                  key={i}
                  onClick={() => onOpenLead(r.lead.id)}
                  className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-[#0e0e0e]"
                >
                  <Avatar name={r.lead.business_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-white">
                      {r.lead.business_name}
                      <span className="ml-2 text-[#8a8a8a]">{r.text}</span>
                    </p>
                    <p className="truncate text-[11px] text-[#737373]">
                      {r.lead.category || ""} {r.lead.address ? `· ${r.lead.address}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={r.lead.status} />
                    <PriorityBadge priority={r.lead.priority} />
                    <span className="w-28 text-right text-[11px] text-[#5c5c5c]">{formatDateTime(r.at)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}