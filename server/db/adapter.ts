import type { Context } from "hono";
import { getEnv } from "../env";

export interface DataContext {
  c?: Context;
}

// In-memory fallbacks for tables not yet created in remote DB
const inMemoryInquiries: any[] = [];
const inMemoryBookings: any[] = [];
const inMemoryThreads: any[] = [];
const inMemoryMessages: any[] = [];

export function computeLeadScore(lead: any): number {
  let score = 0;
  const category = (lead.category || "").toLowerCase();
  const address = (lead.address || "").toLowerCase();

  const targetCategories = [
    "pharmacy", "clinic", "hospital", "school", "church",
    "retail", "hotel", "restaurant", "hardware", "shop",
  ];
  const targetAreas = [
    "kampala", "ntinda", "wakiso", "entebbe", "kawempe", "makerere",
    "muyenga", "kansanga", "bugolobi", "nakawa", "lugogo",
  ];

  if (targetCategories.some((c) => category.includes(c))) score += 20;
  if (targetAreas.some((a) => address.includes(a))) score += 15;
  if (lead.phone || lead.whatsapp) score += 10;
  if (lead.email) score += 10;
  if (lead.website) score += 5;
  if (lead.interested_product || lead.interestedProduct) score += 20;
  const tags = lead.tags || [];
  if (Array.isArray(tags) && tags.length > 1) score += 5;
  if (Array.isArray(tags) && tags.some((t: string) => (t || "").toLowerCase().includes("branch"))) score += 15;

  return Math.min(score, 100);
}

