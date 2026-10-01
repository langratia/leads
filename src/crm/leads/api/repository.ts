/* All Supabase access for the CRM. Components never build queries themselves. */

import { supabase } from "@/core/supabase";
import { computeLeadScore } from "../model/scoring";
import type { Customer, Lead, LeadActivity, LeadFollowup, LeadInput } from "../model/types";

/* ---------- error classification ---------- */

export class LeadsNotInstalledError extends Error {
  constructor() {
    super("LEADS_TABLE_MISSING");
  }
}

function isMissingTable(err: any): boolean {
  const msg = (err?.message || "") + " " + (err?.code || "");
  return (
    msg.includes("42P01") ||
    msg.includes("PGRST205") ||
    msg.includes("PGRST204") ||
    msg.includes("relation") ||
    msg.includes("does not exist") ||
    msg.includes("Could not find the table") ||
    msg.includes("404")
  );
}

/* ---------- leads ---------- */

export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
  return data as Lead[];
}

export async function fetchLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
  return data as Lead | null;
}

export async function createLead(input: LeadInput): Promise<Lead> {
  const payload: any = {
    ...input,
    lead_score:
      input.lead_score ?? computeLeadScore(input as Partial<Lead>),
  };
  const { data, error } = await supabase
    .from("leads")
    .insert(payload)
    .select("*")
    .single();
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
  const lead = data as Lead;
  await addActivityQuiet(lead.id, "Note", "Lead created", lead.lead_source);
  return lead;
}

export async function updateLead(id: string, input: LeadInput): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
  const lead = data as Lead;
  if (input.status) {
    await addActivityQuiet(lead.id, "Status change", `Status changed to ${input.status}`);
  }
  return lead;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
}

export async function bulkUpdate(ids: string[], patch: LeadInput): Promise<void> {
  const { error } = await supabase
    .from("leads")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
}

/* ---------- activities ---------- */

export async function fetchActivities(leadId: string): Promise<LeadActivity[]> {
  const { data, error } = await supabase
    .from("lead_activities")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
  return data as LeadActivity[];
}

export async function addActivity(
  leadId: string,
  activity_type: string,
  description?: string,
): Promise<LeadActivity> {
  const { data, error } = await supabase
    .from("lead_activities")
    .insert({ lead_id: leadId, activity_type, description })
    .select("*")
    .single();
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
  return data as LeadActivity;
}

async function addActivityQuiet(
  leadId: string,
  activity_type: string,
  description?: string,
  _source?: string,
): Promise<void> {
  try {
    await addActivity(leadId, activity_type, description);
  } catch {
    /* background bookkeeping — never block the main action */
  }
}

/* ---------- follow-ups ---------- */

export async function fetchFollowups(leadId: string): Promise<LeadFollowup[]> {
  const { data, error } = await supabase
    .from("lead_followups")
    .select("*")
    .eq("lead_id", leadId)
    .order("followup_date", { ascending: true });
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
  return data as LeadFollowup[];
}

export async function fetchAllFollowups(): Promise<LeadFollowup[]> {
  const { data, error } = await supabase
    .from("lead_followups")
    .select("*")
    .order("followup_date", { ascending: true });
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
  return data as LeadFollowup[];
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
  const { data, error } = await supabase
    .from("lead_followups")
    .insert({ lead_id: leadId, ...input })
    .select("*")
    .single();
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
  await supabase
    .from("leads")
    .update({
      next_followup_date: input.followup_date,
      next_followup_time: input.followup_time ?? null,
      followup_method: input.method ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", leadId);
  await addActivityQuiet(leadId, "Follow-up", `Follow-up scheduled for ${input.followup_date}`);
  return data as LeadFollowup;
}

export async function completeFollowup(id: string, leadId: string): Promise<void> {
  const { error } = await supabase
    .from("lead_followups")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
  await addActivityQuiet(leadId, "Follow-up", "Follow-up completed");
}

export async function deleteFollowup(id: string): Promise<void> {
  const { error } = await supabase.from("lead_followups").delete().eq("id", id);
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
}

/* ---------- website inquiries ---------- */

/* Only what the notification feed needs. The full record, including internal
   notes, is loaded by the Inquiries section itself. */
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
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, full_name, email, company, category, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    /* A deployment without the inquiries migration should still run the CRM. */
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as InquiryRow[];
}

/* ---------- conversion ---------- */

export async function convertLead(lead: Lead): Promise<Customer> {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      lead_id: lead.id,
      business_name: lead.business_name,
      category: lead.category,
      contact_person: lead.contact_person,
      phone: lead.phone,
      email: lead.email,
      website: lead.website,
      address: lead.address,
      latitude: lead.latitude,
      longitude: lead.longitude,
      interested_product: lead.interested_product,
      estimated_value: lead.estimated_value,
    })
    .select("*")
    .single();
  if (error) {
    if (isMissingTable(error)) throw new LeadsNotInstalledError();
    throw error;
  }
  const customer = data as Customer;

  await supabase
    .from("leads")
    .update({
      status: "Won",
      converted_at: new Date().toISOString(),
      customer_id: customer.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lead.id);
  await addActivityQuiet(lead.id, "Lead conversion", `Converted to customer (${customer.id})`);

  return customer;
}
