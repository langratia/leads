"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AlarmClock, CalendarClock, CheckCircle2, PhoneCall, CalendarPlus, X, Loader2 } from "lucide-react";
import { Card, StatCard, Badge, Avatar, btnPrimary, btnGhost, inputCls, Field } from "@/app/admin/ui";
import { StatusBadge, PriorityBadge } from "./lead-ui";
import {
  completeFollowup,
  deleteFollowup,
  addFollowup,
  formatDate,
  todayIso,
  type Lead,
  type LeadFollowup,
} from "@/lib/leads";

export default function FollowUps({
  leads,
  followups,
  onRefresh,
}: {
  leads: Lead[];
  followups: LeadFollowup[];
  onRefresh: () => Promise<void>;
}) {
  const leadOf = (id: string) => leads.find((l) => l.id === id);
  const [showAdd, setShowAdd] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const { today, overdue, upcoming } = useMemo(() => {
    const t = todayIso();
    return {
      today: followups.filter((f) => f.followup_date === t && !f.completed),
      overdue: followups.filter((f) => f.followup_date < t && !f.completed),
      upcoming: followups.filter((f) => f.followup_date > t && !f.completed),
    };
  }, [followups]);

  const doComplete = async (f: LeadFollowup) => {
    setBusy(f.id);
    try {
      await completeFollowup(f.id, f.lead_id);
      await onRefresh();
    } finally {
      setBusy(null);
    }
  };

  const doDelete = async (f: LeadFollowup) => {
    setBusy(f.id);
    try {
      await deleteFollowup(f.id);
      await onRefresh();
    } finally {
      setBusy(null);
    }
  };

  const methodTone = (m?: string | null) =>
    m === "Call" ? "blue" : m === "WhatsApp" ? "green" : m === "Email" ? "purple" : m === "Meeting" || m === "Visit" ? "amber" : "gray";

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Follow-ups today" value={String(today.length)} icon={<AlarmClock className="h-4 w-4" />} />
        <StatCard label="Overdue" value={String(overdue.length)} deltaTone={overdue.length ? "red" : "green"} icon={<CalendarClock className="h-4 w-4" />} footer={overdue.length ? "Action required" : "All caught up"} />
        <StatCard label="Upcoming" value={String(upcoming.length)} icon={<CalendarPlus className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Due today & overdue" subtitle="Contact these leads now" bodyClassName="p-0">
          {[...overdue, ...today].length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-[#737373]">Nothing due. Great job.</p>
          ) : (
            <div className="divide-y divide-[#161616]">
              {[...overdue, ...today].map((f) => {
                const lead = leadOf(f.lead_id);
                if (!lead) return null;
                return (
                  <div key={f.id} className="flex items-center gap-3 px-5 py-3.5">
                    <Avatar name={lead.business_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {lead.business_name}
                        {f.followup_date < todayIso() && (
                          <Badge tone="red" dot={false} >Overdue</Badge>
                        )}
                      </p>
                      <p className="text-[11px] text-[#737373]">
                        {formatDate(f.followup_date)}
                        {f.followup_time ? ` · ${f.followup_time}` : ""}
                        {f.method ? ` · ${f.method}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button onClick={() => doComplete(f)} disabled={busy === f.id} className={`${btnGhost} px-2.5 py-1.5`}>
                        {busy === f.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Complete
                      </button>
                      <button onClick={() => doDelete(f)} className="cursor-pointer rounded-lg p-1.5 text-[#5c5c5c] hover:bg-[#141414] hover:text-red-400">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Upcoming follow-ups" subtitle="Scheduled ahead" bodyClassName="p-0">
          {upcoming.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-[#737373]">No upcoming follow-ups scheduled.</p>
          ) : (
            <div className="divide-y divide-[#161616]">
              {upcoming.map((f) => {
                const lead = leadOf(f.lead_id);
                if (!lead) return null;
                return (
                  <div key={f.id} className="flex items-center gap-3 px-5 py-3.5">
                    <Avatar name={lead.business_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">{lead.business_name}</p>
                      <p className="text-[11px] text-[#737373]">
                        {formatDate(f.followup_date)}
                        {f.followup_time ? ` · ${f.followup_time}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {f.method && <Badge tone={methodTone(f.method) as any} dot={false}>{f.method}</Badge>}
                      <button onClick={() => doComplete(f)} disabled={busy === f.id} className="cursor-pointer rounded-lg p-1.5 text-[#5c5c5c] hover:bg-[#141414] hover:text-emerald-400">
                        {busy === f.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => doDelete(f)} className="cursor-pointer rounded-lg p-1.5 text-[#5c5c5c] hover:bg-[#141414] hover:text-red-400">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card title="All scheduled follow-ups" subtitle={`${followups.length} total`} bodyClassName="p-0">
          {followups.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-[#737373]">Schedule a follow-up from any lead profile.</p>
          ) : (
            <div className="divide-y divide-[#161616]">
              {followups.map((f) => {
                const lead = leadOf(f.lead_id);
                return (
                  <div key={f.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={lead?.business_name || "?"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-[13px] font-semibold ${f.completed ? "text-[#5c5c5c] line-through" : "text-white"}`}>
                        {lead?.business_name || "Unknown lead"}
                      </p>
                      <p className="text-[11px] text-[#737373]">
                        {formatDate(f.followup_date)}
                        {f.followup_time ? ` · ${f.followup_time}` : ""}
                        {f.method ? ` · ${f.method}` : ""}
                        {lead && <StatusBadge status={lead.status} />}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!f.completed && lead && (
                        <button
                          onClick={() => setShowAdd(showAdd === f.lead_id ? null : f.lead_id)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#2b2b2b] px-2.5 py-1.5 text-xs font-semibold text-[#d4d4d4] hover:border-[#3a3a3a] hover:bg-[#141414]"
                        >
                          <PhoneCall className="h-3.5 w-3.5" /> Contact
                        </button>
                      )}
                      {f.completed && <Badge tone="green" dot={false}>Done</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {showAdd && (
        <ScheduleFollowupModal
          lead={leadOf(showAdd)!}
          onClose={() => setShowAdd(null)}
          onDone={async () => {
            setShowAdd(null);
            await onRefresh();
          }}
        />
      )}
    </div>
  );
}

function ScheduleFollowupModal({
  lead,
  onClose,
  onDone,
}: {
  lead: Lead;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState("");
  const [method, setMethod] = useState("Call");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await addFollowup(lead.id, { followup_date: date, followup_time: time || null, method, notes: notes || null });
      await onDone();
    } catch (err: any) {
      setError(err?.message || "Failed to schedule follow-up.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-[#242424] bg-[#0a0a0a] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#1c1c1c] px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-white">Schedule follow-up</h3>
            <p className="text-xs text-[#8a8a8a]">{lead.business_name}</p>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-[#8a8a8a] hover:bg-[#141414] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>
            <Field label="Time">
              <input className={inputCls} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
            <Field label="Method">
              <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
                {["Call", "WhatsApp", "Email", "Meeting", "Visit", "Other"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea className={`${inputCls} min-h-[70px] resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What to discuss…" />
          </Field>
          {error && <p className="text-xs font-semibold text-red-400">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
            <button type="submit" disabled={saving} className={`${btnPrimary} disabled:opacity-50`}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarPlus className="h-3.5 w-3.5" />}
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}