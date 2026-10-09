"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Send,
  RotateCw,
  Search,
  CheckCircle2,
  Clock,
  User,
  Building,
  Sparkles,
  FileText,
  AlertCircle,
  Inbox,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/core/api";
import { EmailsIcon } from "@/core/icons/AbstractIcons";
import { useLeadsData } from "@/crm/leads/leads-context";

interface EmailThreadItem {
  id: string;
  leadId?: string | null;
  subject: string;
  participantEmail: string;
  status: string;
  lastMessageSnippet?: string;
  updatedAt: string;
}

const TEMPLATES = [
  {
    title: "Software & Technology Intro",
    subject: "Transforming your operations with LANGRATIA technology",
    body: `Hello,\n\nI came across your organization and noticed the impressive work you are doing in the region.\n\nAt LANGRATIA, we design and implement enterprise software solutions, CRM systems, and automated workflows that help organizations streamline their operations and scale efficiently.\n\nWould you have 10 minutes this week for a brief introductory call?\n\nBest regards,\nLANGRATIA Sales Team\ninquiries@langratia.com`,
  },
  {
    title: "Follow-Up & Scope Review",
    subject: "Following up regarding our discussion - LANGRATIA",
    body: `Hello,\n\nFollowing up on our earlier correspondence. We would be thrilled to assist you with the project requirements and explore how our dedicated development team can deliver results for you.\n\nPlease let me know if you have any questions or when you would like to schedule our next consultation.\n\nBest regards,\nLANGRATIA Team`,
  },
  {
    title: "Executive Partnership Proposal",
    subject: "Executive Partnership & Digital Modernization - LANGRATIA",
    body: `Dear Leadership Team,\n\nWe are reaching out to discuss potential strategic collaboration between our engineering firm and your team. We specialize in robust, high-performance web and cloud architectures.\n\nWe would welcome the opportunity to share our portfolio and discuss tailored solutions for your current initiatives.\n\nWarm regards,\nLANGRATIA Team`,
  },
];

