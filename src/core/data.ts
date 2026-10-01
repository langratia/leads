import {
  Users,
  Search,
  Kanban,
  Table,
  CalendarClock,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export type SectionId =
  | "overview"
  | "finder"
  | "pipeline"
  | "all"
  | "followups"
  | "inquiries";

export interface NavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  /** Live count shown on the right of the nav row. Computed from real data. */
  badge?: number;
  /** Drives the badge colour. "urgent" is reserved for work that is late. */
  badgeTone?: "urgent" | "info" | "muted";
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

/* Grouped by what staff are doing, not by data model. A flat list mixed a tool
   (Finder), a stage view (Pipeline), a list (All Leads) and a task queue
   (Follow-ups), which gave no answer to "what should I work on". */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Work",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "finder", label: "Lead Finder", icon: Search },
    ],
  },
  {
    label: "Leads",
    items: [
      { id: "pipeline", label: "Pipeline", icon: Kanban },
      { id: "all", label: "All Leads", icon: Table },
      { id: "followups", label: "Follow-ups", icon: CalendarClock },
    ],
  },
  {
    label: "Inbound",
    items: [{ id: "inquiries", label: "Website Inquiries", icon: Inbox }],
  },
];

export const SECTION_TITLES: Record<SectionId, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "What needs working on today" },
  finder: { title: "Lead Finder", subtitle: "Discover businesses and save them into the CRM" },
  pipeline: { title: "Pipeline", subtitle: "Track leads from New through Won" },
  all: { title: "All Leads", subtitle: "Search, filter, bulk update, and export every prospect" },
  followups: { title: "Follow-ups", subtitle: "Calls, meetings, and WhatsApp check-ins" },
  inquiries: { title: "Website Inquiries", subtitle: "Inbound scoping requests and consultation bookings" },
};