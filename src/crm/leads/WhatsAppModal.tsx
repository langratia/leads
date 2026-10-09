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
  Copy,
  ExternalLink,
} from "lucide-react";
import type { Lead } from "./model/types";
import {
  normalizeWhatsAppNumber,
  WHATSAPP_TEMPLATES,
  buildWhatsAppUrl,
  type WhatsAppTemplate,
} from "@/core/whatsapp";
import { api } from "@/core/api";

interface WhatsAppModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onActivityLogged?: () => void;
}

export default function WhatsAppModal({
  lead,
  isOpen,
  onClose,
  onActivityLogged,
}: WhatsAppModalProps) {
  if (!isOpen || !lead) return null;

  const rawPhone = lead.whatsapp || lead.phone || "";
  const cleanPhone = normalizeWhatsAppNumber(rawPhone);

  const [selectedTemplate, setSelectedTemplate] = useState<string>("value_intro");
  const [message, setMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    const tmpl = WHATSAPP_TEMPLATES.find((t) => t.id === selectedTemplate) || WHATSAPP_TEMPLATES[0];
    setMessage(tmpl.buildText(lead));
  }, [selectedTemplate, lead]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = async () => {
    if (!cleanPhone) {
      alert("No valid phone number found for this lead.");
      return;
    }

    setLogging(true);
    try {
      // 1. Log the outreach activity to the CRM database
      await api.activities.add(
        lead.id,
        "WhatsApp",
        `WhatsApp outreach dispatched to +${cleanPhone}: "${message.slice(0, 100)}..."`
      );

      // 2. Open WhatsApp Web / Desktop / Mobile with the pre-filled message
      const url = buildWhatsAppUrl(cleanPhone, message);
      window.open(url, "_blank", "noopener,noreferrer");

      if (onActivityLogged) onActivityLogged();
      onClose();
    } catch (err: any) {
      console.warn("Activity logging notice:", err);
      // Still open WhatsApp even if logging fails
      const url = buildWhatsAppUrl(cleanPhone, message);
      window.open(url, "_blank", "noopener,noreferrer");
      onClose();
    } finally {
      setLogging(false);
    }
  };

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
                1-Click WhatsApp Direct Sales
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  Direct wa.me
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Personalized pitch with automated activity logging.
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

        {/* Lead Target Info Box */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-800/80 bg-[#07090e]/80 p-3 text-xs">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Prospect</div>
            <div className="font-bold text-white truncate flex items-center gap-1.5">
              <Building className="h-3 w-3 text-slate-400" />
              {lead.business_name}
            </div>
            <div className="text-slate-400 truncate text-[11px]">
              {lead.contact_person || "Key Decision Maker"}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Destination WhatsApp</div>
            <div className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-emerald-500" />
              {cleanPhone ? `+${cleanPhone}` : "No phone listed"}
            </div>
            <div className="text-slate-500 text-[10px]">
              {rawPhone !== cleanPhone ? `Cleaned from: ${rawPhone}` : "E.164 normalized"}
            </div>
          </div>
        </div>

        {/* Template Selectors */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Select Pitch Template
          </label>
          <div className="grid grid-cols-2 gap-2">
            {WHATSAPP_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedTemplate === tmpl.id
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-sm shadow-emerald-500/10"
                    : "border-slate-800 bg-[#07090e] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <span className="text-xs font-bold">{tmpl.label}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{tmpl.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Message Preview (Customizable)
            </label>
            <button
              type="button"
              onClick={handleCopy}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>

          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-[#07090e] p-3 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-500">
            Will auto-log a <span className="text-emerald-400">WhatsApp activity</span> in CRM
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDispatch}
              disabled={logging || !cleanPhone}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              Launch WhatsApp
              <ExternalLink className="h-3 w-3 opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
