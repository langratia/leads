"use client";

import { useState } from "react";
import {
  Sparkles,
  Zap,
  Play,
  RotateCw,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Send,
  Building,
  Mail,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { api } from "@/core/api";
import { AgentIcon, FinderIcon, EmailsIcon, FollowupsIcon } from "@/core/icons/AbstractIcons";
import { useLeadsData } from "@/crm/leads/leads-context";

interface ExecutionStep {
  step: number;
  action: string;
  detail: string;
  status: "completed" | "in_progress" | "failed";
  timestamp: string;
}

export default function AgentPage() {
  const { leads, refresh } = useLeadsData();
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);

  // Form states for Auto-Prospector
  const [targetCategory, setTargetCategory] = useState("Medical Clinic");
  const [targetArea, setTargetArea] = useState("Kampala");
  const [targetLimit, setTargetLimit] = useState(10);

  // Execution Results
  const [executionSummary, setExecutionSummary] = useState<string | null>(null);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [stats, setStats] = useState<{ imported: number; skipped: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sending drafted email
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);
  const [sentDrafts, setSentDrafts] = useState<Set<number>>(new Set());

  const runProspectorWorkflow = async () => {
    setRunning(true);
    setActiveWorkflow("auto_prospect");
    setErrorMsg(null);
    setExecutionSteps([
      { step: 1, action: "Initializing Autonomous Prospector", detail: `Configuring radar for "${targetCategory} in ${targetArea}"`, status: "in_progress", timestamp: new Date().toLocaleTimeString() },
    ]);
    setExecutionSummary(null);
    setDrafts([]);
    setStats(null);

    try {
      const res = await api.agent.run({
        workflow: "auto_prospect",
        target_category: targetCategory,
        target_area: targetArea,
        limit: targetLimit,
      });

      setExecutionSteps(res.steps || []);
      setExecutionSummary(res.summary);
      setDrafts(res.drafts || []);
      setStats(res.stats || null);
      await refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Autonomous execution failed.");
    } finally {
      setRunning(false);
      setActiveWorkflow(null);
    }
  };

  const runRevivalWorkflow = async () => {
    setRunning(true);
    setActiveWorkflow("stale_revival");
    setErrorMsg(null);
    setExecutionSteps([
      { step: 1, action: "Scanning Database", detail: "Locating leads with no follow-ups or activity in 7+ days", status: "in_progress", timestamp: new Date().toLocaleTimeString() },
    ]);
    setExecutionSummary(null);
    setDrafts([]);
    setStats(null);

    try {
      const res = await api.agent.run({ workflow: "stale_revival" });
      setExecutionSteps(res.steps || []);
      setExecutionSummary(res.summary);
      await refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Revival workflow failed.");
    } finally {
      setRunning(false);
      setActiveWorkflow(null);
    }
  };

  const runCustomPrompt = async () => {
    if (!prompt.trim() || running) return;
    setRunning(true);
    setActiveWorkflow("prompt");
    setErrorMsg(null);
    setExecutionSteps([
      { step: 1, action: "Interpreting Command", detail: prompt, status: "in_progress", timestamp: new Date().toLocaleTimeString() },
    ]);
    setExecutionSummary(null);
    setDrafts([]);
    setStats(null);

    try {
      const res = await api.agent.run({ prompt });
      setExecutionSteps(res.steps || []);
      setExecutionSummary(res.summary);
      if (res.drafts) setDrafts(res.drafts);
      if (res.stats) setStats(res.stats);
      setPrompt("");
      await refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Prompt execution failed.");
    } finally {
      setRunning(false);
      setActiveWorkflow(null);
    }
  };

  const sendDraft = async (draft: any, index: number) => {
    if (!draft.email && !draft.phone) {
      alert("No contact email or phone associated with this draft.");
      return;
    }
    const recipient = draft.email || "client@domain.com";
    setSendingIndex(index);
    try {
      await api.email.send({
        to_email: recipient,
        subject: draft.subject,
        body_text: draft.preview,
      });
      setSentDrafts((prev) => new Set(prev).add(index));
    } catch (err: any) {
      alert(`Email dispatch error: ${err.message}`);
    } finally {
      setSendingIndex(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* AGENT STATUS HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-950/40 via-[#0d121d] to-indigo-950/30 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <AgentIcon className="h-5 w-5" />
              </span>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-400">
                LANGRATIA AUTONOMOUS CORE
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Agent Ready
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Autonomous Sales & Prospecting Agent
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Equipped with Google Places Radar, algorithmic lead scoring, intelligent deduplication, and automated cold outreach dispatch via Resend.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex items-center">
            <div className="rounded-xl border border-slate-800 bg-[#07090e]/80 p-3 text-center min-w-[110px]">
              <div className="text-[10px] font-medium text-slate-500">Live Leads</div>
              <div className="text-lg font-bold text-white">{leads.length}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#07090e]/80 p-3 text-center min-w-[110px]">
              <div className="text-[10px] font-medium text-slate-500">Avg Lead Score</div>
              <div className="text-lg font-bold text-sky-400">
                {leads.length ? Math.round(leads.reduce((acc, l) => acc + (l.lead_score || 0), 0) / leads.length) : 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AUTOPILOT ACTION RECIPES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RECIPE 1: AUTONOMOUS PROSPECTOR */}
        <div className="rounded-xl border border-slate-800/80 bg-[#0d121d] p-5 space-y-4 hover:border-sky-500/30 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <FinderIcon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Target Prospecting Campaign</h3>
                <p className="text-xs text-slate-400">Discover businesses, score them, and draft cold outreach.</p>
              </div>
            </div>
            <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-300">
              Autopilot
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              >
                <option value="Medical Clinic">Medical Clinics</option>
                <option value="Pharmacy">Pharmacies</option>
                <option value="Hospital">Hospitals</option>
                <option value="School">Schools & Colleges</option>
                <option value="Hotel">Hotels & Lodges</option>
                <option value="Restaurant">Restaurants</option>
                <option value="Hardware Store">Hardware Stores</option>
                <option value="Law Firm">Law Firms</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Location Area
              </label>
              <input
                type="text"
                value={targetArea}
                onChange={(e) => setTargetArea(e.target.value)}
                placeholder="e.g. Ntinda, Kampala"
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Batch Count
              </label>
              <select
                value={targetLimit}
                onChange={(e) => setTargetLimit(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3 py-1.5 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
              >
                <option value={5}>5 Leads</option>
                <option value={10}>10 Leads</option>
                <option value={20}>20 Leads</option>
              </select>
            </div>
          </div>

          <button
            onClick={runProspectorWorkflow}
            disabled={running}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 py-2.5 text-xs font-bold text-slate-950 transition-colors shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer"
          >
            {running && activeWorkflow === "auto_prospect" ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                Executing Campaign...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                Launch Autonomous Campaign
              </>
            )}
          </button>
        </div>

        {/* RECIPE 2: STALE LEAD REVIVAL */}
        <div className="rounded-xl border border-slate-800/80 bg-[#0d121d] p-5 space-y-4 hover:border-indigo-500/30 transition-all shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <FollowupsIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Stale Lead Revival Engine</h3>
                  <p className="text-xs text-slate-400">Scans dormant prospects without follow-up and creates revival tasks.</p>
                </div>
              </div>
              <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                Retention
              </span>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-[#07090e]/80 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                Automatic Dormancy Detection
              </div>
              <p>Locates opportunities with no interaction in over 7 days and schedules follow-up calls or emails for tomorrow.</p>
            </div>
          </div>

          <button
            onClick={runRevivalWorkflow}
            disabled={running}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 py-2.5 text-xs font-bold text-indigo-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {running && activeWorkflow === "stale_revival" ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                Analyzing Dormant Leads...
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                Execute Stale Lead Revival
              </>
            )}
          </button>
        </div>
      </div>

      {/* INTERACTIVE NATURAL LANGUAGE CONSOLE */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0d121d] p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Direct Agent Command Console</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Natural Language Tool Execution</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runCustomPrompt();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Find 5 software companies in Nakawa and draft proposals' or 'Summarize my pipeline priorities'..."
              className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={running || !prompt.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-sky-400 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {running && activeWorkflow === "prompt" ? (
              <RotateCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Run
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
          <span className="text-slate-500 font-medium">Quick suggestions:</span>
          <button
            type="button"
            onClick={() => setPrompt("Find 8 dental clinics in Ntinda and score them")}
            className="hover:text-sky-300 underline decoration-slate-700 underline-offset-2 cursor-pointer"
          >
            "Find 8 dental clinics in Ntinda"
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setPrompt("Find 5 hardware shops in Nakawa")}
            className="hover:text-sky-300 underline decoration-slate-700 underline-offset-2 cursor-pointer"
          >
            "Find 5 hardware shops in Nakawa"
          </button>
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* EXECUTION LOG & TRACE */}
      {executionSteps.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Agent Execution Audit Trail
              </h3>
            </div>
            {stats && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-400 font-bold">+{stats.imported} Added</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">{stats.skipped} Deduplicated</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {executionSteps.map((step) => (
              <div
                key={step.step}
                className="flex items-start gap-3 rounded-lg border border-slate-800/60 bg-[#07090e]/70 p-3 text-xs"
              >
                <span className="mt-0.5">
                  {step.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : step.status === "failed" ? (
                    <AlertCircle className="h-4 w-4 text-rose-400" />
                  ) : (
                    <RotateCw className="h-4 w-4 text-sky-400 animate-spin" />
                  )}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{step.action}</span>
                    <span className="text-[10px] font-mono text-slate-500">{step.timestamp}</span>
                  </div>
                  <p className="text-slate-400 mt-0.5">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {executionSummary && (
            <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-xs text-sky-200 font-medium">
              💡 {executionSummary}
            </div>
          )}
        </div>
      )}

      {/* GENERATED OUTREACH DRAFTS (READY FOR 1-CLICK DISPATCH) */}
      {drafts.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EmailsIcon className="h-4 w-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Staged Outreach Drafts ({drafts.length})</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Personalized via Resend sender identity
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {drafts.map((draft, idx) => {
              const isSent = sentDrafts.has(idx);
              const isSending = sendingIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800 bg-[#07090e] p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        {draft.businessName}
                      </h4>
                      <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
                        Score {draft.score}
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-slate-300">
                      Sub: {draft.subject}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-3 bg-[#0d121d] p-2.5 rounded border border-slate-800/80 font-sans">
                      "{draft.preview}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-500">
                      {draft.phone || "No phone listed"}
                    </span>

                    <button
                      onClick={() => sendDraft(draft, idx)}
                      disabled={isSent || isSending}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        isSent
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-sky-500 text-slate-950 hover:bg-sky-400"
                      }`}
                    >
                      {isSent ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Sent
                        </>
                      ) : isSending ? (
                        <>
                          <RotateCw className="h-3 w-3 animate-spin" /> Dispatching...
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3" /> Dispatch Outreach
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
