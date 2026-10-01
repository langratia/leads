/* Record shapes mirroring the Postgres tables in supabase/migrations. */

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
