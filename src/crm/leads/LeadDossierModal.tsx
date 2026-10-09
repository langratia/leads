"use client";

import { useEffect, useState } from "react";
import {
  X,
  Sparkles,
  RotateCw,
  Check,
  Copy,
  MessageSquare,
  Mail,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Building,
  Target,
} from "lucide-react";
import { api } from "@/core/api";
import type { Lead } from "@/crm/leads";

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.779.98-.955 1.18-.176.2-.352.226-.653.075-1.636-.821-2.708-1.464-3.79-3.32-.286-.492.286-.456.818-1.52.09-.18.045-.338-.023-.488-.068-.15-.678-1.636-.93-2.242-.244-.59-.493-.51-.678-.52-.176-.008-.377-.01-.578-.01-.2 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511 0 1.482 1.08 2.912 1.23 3.113.15.201 2.126 3.247 5.151 4.554 1.776.767 2.479.799 3.364.667.545-.082 1.78-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.578-.352z" />
      <path d="M12.004 0C5.373 0 0 5.373 0 12c0 2.118.552 4.107 1.516 5.839L.055 23.44l5.772-1.492A11.94 11.94 0 0012.004 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 21.84c-1.84 0-3.567-.5-5.06-1.37l-.362-.213-3.754.97.99-3.66-.234-.374A9.816 9.816 0 012.164 12c0-5.426 4.414-9.84 9.84-9.84 5.426 0 9.84 4.414 9.84 9.84 0 5.426-4.414 9.84-9.84 9.84z" />
    </svg>
  );
}

interface DossierData {
  businessName: string;
  category: string;
  sectorOverview: string;
  corePainPoints: string[];
  recommendedSolution: {
    title: string;
    architecture: string[];
    estimatedImpact: string;
  };
  objectionHandlers: Array<{
    objection: string;
    counter: string;
  }>;
  whatsAppHook: string;
  emailPitch: {
    subject: string;
    body: string;
  };
}

export default function LeadDossierModal({
  lead,
  isOpen,
  onClose,
}: {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function fetchDossier() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.agent.getDossier({ leadId: lead.id, lead });
        if (isMounted) {
          if (res.success && res.dossier) {
            setDossier(res.dossier);
          } else {
            setError(res.error || "Failed to generate AI dossier.");
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to contact AI agent.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDossier();
    return () => {
      isMounted = false;
    };
  }, [isOpen, lead]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const phone = lead.phone || lead.whatsapp;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl border border-sky-500/30 bg-[#07090e] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-sky-950/40 via-[#0d121d] to-[#07090e] p-5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight truncate">
                  AI Sales Strategy Dossier
                </h3>
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-300 border border-sky-500/30">
                  {lead.lead_score || 0}/100 Score
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="font-semibold text-slate-300">{lead.business_name}</span>
                <span>·</span>
                <span>{lead.category || "Enterprise Account"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#090d16]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <RotateCw className="h-7 w-7 text-sky-400 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">
                Synthesizing Uganda market angle & tactical sales dossier...
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
              {error}
            </div>
          )}

          {!loading && dossier && (
            <div className="space-y-5">
              {/* SECTOR & STRATEGIC CONTEXT */}
              <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 space-y-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-sky-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    East Africa Strategic Market Context
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-[#0d121d] p-3 rounded-lg border border-slate-800/80">
                  {dossier.sectorOverview}
                </p>

                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Identified Operational Vulnerabilities
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dossier.corePainPoints.map((pt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-lg border border-slate-800/80 bg-[#0d121d] p-2.5 text-xs text-slate-300"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RECOMMENDED LANGRATIA ARCHITECTURE */}
              <div className="rounded-xl border border-sky-500/20 bg-gradient-to-r from-sky-950/20 to-[#07090e] p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-sky-400" />
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      Recommended Architecture: {dossier.recommendedSolution.title}
                    </h4>
                  </div>
                  <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    High ROI Fit
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {dossier.recommendedSolution.architecture.map((arch, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{arch}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-[#0d121d] border border-sky-500/20 p-2.5 text-xs text-sky-200 font-medium">
                  📈 <strong>Expected Business Impact:</strong> {dossier.recommendedSolution.estimatedImpact}
                </div>
              </div>

              {/* OBJECTION COUNTER-MATRIX */}
              <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 space-y-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Tactical Objection Handling Counters
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {dossier.objectionHandlers.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-800/80 bg-[#0d121d] p-3 space-y-1 text-xs"
                    >
                      <div className="font-semibold text-rose-300">
                        Prospect Objection: "{h.objection}"
                      </div>
                      <div className="text-slate-300 text-[11px] leading-relaxed">
                        <strong className="text-emerald-400">Winning Counter:</strong> {h.counter}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* READY-TO-DEPLOY WEAPONS: WHATSAPP HOOK & EMAIL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1-CLICK WHATSAPP HOOK */}
                <div className="rounded-xl border border-emerald-500/30 bg-[#07090e] p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <WhatsAppIcon className="h-4 w-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white">1-Click WhatsApp Opener</h4>
                      </div>
                      <button
                        onClick={() => copyToClipboard(dossier.whatsAppHook, "wa")}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        {copiedType === "wa" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {copiedType === "wa" ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <p className="mt-2.5 whitespace-pre-wrap text-xs text-slate-300 bg-[#0d121d] p-3 rounded-lg border border-slate-800/80 font-sans leading-relaxed">
                      "{dossier.whatsAppHook}"
                    </p>
                  </div>

                  {phone && (
                    <a
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        dossier.whatsAppHook
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 py-2 text-xs font-bold text-slate-950 transition-colors shadow-sm shadow-emerald-500/20"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5" />
                      Send on WhatsApp
                    </a>
                  )}
                </div>

                {/* 1-CLICK COLD EMAIL PITCH */}
                <div className="rounded-xl border border-sky-500/30 bg-[#07090e] p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-sky-400" />
                        <h4 className="text-xs font-bold text-white">Tailored Cold Email Pitch</h4>
                      </div>
                      <button
                        onClick={() => copyToClipboard(dossier.emailPitch.body, "email")}
                        className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer"
                      >
                        {copiedType === "email" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {copiedType === "email" ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="mt-2.5 text-xs text-slate-400 font-medium">
                      Subject: <span className="text-white font-mono">{dossier.emailPitch.subject}</span>
                    </div>

                    <p className="mt-1 whitespace-pre-wrap text-xs text-slate-300 bg-[#0d121d] p-3 rounded-lg border border-slate-800/80 font-sans leading-relaxed line-clamp-4">
                      {dossier.emailPitch.body}
                    </p>
                  </div>

                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}?subject=${encodeURIComponent(
                        dossier.emailPitch.subject
                      )}&body=${encodeURIComponent(dossier.emailPitch.body)}`}
                      className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 py-2 text-xs font-bold text-slate-950 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Launch in Mail App
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
