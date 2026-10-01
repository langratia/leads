import { Link } from "wouter";
import { ExternalLink } from "lucide-react";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-black py-12 text-slate-500 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-xs font-black text-slate-950">
            L
          </span>
          <span className="font-brand text-sm font-bold text-white tracking-tight">
            LANGRATIA LEADS
          </span>
          <span className="text-[10px] text-slate-500">• v2.4 Intelligence Engine</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/" className="hover:text-slate-300 transition-colors">
            Overview
          </Link>
          <Link href="/features" className="hover:text-slate-300 transition-colors">
            Features
          </Link>
          <Link href="/demo" className="hover:text-slate-300 transition-colors">
            Simulator
          </Link>
          <Link href="/pipeline" className="hover:text-slate-300 transition-colors">
            Pipeline
          </Link>
          <Link href="/pricing" className="hover:text-slate-300 transition-colors">
            Pricing
          </Link>
          <Link href="/faq" className="hover:text-slate-300 transition-colors">
            FAQ
          </Link>
          <Link href="/login" className="hover:text-slate-300 transition-colors">
            CRM Portal
          </Link>
          <a
            href="https://langratia.com"
            target="_blank"
            rel="noreferrer"
            className="text-sky-400 hover:underline flex items-center gap-1"
          >
            Langratia Corporate <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>All Edge Systems Operational</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-slate-900 text-center text-[11px] text-slate-600">
        © {new Date().getFullYear()} Langratia. All rights reserved. Google Places is a trademark
        of Google LLC.
      </div>
    </footer>
  );
}
