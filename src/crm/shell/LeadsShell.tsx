import { config } from "@/config";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import {
  Bell,
  Command,
  ExternalLink,
  Globe,
  LogOut,
  Menu,
  Plus,
  Sparkles,
  Zap,
  ArrowRight,
  X,
} from "lucide-react";
import { NAV_GROUPS, SECTION_TITLES, type NavGroup, type SectionId } from "@/core/data";
import { LeadsDataProvider, useLeadsData } from "@/crm/leads/leads-context";
import { btnPrimary, Kbd } from "@/core/ui";
import { ToastProvider } from "@/core/toast";
import { todayIso } from "@/core/format";
import { AbstractBrandLogo, AgentIcon } from "@/core/icons/AbstractIcons";
import CommandPalette from "./CommandPalette";
import NotificationsDrawer from "./NotificationsDrawer";

// Section views
import AgentPage from "../agent/AgentPage";
import LeadsOverview from "../leads/LeadsOverviewPage";
import LeadsFinder from "../leads/LeadsFinderPage";
import LeadsAll from "../leads/LeadsAllPage";
import LeadsPipeline from "../leads/LeadsPipelinePage";
import LeadsFollowups from "../leads/LeadsFollowupsPage";
import Inquiries from "../inquiries/Inquiries";
import EmailsPage from "../emails/EmailsPage";
import CustomersPage from "../customers/CustomersPage";

const SECTIONS: Record<SectionId, FC<any>> = {
  agent: () => <AgentPage />,
  overview: () => <LeadsOverview />,
  finder: () => <LeadsFinder />,
  pipeline: () => <LeadsPipeline />,
  all: () => <LeadsAll />,
  customers: () => <CustomersPage />,
  followups: () => <LeadsFollowups />,
  inquiries: () => <Inquiries />,
  emails: () => <EmailsPage />,
};

export default function LeadsShell(props: { userEmail?: string; onLogout: () => void }) {
  return (
    <LeadsDataProvider>
      <ToastProvider>
        <Shell {...props} />
      </ToastProvider>
    </LeadsDataProvider>
  );
}

