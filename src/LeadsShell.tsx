import { useEffect, useState, type FC } from "react";
import {
  Bell,
  Command,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { NAV_GROUPS, SECTION_TITLES, type SectionId } from "./data";
import { Kbd } from "./ui";
import CommandPalette from "./components/CommandPalette";
import NotificationsDrawer from "./components/NotificationsDrawer";

// Section views
import LeadsOverview from "./sections/leads/LeadsOverviewPage";
import LeadsFinder from "./sections/leads/LeadsFinderPage";
import LeadsAll from "./sections/leads/LeadsAllPage";
import LeadsPipeline from "./sections/leads/LeadsPipelinePage";
import LeadsFollowups from "./sections/leads/LeadsFollowupsPage";
import Inquiries from "./sections/Inquiries";

const SECTIONS: Record<SectionId, FC<any>> = {
  overview: () => <LeadsOverview />,
  finder: () => <LeadsFinder />,
  pipeline: () => <LeadsPipeline />,
  all: () => <LeadsAll />,
  followups: () => <LeadsFollowups />,
  inquiries: () => <Inquiries />,
};

export default function LeadsShell({
  userEmail,
  onLogout,
}: {
  userEmail?: string;
  onLogout: () => void;
}) {
  const [active, setActive] = useState<SectionId>(() => {
    const q = new URLSearchParams(window.location.search).get("section");
    return (q as SectionId) in SECTIONS ? (q as SectionId) : "overview";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const meta = SECTION_TITLES[active];
  const ActiveView = SECTIONS[active];

  const navigate = (id: string) => {
    const cleanId = (id.replace(/^leads_/, "") as SectionId) in SECTIONS
      ? (id.replace(/^leads_/, "") as SectionId)
      : (id as SectionId) in SECTIONS
      ? (id as SectionId)
      : "overview";

    setActive(cleanId);
    setMobileOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("section", cleanId);
    window.history.replaceState(null, "", url);
  };

  /* keyboard shortcut: Cmd + K / Ctrl + K */
  useEffect(() => {
    const handleCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleCmdK);
    return () => window.removeEventListener("keydown", handleCmdK);
  }, []);

  /* cross-page navigation */
  useEffect(() => {
    const handler = (e: Event) => navigate((e as CustomEvent).detail);
    window.addEventListener("langratia:nav", handler);
    return () => window.removeEventListener("langratia:nav", handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#07090e] text-slate-100 font-sans antialiased">
      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        onNavigate={navigate}
      />

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800/80 bg-[#07090e] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800/80 px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-500 to-sky-300 text-xs font-black text-slate-950 shadow-md shadow-sky-500/20">
              L
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight text-white">LANGRATIA</span>
              <span className="text-[10px] font-semibold text-sky-400">Leads CRM</span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/60 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className="space-y-1">
              {group.label && (
                <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isSelected = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-sky-500/10 text-sky-300 font-bold border border-sky-500/20"
                        : "text-slate-400 hover:bg-[#121724] hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-sky-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer: User & Website link */}
        <div className="border-t border-slate-800/80 p-3 space-y-2">
          <a
            href="https://langratia.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-[#121724] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              Main Website
            </span>
            <span className="text-[10px] text-slate-400">langratia.com</span>
          </a>
          <div className="flex items-center justify-between rounded-lg bg-[#0e1320] px-3 py-2 border border-slate-800/80">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-200">{userEmail || "sales@langratia.com"}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">Online</p>
            </div>
            <button
              onClick={onLogout}
              title="Sign out"
              className="cursor-pointer text-slate-400 hover:text-rose-400 transition-colors p-1"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#07090e]/95 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/60 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">{meta?.title || "Leads CRM"}</h1>
              <p className="hidden text-xs text-slate-400 sm:block">{meta?.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCmdPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0d121d] px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <Command className="h-3.5 w-3.5" />
              <span>Search or jump to…</span>
              <Kbd>⌘K</Kbd>
            </button>

            <button
              onClick={() => setNotifOpen(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-[#0d121d] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-[#07090e]" />
            </button>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <ActiveView />
        </main>
      </div>

      <NotificationsDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} onNavigate={navigate} />
    </div>
  );
}
