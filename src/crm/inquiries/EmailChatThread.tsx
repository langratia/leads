"use client";

import { useState, useEffect, useRef } from "react";
import { config } from "@/config";
import {
  Calendar,
  Check,
  CheckCheck,
  Clock,
  DollarSign,
  FileCode,
  Mail,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { supabase } from "@/core/supabase";

export interface EmailThreadProps {
  leadId: string;
  leadEmail: string;
  leadName: string;
  avatarUrl?: string;
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
  /** Only set on optimistic outbound bubbles — reflects the real send result. */
  delivery?: "sending" | "sent" | "failed";
}

export default function EmailChatThread({
  leadId,
  leadEmail,
  leadName,
  avatarUrl,
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
  const [loadError, setLoadError] = useState("");
  const [showTokensMenu, setShowTokensMenu] = useState(false);
  const [activeTemplateToast, setActiveTemplateToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load the real thread. If none exists the thread stays empty — the
  // previous version invented an inbound message with a made-up timestamp,
  // which read as conversation history the client never had.
  useEffect(() => {
    let isMounted = true;

    const loadThread = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const { data: thread, error } = await supabase
          .from("email_threads")
          .select("id")
          .eq("participant_email", leadEmail)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (thread && isMounted) {
          setThreadId(thread.id);
          const { data: msgs, error: msgError } = await supabase
            .from("email_messages")
            .select("id, direction, body_text, created_at, from_email, to_email")
            .eq("thread_id", thread.id)
            .order("created_at", { ascending: true });

          if (msgError) throw msgError;
          if (isMounted) setMessages(msgs ?? []);
        }
      } catch (err: any) {
        if (isMounted) setLoadError(`Could not load this thread: ${err?.message || "unknown error"}`);
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
  }, [leadEmail]);

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
    const tempId = `temp_${Date.now()}`;
    const newOutboundMsg: ThreadMessage = {
      id: tempId,
      direction: "OUTBOUND",
      from_email: config.senderEmail,
      to_email: leadEmail,
      body_text: textToSend,
      delivery: "sending",
      created_at: new Date().toISOString(),
    };

    // Optimistic UI append
    setMessages((prev) => [...prev, newOutboundMsg]);
    setComposerText("");
    setShowTokensMenu(false);

    const markDelivery = (delivery: "sent" | "failed") =>
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, delivery } : m))
      );

    try {
      let activeThreadId = threadId;
      if (!activeThreadId) {
        const { data: newThread, error: threadError } = await supabase
          .from("email_threads")
          .insert({
            lead_id: leadId.startsWith("inq_") ? null : leadId,
            subject: `Inquiry: ${initialCategory || "Software Systems"} — ${companyName || leadName}`,
            participant_email: leadEmail,
          })
          .select("id")
          .maybeSingle();

        if (threadError) throw threadError;
        if (newThread?.id) {
          activeThreadId = newThread.id;
          setThreadId(activeThreadId);
        }
      }

      const subject = `Re: ${config.brandName} ${initialCategory || "Enterprise Software"} — ${companyName || leadName}`;

      const sendRes = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("leads_auth_token")
            ? { Authorization: `Bearer ${localStorage.getItem("leads_auth_token")}` }
            : {}),
        },
        body: JSON.stringify({
          thread_id: activeThreadId,
          to_email: leadEmail,
          subject,
          body_text: textToSend,
          body_html: `<div style="font-family:sans-serif;color:#111;line-height:1.6;">${textToSend
            .replace(/\n/g, "<br/>")
            .replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!)}</div>`,
        }),
      });

      /* The bubble used to read "Dispatched to Client" no matter what
         happened, because every failure was swallowed. It now reports the
         outcome the request actually returned. */
      if (!sendRes.ok) {
        const detail = await sendRes.text().catch(() => "");
        throw new Error(`Send failed (${sendRes.status})${detail ? `: ${detail.slice(0, 120)}` : ""}`);
      }
      markDelivery("sent");
    } catch (err: any) {
      markDelivery("failed");
      /* Put the text back so the reply is not lost on a failed send. */
      setComposerText(textToSend);
      showToast(err?.message || "The email was not sent.");
    } finally {
      setSending(false);
    }
  };

  /* These are fixed templates, not generated output. Nothing here calls a
     model — the previous "AI Smart Draft" waited 500ms and pasted canned
     text that read as an analysis of the client's brief. */
  const applyTemplate = (type: "DISCOVERY" | "NDA" | "FOLLOWUP") => {
    const firstName = leadName.split(" ")[0] || leadName;
    const clientCompany = companyName && companyName !== "N/A" ? companyName : "your organization";

    if (type === "DISCOVERY") {
      setComposerText(
        `Dear ${firstName},\n\nThank you for reaching out to ${config.brandName} regarding your ${initialCategory || "software"} project for ${clientCompany}.\n\nWe would love to schedule a 30-minute technical discovery session to review your operational workflow, offline syncing requirements, and deployment timeline.\n\nPlease pick a convenient time on our engineering calendar:\n${config.siteUrl}/contact?book=consultation\n\nBest regards,\n${config.brandName} Engineering Team\n${config.siteDomain}`
      );
      showToast("Discovery call template inserted — edit before sending.");
    } else if (type === "NDA") {
      setComposerText(
        `Dear ${firstName},\n\nThank you for confirming that you would like a mutual NDA in place before we discuss ${clientCompany}'s technical architecture.\n\nOur standard mutual NDA is ready to send over. Please confirm a convenient time to walk through it, or let me know if your legal team uses a specific form we should work from.\n\nBest regards,\n${config.brandName} Legal & Compliance`
      );
      showToast("NDA template inserted — attach the signed document manually.");
    } else {
      setComposerText(
        `Dear ${firstName},\n\nJust following up on our conversation about ${clientCompany}'s ${initialCategory || "project"}.\n\nTo keep things moving, the two things that would help most are a clear picture of your current workflow, and a target date for going live. Once we have those we can put together an accurate timeline and quote.\n\nWould a short call this week work?\n\nBest regards,\n${config.brandName} Engineering Team`
      );
      showToast("Follow-up template inserted — edit before sending.");
    }
  };

  const insertVariable = (token: string) => {
    setComposerText((prev) => prev + " " + token + " ");
    setShowTokensMenu(false);
    textareaRef.current?.focus();
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
                Emailed from {config.senderEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-300 bg-[#090d16] px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-sky-400" />
              {config.senderEmail}
            </span>
          </div>
        </div>
      )}

      {/* CHAT MESSAGES SCROLL AREA */}
      <div ref={scrollRef} className="min-h-[220px] flex-1 space-y-4 overflow-y-auto bg-[#07090e] p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 text-xs text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
            Loading thread…
          </div>
        ) : loadError ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-rose-300">
            {loadError}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-[#0d121d]">
              <MessageSquare className="h-6 w-6 text-sky-400/70" />
            </div>
            <h4 className="text-xs font-bold text-slate-200">No emails sent yet</h4>
            <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-slate-500">
              Nothing has gone out to {leadEmail} yet. Use a template below or write your own reply.
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
                    {isOutbound ? `${config.brandName} Engineering` : leadName}
                  </span>
                  <span className="text-[10px] text-slate-600">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    isOutbound
                      ? "rounded-tr-xs bg-sky-600 text-white"
                      : "rounded-tl-xs border border-slate-800/90 bg-[#0d121d] text-slate-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{msg.body_text}</p>
                </div>

                <div className="mt-1 flex items-center gap-1 px-1">
                  {isOutbound && (
                    <span
                      className={`flex items-center gap-1 text-[10px] font-medium ${
                        msg.delivery === "failed"
                          ? "text-rose-400"
                          : msg.delivery === "sending"
                            ? "text-slate-500"
                            : "text-sky-400"
                      }`}
                    >
                      {msg.delivery === "failed" ? (
                        <>
                          <ShieldAlert className="h-3 w-3" /> Not sent
                        </>
                      ) : msg.delivery === "sending" ? (
                        <>
                          <Clock className="h-3 w-3" /> Sending…
                        </>
                      ) : (
                        <>
                          <CheckCheck className="h-3 w-3" /> Sent
                        </>
                      )}
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

        {/* Template chips — fixed text you edit, not generated output. */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Templates
          </span>

          <button
            type="button"
            onClick={() => applyTemplate("DISCOVERY")}
            className="cursor-pointer rounded-lg border border-slate-800 bg-[#090d16] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <Clock className="mr-1 inline h-3 w-3 text-sky-400" />
            Discovery call
          </button>

          <button
            type="button"
            onClick={() => applyTemplate("NDA")}
            className="cursor-pointer rounded-lg border border-slate-800 bg-[#090d16] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <ShieldCheck className="mr-1 inline h-3 w-3 text-amber-400" />
            Mutual NDA
          </button>

          <button
            type="button"
            onClick={() => applyTemplate("FOLLOWUP")}
            className="cursor-pointer rounded-lg border border-slate-800 bg-[#090d16] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw className="mr-1 inline h-3 w-3 text-indigo-400" />
            Follow-up
          </button>
        </div>

        {/* Composer */}
        <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-[#07090e] transition-all focus-within:border-sky-500/80 focus-within:ring-2 focus-within:ring-sky-500/20">
          {/* Text Input Area */}
          <textarea
            ref={textareaRef}
            value={composerText}
            onChange={(e) => setComposerText(e.target.value)}
            placeholder={`Reply to ${leadName} via official ${config.senderEmail} email…`}
            className="w-full bg-transparent px-3.5 pt-3 pb-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none resize-none min-h-[64px] max-h-[160px] leading-relaxed font-sans"
            rows={Math.min(5, Math.max(2, composerText.split("\n").length))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Bottom toolbar */}
          <div className="relative flex items-center justify-between border-t border-slate-800/80 bg-[#090d16] px-3 py-2">
            <div className="flex items-center gap-1 text-slate-400">
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
                      onClick={() => insertVariable(`${config.siteUrl}/contact?book=consultation`)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white text-left cursor-pointer"
                    >
                      <Calendar className="h-3.5 w-3.5 text-sky-400" /> Calendar Link
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable("[quote]")}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white text-left cursor-pointer"
                    >
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Price placeholder
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
              <span className="hidden font-mono text-[10px] text-slate-500 sm:inline-block">
                {composerText.length > 0 ? `${composerText.length} characters` : `To ${leadEmail}`}
              </span>

              <button
                type="button"
                onClick={handleSend}
                disabled={!composerText.trim() || sending}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold ${
                  composerText.trim() && !sending
                    ? "bg-sky-500 text-slate-950 transition-colors hover:bg-sky-400"
                    : "cursor-not-allowed bg-slate-800 text-slate-500"
                }`}
                title="Send email (Cmd/Ctrl + Enter)"
              >
                {sending ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    <span>Sending…</span>
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
