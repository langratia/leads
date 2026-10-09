"use client";

import { useState, type FormEvent } from "react";
import { config } from "@/config";
import {
  X,
  Phone,
  Mail,
  Globe,
  MapPin,
  CalendarPlus,
  Handshake,
  Trash2,
  Loader2,
  Plus,
  StickyNote,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  User,
  Clock,
  Sparkles,
  Building,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { Badge, surface } from "@/core/ui";
import { StatusBadge, PriorityBadge, SourceBadge, stageColor } from "./lead-ui";
import { formatDateTime, formatDate, formatValue, todayIso } from "@/core/format";
import { LEAD_STATUSES, ACTIVITY_TYPES, FOLLOWUP_METHODS, addActivity, addFollowup, completeFollowup, convertLead, deleteLead, updateLead, type Lead, type LeadActivity, type LeadFollowup } from "@/crm/leads";
import WhatsAppModal from "./WhatsAppModal";
import LeadDossierModal from "./LeadDossierModal";
import { downloadICS, getGoogleCalendarUrl } from "@/core/calendar-utils";

function WhatsAppIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.779.98-.955 1.18-.176.2-.352.226-.653.075-1.636-.821-2.708-1.464-3.79-3.32-.286-.492.286-.456.818-1.52.09-.18.045-.338-.023-.488-.068-.15-.678-1.636-.93-2.242-.244-.59-.493-.51-.678-.52-.176-.008-.377-.01-.578-.01-.2 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511 0 1.482 1.08 2.912 1.23 3.113.15.201 2.126 3.247 5.151 4.554 1.776.767 2.479.799 3.364.667.545-.082 1.78-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.578-.352z" />
      <path d="M12.004 0C5.373 0 0 5.373 0 12c0 2.118.552 4.107 1.516 5.839L.055 23.44l5.772-1.492A11.94 11.94 0 0012.004 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 21.84c-1.84 0-3.567-.5-5.06-1.37l-.362-.213-3.754.97.99-3.66-.234-.374A9.816 9.816 0 012.164 12c0-5.426 4.414-9.84 9.84-9.84 5.426 0 9.84 4.414 9.84 9.84 0 5.426-4.414 9.84-9.84 9.84z" />
    </svg>
  );
}

