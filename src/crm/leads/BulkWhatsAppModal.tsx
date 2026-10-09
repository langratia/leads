"use client";

import { useEffect, useState } from "react";
import {
  X,
  Send,
  MessageSquare,
  Building,
  User,
  Phone,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  RotateCcw,
} from "lucide-react";
import type { Lead } from "./model/types";
import {
  normalizeWhatsAppNumber,
  WHATSAPP_TEMPLATES,
  buildWhatsAppUrl,
} from "@/core/whatsapp";
import { api } from "@/core/api";

interface BulkWhatsAppModalProps {
  leads: Lead[];
  isOpen: boolean;
  onClose: () => void;
  onFinished?: () => void;
}

export default function BulkWhatsAppModal({
  leads,
  isOpen,
  onClose,
  onFinished,
}: BulkWhatsAppModalProps) {
  if (!isOpen) return null;

  // Filter only prospects that have a phone or whatsapp number
  const eligibleLeads = leads.filter((l) => Boolean(l.whatsapp || l.phone));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("value_intro");
  const [customText, setCustomText] = useState<string>("");
  const [dispatchedCount, setDispatchedCount] = useState(0);
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());

  const currentLead = eligibleLeads[currentIndex] || null;
  const isFinished = currentIndex >= eligibleLeads.length;

  useEffect(() => {
    if (currentLead) {
      const tmpl =
        WHATSAPP_TEMPLATES.find((t) => t.id === selectedTemplate) ||
        WHATSAPP_TEMPLATES[0];
      setCustomText(tmpl.buildText(currentLead));
    }
  }, [currentIndex, selectedTemplate, currentLead]);

  const handleSendAndNext = async () => {
    if (!currentLead) return;

    const rawPhone = currentLead.whatsapp || currentLead.phone || "";
    const cleanPhone = normalizeWhatsAppNumber(rawPhone);

    if (cleanPhone) {
      // 1. Log activity to CRM
      await api.activities
        .add(
          currentLead.id,
          "WhatsApp Campaign",
          `Bulk sequence dispatched to +${cleanPhone}: "${customText.slice(0, 80)}..."`
        )
        .catch(() => {});

      // 2. Open WhatsApp Web / App
      const url = buildWhatsAppUrl(cleanPhone, customText);
      window.open(url, "_blank", "noopener,noreferrer");

      setDispatchedCount((prev) => prev + 1);
      setDispatchedIds((prev) => new Set(prev).add(currentLead.id));
    }

    // 3. Advance to next in queue
    if (currentIndex + 1 >= eligibleLeads.length) {
      setCurrentIndex(eligibleLeads.length);
      if (onFinished) onFinished();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex + 1 >= eligibleLeads.length) {
      setCurrentIndex(eligibleLeads.length);
      if (onFinished) onFinished();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const progressPct = eligibleLeads.length
    ? Math.round((currentIndex / eligibleLeads.length) * 100)
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-[#0d121d] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                1-Click Bulk WhatsApp Sequence
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  {eligibleLeads.length} Queued
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Rapidly advance through prospects with automated CRM logging.
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

        {/* Progress Tracker */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>
              Queue Progress: {Math.min(currentIndex + 1, eligibleLeads.length)} of {eligibleLeads.length}
            </span>
            <span className="text-emerald-400 font-mono">{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {isFinished ? (
          /* Finished State */
          <div className="py-8 text-center space-y-4">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Sequence Completed!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Dispatched {dispatchedCount} personalized WhatsApp outreach messages. All activity logs have been recorded in the CRM.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(0);
                  setDispatchedCount(0);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-800 bg-[#07090e] text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Restart Queue
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Active Queue Step */
          <>
            {/* Active Prospect Details */}
            {currentLead && (
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-800/80 bg-[#07090e]/80 p-3 text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Current Prospect ({currentIndex + 1}/{eligibleLeads.length})
                  </div>
                  <div className="font-bold text-white truncate flex items-center gap-1.5">
                    <Building className="h-3 w-3 text-slate-400" />
                    {currentLead.business_name}
                  </div>
                  <div className="text-slate-400 truncate text-[11px]">
                    {currentLead.contact_person || "Operations Lead"} · {currentLead.category || "Business"}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    WhatsApp Destination
                  </div>
                  <div className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-emerald-500" />
                    +{normalizeWhatsAppNumber(currentLead.whatsapp || currentLead.phone)}
                  </div>
                  <div className="text-slate-500 text-[10px] truncate">
                    {currentLead.address ? currentLead.address.split(",")[0] : "Uganda"}
                  </div>
                </div>
              </div>
            )}

            {/* Template Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                Template Strategy
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WHATSAPP_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`flex flex-col text-left p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                      selectedTemplate === tmpl.id
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                        : "border-slate-800 bg-[#07090e] text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="font-bold text-[11px]">{tmpl.label}</span>
                    <span className="text-[9px] text-slate-500">{tmpl.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Personalized Preview
              </label>
              <textarea
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-black/50 p-3 text-xs text-slate-200 outline-none focus:border-emerald-500/50 resize-none font-sans leading-relaxed"
              />
            </div>

            {/* Queue Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-white cursor-pointer flex items-center gap-1"
                >
                  <SkipForward className="h-3 w-3" /> Skip
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendAndNext}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all cursor-pointer active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
                Launch WhatsApp & Next ({currentIndex + 1}/{eligibleLeads.length})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
