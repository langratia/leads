/* All CRM data access goes through the server API.
   Components never build direct database queries. */

import { api } from "@/core/api";
import type { Customer, Lead, LeadActivity, LeadFollowup, LeadInput } from "../model/types";

/* ---------- error classification ---------- */

export class LeadsNotInstalledError extends Error {
  constructor() {
    super("LEADS_TABLE_MISSING");
  }
}

function checkMissingTable(err: any) {
  const msg = String(err?.message || "").toLowerCase();
  if (
    msg.includes("42p01") ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table") ||
    msg.includes("relation") ||
    msg.includes("not found")
  ) {
    throw new LeadsNotInstalledError();
  }
  throw err;
}

/* ---------- leads ---------- */

export async function fetchLeads(): Promise<Lead[]> {
  try {
    return await api.leads.list();
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

export async function fetchLead(id: string): Promise<Lead | null> {
  try {
    const data = await api.leads.get(id);
    return data.lead;
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

export async function createLead(input: LeadInput): Promise<Lead> {
  try {
    return await api.leads.create(input);
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

export async function updateLead(id: string, input: LeadInput): Promise<Lead> {
  try {
    return await api.leads.update(id, input);
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

export async function deleteLead(id: string): Promise<void> {
  try {
    await api.leads.delete(id);
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

export async function bulkUpdate(ids: string[], patch: LeadInput): Promise<void> {
  try {
    await api.leads.bulkUpdate(ids, patch);
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

/* ---------- activities ---------- */

export async function fetchActivities(leadId: string): Promise<LeadActivity[]> {
  try {
    return await api.activities.list(leadId);
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

export async function addActivity(
  leadId: string,
  activity_type: string,
  description?: string,
): Promise<LeadActivity> {
  try {
    return await api.activities.add(leadId, activity_type, description);
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

/* ---------- follow-ups ---------- */

export async function fetchFollowups(leadId: string): Promise<LeadFollowup[]> {
  try {
    return await api.followups.list(leadId);
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

export async function fetchAllFollowups(): Promise<LeadFollowup[]> {
  try {
    return await api.followups.list();
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

export async function addFollowup(
  leadId: string,
  input: {
    followup_date: string;
    followup_time?: string | null;
    method?: string | null;
    notes?: string | null;
    assigned_to?: string | null;
  },
): Promise<LeadFollowup> {
  try {
    return await api.followups.create({ lead_id: leadId, ...input });
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

export async function completeFollowup(id: string, _leadId: string): Promise<void> {
  try {
    await api.followups.complete(id);
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

export async function deleteFollowup(id: string): Promise<void> {
  try {
    await api.followups.delete(id);
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}

/* ---------- website inquiries ---------- */

export interface InquiryRow {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  category: string | null;
  status: string;
  created_at: string;
}

export async function fetchInquiries(): Promise<InquiryRow[]> {
  try {
    const list = await api.inquiries.list();
    return list.map((item: any) => ({
      id: item.id,
      full_name: item.fullName || item.full_name || "",
      email: item.email,
      company: item.company || null,
      category: item.category || null,
      status: item.status,
      created_at: item.createdAt || item.created_at,
    }));
  } catch {
    return [];
  }
}

/* ---------- conversion (atomic transaction executed by the server) ---------- */

export async function convertLead(lead: Lead): Promise<Customer> {
  try {
    return await api.leads.convert(lead.id);
  } catch (err: any) {
    checkMissingTable(err);
    throw err;
  }
}