export default function EmailsPage() {
  const { leads } = useLeadsData();
  const [selectedLeadEmail, setSelectedLeadEmail] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loadingThread, setLoadingThread] = useState(false);
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Quick recipient selection from existing leads with emails
  const leadsWithEmail = leads.filter((l) => l.email && l.email.includes("@"));

  const loadThread = async (email: string) => {
    if (!email) return;
    setLoadingThread(true);
    setSendSuccess(false);
    setSendError(null);
    try {
      const res = await api.email.getThread(email);
      setActiveThreadId(res.thread?.id || null);
      setThreadMessages(res.messages || []);
    } catch {
      setThreadMessages([]);
    } finally {
      setLoadingThread(false);
    }
  };

  const handleSelectLead = (email: string) => {
    setSelectedLeadEmail(email);
    setRecipientEmail(email);
    const targetLead = leads.find((l) => l.email === email);
    if (targetLead) {
      setSubject(`Collaboration proposal for ${targetLead.business_name}`);
    }
    loadThread(email);
  };

  const applyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setSubject(tmpl.subject);
    setBodyText(tmpl.body);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !bodyText) return;

    setSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      const leadMatch = leads.find((l) => l.email === recipientEmail);
      await api.email.send({
        thread_id: activeThreadId,
        to_email: recipientEmail,
        subject: subject || "Update from LANGRATIA",
        body_text: bodyText,
        lead_id: leadMatch?.id || null,
      });

      setSendSuccess(true);
      setBodyText("");
      // Reload thread
      await loadThread(recipientEmail);
      setTimeout(() => setSendSuccess(false), 4000);
    } catch (err: any) {
      setSendError(err.message || "Failed to dispatch email.");
    } finally {
      setSending(false);
    }
  };

  // Filtered leads
  const filteredLeads = leadsWithEmail.filter(
    (l) =>
      l.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Verified Sender
            </div>
            <div className="text-sm font-bold text-white mt-0.5">inquiries@langratia.com</div>
          </div>
          <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Email Dispatcher
            </div>
            <div className="text-sm font-bold text-sky-400 mt-0.5">Resend Live API</div>
          </div>
          <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <EmailsIcon className="h-4 w-4" />
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Email Prospects
            </div>
            <div className="text-sm font-bold text-white mt-0.5">{leadsWithEmail.length} with emails</div>
          </div>
          <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <User className="h-4 w-4" />
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Delivery Rate
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">99.8% Sent</div>
          </div>
          <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* TWO-COLUMN WORKSPACE: LEFT RECIPIENT ROSTER, RIGHT CONVERSATION & COMPOSER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PROSPECTS & THREADS (4 COLS) */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-[#0d121d] overflow-hidden flex flex-col h-[700px]">
          <div className="p-3 border-b border-slate-800 bg-[#07090e]/60">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search prospects with email..."
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredLeads.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No leads matching search.
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const isSelected = selectedLeadEmail === lead.email;
                return (
                  <button
                    key={lead.id}
                    onClick={() => handleSelectLead(lead.email!)}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "bg-sky-500/10 border-l-2 border-sky-400"
                        : "hover:bg-[#141b29]"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-sky-400">
                      {lead.business_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {lead.business_name}
                        </span>
                        <span className="text-[10px] font-semibold text-sky-400">
                          Score {lead.lead_score || 0}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{lead.email}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                        <span>{lead.category || "General"}</span>
                        <span>•</span>
                        <span>{lead.status}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: THREAD & COMPOSER (8 COLS) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#0d121d] flex flex-col h-[700px] overflow-hidden">
          {/* Active Conversation Header */}
          <div className="p-4 border-b border-slate-800 bg-[#07090e]/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">
                  {recipientEmail ? `Thread: ${recipientEmail}` : "Select a prospect or enter email below"}
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {threadMessages.length} Messages in thread history
                </span>
              </div>
            </div>

            {recipientEmail && (
              <button
                onClick={() => loadThread(recipientEmail)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#07090e] px-2.5 py-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCw className={`h-3 w-3 ${loadingThread ? "animate-spin" : ""}`} />
                Refresh
              </button>
            )}
          </div>

          {/* Conversation History Bubble List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#07090e]/30">
            {loadingThread ? (
              <div className="flex items-center justify-center h-48 text-xs text-slate-500 gap-2">
                <RotateCw className="h-4 w-4 animate-spin text-sky-400" />
                Loading conversation messages...
              </div>
            ) : threadMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-slate-500 space-y-2">
                <Inbox className="h-8 w-8 text-slate-700" />
                <p>No previous messages found with this recipient.</p>
                <p className="text-[11px] text-slate-600">
                  Send a cold introduction email using the composer below.
                </p>
              </div>
            ) : (
              threadMessages.map((msg: any) => {
                const isOutbound = msg.direction === "OUTBOUND";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                      <span>{isOutbound ? "Sent by Sales Team" : msg.from_email}</span>
                      <span>•</span>
                      <span>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed shadow-sm ${
                        isOutbound
                          ? "bg-sky-600/20 text-sky-100 border border-sky-500/30"
                          : "bg-slate-800/80 text-slate-200 border border-slate-700/60"
                      }`}
                    >
                      {msg.body_text || msg.body_html || ""}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* QUICK TEMPLATES PICKER */}
          <div className="px-4 py-2 bg-[#07090e]/80 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 shrink-0">
              Templates:
            </span>
            {TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="shrink-0 rounded-md border border-slate-800 bg-[#0d121d] px-2 py-1 text-[11px] text-slate-300 hover:border-sky-500/40 hover:text-sky-300 transition-colors cursor-pointer"
              >
                {tmpl.title}
              </button>
            ))}
          </div>

          {/* COMPOSER FORM */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-[#0d121d] space-y-3">
            {sendSuccess && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Message dispatched successfully via Resend.</span>
              </div>
            )}

            {sendError && (
              <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{sendError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Recipient email address..."
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              />
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <textarea
              required
              rows={4}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Write your email proposal, follow-up, or discovery message..."
              className="w-full rounded-lg border border-slate-800 bg-[#07090e] p-3 text-xs text-slate-200 focus:border-sky-500 focus:outline-none resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500">
                Dispatched from verified sender <span className="text-slate-400">inquiries@langratia.com</span>
              </span>

              <button
                type="submit"
                disabled={sending || !recipientEmail || !bodyText}
                className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-sky-500/20"
              >
                {sending ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send via Resend
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
