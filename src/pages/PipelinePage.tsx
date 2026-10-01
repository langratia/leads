import { Link } from "wouter";
import {
  Kanban,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Mail,
  UserCheck,
  Shield,
  Layers,
} from "lucide-react";
import MarketingLayout from "../components/marketing/MarketingLayout";

interface PageProps {
  session?: any;
  onLogout?: () => void;
}

export default function PipelinePage({ session, onLogout }: PageProps) {
  const stages = [
    {
      step: "01",
      name: "Cold Discovery",
      badge: "Inbound & Outbound",
      color: "text-slate-300",
      borderColor: "border-slate-800",
      description:
        "Sourced through Google Places queries or inbound customer inquiries from the Langratia website.",
      metrics: "Average time in stage: < 1 hour",
    },
    {
      step: "02",
      name: "Contacted",
      badge: "Outreach Triggered",
      color: "text-sky-400",
      borderColor: "border-sky-500/30",
      description:
        "Initial personalized outreach sent via integrated email or direct executive touchpoint.",
      metrics: "Average open rate: 68%",
    },
    {
      step: "03",
      name: "Qualified Lead",
      badge: "Intent Confirmed",
      color: "text-indigo-400",
      borderColor: "border-indigo-500/30",
      description:
        "Prospect expressed active requirement, budget alignment, and decision-maker availability.",
      metrics: "Deal probability: ~40%",
    },
    {
      step: "04",
      name: "Proposal Sent",
      badge: "Commercial Offer",
      color: "text-amber-400",
      borderColor: "border-amber-500/30",
      description:
        "Formal statement of work, pricing schedule, or software licensing proposal delivered.",
      metrics: "Deal probability: ~70%",
    },
    {
      step: "05",
      name: "Negotiation",
      badge: "Contract Review",
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      description:
        "Legal, SLA, or technical fine-tuning with executive stakeholders.",
      metrics: "Deal probability: ~85%",
    },
    {
      step: "06",
      name: "Closed Won 🎉",
      badge: "Revenue Booked",
      color: "text-emerald-400",
      borderColor: "border-emerald-500/40",
      description:
        "Signed agreement and initial retainer/license invoice dispatched. Automated handoff to delivery.",
      metrics: "100% conversion",
    },
  ];

  return (
    <MarketingLayout session={session} onLogout={onLogout}>
      {/* PAGE HEADER */}
      <section className="pt-20 pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-400 mb-6">
          <Kanban className="h-3.5 w-3.5" />
          <span>Deal Flow Architecture</span>
        </div>
        <h1 className="font-brand text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          The High-Velocity{" "}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
            Deal Pipeline.
          </span>
        </h1>
        <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Manage opportunities with zero clutter. A streamlined Kanban progression that gives your sales
          team complete clarity over every prospective client from first touch to closed contract.
        </p>
      </section>

      {/* PIPELINE STAGES GRID */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stages.map((stage) => (
              <div
                key={stage.step}
                className={`rounded-2xl border ${stage.borderColor} bg-[#090d18] p-7 flex flex-col justify-between transition-all hover:bg-[#0c1224] shadow-lg`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-black text-slate-700 select-none">
                      {stage.step}
                    </span>
                    <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                      {stage.badge}
                    </span>
                  </div>

                  <h3 className={`font-brand text-xl font-bold ${stage.color}`}>{stage.name}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {stage.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                  <span>{stage.metrics}</span>
                  <CheckCircle2 className={`h-4 w-4 ${stage.color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* DEAL VELOCITY PRINCIPLES */}
          <div className="mt-16 rounded-3xl border border-slate-800 bg-[#090d18] p-8 sm:p-12 shadow-2xl">
            <div className="max-w-3xl mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Outbound Principles
              </span>
              <h2 className="mt-1 font-brand text-2xl sm:text-3xl font-bold text-white">
                Engineered to Eliminate Bottlenecks
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-800/80 bg-black/60 p-5 space-y-2">
                <div className="flex items-center gap-2 text-sky-400">
                  <Clock className="h-5 w-5" />
                  <h4 className="text-sm font-bold text-white">Time-to-Touch SLA</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Automated queues ensure every newly discovered prospect is engaged within 4 hours.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-black/60 p-5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Mail className="h-5 w-5" />
                  <h4 className="text-sm font-bold text-white">Contextual Sync</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Email exchanges, phone notes, and quotes stay pinned to the prospect’s profile.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-black/60 p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                  <h4 className="text-sm font-bold text-white">Revenue Visibility</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Real-time pipeline aggregates show exact weighted and unweighted revenue projections.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Test the Kanban pipeline live in the workspace.
              </div>
              <Link
                href={session ? "/app" : "/login"}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-sky-400 transition-colors cursor-pointer"
              >
                Launch Workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
