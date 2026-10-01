/* Notifications derived from the records already loaded.

   These were previously four hardcoded strings naming businesses and people
   that no search or call had ever produced. Each item below points at a row
   that actually exists. */

import type { InquiryRow, Lead, LeadFollowup } from "@/crm/leads";
import type { SectionId } from "@/core/data";
import { todayIso } from "@/core/format";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  /** Absolute timestamp; formatted for display rather than stored as "3h ago". */
  at: string | null;
  /** A due date rather than an event time — rendered as an overdue warning. */
  overdue: boolean;
  targetSection: SectionId;
}

export interface NotificationCounts {
  followupsDue: number;
  newInquiries: number;
  highValueUntouched: number;
}

const OPEN_INQUIRY = "NEW_LEAD";

export function deriveNotifications(
  leads: Lead[],
  followups: LeadFollowup[],
  inquiries: InquiryRow[],
): AppNotification[] {
  const items: AppNotification[] = [];
  const today = todayIso();
  const leadName = (id: string) => leads.find((l) => l.id === id)?.business_name ?? null;

  for (const f of followups) {
    if (f.completed || f.followup_date > today) continue;
    const name = leadName(f.lead_id);
    if (!name) continue;
    const overdue = f.followup_date < today;
    items.push({
      id: `followup-${f.id}`,
      title: overdue ? "Follow-up overdue" : "Follow-up due today",
      body: `${f.method || "Call"} with ${name}${f.followup_time ? ` at ${f.followup_time}` : ""}.`,
      at: null,
      overdue,
      targetSection: "followups",
    });
  }

  for (const i of inquiries) {
    if (i.status !== OPEN_INQUIRY) continue;
    const who = i.company || i.full_name;
    items.push({
      id: `inquiry-${i.id}`,
      title: "New website inquiry",
      body: `${who}${i.category ? ` — ${i.category}` : ""} is waiting for a first response.`,
      at: i.created_at,
      overdue: false,
      targetSection: "inquiries",
    });
  }

  for (const l of leads) {
    if (l.status !== "New" || (l.lead_score ?? 0) < 60) continue;
    items.push({
      id: `lead-${l.id}`,
      title: "Strong lead not yet contacted",
      body: `${l.business_name} scored ${l.lead_score}/100 and is still in New.`,
      at: l.created_at,
      overdue: false,
      targetSection: "all",
    });
  }

  return items.sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    return (+new Date(b.at || 0)) - (+new Date(a.at || 0));
  });
}

export function notificationCounts(
  leads: Lead[],
  followups: LeadFollowup[],
  inquiries: InquiryRow[],
): NotificationCounts {
  const today = todayIso();
  return {
    followupsDue: followups.filter((f) => !f.completed && f.followup_date <= today).length,
    newInquiries: inquiries.filter((i) => i.status === OPEN_INQUIRY).length,
    highValueUntouched: leads.filter((l) => l.status === "New" && (l.lead_score ?? 0) >= 60).length,
  };
}