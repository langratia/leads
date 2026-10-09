"use client";

import { useState } from "react";
import {
  X,
  Mail,
  Send,
  Building,
  CheckCircle2,
  Sparkles,
  Loader2,
  Users,
} from "lucide-react";
import type { Lead } from "./model/types";
import { apiFetch } from "@/core/api";

interface BulkEmailModalProps {
  leads: Lead[];
  isOpen: boolean;
  onClose: () => void;
  onDispatched?: () => void;
}

export default function BulkEmailModal({
  leads,
  isOpen,
  onClose,
  onDispatched,
}: BulkEmailModalProps) {
  if (!isOpen) return null;

  const eligibleLeads = leads.filter((l) => Boolean(l.email));

  const [subject, setSubject] = useState("Enterprise Technology & Automation Scoping for {business}");
  const [template, setTemplate] = useState(
    `Hello {name},\n\nWe noticed {business}'s strong market presence and wanted to introduce LANGRATIA's custom operational systems and software engineering services.\n\nWe design and deploy custom ERPs, automated client billing, and operational workflows for high-growth organizations in the {category} sector.\n\nWould you be open to a 10-minute discovery call this week to explore how we can optimize operations for {business}?\n\nBest regards,\nAllan Nuwamanya\nLead Systems Engineer\nLANGRATIA Software Engineering\nhttps://langratia.com`
  );
  const [dispatching, setDispatching] = useState(false);
  const [result, setResult] = useState<{ dispatched: number; skipped: number } | null>(null);

  const previewLead = eligibleLeads[0];
  const previewBody = previewLead
    ? template
        .replace(/\{name\}/gi, previewLead.contact_person || previewLead.business_name || "Team")
        .replace(/\{business\}/gi, previewLead.business_name)
        .replace(/\{category\}/gi, previewLead.category || "commercial")
    : "";

  const handleDispatch = async () => {
    if (!eligibleLeads.length || !subject || !template) return;

    setDispatching(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        dispatched: number;
        skipped: number;
      }>("/api/email/bulk", {
        method: "POST",
        body: JSON.stringify({
          leads: eligibleLeads.map((l) => ({
            id: l.id,
            business_name: l.business_name,
            contact_person: l.contact_person,
            email: l.email,
            category: l.category,
          })),
          subject,
          template,
        }),
      });

      setResult({ dispatched: res.dispatched, skipped: res.skipped });
      if (onDispatched) onDispatched();
    } catch (err: any) {
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-[#0d121d] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Bulk Email Outreach Campaign
                <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/20">
                  {eligibleLeads.length} Recipients
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Direct dispatch via Resend with automated CRM activity logging.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {result ? (
          /* Finished State */
          <div className="py-8 text-center space-y-4">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Campaign Dispatched!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Successfully dispatched {result.dispatched} personalized outbound emails ({result.skipped} skipped). Outbound threads have been created.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-sky-500 text-slate-950 text-xs font-bold hover:bg-sky-400 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* Campaign Form */
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Email Template
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Supported: {"{name}"}, {"{business}"}, {"{category}"}
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-black/50 p-3 text-xs text-slate-200 outline-none focus:border-sky-500 resize-none font-sans leading-relaxed"
                />
              </div>

              {/* Sample Preview */}
              {previewLead && (
                <div className="rounded-xl border border-slate-800/80 bg-[#07090e]/80 p-3 text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-sky-400" /> Preview for: {previewLead.business_name} ({previewLead.email})
                  </div>
                  <p className="text-[11px] text-slate-300 italic line-clamp-2">
                    "{previewBody.slice(0, 150)}..."
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {eligibleLeads.length} valid recipients
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={dispatching || !eligibleLeads.length}
                  onClick={handleDispatch}
                  className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:bg-sky-400 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {dispatching ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Dispatching...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Dispatch Campaign ({eligibleLeads.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