export function getDataAdapter(c?: Context) {
  const supabaseUrl = getEnv(c, "SUPABASE_URL", "https://sriwrevcvwrzkgppzvst.supabase.co");
  const secretKey = getEnv(c, "SUPABASE_SERVICE_ROLE_KEY", "");

  async function postgrest<T = any>(
    path: string,
    options?: {
      method?: string;
      body?: any;
      prefer?: string;
    }
  ): Promise<{ data: T | null; error: any }> {
    const method = options?.method || "GET";
    const headers: Record<string, string> = {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(options?.prefer ? { Prefer: options.prefer } : {}),
    };

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(8000),
      });

      if (res.status === 204) {
        return { data: null, error: null };
      }

      const text = await res.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }

      if (!res.ok) {
        return { data: null, error: parsed };
      }

      return { data: parsed as T, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  return {
    postgrest,

    leads: {
      async list() {
        const { data, error } = await postgrest<any[]>("leads?select=*&order=created_at.desc&limit=1000");
        if (error) throw new Error(error.message || "Failed to fetch leads");
        return data || [];
      },

      async get(id: string) {
        const { data, error } = await postgrest<any[]>(`leads?id=eq.${id}&select=*`);
        if (error) throw new Error(error.message || "Failed to fetch lead");
        const lead = data?.[0] || null;
        if (!lead) return null;

        // Fetch followups and activities concurrently
        const [followupsRes, activitiesRes] = await Promise.all([
          postgrest<any[]>(`lead_followups?lead_id=eq.${id}&order=followup_date.desc`),
          postgrest<any[]>(`lead_activities?lead_id=eq.${id}&order=created_at.desc`),
        ]);

        return {
          lead,
          followups: followupsRes.data || [],
          activities: activitiesRes.data || [],
        };
      },

      async create(input: any, createdBy?: string) {
        const score = computeLeadScore(input);
        const record = {
          business_name: input.business_name || input.businessName,
          category: input.category || null,
          contact_person: input.contact_person || input.contactPerson || null,
          phone: input.phone || null,
          whatsapp: input.whatsapp || null,
          email: input.email || null,
          website: input.website || null,
          address: input.address || null,
          latitude: input.latitude ? Number(input.latitude) : null,
          longitude: input.longitude ? Number(input.longitude) : null,
          place_id: input.place_id || input.placeId || null,
          rating: input.rating ? Number(input.rating) : null,
          review_count: input.review_count || input.reviewCount ? Number(input.review_count || input.reviewCount) : null,
          interested_product: input.interested_product || input.interestedProduct || null,
          lead_source: input.lead_source || input.leadSource || "Manual Entry",
          status: input.status || "New",
          priority: input.priority || "Medium",
          lead_score: score,
          estimated_value: input.estimated_value || input.estimatedValue ? Number(input.estimated_value || input.estimatedValue) : null,
          assigned_to: input.assigned_to || input.assignedTo || null,
          tags: input.tags || [],
          notes: input.notes || null,
          next_followup_date: input.next_followup_date || input.nextFollowupDate || null,
          next_followup_time: input.next_followup_time || input.nextFollowupTime || null,
          followup_method: input.followup_method || input.followupMethod || null,
          created_by: createdBy || null,
        };

        const { data, error } = await postgrest<any[]>("leads", {
          method: "POST",
          body: record,
          prefer: "return=representation",
        });

        if (error) throw new Error(error.message || "Failed to create lead");
        const created = data?.[0];

        if (created?.id) {
          // Log creation activity
          await postgrest("lead_activities", {
            method: "POST",
            body: {
              lead_id: created.id,
              activity_type: "Note",
              description: "Lead created",
              created_by: createdBy || null,
            },
          }).catch(() => {});
        }

        return created;
      },

      async update(id: string, updates: any) {
        // If details affect scoring, compute new score
        const score = computeLeadScore(updates);
        const patch: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (updates.business_name !== undefined) patch.business_name = updates.business_name;
        if (updates.category !== undefined) patch.category = updates.category;
        if (updates.contact_person !== undefined) patch.contact_person = updates.contact_person;
        if (updates.phone !== undefined) patch.phone = updates.phone;
        if (updates.whatsapp !== undefined) patch.whatsapp = updates.whatsapp;
        if (updates.email !== undefined) patch.email = updates.email;
        if (updates.website !== undefined) patch.website = updates.website;
        if (updates.address !== undefined) patch.address = updates.address;
        if (updates.latitude !== undefined) patch.latitude = updates.latitude ? Number(updates.latitude) : null;
        if (updates.longitude !== undefined) patch.longitude = updates.longitude ? Number(updates.longitude) : null;
        if (updates.place_id !== undefined) patch.place_id = updates.place_id;
        if (updates.rating !== undefined) patch.rating = updates.rating ? Number(updates.rating) : null;
        if (updates.review_count !== undefined) patch.review_count = updates.review_count ? Number(updates.review_count) : null;
        if (updates.interested_product !== undefined) patch.interested_product = updates.interested_product;
        if (updates.lead_source !== undefined) patch.lead_source = updates.lead_source;
        if (updates.status !== undefined) patch.status = updates.status;
        if (updates.priority !== undefined) patch.priority = updates.priority;
        if (updates.lead_score !== undefined) {
          patch.lead_score = Number(updates.lead_score);
        } else {
          patch.lead_score = score;
        }
        if (updates.estimated_value !== undefined) patch.estimated_value = updates.estimated_value ? Number(updates.estimated_value) : null;
        if (updates.assigned_to !== undefined) patch.assigned_to = updates.assigned_to;
        if (updates.tags !== undefined) patch.tags = updates.tags;
        if (updates.notes !== undefined) patch.notes = updates.notes;
        if (updates.next_followup_date !== undefined) patch.next_followup_date = updates.next_followup_date;
        if (updates.next_followup_time !== undefined) patch.next_followup_time = updates.next_followup_time;
        if (updates.followup_method !== undefined) patch.followup_method = updates.followup_method;

        const { data, error } = await postgrest<any[]>(`leads?id=eq.${id}`, {
          method: "PATCH",
          body: patch,
          prefer: "return=representation",
        });

        if (error) throw new Error(error.message || "Failed to update lead");
        return data?.[0];
      },

      async bulkUpdate(ids: string[], updates: any) {
        if (!ids.length) return;
        const patch: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.status !== undefined) patch.status = updates.status;
        if (updates.priority !== undefined) patch.priority = updates.priority;
        if (updates.assigned_to !== undefined) patch.assigned_to = updates.assigned_to;

        const { error } = await postgrest(`leads?id=in.(${ids.join(",")})`, {
          method: "PATCH",
          body: patch,
        });

        if (error) throw new Error(error.message || "Failed to bulk update leads");
      },

      async delete(id: string) {
        // Cascade delete child activities and followups
        await postgrest(`lead_activities?lead_id=eq.${id}`, { method: "DELETE" }).catch(() => {});
        await postgrest(`lead_followups?lead_id=eq.${id}`, { method: "DELETE" }).catch(() => {});

        const { error } = await postgrest(`leads?id=eq.${id}`, { method: "DELETE" });
        if (error) throw new Error(error.message || "Failed to delete lead");
      },

      async convertToCustomer(id: string, customerData: any, convertedBy?: string) {
        // 1. Fetch current lead
        const { data: leadData } = await postgrest<any[]>(`leads?id=eq.${id}&select=*`);
        const lead = leadData?.[0];
        if (!lead) throw new Error("Lead not found");

        const now = new Date().toISOString();

        // 2. Insert into customers table
        const customerRecord = {
          lead_id: id,
          business_name: customerData.business_name || lead.business_name,
          category: customerData.category || lead.category,
          contact_person: customerData.contact_person || lead.contact_person,
          phone: customerData.phone || lead.phone,
          email: customerData.email || lead.email,
          website: customerData.website || lead.website,
          address: customerData.address || lead.address,
          latitude: customerData.latitude ?? lead.latitude,
          longitude: customerData.longitude ?? lead.longitude,
          interested_product: customerData.interested_product || lead.interested_product,
          estimated_value: customerData.estimated_value ?? lead.estimated_value,
          converted_by: convertedBy || null,
          converted_at: now,
        };

        const { data: customerRows, error: custErr } = await postgrest<any[]>("customers", {
          method: "POST",
          body: customerRecord,
          prefer: "return=representation",
        });

        if (custErr) throw new Error(custErr.message || "Failed to create customer");
        const customer = customerRows?.[0];

        // 3. Mark lead as Won
        await postgrest(`leads?id=eq.${id}`, {
          method: "PATCH",
          body: {
            status: "Won",
            customer_id: customer?.id || null,
            converted_at: now,
            updated_at: now,
          },
        });

        // 4. Record activity
        await postgrest("lead_activities", {
          method: "POST",
          body: {
            lead_id: id,
            activity_type: "Conversion",
            description: `Converted to customer: ${customerRecord.business_name}`,
            created_by: convertedBy || null,
          },
        }).catch(() => {});

        return { customer, leadId: id };
      },

      async importPlaces(places: any[], createdBy?: string) {
        if (!places || !places.length) return { imported: 0, skipped: 0 };

        // Fetch existing place_ids to prevent duplicates
        const { data: existingLeads } = await postgrest<any[]>("leads?select=place_id,business_name&limit=5000");
        const existingPlaceIds = new Set((existingLeads || []).map((l) => l.place_id).filter(Boolean));
        const existingNames = new Set((existingLeads || []).map((l) => (l.business_name || "").toLowerCase().trim()));

        let imported = 0;
        let skipped = 0;

        for (const p of places) {
          const placeId = p.place_id || null;
          const name = (p.business_name || "").trim();

          if ((placeId && existingPlaceIds.has(placeId)) || existingNames.has(name.toLowerCase())) {
            skipped++;
            continue;
          }

          const record = {
            business_name: name || "Unnamed Place",
            category: p.category || null,
            phone: p.phone || null,
            website: p.website || null,
            address: p.address || null,
            latitude: p.latitude ? Number(p.latitude) : null,
            longitude: p.longitude ? Number(p.longitude) : null,
            place_id: placeId,
            rating: p.rating ? Number(p.rating) : null,
            review_count: p.reviews ? Number(p.reviews) : null,
            lead_source: "Google Places",
            status: "New",
            priority: "Medium",
            lead_score: computeLeadScore(p),
            created_by: createdBy || null,
          };

          const { error } = await postgrest("leads", {
            method: "POST",
            body: record,
          });

          if (!error) {
            imported++;
            if (placeId) existingPlaceIds.add(placeId);
            existingNames.add(name.toLowerCase());
          } else {
            skipped++;
          }
        }

        return { imported, skipped };
      },
    },

    followups: {
      async list(leadId?: string) {
        const query = leadId
          ? `lead_followups?lead_id=eq.${leadId}&order=followup_date.desc`
          : `lead_followups?order=followup_date.desc&limit=500`;

        const { data, error } = await postgrest<any[]>(query);
        if (error) throw new Error(error.message || "Failed to fetch followups");
        return data || [];
      },

      async create(input: any, createdBy?: string) {
        const record = {
          lead_id: input.lead_id || input.leadId,
          followup_date: input.followup_date || input.followupDate,
          followup_time: input.followup_time || input.followupTime || null,
          method: input.method || null,
          notes: input.notes || null,
          assigned_to: input.assigned_to || input.assignedTo || null,
          completed: false,
          created_by: createdBy || null,
        };

        const { data, error } = await postgrest<any[]>("lead_followups", {
          method: "POST",
          body: record,
          prefer: "return=representation",
        });

        if (error) throw new Error(error.message || "Failed to create followup");
        return data?.[0];
      },

      async update(id: string, updates: any) {
        const patch: Record<string, any> = {};
        if (updates.followup_date !== undefined) patch.followup_date = updates.followup_date;
        if (updates.followup_time !== undefined) patch.followup_time = updates.followup_time;
        if (updates.method !== undefined) patch.method = updates.method;
        if (updates.notes !== undefined) patch.notes = updates.notes;
        if (updates.assigned_to !== undefined) patch.assigned_to = updates.assigned_to;
        if (updates.completed !== undefined) {
          patch.completed = Boolean(updates.completed);
          if (patch.completed) {
            patch.completed_at = new Date().toISOString();
          } else {
            patch.completed_at = null;
          }
        }

        const { data, error } = await postgrest<any[]>(`lead_followups?id=eq.${id}`, {
          method: "PATCH",
          body: patch,
          prefer: "return=representation",
        });

        if (error) throw new Error(error.message || "Failed to update followup");
        return data?.[0];
      },

      async delete(id: string) {
        const { error } = await postgrest(`lead_followups?id=eq.${id}`, { method: "DELETE" });
        if (error) throw new Error(error.message || "Failed to delete followup");
      },
    },

    activities: {
      async list(leadId?: string) {
        const query = leadId
          ? `lead_activities?lead_id=eq.${leadId}&order=created_at.desc`
          : `lead_activities?order=created_at.desc&limit=500`;

        const { data, error } = await postgrest<any[]>(query);
        if (error) throw new Error(error.message || "Failed to fetch activities");
        return data || [];
      },

      async create(input: any, createdBy?: string) {
        const record = {
          lead_id: input.lead_id || input.leadId,
          activity_type: input.activity_type || input.activityType || "Note",
          description: input.description || null,
          created_by: createdBy || null,
        };

        const { data, error } = await postgrest<any[]>("lead_activities", {
          method: "POST",
          body: record,
          prefer: "return=representation",
        });

        if (error) throw new Error(error.message || "Failed to create activity");
        return data?.[0];
      },
    },

    customers: {
      async list() {
        const { data, error } = await postgrest<any[]>("customers?select=*&order=created_at.desc&limit=500");
        if (error) throw new Error(error.message || "Failed to fetch customers");
        return data || [];
      },

      async get(id: string) {
        const { data, error } = await postgrest<any[]>(`customers?id=eq.${id}&select=*`);
        if (error) throw new Error(error.message || "Failed to fetch customer");
        return data?.[0] || null;
      },
    },

    searchLogs: {
      async create(input: any, createdBy?: string) {
        const record = {
          query: input.query,
          category: input.category || null,
          results_count: input.results_count ?? input.resultsCount ?? 0,
          source: input.source || "Google Places",
          created_by: createdBy || null,
        };

        await postgrest("search_logs", {
          method: "POST",
          body: record,
        }).catch(() => {});
      },
    },

    inquiries: {
      async list() {
        // Try remote table, fall back to in-memory
        const { data, error } = await postgrest<any[]>("inquiries?select=*&order=created_at.desc&limit=200");
        if (!error && data) return data;
        return inMemoryInquiries;
      },

      async create(input: any) {
        const record = {
          id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          full_name: input.fullName || input.full_name,
          email: input.email,
          phone: input.phone || null,
          company: input.company || null,
          category: input.category || null,
          project_description: input.projectDescription || input.project_description || "",
          nda_requested: Boolean(input.ndaRequested || input.nda_requested),
          source: input.source || "/contact",
          status: "NEW",
          internal_notes: null,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await postgrest<any[]>("inquiries", {
          method: "POST",
          body: record,
          prefer: "return=representation",
        });

        if (!error && data?.[0]) return data[0];

        inMemoryInquiries.unshift(record);
        return record;
      },

      async update(id: string, updates: any) {
        const patch: Record<string, any> = {};
        if (updates.status) patch.status = updates.status;
        if (updates.internal_notes !== undefined) patch.internal_notes = updates.internal_notes;

        const { data, error } = await postgrest<any[]>(`inquiries?id=eq.${id}`, {
          method: "PATCH",
          body: patch,
          prefer: "return=representation",
        });

        if (!error && data?.[0]) return data[0];

        const item = inMemoryInquiries.find((i) => i.id === id);
        if (item) {
          Object.assign(item, patch);
          return item;
        }
        return null;
      },
    },

    email: {
      async getThread(email: string) {
        const { data, error } = await postgrest<any[]>(
          `email_threads?participant_email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=1`
        );

        if (!error && data?.[0]) {
          const thread = data[0];
          const { data: messages } = await postgrest<any[]>(
            `email_messages?thread_id=eq.${thread.id}&order=created_at.asc`
          );
          return { thread, messages: messages || [] };
        }

        const memThread = inMemoryThreads.find((t) => t.participant_email === email);
        if (memThread) {
          const messages = inMemoryMessages.filter((m) => m.thread_id === memThread.id);
          return { thread: memThread, messages };
        }

        return { thread: null, messages: [] };
      },

      async saveThreadAndMessage(input: {
        threadId?: string;
        leadId?: string;
        subject: string;
        toEmail: string;
        fromEmail: string;
        participantEmail?: string;
        direction?: "INBOUND" | "OUTBOUND";
        bodyText?: string;
        bodyHtml?: string;
        messageId?: string | null;
        userId?: string | null;
      }) {
        let activeThreadId = input.threadId;
        const participant =
          input.participantEmail ||
          (input.direction === "INBOUND" ? input.fromEmail : input.toEmail);

        if (!activeThreadId) {
          const newThread = {
            id: `th_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            lead_id: input.leadId && !input.leadId.startsWith("inq_") ? input.leadId : null,
            subject: input.subject,
            participant_email: participant,
            status: "OPEN",
            created_at: new Date().toISOString(),
          };

          const { data: threadRes } = await postgrest<any[]>("email_threads", {
            method: "POST",
            body: newThread,
            prefer: "return=representation",
          });

          if (threadRes?.[0]?.id) {
            activeThreadId = threadRes[0].id;
          } else {
            inMemoryThreads.unshift(newThread);
            activeThreadId = newThread.id;
          }
        }

        const msgRecord = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          thread_id: activeThreadId,
          direction: input.direction || "OUTBOUND",
          from_email: input.fromEmail,
          to_email: input.toEmail,
          body_text: input.bodyText || "",
          body_html: input.bodyHtml || null,
          message_id: input.messageId || null,
          created_by: input.userId || null,
          created_at: new Date().toISOString(),
        };

        const { data: msgRes } = await postgrest<any[]>("email_messages", {
          method: "POST",
          body: msgRecord,
          prefer: "return=representation",
        });

        const savedMsg = msgRes?.[0] || msgRecord;
        if (!msgRes?.[0]) {
          inMemoryMessages.push(msgRecord);
        }

        return { threadId: activeThreadId, message: savedMsg };
      },
    },
  };
}
