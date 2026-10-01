import { useState } from "react";
import { X, CheckCheck, Bell, ArrowRight } from "lucide-react";
import { tint, Badge, Card, Kbd } from "@/ui";
import type { SectionId } from "@/data";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  category: "leads" | "inquiries" | "system";
  targetSection?: SectionId;
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
  onNavigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: SectionId) => void;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "New consultation requested via website",
      body: "Dr. Ronald Kato submitted a project scoping inquiry for Hospital EHR.",
      time: "12m ago",
      unread: true,
      category: "inquiries",
      targetSection: "inquiries",
    },
    {
      id: "2",
      title: "High priority lead awaiting proposal",
      body: "Apex Pharmacies proposal draft deadline is in 24 hours.",
      time: "1h ago",
      unread: true,
      category: "leads",
      targetSection: "pipeline",
    },
    {
      id: "3",
      title: "Follow-up call due today",
      body: "Scheduled call with Sarah Nansubuga regarding School Admin System.",
      time: "3h ago",
      unread: false,
      category: "leads",
      targetSection: "followups",
    },
    {
      id: "4",
      title: "Lead Finder query completed",
      body: "Discovered 42 businesses in Kampala Central.",
      time: "Yesterday",
      unread: false,
      category: "system",
      targetSection: "finder",
    },
  ]);

  if (!isOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleClick = (item: NotificationItem) => {
    if (item.targetSection) {
      onNavigate(item.targetSection);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border-l border-slate-800 bg-[#0a0f1d] p-5 shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white">Notifications</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800/60 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClick(item)}
                className={`rounded-xl border p-3 transition-colors cursor-pointer ${
                  item.unread
                    ? "border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10"
                    : "border-slate-800/80 bg-[#0d121d] hover:bg-[#121724]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-bold text-white">{item.title}</h3>
                  <span className="text-[10px] text-slate-500 shrink-0">{item.time}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{item.body}</p>
                {item.targetSection && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-sky-400">
                    <span>Open view</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
