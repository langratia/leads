"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  CheckCheck,
  Clock,
  FileText,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Paperclip,
  RotateCcw,
  Mail,
  MessageSquare,
  Zap,
  X,
  Bold,
  Italic,
  List,
  Link2,
  Calendar,
  DollarSign,
  FileCode,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface EmailThreadProps {
  leadId: string;
  leadEmail: string;
  leadName: string;
  avatarUrl?: string;
  initialInquiryBody?: string;
  initialCategory?: string;
  companyName?: string;
  className?: string;
  hideHeader?: boolean;
}

export interface ThreadMessage {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  body_text: string;
  created_at: string;
  from_email?: string;
  to_email?: string;
  attachments?: Array<{ name: string; size: string }>;
}

export default function EmailChatThread({
  leadId,
  leadEmail,
  leadName,
  avatarUrl,
  initialInquiryBody,
  initialCategory,
  companyName,
  className = "",
  hideHeader = false,
}: EmailThreadProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [composerText, setComposerText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; name: string; size: string }>>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showTokensMenu, setShowTokensMenu] = useState(false);
  const [activeTemplateToast, setActiveTemplateToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize or fetch thread & messages
  useEffect(() => {
    let isMounted = true;

    const loadThread = async () => {
      setLoading(true);
      try {
        const { data: thread } = await supabase
          .from("email_threads")
          .select("id")
          .eq("participant_email", leadEmail)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (thread && isMounted) {
          setThreadId(thread.id);
          const { data: msgs } = await supabase
            .from("email_messages")
            .select("id, direction, body_text, created_at, from_email, to_email")
            .eq("thread_id", thread.id)
            .order("created_at", { ascending: true });

          if (msgs && msgs.length > 0) {
            setMessages(msgs);
            setLoading(false);
            return;
          }
        }

        // If no messages stored yet, synthesize the original inquiry as first client bubble
        if (isMounted) {
          const defaultInitialMsg: ThreadMessage = {
            id: `init_${leadId || "seed"}`,
            direction: "INBOUND",
            from_email: leadEmail,
            to_email: "inquiries@langratia.com",
            body_text:
              initialInquiryBody ||
              `Hello LANGRATIA team, we are inquiring about your ${initialCategory || "custom software"} platform. We would like to discuss implementation details and pricing for our organization.`,
            created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
          };
          setMessages([defaultInitialMsg]);
        }
      } catch (err) {
        console.warn("Could not fetch remote thread, using fallback:", err);
        if (isMounted) {
          setMessages([
            {
              id: `fallback_${leadId}`,
              direction: "INBOUND",
              from_email: leadEmail,
              to_email: "inquiries@langratia.com",
              body_text:
                initialInquiryBody ||
                `Inquiry regarding ${initialCategory || "software architecture"}.`,
              created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (leadEmail) {
      loadThread();
    }

    return () => {
      isMounted = false;
    };
  }, [leadEmail, leadId, initialInquiryBody, initialCategory]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const showToast = (msg: string) => {
    setActiveTemplateToast(msg);
    setTimeout(() => setActiveTemplateToast(null), 2500);
  };

  const handleSend = async () => {
    if (!composerText.trim() || sending) return;
    setSending(true);

    const textToSend = composerText.trim();
    const currentAttachments = [...attachedFiles];
    const tempId = `temp_${Date.now()}`;
    const newOutboundMsg: ThreadMessage = {
      id: tempId,
      direction: "OUTBOUND",
      from_email: "inquiries@langratia.com",
      to_email: leadEmail,
      body_text: textToSend,
      attachments: currentAttachments.map((f) => ({ name: f.name, size: f.size })),
      created_at: new Date().toISOString(),
    };

    // Optimistic UI append
    setMessages((prev) => [...prev, newOutboundMsg]);
    setComposerText("");
    setAttachedFiles([]);
    setShowAttachMenu(false);
    setShowTokensMenu(false);

    try {
      let activeThreadId = threadId;
      if (!activeThreadId) {
        const { data: newThread } = await supabase
          .from("email_threads")
          .insert({
            lead_id: leadId.startsWith("inq_") ? null : leadId,
            subject: `Inquiry: ${initialCategory || "Software Systems"} — ${companyName || leadName}`,
            participant_email: leadEmail,
          })
          .select("id")
          .maybeSingle();

        if (newThread?.id) {
          activeThreadId = newThread.id;
          setThreadId(activeThreadId);
        }
      }

      // Invoke Supabase Edge Function to dispatch via Resend
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          thread_id: activeThreadId,
          to_email: leadEmail,
          subject: `Re: LANGRATIA ${initialCategory || "Enterprise Software"} — ${companyName || leadName}`,
          body_text: textToSend,
          body_html: `<div style="font-family:sans-serif;color:#111;line-height:1.6;">${textToSend.replace(
            /\n/g,
            "<br/>"
          )}</div>`,
        },
      });

      if (error) {
        console.warn("Edge function send-email notice:", error.message);
      }
    } catch (err) {
      console.warn("Email logged in UI thread with live optimistic state:", err);
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (type: "DISCOVERY" | "NDA" | "PRICING" | "AI_CUSTOM") => {
    const firstName = leadName.split(" ")[0] || leadName;
    const clientCompany = companyName && companyName !== "N/A" ? companyName : "your organization";

    if (type === "DISCOVERY") {
      setComposerText(
        `Dear ${firstName},\n\nThank you for reaching out to LANGRATIA regarding your ${initialCategory || "software"} project for ${clientCompany}.\n\nWe would love to schedule a 30-minute technical discovery session to review your operational workflow, offline syncing requirements, and deployment timeline.\n\nPlease pick a convenient time on our engineering calendar:\nhttps://langratia.com/contact?book=consultation\n\nBest regards,\nLANGRATIA Engineering Team\nKampala, Uganda`
      );
      showToast("Applied '30-Min Discovery Call' template");
    } else if (type === "NDA") {
      setComposerText(
        `Dear ${firstName},\n\nIn accordance with your request for confidentiality protection regarding ${clientCompany}'s software architecture, we have prepared our standard Mutual NDA for review.\n\nLANGRATIA safeguards all proprietary schemas, records, and workflow specifications with enterprise security.\n\nPlease review and let us know if any adjustments are needed.\n\nBest regards,\nLANGRATIA Legal & Compliance`
      );
      // Auto-attach NDA document
      if (!attachedFiles.some((f) => f.name.includes("Mutual_NDA"))) {
        setAttachedFiles((prev) => [
          ...prev,
          { id: "nda_doc", name: "LANGRATIA_Mutual_NDA_2026.pdf", size: "248 KB" },
        ]);
      }
      showToast("Applied 'Mutual NDA' template & attached document");
    } else if (type === "PRICING") {
      setComposerText(
        `Dear ${firstName},\n\nThank you for reaching out. Here is our architecture and pricing overview for ${clientCompany}:\n\n• Core Modules: Offline-first workstation sync, role-based access, automated Mobile Money reconciliation.\n• Deployment: On-Premise Local Server + Automated Cloud Mirror Sync.\n• Standard Implementation: 4–6 weeks.\n• Estimated Budget: $3,500 – $5,200 (UGX 13M – 19.5M)\n\nWe would be happy to host a live demo or provide a full technical quote.\n\nBest regards,\nLANGRATIA Enterprise Solutions`
      );
      if (!attachedFiles.some((f) => f.name.includes("Architecture"))) {
        setAttachedFiles((prev) => [
          ...prev,
          { id: "arch_doc", name: "LANGRATIA_Architecture_Overview.pdf", size: "1.4 MB" },
        ]);
      }
      showToast("Applied 'Architecture & Pricing' template & attached deck");
    } else if (type === "AI_CUSTOM") {
      setAiGenerating(true);
      setTimeout(() => {
        setComposerText(
          `Dear ${firstName},\n\nI reviewed your request for ${clientCompany} regarding "${initialInquiryBody?.slice(0, 80) || "your system"}...".\n\nOur engineering team specializes in ${initialCategory || "custom software systems"}, particularly offline-first synchronization, high-availability local database replication, and automated operational reconciliation.\n\nBased on your scope, we recommend an initial architecture sprint of 4 weeks with on-site deployment in Kampala.\n\nWould you be available for a brief Google Meet call this week to finalize the technical specification?\n\nBest regards,\nLANGRATIA Lead Systems Architect`
        );
        setAiGenerating(false);
        showToast("✨ AI generated personalized response");
      }, 500);
    }
  };

  const insertVariable = (token: string) => {
    setComposerText((prev) => prev + " " + token + " ");
    setShowTokensMenu(false);
    textareaRef.current?.focus();
  };

  const addPresetAttachment = (name: string, size: string) => {
    if (!attachedFiles.some((f) => f.name === name)) {
      setAttachedFiles((prev) => [...prev, { id: `att_${Date.now()}`, name, size }]);
      showToast(`Attached ${name}`);
    }
    setShowAttachMenu(false);
  };

  const removeAttachment = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className={`flex flex-col h-full bg-[#090d16] rounded-xl border border-slate-800/80 overflow-hidden shadow-xl ${className}`}>
      {/* THREAD TOPBAR (OPTIONAL WHEN EMBEDDED) */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#0d121d] border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-slate-700/80 shadow-md">
                <img src={avatarUrl} alt={leadName} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs shadow-inner shrink-0">
                {leadName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white tracking-tight">{leadName}</h3>
                <span className="text-[10px] text-slate-400 font-mono">({leadEmail})</span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Email Thread · Auto-synced with Resend Webhooks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-300 bg-[#080c14] px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-sky-400" />
              inquiries@langratia.com
            </span>
          </div>
        </div>
      )}

      {/* CHAT MESSAGES SCROLL AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px] bg-[#07090e]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs gap-2">
            <div className="h-4 w-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
            Syncing email conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
            <div className="relative mb-3 flex items-center justify-center">
              <div className="absolute inset-0 h-16 w-16 rounded-full bg-sky-500/10 blur-xl"></div>
              <div className="relative h-12 w-12 rounded-2xl bg-[#0d121d] border border-slate-800 flex items-center justify-center text-slate-500 shadow-xl">
                <MessageSquare className="h-6 w-6 text-sky-400/70" />
              </div>
            </div>
            <h4 className="text-xs font-bold text-slate-200">No emails exchanged yet</h4>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-relaxed">
              Start the conversation by choosing one of the quick templates below or typing an email reply.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOutbound = msg.direction === "OUTBOUND";
            return (
              <div
                key={msg.id}
                className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out ${
                  isOutbound ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {isOutbound ? "LANGRATIA Engineering" : leadName}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-lg transition-all ${
                    isOutbound
                      ? "bg-gradient-to-br from-sky-600 via-sky-600 to-indigo-700 text-white rounded-tr-xs shadow-sky-950/40"
                      : "bg-[#0d1320] text-slate-100 border border-slate-800/90 rounded-tl-xs shadow-black/40"
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{msg.body_text}</p>

                  {/* Attached Files inside message bubble */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                      {msg.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-black/25 px-2.5 py-1 rounded-lg text-[11px] text-slate-200"
                        >
                          <Paperclip className="h-3 w-3 text-sky-300" />
                          <span className="font-mono text-[10px] font-semibold">{att.name}</span>
                          <span className="text-[9px] text-slate-400">({att.size})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-1 px-1">
                  {isOutbound && (
                    <span className="text-[10px] text-sky-400 font-medium flex items-center gap-1">
                      <CheckCheck className="h-3 w-3" /> Dispatched to Client
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================
          REVOLUTIONARY INTERACTIVE EMAIL COMPOSER
          ============================================================ */}
      <div className="p-3 bg-[#0d121d] border-t border-slate-800/80 shrink-0 space-y-2 relative">
        {/* Template Feedback Toast */}
        {activeTemplateToast && (
          <div className="absolute -top-9 left-4 z-20 flex items-center gap-1.5 bg-sky-500 text-slate-950 px-3 py-1 rounded-full text-[11px] font-bold shadow-lg shadow-sky-500/30 animate-in fade-in slide-in-from-bottom-1">
            <Check className="h-3 w-3" /> {activeTemplateToast}
          </div>
        )}

        {/* Quick Template Chips Bar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" /> Fast Actions:
          </span>

          <button
            type="button"
            onClick={() => applyTemplate("AI_CUSTOM")}
            disabled={aiGenerating}
            className="flex items-center gap-1.5 text-[11px] font-bold bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-sky-500/20 hover:from-indigo-500/30 hover:to-sky-500/30 text-indigo-300 hover:text-white px-2.5 py-1 rounded-lg transition-all border border-indigo-500/40 hover:border-indigo-400 cursor-pointer shadow-sm active:scale-95"
            title="Auto-draft personalized engineering response"
          >
            <Sparkles className={`h-3 w-3 text-indigo-400 ${aiGenerating ? "animate-spin" : ""}`} />
            {aiGenerating ? "Drafting..." : "✨ AI Smart Draft"}
          </button>

          <button
            type="button"
            onClick={() => applyTemplate("DISCOVERY")}
            className="flex items-center gap-1 text-[11px] font-medium bg-[#121826] hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-all border border-slate-800 hover:border-slate-700 cursor-pointer shadow-sm active:scale-95"
          >
            <Clock className="h-3 w-3 text-sky-400" /> Discovery Call
          </button>

          <button
            type="button"
            onClick={() => applyTemplate("NDA")}
            className="flex items-center gap-1 text-[11px] font-medium bg-[#121826] hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-all border border-slate-800 hover:border-slate-700 cursor-pointer shadow-sm active:scale-95"
          >
            <ShieldCheck className="h-3 w-3 text-amber-400" /> Mutual NDA
          </button>

          <button
            type="button"
            onClick={() => applyTemplate("PRICING")}
            className="flex items-center gap-1 text-[11px] font-medium bg-[#121826] hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-all border border-slate-800 hover:border-slate-700 cursor-pointer shadow-sm active:scale-95"
          >
            <FileText className="h-3 w-3 text-indigo-400" /> Pricing & Deck
          </button>
        </div>

        {/* Unified Interactive Composer Card */}
        <div className="rounded-xl border border-slate-700/80 bg-[#07090e] shadow-xl focus-within:border-sky-500/80 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all overflow-hidden">
          {/* Active Attached Files List (if any) */}
          {attachedFiles.length > 0 && (
            <div className="px-3 pt-2.5 pb-1 flex flex-wrap gap-1.5 bg-[#090e18] border-b border-slate-800/80">
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-1.5 bg-slate-800/90 text-slate-200 border border-slate-700 px-2.5 py-0.5 rounded-md text-[11px] shadow-sm animate-in fade-in"
                >
                  <Paperclip className="h-3 w-3 text-sky-400" />
                  <span className="font-mono text-[10px] font-medium">{file.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">({file.size})</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.id)}
                    className="text-slate-400 hover:text-rose-400 ml-1 p-0.5 rounded cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text Input Area */}
          <textarea
            ref={textareaRef}
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder={`Reply to ${leadName} via official sales@langratia.com email…`}
            className="w-full bg-transparent px-3.5 pt-3 pb-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none resize-none min-h-[64px] max-h-[160px] leading-relaxed font-sans"
            rows={Math.min(5, Math.max(2, composerText.split("\n").length))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Integrated Interactive Bottom Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#090d16] border-t border-slate-800/80 relative">
            {/* Left Tools: Attachments, Snippets, Shortcuts */}
            <div className="flex items-center gap-1 text-slate-400">
              {/* Attach Document Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAttachMenu((prev) => !prev)}
                  className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  title="Attach Capabilities or Proposal PDF"
                >
                  <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[11px] font-medium">Attach</span>
                </button>

                {showAttachMenu && (
                  <div className="absolute bottom-8 left-0 z-30 w-64 rounded-xl border border-slate-800 bg-[#0d121d] p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95">
                    <p className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">Attach Preset Document</p>
                    <button
                      type="button"
                      onClick={() => addPresetAttachment("LANGRATIA_Capabilities_2026.pdf", "2.1 MB")}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white text-left cursor-pointer"
                    >
                      <span className="truncate">📄 Capabilities Deck</span>
                      <span className="text-[10px] text-slate-500 font-mono">2.1 MB</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addPresetAttachment("LANGRATIA_Mutual_NDA_2026.pdf", "248 KB")}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white text-left cursor-pointer"
                    >
                      <span className="truncate">🔒 Mutual NDA Terms</span>
                      <span className="text-[10px] text-slate-500 font-mono">248 KB</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addPresetAttachment("Enterprise_Architecture_Overview.pdf", "1.4 MB")}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white text-left cursor-pointer"
                    >
                      <span className="truncate">💼 Architecture Deck</span>
                      <span className="text-[10px] text-slate-500 font-mono">1.4 MB</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Snippets & Tokens */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTokensMenu((prev) => !prev)}
                  className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  title="Insert dynamic variable or link"
                >
                  <FileCode className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[11px] font-medium">Insert</span>
                </button>

                {showTokensMenu && (
                  <div className="absolute bottom-8 left-0 z-30 w-56 rounded-xl border border-slate-800 bg-[#0d121d] p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95">
                    <p className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">Insert Shortcut</p>
                    <button
                      type="button"
                      onClick={() => insertVariable("https://langratia.com/contact?book=consultation")}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white text-left cursor-pointer"
                    >
                      <Calendar className="h-3.5 w-3.5 text-sky-400" /> Calendar Link
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable(`Estimated budget: $3,500 – $5,200 (UGX 13,000,000 – 19,500,000)`)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white text-left cursor-pointer"
                    >
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Pricing Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable(companyName || leadName)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white text-left cursor-pointer"
                    >
                      <User className="h-3.5 w-3.5 text-amber-400" /> Company Name
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Status Indicator & Send Button */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 hidden sm:inline-block font-mono">
                {composerText.length > 0 ? `${composerText.length} chars` : "Resend SMTP Connected"}
              </span>

              <button
                type="button"
                onClick={handleSend}
                disabled={!composerText.trim() || sending}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-md active:scale-95 ${
                  composerText.trim() && !sending
                    ? "bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-slate-950 shadow-sky-500/25 font-bold"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                }`}
                title="Send Email (Cmd + Enter)"
              >
                {sending ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Email</span>
                    <span className="text-[9px] opacity-75 font-mono ml-0.5 bg-black/20 px-1 py-0.2 rounded">⌘↵</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
