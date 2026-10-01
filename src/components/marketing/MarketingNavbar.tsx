import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ArrowUpRight, Menu, X, Rocket } from "lucide-react";

interface MarketingNavbarProps {
  session?: any;
  onLogout?: () => void;
}

export default function MarketingNavbar({ session, onLogout }: MarketingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { label: "Overview", href: "/" },
    { label: "Features", href: "/features" },
    { label: "Live Demo", href: "/demo" },
    { label: "Pipeline", href: "/pipeline" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#07090e]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-sky-300 text-sm font-black text-slate-950 shadow-md shadow-sky-500/25 transition-transform group-hover:scale-105">
            L
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-brand text-base font-extrabold tracking-tight text-white">
                LANGRATIA
              </span>
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                Leads
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">
              B2B Intelligence &amp; Sales CRM
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive
                    ? "text-sky-400 font-bold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-400 rounded-full shadow-[0_0_8px_#38bdf8]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Header Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://langratia.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Langratia.com <ArrowUpRight className="h-3.5 w-3.5" />
          </a>

          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all cursor-pointer"
              >
                <Rocket className="h-3.5 w-3.5" /> Open CRM
              </Link>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg border border-slate-700/80 bg-slate-900/60 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-sky-500/20 hover:bg-sky-400 transition-all cursor-pointer"
              >
                Launch App <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0a0d16] px-4 py-6 space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1 ${
                  location === link.href
                    ? "text-sky-400 font-bold"
                    : "text-slate-300 hover:text-sky-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href={session ? "/app" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-lg bg-sky-500 py-2.5 text-xs font-bold text-slate-950"
            >
              {session ? "Open CRM Platform" : "Launch Leads CRM"}
            </Link>
            <a
              href="https://langratia.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center text-xs text-slate-400 py-1.5"
            >
              Visit Langratia.com ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
