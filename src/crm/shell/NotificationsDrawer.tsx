import { useMemo, useState } from "react";
import { X, Bell, ArrowRight, Inbox, CalendarClock, Users, CheckCircle2 } from "lucide-react";
import type { InquiryRow, Lead, LeadFollowup } from "@/crm/leads";
import type { SectionId } from "@/core/data";
import { formatDateTime } from "@/core/format";
import { deriveNotifications, type AppNotification } from "./notifications";

const ICONS = {
  followups: CalendarClock,
  inquiries: Inbox,
  all: Users,
} as const;

function iconFor(section: SectionId) {
  return ICONS[section as keyof typeof ICONS] ?? Bell;
}

export default function NotificationsDrawer({
  leads,
  followups,
  inquiries,
  onClose,
  onNavigate,
}: {
  leads: Lead[];
  followups: LeadFollowup[];
  inquiries: InquiryRow[];
  onClose: () => void;
  onNavigate: (section: SectionId) => void;
}) {
  /* Read tracking is per-session: what you have seen, not what exists. */
  const [seen, setSeen] = useState<Set<string>>(new Set());

  const items = useMemo(
    () => deriveNotifications(leads, followups, inquiries),
    [leads, followups, inquiries],
  );
  const unread = items.filter((i) => !seen.has(i.id));

  const open = (item: AppNotification) => {
    setSeen((prev) => new Set(prev).add(item.id));
    onNavigate(item.targetSection);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Notifications"
        className="flex w-full max-w-sm flex-col border-l border-slate-800 bg-[#0d121d]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">Needs attention</h2>
            {unread.length > 0 && (
              <span className="rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-rose-300">
                {unread.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500/60" />
              <p className="text-sm font-semibold text-slate-300">Nothing needs you right now</p>
              <p className="text-xs text-slate-500">
                Overdue follow-ups, new website inquiries, and high-scoring untouched leads will
                appear here.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const Icon = iconFor(item.targetSection);
              const isUnread = !seen.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => open(item)}
                  className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-colors ${
                    isUnread
                      ? "border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10"
                      : "border-slate-800/80 bg-[#090d16] opacity-70 hover:bg-[#141b29]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                        item.overdue ? "text-rose-400" : "text-sky-400"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-xs font-semibold ${
                            item.overdue ? "text-rose-300" : "text-white"
                          }`}
                        >
                          {item.title}
                        </h3>
                        {item.at && (
                          <span className="shrink-0 text-[10px] text-slate-500">
                            {formatDateTime(item.at)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{item.body}</p>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-sky-400">
                        Open <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}