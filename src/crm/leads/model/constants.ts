/* Enum-like value lists shared by forms, filters, and validation. */

export const LEAD_SOURCES = [
  "Website",
  "Lead Finder",
  "Google",
  "WhatsApp",
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Referral",
  "Phone",
  "Walk-in",
  "Campaign",
  "Other",
] as const;

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiating",
  "Won",
  "Lost",
] as const;

export const LEAD_PRIORITIES = ["Low", "Medium", "High", "Hot"] as const;

export const FOLLOWUP_METHODS = [
  "Call",
  "WhatsApp",
  "Email",
  "Meeting",
  "Visit",
  "Other",
] as const;

export const ACTIVITY_TYPES = [
  "Call",
  "WhatsApp",
  "Email",
  "Meeting",
  "Note",
  "Proposal",
  "Follow-up",
  "Status change",
  "Assignment",
  "Enrichment",
  "Lead conversion",
] as const;
