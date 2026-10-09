"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AlarmClock,
  CalendarClock,
  CheckCircle2,
  CalendarPlus,
  Calendar,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { Card, StatCard, Avatar, btnPrimary, btnGhost, inputCls, Field, Segmented } from "@/core/ui";
import { StatusBadge } from "./lead-ui";
import { formatDate, todayIso } from "@/core/format";
import { completeFollowup, deleteFollowup, addFollowup, type Lead, type LeadFollowup } from "@/crm/leads";
import { downloadICS } from "@/core/calendar-utils";

type Bucket = "due" | "upcoming" | "done";

export default function FollowUps({
  leads,
  followups,
  onRefresh,
}: {
  leads: Lead[];
  followups: LeadFollowup[];
  onRefresh: () => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [bucket, setBucket] = useState<Bucket>("due");

  const leadOf = (id: string) => leads.find((l) => l.id === id);

  const groups = useMemo(() => {
    const t = todayIso();
    const open = followups.filter((f) => !f.completed);
    return {
      due: open.filter((f) => f.followup_date <= t).sort((a, b) => a.followup_date.localeCompare(b.followup_date)),
      upcoming: open.filter((f) => f.followup_date > t).sort((a, b) => a.followup_date.localeCompare(b.followup_date)),
      done: followups
        .filter((f) => f.completed)
        .sort((a, b) => (b.completed_at || "").localeCompare(a.completed_at || "")),
    };
  }, [followups]);

  const todayCount = groups.due.filter((f) => f.followup_date === todayIso()).length;
  const overdueCount = groups.due.length - todayCount;

  const doComplete = async (f: LeadFollowup) => {
    setBusy(f.id);
    try {
      await completeFollowup(f.id, f.lead_id);
      await onRefresh();
    } finally {
      setBusy(null);
    }
  };

  /* Deleting is destructive and there is no undo, so it asks first. */
  const doDelete = async (f: LeadFollowup) => {
    const name = leadOf(f.lead_id)?.business_name ?? "this lead";
    if (!window.confirm(`Delete the follow-up for ${name} on ${formatDate(f.followup_date)}?`)) return;
    setBusy(f.id);
    try {
      await deleteFollowup(f.id);
      await onRefresh();
    } finally {
      setBusy(null);
    }
  };

  const rows = groups[bucket];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Due today" value={String(todayCount)} icon={<AlarmClock className="h-4 w-4" />} />
        <StatCard
          label="Overdue"
          value={String(overdueCount)}
          deltaTone={overdueCount ? "red" : "green"}
          icon={<CalendarClock className="h-4 w-4" />}
          footer={overdueCount ? "Needs action" : "All caught up"}
        />
        <StatCard
          label="Upcoming"
          value={String(groups.upcoming.length)}
          icon={<CalendarPlus className="h-4 w-4" />}
        />
      </div>

      <Card
        title="Follow-ups"
        subtitle="Grouped by when they are due — the same records, not three copies"
        bodyClassName="p-0"
        actions={
          <Segmented
            value={bucket}
            onChange={(v) => setBucket(v as Bucket)}
            options={[
              { value: "due", label: `Due (${groups.due.length})` },
              { value: "upcoming", label: `Upcoming (${groups.upcoming.length})` },
              { value: "done", label: `Done (${groups.done.length})` },
            ]}
          />
        }
      >
        {rows.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500">
            {bucket === "due"
              ? "Nothing due. Every follow-up is scheduled ahead."
              : bucket === "upcoming"
                ? "No follow-ups scheduled ahead."
                : "No completed follow-ups yet."}
          </p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {rows.map((f) => {
              const lead = leadOf(f.lead_id);
              const overdue = !f.completed && f.followup_date < todayIso();
              return (
                <div key={f.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar name={lead?.business_name || "?"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`truncate text-[13px] font-semibold ${
                          f.completed ? "text-slate-500 line-through" : "text-white"
                        }`}
                      >
                        {lead?.business_name || "Unknown lead"}
                      </p>
                      {overdue && (
                        <span className="shrink-0 rounded-md border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span>
                        {formatDate(f.followup_date)}
                        {f.followup_time ? ` · ${f.followup_time}` : ""}
                        {f.method ? ` · ${f.method}` : ""}
                      </span>
                      {lead && <StatusBadge status={lead.status} />}
                    </p>
                    {f.notes && (
                      <p className="mt-1 truncate text-[11px] text-slate-500">{f.notes}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {!f.completed && lead && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            downloadICS({
                              title: `Follow-up: ${lead.business_name}`,
                              description: `Scheduled follow-up with ${lead.business_name}. ${f.notes || ""}`,
                              date: f.followup_date,
                              time: f.followup_time,
                              location: lead.address || "Kampala, Uganda",
                              attendeeEmail: lead.email,
                            })
                          }
                          className="flex cursor-pointer items-center gap-1 rounded bg-slate-800/80 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          title="Download .ics Calendar Invite"
                        >
                          <Calendar className="h-3 w-3 text-sky-400" /> .ics
                        </button>
                        <button
                          onClick={() => setShowAdd(showAdd === f.lead_id ? null : f.lead_id)}
                          className={btnGhost}
                        >
                          <CalendarPlus className="h-3.5 w-3.5" /> Schedule
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => doComplete(f)}
                      disabled={busy === f.id}
                      aria-label="Mark complete"
                      className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-emerald-400 disabled:opacity-50"
                    >
                      {busy === f.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => doDelete(f)}
                      disabled={busy === f.id}
                      aria-label="Delete follow-up"
                      className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-rose-400 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

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
      await addFollowup(lead.id, {
        followup_date: date,
        followup_time: time || null,
        method,
        notes: notes || null,
      });
      await onDone();
    } catch (err: any) {
      setError(err?.message || "Failed to schedule follow-up.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Schedule follow-up"
        className="w-full max-w-md rounded-xl border border-slate-800/80 bg-[#0d121d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-white">Schedule follow-up</h3>
            <p className="text-xs text-slate-500">{lead.business_name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input
                className={inputCls}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Field>
            <Field label="Time">
              <input
                className={inputCls}
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </Field>
            <Field label="Method">
              <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
                {["Call", "WhatsApp", "Email", "Meeting", "Visit", "Other"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              className={`${inputCls} min-h-[70px] resize-y`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What to discuss…"
            />
          </Field>
          {error && <p className="text-xs font-semibold text-rose-400">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CalendarPlus className="h-3.5 w-3.5" />
              )}
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
