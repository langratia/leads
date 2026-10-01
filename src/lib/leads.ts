"use client";

import { supabase } from "./supabase";

/* ============================================================
   LEADS CRM — data layer
   All reads/writes go through the Supabase client (project
   sriwrevcvwrzkgppzvst). The underlying tables are defined in
   supabase/migrations/0001_leads_crm.sql.
   ============================================================ */

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

export interface Lead {
  id: string;
  business_name: string;
  category: string | null;
  contact_person: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  place_id: string | null;
  rating: number | null;
  review_count: number | null;
  interested_product: string | null;
  lead_source: string;
  status: string;
  priority: string;
  lead_score: number;
  estimated_value: number | null;
  assigned_to: string | null;
  tags: string[];
  notes: string | null;
  next_followup_date: string | null;
  next_followup_time: string | null;
  followup_method: string | null;
  created_by: string | null;
  converted_at: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface LeadFollowup {
  id: string;
  lead_id: string;
  followup_date: string;
  followup_time: string | null;
  method: string | null;
  notes: string | null;
  assigned_to: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  lead_id: string | null;
  business_name: string;
  category: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  interested_product: string | null;
  estimated_value: number | null;
  converted_by: string | null;
  converted_at: string;
  created_at: string;
}

export type LeadInput = Omit<
  Partial<Lead>,
  "id" | "created_at" | "updated_at" | "converted_at" | "customer_id"
>;

export interface FoundBusiness {
  business_name: string;
  category?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

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

/* ---------- scoring ---------- */

const TARGET_CATEGORIES = ["pharmacy", "clinic", "hospital", "school", "church", "retail", "hotel", "restaurant", "hardware", "shop"];
const TARGET_AREAS = ["kampala", "ntinda", "wakiso", "entebbe", "kawempe", "makerere", "ntinda", "muyenga", "kansanga", "bugolobi", "nakawa", "lugogo"];

export function computeLeadScore(lead: Partial<Lead>): number {
  let score = 0;
  const category = (lead.category || "").toLowerCase();
  const address = (lead.address || "").toLowerCase();

  if (TARGET_CATEGORIES.some((c) => category.includes(c))) score += 20;
  if (TARGET_AREAS.some((a) => address.includes(a))) score += 15;
  if (lead.phone || lead.whatsapp) score += 10;
  if (lead.email) score += 10;
  if (lead.website) score += 5;
  if (lead.interested_product) score += 20;
  if ((lead.tags || []).length > 1) score += 5;
  if ((lead.tags || []).some((t) => t.toLowerCase().includes("branch"))) score += 15;

  return Math.min(score, 100);
}

/* ---------- Lead Finder (Google Places) ----------
   Interactive business search. The Places API key stays server-side:
   in dev, Vite proxies /api/places (see vite.config.ts); in production
   the Cloudflare Pages Function functions/api/places.ts handles it.
   Provider-agnostic: swap the fetch below without touching the CRM. */

export interface FinderSearchResult {
  place_id: string;
  business_name: string;
  category: string | null;
  phone: string | null;
  website: string | null;
  address: string;
  rating: number | null;
  reviews: number | null;
  latitude: number;
  longitude: number;
}

export interface FinderSearchResultSet {
  results: FinderSearchResult[];
  nextPageToken: string | null;
}

const PLACES_BASE = "/api/places/search";

async function authHeaders(): Promise<Record<string, string>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function findBusinesses(
  query: string,
  radiusKm?: number,
  center?: { lat: number; lon: number },
  opts?: { type?: string; pageToken?: string },
): Promise<FinderSearchResultSet> {
  const params = new URLSearchParams({ q: query });
  if (center) {
    params.set("lat", String(center.lat));
    params.set("lon", String(center.lon));
    params.set("radius", String(radiusKm ?? 5));
  }
  if (opts?.type) params.set("type", opts.type);
  if (opts?.pageToken) params.set("pageToken", opts.pageToken);

  const res = await fetch(`${PLACES_BASE}?${params.toString()}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Session expired. Sign in to continue.");
    if (res.status === 429) throw new Error("Too many searches. Wait a moment and try again.");
    throw new Error(`Business search failed (${res.status})`);
  }

  const json = (await res.json()) as {
    success: boolean;
    error?: string;
    results?: FinderSearchResult[];
    nextPageToken?: string | null;
  };
  if (!json.success) throw new Error(json.error || "Business search failed");

  return { results: json.results ?? [], nextPageToken: json.nextPageToken ?? null };
}

export async function geocodeAddress(
  address: string,
): Promise<{
  place_id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
} | null> {
  if (!address.trim()) return null;
  const res = await fetch(
    `/api/places/geocode?address=${encodeURIComponent(address.trim())}`,
    { headers: await authHeaders() },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as {
    success: boolean;
    result?: { place_id: string; formatted_address: string; latitude: number; longitude: number };
  };
  return json.success ? json.result ?? null : null;
}

/* ---------- formatting helpers ---------- */

export function formatValue(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "—";
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(v);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}