function Shell({ userEmail, onLogout }: { userEmail?: string; onLogout: () => void }) {
  const { leads, followups, inquiries, refresh } = useLeadsData();
  const [active, setActive] = useState<SectionId>(() => {
    // 1. Check query parameter ?section=agent
    const q = new URLSearchParams(window.location.search).get("section");
    if (q && (q as SectionId) in SECTIONS) return q as SectionId;

    // 2. Check path segments e.g. /crm/emails, /app/agent, /agent
    const segments = window.location.pathname.toLowerCase().split("/").filter(Boolean);
    for (const seg of segments) {
      if ((seg as SectionId) in SECTIONS) return seg as SectionId;
      if (seg === "leads") return "all";
      if (seg === "inbox") return "emails";
    }

    return "overview";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Real-time inbound lead alert state
  const seenInquiryIds = useRef<Set<string> | null>(null);
  const [inboundAlert, setInboundAlert] = useState<{
    id: string;
    fullName: string;
    company?: string;
    category: string;
    source: string;
  } | null>(null);

  // Zero-dependency synthetic Web Audio API chime
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.55);
    } catch {
      // Audio autoplay policy handled gracefully
    }
  };

  // Track and alert on new inbound website inquiries
  useEffect(() => {
    const currentIds = new Set(inquiries.map((i) => i.id));
    if (seenInquiryIds.current === null) {
      seenInquiryIds.current = currentIds;
      return;
    }

    const newlyArrived = inquiries.find((i) => !seenInquiryIds.current?.has(i.id));
    if (newlyArrived) {
      playNotificationChime();
      setInboundAlert({
        id: newlyArrived.id,
        fullName: newlyArrived.full_name,
        company: newlyArrived.company || undefined,
        category: newlyArrived.category || "Inbound Web Inquiry",
        source: "Website Inquiry",
      });

      // Auto dismiss after 9 seconds
      const timer = setTimeout(() => {
        setInboundAlert((curr) => (curr?.id === newlyArrived.id ? null : curr));
      }, 9000);
      return () => clearTimeout(timer);
    }
    seenInquiryIds.current = currentIds;
  }, [inquiries]);

  // Periodic background refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh().catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const meta = SECTION_TITLES[active];
  const ActiveView = SECTIONS[active];

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePop = () => {
      const q = new URLSearchParams(window.location.search).get("section");
      if (q && (q as SectionId) in SECTIONS) {
        setActive(q as SectionId);
        return;
      }
      const segments = window.location.pathname.toLowerCase().split("/").filter(Boolean);
      for (const seg of segments) {
        if ((seg as SectionId) in SECTIONS) {
          setActive(seg as SectionId);
          return;
        }
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const navigate = (id: string) => {
    const stripped = id.replace(/^leads_/, "");
    const cleanId = ((stripped as SectionId) in SECTIONS ? stripped : id) as SectionId;
    if (!(cleanId in SECTIONS)) return;

    setActive(cleanId);
    setMobileOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("section", cleanId);
    if (window.location.pathname.startsWith("/app") || window.location.pathname.startsWith("/crm")) {
      url.pathname = `/crm/${cleanId}`;
    }
    window.history.pushState(null, "", url);
  };

  /* Counts shown on the nav, so "what is urgent" is answerable without clicking. */
  const badges = useMemo(() => {
    const today = todayIso();
    const wonCount = leads.filter((l) => l.status === "Won").length;
    return {
      followups: followups.filter((f) => !f.completed && f.followup_date <= today).length,
      inquiries: inquiries.filter((i) => i.status === "NEW_LEAD").length,
      all: leads.filter((l) => l.status === "New" && (l.lead_score ?? 0) >= 60).length,
      customers: wonCount > 0 ? wonCount : undefined,
    };
  }, [leads, followups, inquiries]);

  const groups = useMemo<NavGroup[]>(
    () =>
      NAV_GROUPS.map((g) => ({
        ...g,
        items: g.items.map((item) => {
          if (item.id === "agent") {
            return { ...item, badge: "AI", badgeTone: "ai" as const };
          }
          const count =
            item.id === "followups"
              ? badges.followups
              : item.id === "inquiries"
                ? badges.inquiries
                : item.id === "all"
                  ? badges.all
                  : item.id === "customers"
                    ? badges.customers
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

  const openAddLead = () => {
    navigate("all");
    setTimeout(() => window.dispatchEvent(new CustomEvent(config.events.openAddLead)), 200);
  };

  const showAddAction = active !== "all";

  return (
    <div className="flex min-h-screen bg-[#07090e] text-slate-100 font-sans antialiased selection:bg-sky-500/30 selection:text-sky-200">
      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        onNavigate={navigate}
      />

      {/* REDESIGNED SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800/80 bg-[#07090e] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header with Abstract Holographic Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 px-4 bg-gradient-to-b from-sky-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => navigate("overview")}>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-sky-500/30 to-indigo-500/30 blur-sm group-hover:opacity-100 transition duration-300 opacity-70" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d121d] border border-sky-500/30 shadow-md shadow-sky-500/10">
                <AbstractBrandLogo className="h-6 w-6" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider text-white flex items-center gap-1.5 font-mono">
                {config.brandName}
                <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-400 font-sans font-bold">2.0</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-tight">
                Autonomous Leads
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/60 lg:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Main">
          {groups.map((group, gi) => (
            <div key={gi} className="space-y-1">
              {group.label && (
                <div className="px-3 pb-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isSelected = active === item.id;
                const isAi = item.id === "agent";

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    aria-current={isSelected ? "page" : undefined}
                    className={`group relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? isAi
                          ? "bg-gradient-to-r from-sky-500/20 via-indigo-500/15 to-transparent text-sky-200 border border-sky-500/30 shadow-sm shadow-sky-500/10"
                          : "bg-sky-500/10 text-sky-300 border border-sky-500/20 shadow-sm shadow-sky-500/5"
                        : "text-slate-400 hover:bg-[#0d121d] hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    {/* Active Accent Left Pill */}
                    {isSelected && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sky-400 shadow-sm shadow-sky-400" />
                    )}

                    <span className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`transition-colors ${
                          isSelected
                            ? isAi
                              ? "text-sky-300"
                              : "text-sky-400"
                            : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </span>

                    {item.badge ? (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                          item.badgeTone === "ai"
                            ? "bg-gradient-to-r from-violet-600/30 to-sky-500/30 text-sky-300 border border-sky-400/40 shadow-xs shadow-sky-500/20"
                            : item.badgeTone === "urgent"
                              ? "bg-rose-500/15 text-rose-300 border border-rose-500/20"
                              : "bg-sky-500/15 text-sky-300 border border-sky-500/20"
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

        {/* Footer: User & Outbound */}
        <div className="space-y-2 border-t border-slate-800/80 p-3 bg-[#07090e]/80">
          <a
            href="/"
            className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-[#0d121d] hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-sky-400" />
              Public portal
            </span>
          </a>

          <a
            href={config.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-[#0d121d] hover:text-white"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              Main website
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{config.siteDomain}</span>
          </a>

          <div className="flex items-center justify-between rounded-xl bg-[#0d121d] p-2.5 border border-slate-800/80 mt-1">
            <div className="min-w-0 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20 shrink-0" />
              <p className="min-w-0 truncate text-xs font-medium text-slate-300">
                {userEmail || config.defaultUserEmail}
              </p>
            </div>
            <button
              onClick={onLogout}
              aria-label="Sign out"
              className="cursor-pointer p-1 text-slate-500 transition-colors hover:text-rose-400"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-800/80 bg-[#07090e]/95 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/60 lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold tracking-tight text-white flex items-center gap-2">
                {meta?.title || config.productName}
                {active === "agent" && (
                  <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-500/30">
                    Autopilot
                  </span>
                )}
              </h1>
              <p className="hidden truncate text-xs text-slate-400 sm:block">{meta?.subtitle}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {/* Quick AI Agent launcher if on other tabs */}
            {active !== "agent" && (
              <button
                onClick={() => navigate("agent")}
                className="hidden md:flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-all cursor-pointer shadow-sm shadow-sky-500/10"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                <span>AI Agent</span>
              </button>
            )}

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

      {/* REAL-TIME INBOUND TOAST NOTIFICATION */}
      {inboundAlert && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-2xl border border-emerald-500/50 bg-[#0d121d]/95 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 max-w-sm ring-1 ring-emerald-500/30">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Zap className="h-5 w-5 animate-pulse" />
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                New Inbound Lead
              </span>
              <button
                onClick={() => setInboundAlert(null)}
                className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <h4 className="text-xs font-bold text-white truncate mt-0.5">
              {inboundAlert.fullName}
              {inboundAlert.company && <span className="text-slate-400 font-normal"> · {inboundAlert.company}</span>}
            </h4>

            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              Category: {inboundAlert.category}
            </p>

            <button
              onClick={() => {
                navigate("inquiries");
                setInboundAlert(null);
              }}
              className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <span>View Inbound Inquiry</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}