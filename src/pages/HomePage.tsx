import { Link } from "wouter";
import {
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Database,
  Search,
  Zap,
  ArrowRight,
  Kanban,
  CheckCircle2,
  Rocket,
} from "lucide-react";
import MarketingLayout from "../components/marketing/MarketingLayout";

interface PageProps {
  session?: any;
  onLogout?: () => void;
}

export default function HomePage({ session, onLogout }: PageProps) {
  return (
    <MarketingLayout session={session} onLogout={onLogout}>
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Tag Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-400 shadow-sm shadow-sky-500/10 backdrop-blur-md mb-8">
            <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
            <span>Langratia Intelligence OS • Built for High-Velocity B2B Outbound</span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="mx-auto max-w-5xl font-brand text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
            Turn Local Discovery Into{" "}
            <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Closed Enterprise Deals.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            The high-performance prospecting and deal-execution CRM. Harness Google Places
            geospatial data, automated multi-source enrichment, and deal-velocity kanban to
            source, verify, and close high-ticket clients 10x faster.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session ? "/app" : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-sky-500/25 hover:from-sky-400 hover:to-sky-300 transition-all cursor-pointer"
            >
              <Zap className="h-4 w-4 fill-slate-950" />
              {session ? "Go to CRM Dashboard" : "Launch Leads CRM"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all"
            >
              <Search className="h-4 w-4 text-sky-400" />
              Try Live Demo
            </Link>
          </div>

          {/* Trust and Performance Metrics */}
          <div className="mt-16 border-y border-slate-800/80 bg-slate-950/40 py-6 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="flex flex-col items-center">
                <span className="font-brand text-2xl sm:text-3xl font-extrabold text-white">
                  30,000+
                </span>
                <span className="mt-1 text-xs font-medium text-slate-400">
                  Verified B2B Leads Sourced
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-brand text-2xl sm:text-3xl font-extrabold text-sky-400">
                  99.2%
                </span>
                <span className="mt-1 text-xs font-medium text-slate-400">
                  Deliverable Contact Points
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-brand text-2xl sm:text-3xl font-extrabold text-indigo-400">
                  3.4x
                </span>
                <span className="mt-1 text-xs font-medium text-slate-400">
                  Faster Deal Cycle Velocity
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-brand text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  &lt; 500ms
                </span>
                <span className="mt-1 text-xs font-medium text-slate-400">
                  Global Edge Query Speed
                </span>
              </div>
            </div>
          </div>

          {/* HERO PRODUCT PREVIEW SHOWCASE */}
          <div className="mt-14 relative mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-[#0c101c]/90 p-3 sm:p-5 shadow-2xl shadow-sky-500/10 backdrop-blur-xl">
            {/* Window Controls */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Database className="h-3 w-3 text-sky-400" />
                  leads.langratia.com • Active Workspace
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Google Places API Connected
                </span>
              </div>
            </div>

            {/* Inside Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-left">
              {/* Left: Discovery Filter & Prospect Card */}
              <div className="lg:col-span-7 rounded-xl border border-slate-800/80 bg-[#080b14] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-sky-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Places Lead Finder
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Query: <code className="text-sky-300">Software &amp; AI in London</code>
                  </span>
                </div>

                {/* Mock lead item */}
                <div className="rounded-lg border border-sky-500/30 bg-sky-950/20 p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          Vortex Intelligence Systems
                        </h4>
                        <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        Old Street, London EC1V • 4.9★ (84 Google reviews)
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                      $48,000 Deal
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="h-3 w-3 text-sky-400" /> contact@vortexintel.co.uk
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Phone className="h-3 w-3 text-sky-400" /> +44 20 7946 0912
                    </div>
                  </div>
                </div>

                {/* Second mock lead */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3.5 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Nexus Cloud Architecture</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-500" /> Canary Wharf, London • 4.8★
                        (52 reviews)
                      </p>
                    </div>
                    <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-bold text-sky-400 border border-sky-500/20">
                      $32,500 Deal
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Kanban Pipeline Glance */}
              <div className="lg:col-span-5 rounded-xl border border-slate-800/80 bg-[#080b14] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <Kanban className="h-3.5 w-3.5 text-indigo-400" /> Deal Flow Pipeline
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400">$384,500 Active</span>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Prospects Sourced</div>
                        <div className="text-[10px] text-slate-500">28 new leads today</div>
                      </div>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                        28
                      </span>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Proposal Sent</div>
                        <div className="text-[10px] text-slate-500">8 pending review</div>
                      </div>
                      <span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs font-bold text-sky-300">
                        $142,000
                      </span>
                    </div>

                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-emerald-300">Closed Won 🎉</div>
                        <div className="text-[10px] text-emerald-400/80">3 enterprise contracts</div>
                      </div>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
                        $175,000
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Automated Follow-ups: Active</span>
                  <span className="text-sky-400 font-semibold">100% In-Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK WORKFLOW PREVIEW */}
      <section className="py-20 bg-slate-950/40 border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
              The 3-Step Growth Engine
            </span>
            <h2 className="mt-2 font-brand text-3xl sm:text-4xl font-extrabold text-white">
              From Cold Local Discovery to Revenue
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-800 bg-[#080c16] p-7">
              <span className="text-4xl font-black text-slate-800 select-none">01</span>
              <h3 className="mt-2 font-brand text-lg font-bold text-white">
                Pinpoint High-Intent Targets
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Query target niches and territories via Google Places API to collect verified
                merchants and enterprises.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-sky-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Filter by reviews &amp; ratings
              </div>
            </div>

            <div className="rounded-2xl border border-sky-500/30 bg-[#080c16] p-7 shadow-lg shadow-sky-500/5">
              <span className="text-4xl font-black text-sky-500/40 select-none">02</span>
              <h3 className="mt-2 font-brand text-lg font-bold text-white">
                Enrich &amp; Qualify
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Extract corporate emails, phone numbers, and websites. Assign deal sizes and push
                records into pipeline stages.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-sky-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> 1-Click addition to CRM
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#080c16] p-7">
              <span className="text-4xl font-black text-slate-800 select-none">03</span>
              <h3 className="mt-2 font-brand text-lg font-bold text-white">
                Engage &amp; Close Deals
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Send targeted outreach messages, schedule follow-up cadences, and celebrate closed
                revenue.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Track stage conversion velocity
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/pipeline"
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300"
            >
              Explore Full Pipeline Methodology <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-20 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-950/40 via-slate-950 to-black p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />

            <h2 className="font-brand text-3xl sm:text-5xl font-black text-white tracking-tight">
              Accelerate Your B2B Outbound Today.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-300">
              Stop wasting hours on manual research. Tap into verified Google Places intelligence
              and close higher-value contracts with Langratia Leads.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={session ? "/app" : "/login"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-sky-500/25 hover:bg-sky-400 transition-all cursor-pointer"
              >
                <Rocket className="h-4 w-4" />
                {session ? "Enter CRM OS" : "Launch Leads CRM"}
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-all"
              >
                View Plans &amp; Pricing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
