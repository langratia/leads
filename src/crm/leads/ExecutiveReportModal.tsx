"use client";

import { useState } from "react";
import {
  X,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Printer,
  TrendingUp,
  Handshake,
  Users,
  ShieldAlert,
  Building,
} from "lucide-react";
import { formatValue } from "@/core/format";
import { exportToCSV } from "@/core/export-utils";
import type { Lead, LeadFollowup } from "@/crm/leads";

export default function ExecutiveReportModal({
  leads,
  followups,
  isOpen,
  onClose,
}: {
  leads: Lead[];
  followups: LeadFollowup[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const today = new Date().toISOString().split("T")[0];
  const totalLeads = leads.length;
  const openDeals = leads.filter((l) => l.status !== "Won" && l.status !== "Lost");
  const wonDeals = leads.filter((l) => l.status === "Won");
  const lostDeals = leads.filter((l) => l.status === "Lost");

  const pipelineValue = openDeals.reduce((a, l) => a + (l.estimated_value || 0), 0);
  const wonValue = wonDeals.reduce((a, l) => a + (l.estimated_value || 0), 0);
  const winRate = totalLeads ? Math.round((wonDeals.length / totalLeads) * 100) : 0;

  const overdueFollowups = followups.filter((f) => !f.completed && f.followup_date < today);

  // Top 5 highest value open opportunities
  const topDeals = [...openDeals]
    .sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0))
    .slice(0, 5);

  // Channel Acquisition Distribution
  const channelCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const src = l.lead_source || "Direct / Other";
    channelCounts[src] = (channelCounts[src] || 0) + 1;
  });

  // Generate Executive Markdown Memo
  const generateMarkdownMemo = () => {
    const lines = [
      `# LANGRATIA EXECUTIVE SALES & PIPELINE REPORT`,
      `**Date:** ${new Date().toLocaleDateString()} | **Market:** East Africa / Uganda`,
      `**Prepared For:** Executive Board & Commercial Leadership`,
      ``,
      `---`,
      `## 1. Executive Pipeline Summary`,
      `- **Total Accounts Managed:** ${totalLeads}`,
      `- **Active Pipeline Volume:** ${openDeals.length} active opportunities`,
      `- **Active Pipeline Value:** $${pipelineValue.toLocaleString()} USD`,
      `- **Closed-Won Revenue:** $${wonValue.toLocaleString()} USD (${wonDeals.length} deals won)`,
      `- **Overall Win Rate:** ${winRate}% conversion`,
      `- **Overdue Customer Follow-ups:** ${overdueFollowups.length} commitments requiring recovery`,
      ``,
      `---`,
      `## 2. Top 5 Strategic Deal Opportunities`,
      ...topDeals.map((d, i) =>
        `${i + 1}. **${d.business_name}** | Sector: ${d.category || "Enterprise"} | Est. Value: $${(d.estimated_value || 0).toLocaleString()} | Stage: ${d.status} | Score: ${d.lead_score || 0}/100`
      ),
      ``,
      `---`,
      `## 3. Lead Acquisition Channel Breakdown`,
      ...Object.entries(channelCounts).map(
        ([src, count]) => `- **${src}:** ${count} leads (${Math.round((count / (totalLeads || 1)) * 100)}%)`
      ),
      ``,
      `---`,
      `## 4. Operational Directives for Sales Team`,
      overdueFollowups.length > 0
        ? `1. Immediate focus: Recover ${overdueFollowups.length} overdue follow-up tasks to safeguard high-intent prospects.`
        : `1. Follow-up cadence is fully compliant with zero overdue tasks.`,
      `2. Focus high-touch WhatsApp and scoping demos on top accounts in Healthcare, Education, and Commercial Wholesale.`,
      `3. Accelerate deals currently in 'Meeting Scheduled' and 'Proposal Sent' towards formal contract close.`,
      ``,
      `*Generated autonomously by Langratia Leads 2.0 Sales Engine.*`,
    ];

    return lines.join("\n");
  };

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(generateMarkdownMemo());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMemo = () => {
    const memo = generateMarkdownMemo();
    const blob = new Blob([memo], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `LANGRATIA_Executive_Sales_Report_${today}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    exportToCSV(
      leads.map((l) => ({
        business_name: l.business_name,
        contact_person: l.contact_person,
        category: l.category,
        status: l.status,
        priority: l.priority,
        lead_score: l.lead_score,
        estimated_value: l.estimated_value,
        phone: l.phone,
        email: l.email,
        address: l.address,
        lead_source: l.lead_source,
        created_at: l.created_at,
      })),
      "langratia_pipeline_export"
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-sky-500/30 bg-[#07090e] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-sky-950/40 via-[#0d121d] to-[#07090e] p-5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Executive Sales & Pipeline Report
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                  {today}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprehensive revenue intelligence & commercial executive memo for leadership
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

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#090d16]">
          {/* STATS TILES */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Active Pipeline
              </div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {formatValue(pipelineValue)}
              </div>
              <div className="text-[11px] text-slate-400">{openDeals.length} open deals</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Won Revenue
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {formatValue(wonValue)}
              </div>
              <div className="text-[11px] text-emerald-400">{wonDeals.length} deals closed</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Win Rate
              </div>
              <div className="text-lg font-bold text-sky-400 font-mono">{winRate}%</div>
              <div className="text-[11px] text-slate-400">of all accounts</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Pipeline Risk
              </div>
              <div className={`text-lg font-bold font-mono ${overdueFollowups.length > 0 ? "text-rose-400" : "text-slate-400"}`}>
                {overdueFollowups.length}
              </div>
              <div className="text-[11px] text-slate-400">overdue follow-ups</div>
            </div>
          </div>

          {/* TOP 5 DEALS */}
          <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Top 5 High-Value Strategic Opportunities
              </span>
              <span className="text-[11px] text-slate-500">Ranked by Deal Value</span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {topDeals.map((deal, idx) => (
                <div key={deal.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-800 text-[10px] font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{deal.business_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {deal.category || "General"} · Stage: {deal.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                      Score {deal.lead_score || 0}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatValue(deal.estimated_value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHANNEL ACQUISITION BREAKDOWN */}
          <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 space-y-3 shadow-md">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block border-b border-slate-800/80 pb-2">
              Lead Generation Channel Attribution
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {Object.entries(channelCounts).map(([channel, count]) => (
                <div key={channel} className="rounded-lg border border-slate-800/80 bg-[#0b0f19] p-3 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 truncate block">
                    {channel}
                  </span>
                  <div className="text-base font-bold text-white font-mono">{count}</div>
                  <div className="text-[10px] text-slate-500">
                    {Math.round((count / (totalLeads || 1)) * 100)}% of pipeline
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-800/80 bg-[#090d16] px-5 py-3.5 shrink-0 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0d121d] px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0d121d] px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-slate-400" /> Print
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMemo}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied to Clipboard" : "Copy Executive Memo"}
            </button>

            <button
              type="button"
              onClick={handleDownloadMemo}
              className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors cursor-pointer shadow-md shadow-sky-500/20"
            >
              <Download className="h-3.5 w-3.5" /> Download Report (.md)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