export default function LeadProfile({
  lead,
  activities,
  followups,
  onClose,
  onChanged,
}: {
  lead: Lead;
  activities: LeadActivity[];
  followups: LeadFollowup[];
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [busy, setBusy] = useState("");
  const [status, setStatus] = useState(lead.status);
  const [note, setNote] = useState("");
  const [actType, setActType] = useState("Call");
  const [actDesc, setActDesc] = useState("");
  const [showFollowup, setShowFollowup] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [fuDate, setFuDate] = useState(todayIso());
  const [fuTime, setFuTime] = useState("");
  const [fuMethod, setFuMethod] = useState("Call");
  const [error, setError] = useState("");

  const stageIdx = LEAD_STATUSES.indexOf(lead.status as any);

  const saveStatus = async (newStatus: string) => {
    setBusy("status");
    setError("");
    try {
      await updateLead(lead.id, { status: newStatus as any });
      setStatus(newStatus);
      await onChanged();
    } catch (err: any) {
      setError(err?.message || "Failed to update status.");
    } finally {
      setBusy("");
    }
  };

  const submitNote = async (e: FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setBusy("note");
    try {
      await addActivity(lead.id, "Note", note.trim());
      setNote("");
      await onChanged();
    } catch (err: any) {
      setError(err?.message || "Failed to add note.");
    } finally {
      setBusy("");
    }
  };

  const submitActivity = async (e: FormEvent) => {
    e.preventDefault();
    if (!actDesc.trim()) return;
    setBusy("activity");
    try {
      await addActivity(lead.id, actType, actDesc.trim());
      setActDesc("");
      await onChanged();
    } catch (err: any) {
      setError(err?.message || "Failed to log activity.");
    } finally {
      setBusy("");
    }
  };

  const submitFollowup = async (e: FormEvent) => {
    e.preventDefault();
    setBusy("followup");
    try {
      await addFollowup(lead.id, { followup_date: fuDate, followup_time: fuTime || null, method: fuMethod });
      setShowFollowup(false);
      await onChanged();
    } catch (err: any) {
      setError(err?.message || "Failed to schedule follow-up.");
    } finally {
      setBusy("");
    }
  };

  const doConvert = async () => {
    setBusy("convert");
    setError("");
    try {
      await convertLead(lead);
      await onChanged();
    } catch (err: any) {
      setError(err?.message || "Conversion failed.");
    } finally {
      setBusy("");
    }
  };

  const doDelete = async () => {
    if (!confirm(`Delete lead "${lead.business_name}"? This cannot be undone.`)) return;
    setBusy("delete");
    try {
      await deleteLead(lead.id);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Delete failed.");
      setBusy("");
    }
  };

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex justify-between gap-3 py-1 text-xs">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-200 truncate">{children}</span>
    </div>
  );

  const initials = lead.business_name ? lead.business_name.slice(0, 2).toUpperCase() : "LD";

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-end" onClick={onClose}>
      <div
        role="dialog"
        aria-label={`Lead profile for ${lead.business_name}`}
        className={`flex h-full w-full max-w-xl flex-col border-l border-slate-800/80 ${surface.card} shadow-2xl animate-in slide-in-from-right duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className={`shrink-0 border-b border-slate-800/80 ${surface.inset} p-5`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm shadow-inner shrink-0">
                {initials}
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">{lead.business_name}</h2>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <Building className="h-3 w-3 text-slate-500" />
                  {lead.category || "Enterprise Software"} {lead.address ? `· ${lead.address.split(",")[0]}` : ""}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
            <SourceBadge source={lead.lead_source} />
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
              Score {lead.lead_score}/100
            </span>
            {lead.converted_at && <Badge tone="green">Converted Customer</Badge>}
          </div>

          {/* Quick Actions Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => saveStatus(e.target.value)}
              disabled={busy === "status"}
              className="cursor-pointer rounded-lg border border-slate-700 bg-[#07090e] px-2.5 py-1.5 text-xs font-semibold text-slate-200 outline-none focus:border-sky-500/60 transition-colors"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  Stage: {s}
                </option>
              ))}
            </select>

            <button
              onClick={doConvert}
              disabled={!!lead.converted_at || busy === "convert"}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors active:scale-95"
            >
              {busy === "convert" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Handshake className="h-3.5 w-3.5" />}
              Convert to Customer
            </button>

            <button
              type="button"
              onClick={() => setShowWhatsApp(true)}
              disabled={!lead.whatsapp && !lead.phone}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors active:scale-95 shadow-sm shadow-emerald-500/10"
              title={lead.whatsapp || lead.phone ? "Open 1-Click WhatsApp Sales Pitch" : "No phone number available"}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              WhatsApp Pitch
            </button>

            <button
              type="button"
              onClick={() => setShowDossier(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/15 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/25 transition-colors active:scale-95 shadow-sm shadow-sky-500/10"
              title="Generate Deep AI Market Research & Sales Pitch Dossier"
            >
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              AI Strategy Dossier
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#090d16]">
          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
              {error}
            </p>
          )}

          {/* PIPELINE PROGRESSION STEPPER */}
          <section className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pipeline Progression</span>
              <span className="text-xs font-bold text-sky-400">{lead.status}</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              {LEAD_STATUSES.filter((s) => s !== "Lost").map((s, i) => {
                const isCompletedOrCurrent = i <= stageIdx;
                const isCurrent = i === stageIdx;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => saveStatus(s)}
                    className="flex-1 group cursor-pointer"
                    title={`Advance to ${s}`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCurrent
                          ? "bg-sky-400 shadow-sm shadow-sky-400/50"
                          : isCompletedOrCurrent
                          ? "bg-sky-600"
                          : "bg-slate-800 group-hover:bg-slate-700"
                      }`}
                    />
                    <p className={`text-[9px] mt-1 text-center truncate ${isCurrent ? "font-bold text-white" : "text-slate-500"}`}>
                      {s.slice(0, 4)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* AI SCORING MATRIX BREAKDOWN */}
          <section className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-2 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                AI Qualification Score Matrix ({lead.lead_score}/100)
              </span>
              <span
                className={`text-[11px] font-bold font-mono ${
                  lead.lead_score >= 60
                    ? "text-emerald-400"
                    : lead.lead_score >= 35
                    ? "text-amber-400"
                    : "text-slate-400"
                }`}
              >
                {lead.lead_score >= 60
                  ? "High Intent Tier"
                  : lead.lead_score >= 35
                  ? "Moderate Fit"
                  : "Nurture Tier"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b0f19] border border-slate-800/60">
                <span className="text-slate-400">Direct WhatsApp</span>
                <span
                  className={
                    lead.phone || lead.whatsapp
                      ? "text-emerald-400 font-bold font-mono"
                      : "text-slate-600 font-mono"
                  }
                >
                  {lead.phone || lead.whatsapp ? "+10 pts" : "0 pts"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b0f19] border border-slate-800/60">
                <span className="text-slate-400">Verified Email</span>
                <span
                  className={
                    lead.email ? "text-emerald-400 font-bold font-mono" : "text-slate-600 font-mono"
                  }
                >
                  {lead.email ? "+10 pts" : "0 pts"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b0f19] border border-slate-800/60">
                <span className="text-slate-400">Target Industry Sector</span>
                <span
                  className={
                    lead.category ? "text-emerald-400 font-bold font-mono" : "text-slate-600 font-mono"
                  }
                >
                  {lead.category ? "+20 pts" : "0 pts"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b0f19] border border-slate-800/60">
                <span className="text-slate-400">Digital Web Presence</span>
                <span
                  className={
                    lead.website ? "text-emerald-400 font-bold font-mono" : "text-slate-600 font-mono"
                  }
                >
                  {lead.website ? "+5 pts" : "0 pts"}
                </span>
              </div>
            </div>
          </section>

          {/* CONTACT & BUSINESS DETAILS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-2 shadow-md">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 pb-1.5">
                Contact Person
              </h4>
              <div className="space-y-1">
                <Row label="Name">{lead.contact_person || "—"}</Row>
                <Row label="Phone">{lead.phone || "—"}</Row>
                <Row label="WhatsApp">
                  {lead.whatsapp || lead.phone ? (
                    <button
                      type="button"
                      onClick={() => setShowWhatsApp(true)}
                      className="text-emerald-400 hover:text-emerald-300 font-mono inline-flex items-center gap-1 cursor-pointer transition-colors"
                      title="Click to launch WhatsApp pitch modal"
                    >
                      <WhatsAppIcon className="h-3 w-3" />
                      {lead.whatsapp || lead.phone}
                    </button>
                  ) : (
                    "—"
                  )}
                </Row>
                <Row label="Email">{lead.email || "—"}</Row>
                <Row label="Website">{lead.website || "—"}</Row>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-2 shadow-md">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 pb-1.5">
                Deal Details
              </h4>
              <div className="space-y-1">
                <Row label="Sector">{lead.category || "—"}</Row>
                <Row label="Product">{lead.interested_product || "—"}</Row>
                <Row label="Est. Value">
                  <span className="font-bold text-emerald-400 font-mono">{formatValue(lead.estimated_value)}</span>
                </Row>
                <Row label="Owner">{lead.assigned_to || "Unassigned"}</Row>
                <Row label="Location">{lead.address?.split(",")[0] || "—"}</Row>
              </div>
            </section>
          </div>

          {/* NOTES & SCOPE */}
          {lead.notes && (
            <section className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-1.5 shadow-md">
              <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <StickyNote className="h-3 w-3 text-amber-400" /> Project Brief & Notes
              </h4>
              <p className="whitespace-pre-wrap text-xs text-slate-200 leading-relaxed font-sans bg-[#07090e] p-3 rounded-lg border border-slate-800/80">
                {lead.notes}
              </p>
            </section>
          )}

          {/* SCHEDULED FOLLOW-UPS */}
          <section className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Follow-up Schedule</h4>
              <button
                onClick={() => setShowFollowup((v) => !v)}
                className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
              >
                <CalendarPlus className="h-3.5 w-3.5" /> + Schedule
              </button>
            </div>

            {showFollowup && (
              <form onSubmit={submitFollowup} className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Date</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-[#07090e] px-2.5 py-1 text-xs text-white"
                      type="date"
                      value={fuDate}
                      onChange={(e) => setFuDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Time</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-[#07090e] px-2.5 py-1 text-xs text-white"
                      type="time"
                      value={fuTime}
                      onChange={(e) => setFuTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Method</label>
                    <select
                      className="w-full rounded-lg border border-slate-700 bg-[#07090e] px-2.5 py-1 text-xs text-white"
                      value={fuMethod}
                      onChange={(e) => setFuMethod(e.target.value)}
                    >
                      {FOLLOWUP_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={busy === "followup"}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-sky-400 transition-colors"
                  >
                    {busy === "followup" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CalendarPlus className="h-3 w-3" />}{" "}
                    Save Follow-up
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {followups.length === 0 && <p className="text-xs text-slate-600">No pending follow-ups.</p>}
              {followups.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#07090e] p-2.5 text-xs"
                >
                  <div>
                    <p className={`font-semibold ${f.completed ? "text-slate-600 line-through" : "text-white"}`}>
                      {formatDate(f.followup_date)} {f.followup_time ? `· ${f.followup_time}` : ""}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {f.method || "Call"} {f.notes ? `· ${f.notes}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        downloadICS({
                          title: `Follow-up: ${lead.business_name}`,
                          description: `Follow-up regarding ${lead.interested_product || "solutions"}. ${f.notes || ""}`,
                          date: f.followup_date,
                          time: f.followup_time,
                          attendeeEmail: lead.email,
                          location: lead.address || "Kampala, Uganda",
                        })
                      }
                      className="flex cursor-pointer items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Download .ics Calendar Invite"
                    >
                      <Calendar className="h-3 w-3 text-sky-400" />
                      .ics
                    </button>

                    <a
                      href={getGoogleCalendarUrl({
                        title: `Follow-up: ${lead.business_name}`,
                        description: `Follow-up regarding ${lead.interested_product || "solutions"}. ${f.notes || ""}`,
                        date: f.followup_date,
                        time: f.followup_time,
                        attendeeEmail: lead.email,
                        location: lead.address || "Kampala, Uganda",
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="hidden sm:inline-flex cursor-pointer items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Add to Google Calendar"
                    >
                      Google Cal
                    </a>

                    {!f.completed ? (
                      <button
                        onClick={async () => {
                          setBusy("fu-" + f.id);
                          try {
                            await completeFollowup(f.id, lead.id);
                            await onChanged();
                          } finally {
                            setBusy("");
                          }
                        }}
                        className="flex cursor-pointer items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-300 hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        {busy === "fu-" + f.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}{" "}
                        Done
                      </button>
                    ) : (
                      <Badge tone="green" dot={false}>
                        Done
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ACTIVITY LOG & TIMELINE */}
          <section className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-3 shadow-md">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Activity Timeline</h4>
            <form onSubmit={submitNote} className="flex gap-2">
              <input
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/60"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type quick internal note…"
              />
              <button
                type="submit"
                disabled={busy === "note"}
                className="flex cursor-pointer items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                {busy === "note" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Note
              </button>
            </form>

            <form onSubmit={submitActivity} className="flex gap-2">
              <select
                className="w-32 shrink-0 cursor-pointer rounded-lg border border-slate-800 bg-[#07090e] px-2 py-1.5 text-xs text-slate-300 outline-none"
                value={actType}
                onChange={(e) => setActType(e.target.value)}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/60"
                value={actDesc}
                onChange={(e) => setActDesc(e.target.value)}
                placeholder="Log phone call, demo meeting..."
              />
              <button
                type="submit"
                disabled={busy === "activity"}
                className="flex cursor-pointer items-center gap-1 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-sky-400"
              >
                {busy === "activity" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Log
              </button>
            </form>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-600">No activity recorded yet.</p>
            ) : (
              <div className="relative space-y-0 pt-1">
                {activities.map((a) => (
                  <div key={a.id} className="relative border-l border-slate-800 pb-3.5 pl-4 last:pb-0">
                    <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-sky-400" />
                    <p className="text-xs font-bold text-white">{a.activity_type}</p>
                    {a.description && <p className="text-xs text-slate-300 mt-0.5">{a.description}</p>}
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{formatDateTime(a.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-[#090d16] px-5 py-3 shrink-0">
          <span className="text-[10px] text-slate-500 font-mono">Created {formatDate(lead.created_at)}</span>
          <div className="flex items-center gap-2">
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0d121d] px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700"
              >
                <Phone className="h-3 w-3 text-sky-400" /> Call
              </a>
            )}
            {(lead.whatsapp || lead.phone) && (
              <button
                type="button"
                onClick={() => setShowWhatsApp(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-400" /> WhatsApp
              </button>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0d121d] px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700"
              >
                <Mail className="h-3 w-3 text-sky-400" /> Email
              </a>
            )}
            <button
              onClick={doDelete}
              disabled={busy === "delete"}
              className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-rose-950/30 hover:text-rose-400 transition-colors ml-1"
              title="Delete Lead"
            >
              {busy === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <WhatsAppModal
        lead={lead}
        isOpen={showWhatsApp}
        onClose={() => setShowWhatsApp(false)}
        onActivityLogged={onChanged}
      />

      <LeadDossierModal
        lead={lead}
        isOpen={showDossier}
        onClose={() => setShowDossier(false)}
      />
    </div>
  );
}