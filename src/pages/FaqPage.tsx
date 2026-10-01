import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, HelpCircle, ArrowRight, MessageSquare } from "lucide-react";
import MarketingLayout from "../components/marketing/MarketingLayout";

interface PageProps {
  session?: any;
  onLogout?: () => void;
}

export default function FaqPage({ session, onLogout }: PageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Where does Langratia Leads source its prospect data?",
      a: "Our discovery engine queries the official Google Places API (New) for verified, real-world businesses, local merchant registrations, customer review counts, and verified ratings. We then enrich each result with web domain audits, corporate email discovery, executive contact points, and phone numbers.",
    },
    {
      q: "Can I use my own Google Places API key or Supabase database?",
      a: "Yes. Langratia Leads is architected for total data sovereignty. You can bring your own Google Places API key, configure custom rate limits, and use your own self-hosted or managed Supabase PostgreSQL instance with full Row-Level Security (RLS).",
    },
    {
      q: "How does the Kanban Deal Pipeline differ from generic CRMs?",
      a: "Unlike clunky enterprise CRMs that take months to set up, Langratia Leads is purpose-built for high-velocity B2B prospecting. Moving a lead from 'Discovered' to 'Won' is frictionless, complete with automated follow-up cadences, deal value tracking, and unified email threads in one window.",
    },
    {
      q: "Can I export my leads and customer lists to CSV or JSON?",
      a: "Absolutely. With a single click, you can export all prospects, filtered subsets, pipeline stages, or search queries into clean, standard CSV or JSON files ready for Excel, Google Sheets, HubSpot, or Salesforce import.",
    },
    {
      q: "How does email threading and automated communication work?",
      a: "Langratia Leads integrates bi-directional email messaging directly on the lead profile. You can send personalized outreach messages, track status, and view replies chronologically without switching tabs or context.",
    },
    {
      q: "Is Langratia Leads available for external teams and agencies?",
      a: "Yes. While initially built as Langratia's proprietary internal sales engine, the platform is now open for select agency partners, high-growth B2B startups, and outbound sales teams looking for a lightning-fast prospecting workspace.",
    },
    {
      q: "What security measures protect our pipeline data?",
      a: "All records are isolated using PostgreSQL Row-Level Security (RLS) on Supabase. Edge endpoints communicate over TLS 1.3 with Cloudflare edge encryption, and API keys are stored securely using Cloudflare Secrets.",
    },
  ];

  return (
    <MarketingLayout session={session} onLogout={onLogout}>
      {/* PAGE HEADER */}
      <section className="pt-20 pb-14 text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-400 mb-6">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Knowledge &amp; Support</span>
        </div>
        <h1 className="font-brand text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Frequently Asked{" "}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
            Questions.
          </span>
        </h1>
        <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Everything you need to know about the platform, data sources, security, and setup.
        </p>
      </section>

      {/* ACCORDION */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-[#090d18] transition-all hover:border-slate-700 shadow-md"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left text-sm sm:text-base font-bold text-white focus:outline-none cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                    openFaq === idx ? "rotate-180 text-sky-400" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}

          {/* HELP CALLOUT CARD */}
          <div className="mt-12 rounded-2xl border border-slate-800 bg-black/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Have a custom question?</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reach out to the Langratia engineering and enterprise support team.
                </p>
              </div>
            </div>

            <a
              href="https://langratia.com/contact"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              Contact Support <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
