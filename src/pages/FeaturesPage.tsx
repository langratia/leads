import { Link } from "wouter";
import {
  MapPin,
  Sparkles,
  Kanban,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";
import MarketingLayout from "../components/marketing/MarketingLayout";

interface PageProps {
  session?: any;
  onLogout?: () => void;
}

export default function FeaturesPage({ session, onLogout }: PageProps) {
  const features = [
    {
      icon: MapPin,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/30",
      title: "Precision Google Places Discovery",
      badge: "Real-time Geospatial API",
      description:
        "Connect directly to the official Google Places API (New) to discover commercial enterprises in any global city or coordinates radius.",
      bullets: [
        "Search by niche keywords, registered category codes, or custom queries",
        "Filter by minimum Google customer review score (e.g. 4.5★+)",
        "Extract verified physical addresses, merchant coordinates, and operating hours",
        "Sub-second response caching on Cloudflare Edge proxy",
      ],
    },
    {
      icon: Sparkles,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/30",
      title: "Automated Contact Enrichment",
      badge: "Zero Manual Research",
      description:
        "Eliminate tedious copy-pasting. The automated enrichment pipeline checks domains, verifies emails, and compiles actionable contact points.",
      bullets: [
        "Automated corporate email detection and active MX validation",
        "Direct executive phone numbers and WhatsApp reachability",
        "Primary domain audit and social media profiles extraction",
        "Lead quality scoring based on rating volume and completeness",
      ],
    },
    {
      icon: Kanban,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      title: "Visual Kanban Deal Pipeline",
      badge: "High-Velocity Deal Flow",
      description:
        "A deal-stage management workspace built specifically for high-velocity B2B outbound teams closing monthly contracts.",
      bullets: [
        "Drag-and-drop progression across 6 stages (Prospect to Won)",
        "Real-time pipeline total values and stage conversion summaries",
        "One-click stage reassignment and instant deal value adjustments",
        "Tagging by deal priority (Hot, Warm, Cold) and client niche",
      ],
    },
    {
      icon: Mail,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/30",
      title: "Bi-Directional Email Threads",
      badge: "Unified Communication Hub",
      description:
        "Send personalized cold outreach and track incoming responses in a real-time conversational thread without leaving the lead profile.",
      bullets: [
        "Direct integration with Resend and custom SMTP mail servers",
        "Chronological conversation thread on every lead record",
        "Automated status transitions when prospects respond",
        "Quick reply templates for high-conversion follow-ups",
      ],
    },
    {
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      title: "Zero-Slip Follow-Up Cadence",
      badge: "Smart Reminder Engine",
      description:
        "Over 60% of closed contracts require 4 or more touchpoints. Never let a promising prospective client slip through the cracks.",
      bullets: [
        "Automated alerts for pending follow-ups and overdue responses",
        "One-click snooze for 2 days, 1 week, or custom date/time",
        "Interactive activity timeline logging every touchpoint",
        "Dedicated Follow-Ups queue for daily sales execution",
      ],
    },
    {
      icon: ShieldCheck,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      title: "Total Data Sovereignty & Exports",
      badge: "Zero Vendor Lock-In",
      description:
        "Your data is 100% yours. Powered by Supabase PostgreSQL with strict Row-Level Security, instant exportability, and no per-seat taxes.",
      bullets: [
        "Instant one-click CSV and JSON exports for any view or filter",
        "Full Supabase Row-Level Security (RLS) keeping records private",
        "Option to bring your own database or self-host tables",
        "Comprehensive API and webhook support for custom workflows",
      ],
    },
  ];

  return (
    <MarketingLayout session={session} onLogout={onLogout}>
      {/* PAGE HEADER */}
      <section className="pt-20 pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-400 mb-6">
          <Zap className="h-3.5 w-3.5" />
          <span>Platform Capabilities &amp; Architecture</span>
        </div>
        <h1 className="font-brand text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Engineered for Closing{" "}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
            High-Ticket Deals.
          </span>
        </h1>
        <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Every tool, scraper, and feature in Langratia Leads is designed to eliminate sales friction
          and maximize your deal conversion velocity.
        </p>
      </section>

      {/* DETAILED FEATURE CARDS */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            const isReversed = idx % 2 === 1;

            return (
              <div
                key={feat.title}
                className="rounded-3xl border border-slate-800 bg-[#090d18] p-8 sm:p-12 transition-all hover:border-slate-700 shadow-xl"
              >
                <div
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                    isReversed ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feat.bgColor} ${feat.color} border ${feat.borderColor}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-300">
                        {feat.badge}
                      </span>
                    </div>

                    <h2 className="font-brand text-2xl sm:text-3xl font-bold text-white">
                      {feat.title}
                    </h2>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                      {feat.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      {feat.bullets.map((bullet, bi) => (
                        <div key={bi} className="flex items-start gap-2 text-xs text-slate-400">
                          <CheckCircle2 className={`h-4 w-4 ${feat.color} shrink-0 mt-0.5`} />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 rounded-2xl border border-slate-800/80 bg-black/60 p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800/80">
                      <span className="font-semibold text-white">System Specification</span>
                      <span className={feat.color}>● Active Feature</span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-500">Latency / Response</span>
                        <span className="font-mono text-white">&lt; 250ms</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-500">Infrastructure</span>
                        <span>Cloudflare Edge + Supabase</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/40">
                        <span className="text-slate-500">Data Guarantee</span>
                        <span>Row-Level Security (RLS)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Integration</span>
                        <span>Instant 1-Click Sync</span>
                      </div>
                    </div>

                    <Link
                      href={session ? "/app" : "/login"}
                      className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-700 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                    >
                      Try in Workspace <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-16 text-center border-t border-slate-800/80 bg-slate-950/40">
        <h3 className="font-brand text-2xl sm:text-3xl font-bold text-white">
          Experience the Discovery Engine in Action
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Run a simulated prospecting scan in under 30 seconds.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-sky-400 shadow-lg shadow-sky-500/20"
          >
            Launch Interactive Demo <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-800"
          >
            Compare Plans
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
