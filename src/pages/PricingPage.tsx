import { useState } from "react";
import { Link } from "wouter";
import { Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import MarketingLayout from "../components/marketing/MarketingLayout";

interface PageProps {
  session?: any;
  onLogout?: () => void;
}

export default function PricingPage({ session, onLogout }: PageProps) {
  const [annualBilling, setAnnualBilling] = useState(true);

  return (
    <MarketingLayout session={session} onLogout={onLogout}>
      {/* PAGE HEADER */}
      <section className="pt-20 pb-14 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-400 mb-6">
          <Zap className="h-3.5 w-3.5" />
          <span>Transparent Pricing &amp; Access</span>
        </div>
        <h1 className="font-brand text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Simple Plans.{" "}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
            Uncapped Outbound ROI.
          </span>
        </h1>
        <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          High-velocity prospect discovery without punishing per-seat taxes. Choose the tier that
          matches your pipeline volume.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 p-1.5 backdrop-blur-md">
          <button
            onClick={() => setAnnualBilling(false)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              !annualBilling
                ? "bg-sky-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnualBilling(true)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              annualBilling
                ? "bg-sky-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Yearly
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* PRICING TIERS */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Tier 1: Starter */}
            <div className="rounded-3xl border border-slate-800 bg-[#090d18] p-8 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="font-brand text-xl font-bold text-white">Starter</h3>
                <p className="mt-1 text-xs text-slate-400">
                  For solo dealmakers and founders testing outbound.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-brand text-4xl font-extrabold text-white">
                    ${annualBilling ? "39" : "49"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="mt-8 space-y-3.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> 500 Google Places Searches / mo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> 250 Contact Enrichments
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Kanban Deal Pipeline Board
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> CSV &amp; JSON Data Export
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Single User Workspace
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-center text-xs font-bold text-white hover:bg-slate-700 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Tier 2: Growth (Popular) */}
            <div className="rounded-3xl border-2 border-sky-500 bg-[#0c1224] p-8 flex flex-col justify-between relative shadow-2xl shadow-sky-500/15">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-950">
                Most Popular
              </div>
              <div>
                <h3 className="font-brand text-xl font-bold text-white">Growth Outbound</h3>
                <p className="mt-1 text-xs text-slate-400">
                  For active sales teams closing weekly high-ticket deals.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-brand text-4xl font-extrabold text-white">
                    ${annualBilling ? "99" : "129"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="mt-8 space-y-3.5 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> 2,500 Places Searches / mo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Unlimited Enriched Contacts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Bi-directional Email Threads
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Automated Follow-up Cadences
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Multi-Seat Team Collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Priority Support &amp; Webhooks
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                className="mt-8 w-full rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 py-3 text-center text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-sky-300 transition-all cursor-pointer"
              >
                Start Outbound Growth
              </Link>
            </div>

            {/* Tier 3: Enterprise */}
            <div className="rounded-3xl border border-slate-800 bg-[#090d18] p-8 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="font-brand text-xl font-bold text-white">Enterprise</h3>
                <p className="mt-1 text-xs text-slate-400">
                  For large sales organizations, brokers, and agencies.
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-brand text-4xl font-extrabold text-white">
                    ${annualBilling ? "279" : "349"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="mt-8 space-y-3.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Unlimited Places Searches
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Dedicated Supabase Database
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Custom Scrapers &amp; Webhooks
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Dedicated Account Manager
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-400 shrink-0" /> Custom SLA &amp; Security Review
                  </li>
                </ul>
              </div>

              <a
                href="https://langratia.com/contact"
                target="_blank"
                rel="noreferrer"
                className="mt-8 w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-center text-xs font-bold text-white hover:bg-slate-700 transition-colors"
              >
                Talk to Enterprise Sales
              </a>
            </div>
          </div>

          {/* COMPARISON TABLE */}
          <div className="mt-20">
            <h2 className="text-center font-brand text-2xl sm:text-3xl font-bold text-white mb-8">
              Compare Platform Approaches
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#090d18] shadow-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    <th className="p-4 font-bold text-slate-300">Feature &amp; Capability</th>
                    <th className="p-4 font-extrabold text-sky-400 bg-sky-500/10 border-x border-sky-500/20 text-center">
                      Langratia Leads
                    </th>
                    <th className="p-4 font-semibold text-slate-400 text-center">
                      Legacy Enterprise CRMs
                    </th>
                    <th className="p-4 font-semibold text-slate-400 text-center">
                      Manual Scraping &amp; Sheets
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  <tr>
                    <td className="p-4 font-medium">Google Places Real-Time API Search</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-slate-500">Requires Expensive Add-ons</td>
                    <td className="p-4 text-center text-slate-500">Manual Copy-Paste</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Automated Contact &amp; Email Enrichment</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-slate-500">$99+/seat add-on</td>
                    <td className="p-4 text-center text-slate-500">Hours of Manual Research</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">No Per-Seat Pricing Penalty</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-rose-400">Strict Per-User Tax</td>
                    <td className="p-4 text-center text-slate-400">Free but Fragmented</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Drag-and-Drop Kanban Deal Velocity</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-slate-300">Included (Complex Setup)</td>
                    <td className="p-4 text-center text-slate-500">Clunky Formulas</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">100% Data Sovereignty (Supabase RLS)</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-slate-500">Walled Garden</td>
                    <td className="p-4 text-center text-slate-500">Unencrypted Spreadsheets</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Instant 1-Click CSV &amp; JSON Export</td>
                    <td className="p-4 text-center font-bold text-sky-300 bg-sky-500/5 border-x border-sky-500/20">
                      <Check className="h-4 w-4 text-sky-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center text-slate-400">Restricted Rate Limits</td>
                    <td className="p-4 text-center text-slate-300">Native</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Internal team note */}
          <div className="mt-12 text-center text-xs text-slate-400">
            ⚡ Internal Langratia staff? Access the{" "}
            <Link href="/login" className="text-sky-400 underline font-semibold">
              Sales Portal Login
            </Link>{" "}
            for direct authenticated access.
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
