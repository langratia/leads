import type { FC } from "react";
import {
  AgentIcon,
  OverviewIcon,
  FinderIcon,
  InquiriesIcon,
  PipelineIcon,
  AllLeadsIcon,
  CustomersIcon,
  FollowupsIcon,
  EmailsIcon,
} from "./icons/AbstractIcons";

export type SectionId =
  | "agent"
  | "overview"
  | "finder"
  | "inquiries"
  | "pipeline"
  | "all"
  | "customers"
  | "followups"
  | "emails";

export interface NavItem {
  id: SectionId;
  label: string;
  icon: FC<{ className?: string }>;
  /** Live count shown on the right of the nav row. Computed from real data. */
  badge?: number | string;
  /** Drives the badge colour. "urgent" is reserved for work that is late. */
  badgeTone?: "urgent" | "info" | "muted" | "ai";
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Autonomous Hub",
    items: [
      { id: "agent", label: "AI Agent", icon: AgentIcon, badge: "AI", badgeTone: "ai" },
    ],
  },
  {
    label: "Prospecting & Inbound",
    items: [
      { id: "overview", label: "Overview", icon: OverviewIcon },
      { id: "finder", label: "Lead Finder", icon: FinderIcon },
      { id: "inquiries", label: "Website Inquiries", icon: InquiriesIcon },
    ],
  },
  {
    label: "Sales & Pipeline",
    items: [
      { id: "pipeline", label: "Pipeline", icon: PipelineIcon },
      { id: "all", label: "All Leads", icon: AllLeadsIcon },
      { id: "customers", label: "Customers", icon: CustomersIcon },
      { id: "followups", label: "Follow-ups", icon: FollowupsIcon },
    ],
  },
  {
    label: "Communications",
    items: [
      { id: "emails", label: "Email Outreach", icon: EmailsIcon },
    ],
  },
];

export const SECTION_TITLES: Record<SectionId, { title: string; subtitle: string }> = {
  agent: { title: "Autonomous AI Agent", subtitle: "Autonomous prospecting, automated lead scoring, and outreach campaigns" },
  overview: { title: "Overview", subtitle: "Operational KPIs and today's priority actions" },
  finder: { title: "Lead Finder", subtitle: "Target local businesses and import them into the CRM" },
  inquiries: { title: "Website Inquiries", subtitle: "Inbound scoping submissions and consultation bookings" },
  pipeline: { title: "Sales Pipeline", subtitle: "Track opportunities visually from New Prospect to Closed Won" },
  all: { title: "All Leads", subtitle: "Master database with multi-field search, filters, and batch updates" },
  customers: { title: "Customers", subtitle: "Converted client accounts, deal values, and account relationships" },
  followups: { title: "Follow-ups", subtitle: "Scheduled phone calls, WhatsApp check-ins, and client meetings" },
  emails: { title: "Email Outreach & Inbox", subtitle: "Unified conversation threads, cold outreach campaigns, and Resend delivery" },
};