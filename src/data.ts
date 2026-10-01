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
  badge?: string;
  badgeTone?: "blue" | "green" | "red" | "amber" | "gray" | "purple";
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Leads Engine",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "finder", label: "Lead Finder", icon: Search },
      { id: "pipeline", label: "Pipeline", icon: Kanban },
      { id: "all", label: "All Leads", icon: Table },
      { id: "followups", label: "Follow-ups", icon: CalendarClock },
      { id: "inquiries", label: "Website Inquiries", icon: Inbox },
    ],
  },
];

export const SECTION_TITLES: Record<SectionId, { title: string; subtitle: string }> = {
  overview: { title: "Leads Overview", subtitle: "Real-time sales velocity and lead qualification triage" },
  finder: { title: "Lead Finder", subtitle: "Discover businesses on the map and save them into the CRM" },
  pipeline: { title: "Deal Pipeline", subtitle: "Track leads through New, Contacted, Qualified, and Won stages" },
  all: { title: "All Leads", subtitle: "Search, filter, bulk update, and export every prospect" },
  followups: { title: "Scheduled Follow-ups", subtitle: "Upcoming calls, meetings, WhatsApp check-ins, and reminders" },
  inquiries: { title: "Inquiries & Email Threads", subtitle: "Incoming scoping requests and persistent chat-style email inbox" },
};

export interface Notification {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: "lead" | "inquiry" | "followup";
}

export const mockNotifications: Notification[] = [
  {
    id: "notif_1",
    title: "New consultation requested via website",
    time: "10m ago",
    read: false,
    type: "inquiry",
  },
  {
    id: "notif_2",
    title: "High priority lead awaiting proposal",
    time: "1h ago",
    read: false,
    type: "lead",
  },
  {
    id: "notif_3",
    title: "Follow-up call due today with Apex Pharma",
    time: "3h ago",
    read: true,
    type: "followup",
  },
];
