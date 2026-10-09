import { config } from "@/config";

/**
 * Normalizes East African and international phone numbers into clean E.164 digits without symbols.
 * Handles formats such as:
 * - "+256 782 486240" -> "256782486240"
 * - "0782 486240"     -> "256782486240"
 * - "0700123456"      -> "256700123456"
 * - "256782486240"    -> "256782486240"
 */
export function normalizeWhatsAppNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  // Strip all non-digit characters
  const digits = phone.replace(/[^0-9]/g, "");

  // If local Ugandan format starting with 07... (10 digits)
  if (digits.length === 10 && digits.startsWith("07")) {
    return `256${digits.slice(1)}`;
  }

  // If local format starting with 7... (9 digits)
  if (digits.length === 9 && digits.startsWith("7")) {
    return `256${digits}`;
  }

  return digits;
}

export interface WhatsAppTemplate {
  id: string;
  label: string;
  tag: string;
  buildText: (lead: {
    business_name: string;
    contact_person?: string | null;
    category?: string | null;
    address?: string | null;
  }) => string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "value_intro",
    label: "Value Introduction",
    tag: "Cold Outreach",
    buildText: (lead) => {
      const recipient = lead.contact_person ? lead.contact_person.split(" ")[0] : "there";
      const location = lead.address ? ` in ${lead.address.split(",")[0]}` : "";
      return `Hello ${recipient}, this is Allan from ${config.brandName} Software Engineering.\n\nWe noticed ${lead.business_name}'s great work${location}. We design and build enterprise management software, custom billing systems, and automated operational tools for ${lead.category || "forward-thinking organizations"}.\n\nWould you be open to a quick 5-minute chat this week on how we can streamline operations for ${lead.business_name}?`;
    },
  },
  {
    id: "demo_invite",
    label: "Software Demo Preview",
    tag: "High Intent",
    buildText: (lead) => {
      const recipient = lead.contact_person || lead.business_name;
      return `Hi ${recipient}, following up from ${config.brandName}.\n\nWe recently deployed an automated system for an organization in the ${lead.category || "commercial"} sector that cut operational delays by 40%.\n\nCould we share a 2-minute video preview tailored for ${lead.business_name} with you here?`;
    },
  },
  {
    id: "followup",
    label: "Relationship Check-In",
    tag: "Follow-Up",
    buildText: (lead) => {
      const recipient = lead.contact_person ? lead.contact_person.split(" ")[0] : "there";
      return `Hi ${recipient}, checking in from ${config.brandName}.\n\nWanted to see if you had a moment to review our technology proposal for ${lead.business_name}? Happy to answer any questions or adapt the scope to your immediate timeline.`;
    },
  },
  {
    id: "consultation",
    label: "Free Discovery Call",
    tag: "Closing",
    buildText: (lead) => {
      return `Hello ${lead.contact_person || lead.business_name},\n\nWe are currently offering complimentary digital infrastructure reviews for leading businesses in the region. Would you like to schedule a 15-minute scoping session with our senior engineers this week?`;
    },
  },
];

export function buildWhatsAppUrl(phone: string, text: string): string {
  const clean = normalizeWhatsAppNumber(phone);
  if (!clean) return "";
  return `https://wa.me/${clean}?text=${encodeURIComponent(text.trim())}`;
}
