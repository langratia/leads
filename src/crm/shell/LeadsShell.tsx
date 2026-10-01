import { config } from "@/config";
import { useEffect, useMemo, useState, type FC } from "react";
import {
  Bell,
  Command,
  ExternalLink,
  Globe,
  LogOut,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { NAV_GROUPS, SECTION_TITLES, type NavGroup, type SectionId } from "@/core/data";
import { LeadsDataProvider, useLeadsData } from "@/crm/leads/leads-context";
import { btnPrimary, Kbd } from "@/core/ui";
import { ToastProvider } from "@/core/toast";
import { todayIso } from "@/core/format";
import CommandPalette from "./CommandPalette";
import NotificationsDrawer from "./NotificationsDrawer";

// Section views
import LeadsOverview from "../leads/LeadsOverviewPage";
import LeadsFinder from "../leads/LeadsFinderPage";
import LeadsAll from "../leads/LeadsAllPage";
import LeadsPipeline from "../leads/LeadsPipelinePage";
import LeadsFollowups from "../leads/LeadsFollowupsPage";
import Inquiries from "../inquiries/Inquiries";

const SECTIONS: Record<SectionId, FC<any>> = {
  overview: () => <LeadsOverview />,
  finder: () => <LeadsFinder />,
  pipeline: () => <LeadsPipeline />,
  all: () => <LeadsAll />,
  followups: () => <LeadsFollowups />,
  inquiries: () => <Inquiries />,
};

export default function LeadsShell(props: { userEmail?: string; onLogout: () => void }) {
  return (
    /* ToastProvider is inside LeadsDataProvider so a toast can describe a lead
       the dataset has just gained, without the two providers depending on
       each other's ordering. */
    <LeadsDataProvider>
      <ToastProvider>
        <Shell {...props} />
      </ToastProvider>
    </LeadsDataProvider>
  );
}

function Shell({ userEmail, onLogout }: { userEmail?: string; onLogout: () => void }) {
  const { leads, followups, inquiries } = useLeadsData();
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
    const stripped = id.replace(/^leads_/, "");
    const cleanId = ((stripped as SectionId) in SECTIONS ? stripped : id) as SectionId;
    if (!(cleanId in SECTIONS)) return;

    setActive(cleanId);
    setMobileOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("section", cleanId);
    window.history.replaceState(null, "", url);
  };

  /* Counts shown on the nav, so "what is urgent" is answerable without clicking. */
  const badges = useMemo(() => {
    const today = todayIso();
    return {
      followups: followups.filter((f) => !f.completed && f.followup_date <= today).length,
      inquiries: inquiries.filter((i) => i.status === "NEW_LEAD").length,
      all: leads.filter((l) => l.status === "New" && (l.lead_score ?? 0) >= 60).length,
    };
  }, [leads, followups, inquiries]);

  const groups = useMemo<NavGroup[]>(
    () =>
      NAV_GROUPS.map((g) => ({
        ...g,
        items: g.items.map((item) => {
          const count =
            item.id === "followups"
              ? badges.followups
              : item.id === "inquiries"
                ? badges.inquiries
                : item.id === "all"
                  ? badges.all
                  : 0;
          if (!count) return { ...item, badge: undefined, badgeTone: undefined };
          return {
            ...item,
            badge: count,
            badgeTone: item.id === "followups" ? ("urgent" as const) : ("info" as const),
          };
        }),
      })),
    [badges],
  );

  const unread = badges.followups + badges.inquiries + badges.all;

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
    window.addEventListener(config.events.navigate, handler);
    return () => window.removeEventListener(config.events.navigate, handler);
  }, []);

  /* Pages mutate through the repository; the shell's copy has to hear about it. */
  const openAddLead = () => {
    navigate("all");
    setTimeout(() => window.dispatchEvent(new CustomEvent(config.events.openAddLead)), 200);
  };

  const showAddAction = active !== "all";

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
              {config.brandName.charAt(0)}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight text-white">{config.brandName}</span>
              <span className="text-[10px] font-semibold text-sky-400">{config.productName} CRM</span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/60 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Main">
          {groups.map((group, gi) => (
            <div key={gi} className="space-y-1">
              {group.label && (
                <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
                    aria-current={isSelected ? "page" : undefined}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-sky-500/10 text-sky-300"
                        : "text-slate-400 hover:bg-[#141b29] hover:text-slate-200"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge ? (
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                          item.badgeTone === "urgent"
                            ? "bg-rose-500/15 text-rose-300"
                            : "bg-sky-500/15 text-sky-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: user & outbound links */}
        <div className="space-y-2 border-t border-slate-800/80 p-3">
          <a
            href="/"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-[#141b29] hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-sky-400" />
              Public site
            </span>
          </a>
          <a
            href={config.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-[#141b29] hover:text-white"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              Main website
            </span>
            <span className="text-[10px] text-slate-500">{config.siteDomain}</span>
          </a>
          <div className="flex items-center justify-between rounded-lg bg-[#0d121d] px-3 py-2">
            <p className="min-w-0 truncate text-xs font-medium text-slate-300">
              {userEmail || config.defaultUserEmail}
            </p>
            <button
              onClick={onLogout}
              aria-label="Sign out"
              className="cursor-pointer p-1 text-slate-500 transition-colors hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header — owns the page title, so pages do not repeat it */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-800/80 bg-[#07090e]/95 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/60 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold tracking-tight text-white">
                {meta?.title || config.productName}
              </h1>
              <p className="hidden truncate text-xs text-slate-400 sm:block">{meta?.subtitle}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {showAddAction && (
              <button onClick={openAddLead} className={btnPrimary}>
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New lead</span>
              </button>
            )}
            <button
              onClick={() => setCmdPaletteOpen(true)}
              aria-label="Open command palette"
              className="hidden cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-[#0d121d] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-700 hover:text-white sm:flex"
            >
              <Command className="h-3.5 w-3.5" />
              <span>Search or jump to…</span>
              <Kbd>⌘K</Kbd>
            </button>

            <button
              onClick={() => setNotifOpen(true)}
              aria-label={
                unread ? `Notifications, ${unread} needing attention` : "Notifications"
              }
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-800 bg-[#0d121d] text-slate-400 transition-colors hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold tabular-nums text-white ring-2 ring-[#07090e]">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <ActiveView key={active} />
        </main>
      </div>

      {notifOpen && (
        <NotificationsDrawer
          leads={leads}
          followups={followups}
          inquiries={inquiries}
          onClose={() => setNotifOpen(false)}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}