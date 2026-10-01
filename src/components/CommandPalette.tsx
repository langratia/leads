import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  Inbox,
  Users,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import { Kbd } from "@/ui";
import type { SectionId } from "@/data";

export interface CommandItem {
  id: string;
  label: string;
  category: "Pages" | "Actions" | "Search";
  icon: LucideIcon;
  badge?: string;
  action: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: SectionId) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const items: CommandItem[] = [
    // Navigation Pages
    {
      id: "nav-overview",
      label: "Go to Leads Overview",
      category: "Pages",
      icon: LayoutDashboard,
      action: () => onNavigate("overview"),
    },
    {
      id: "nav-finder",
      label: "Open Lead Finder (Google Places)",
      category: "Pages",
      icon: Search,
      badge: "Search",
      action: () => onNavigate("finder"),
    },
    {
      id: "nav-pipeline",
      label: "Go to Sales Pipeline (Kanban)",
      category: "Pages",
      icon: Users,
      action: () => onNavigate("pipeline"),
    },
    {
      id: "nav-all",
      label: "Go to All Leads (Table View)",
      category: "Pages",
      icon: Users,
      action: () => onNavigate("all"),
    },
    {
      id: "nav-followups",
      label: "Go to Scheduled Follow-ups",
      category: "Pages",
      icon: Users,
      action: () => onNavigate("followups"),
    },
    {
      id: "nav-inquiries",
      label: "Go to Inquiries & Email Inbox",
      category: "Pages",
      icon: Inbox,
      badge: "Inbound",
      action: () => onNavigate("inquiries"),
    },

    // Fast Actions
    {
      id: "act-add-lead",
      label: "Create New CRM Lead",
      category: "Actions",
      icon: Plus,
      action: () => {
        onNavigate("all");
        setTimeout(() => window.dispatchEvent(new CustomEvent("langratia:open-add-lead")), 200);
      },
    },
    {
      id: "act-find-biz",
      label: "Find Businesses Nearby (Lead Finder)",
      category: "Actions",
      icon: Search,
      action: () => onNavigate("finder"),
    },
    {
      id: "act-pipeline-view",
      label: "Review Kanban Deal Stages",
      category: "Actions",
      icon: Users,
      action: () => onNavigate("pipeline"),
    },
    {
      id: "act-check-followups",
      label: "Check Overdue Follow-ups",
      category: "Actions",
      icon: Users,
      action: () => onNavigate("followups"),
    },
  ];

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-800 bg-[#0a0f1d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center border-b border-slate-800/80 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or jump to section…"
            className="flex-1 bg-transparent px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none"
          />
          <Kbd>ESC</Kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-colors ${
                    isSelected ? "bg-sky-500/15 text-sky-300" : "text-slate-300 hover:bg-[#121724]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-400">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">{item.category}</span>
                    <ArrowRight className="h-3 w-3 text-slate-600" />
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
