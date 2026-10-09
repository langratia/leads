/**
 * Client API Layer — replaces direct browser Supabase access.
 *
 * All frontend requests go through /api/* endpoints. No database credentials,
 * connection strings, or third-party BaaS SDKs are exposed to the client.
 */

const TOKEN_KEY = "leads_auth_token";

export function getAuthToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // If unauthorized, clear stale token
    clearAuthToken();
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = json?.error || json?.message || `Request failed (${res.status})`;
    throw new Error(errorMsg);
  }

  return json as T;
}

export const api = {
  auth: {
    async login(email: string, password: string) {
      const data = await apiFetch<{
        success: boolean;
        accessToken?: string;
        user?: { id: string; email: string };
        error?: string;
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (data.accessToken) {
        setAuthToken(data.accessToken);
      }
      return data;
    },

    async logout() {
      try {
        await apiFetch("/api/auth/logout", { method: "POST" });
      } finally {
        clearAuthToken();
      }
    },

    async getSession() {
      const token = getAuthToken();
      if (!token) return null;
      try {
        const data = await apiFetch<{
          success: boolean;
          user: { id: string; email: string };
        }>("/api/auth/me");
        return data.user ? { user: data.user } : null;
      } catch {
        return null;
      }
    },
  },

  leads: {
    async list() {
      const res = await apiFetch<{ success: boolean; leads: any[] }>("/api/leads");
      return res.leads;
    },

    async get(id: string) {
      const res = await apiFetch<{
        success: boolean;
        lead: any;
        activities: any[];
        followups: any[];
      }>(`/api/leads/${id}`);
      return res;
    },

    async create(input: any) {
      const res = await apiFetch<{ success: boolean; lead: any }>("/api/leads", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return res.lead;
    },

    async update(id: string, patch: any) {
      const res = await apiFetch<{ success: boolean; lead: any }>(`/api/leads/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      return res.lead;
    },

    async delete(id: string) {
      await apiFetch(`/api/leads/${id}`, { method: "DELETE" });
    },

    async bulkUpdate(ids: string[], patch: any) {
      await apiFetch("/api/leads/bulk", {
        method: "POST",
        body: JSON.stringify({ ids, patch }),
      });
    },

    async convert(id: string) {
      const res = await apiFetch<{ success: boolean; customer: any }>(
        `/api/leads/${id}/convert`,
        { method: "POST" }
      );
      return res.customer;
    },
  },

  activities: {
    async list(leadId: string) {
      const res = await apiFetch<{ success: boolean; activities: any[] }>(
        `/api/activities?leadId=${encodeURIComponent(leadId)}`
      );
      return res.activities;
    },

    async add(leadId: string, activityType: string, description?: string) {
      const res = await apiFetch<{ success: boolean; activity: any }>("/api/activities", {
        method: "POST",
        body: JSON.stringify({
          lead_id: leadId,
          activity_type: activityType,
          description,
        }),
      });
      return res.activity;
    },
  },

  followups: {
    async list(leadId?: string) {
      const endpoint = leadId
        ? `/api/followups?leadId=${encodeURIComponent(leadId)}`
        : "/api/followups";
      const res = await apiFetch<{ success: boolean; followups: any[] }>(endpoint);
      return res.followups;
    },

    async create(input: {
      lead_id: string;
      followup_date: string;
      followup_time?: string | null;
      method?: string | null;
      notes?: string | null;
      assigned_to?: string | null;
    }) {
      const res = await apiFetch<{ success: boolean; followup: any }>("/api/followups", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return res.followup;
    },

    async complete(id: string) {
      await apiFetch(`/api/followups/${id}/complete`, { method: "PATCH" });
    },

    async delete(id: string) {
      await apiFetch(`/api/followups/${id}`, { method: "DELETE" });
    },
  },

  inquiries: {
    async list() {
      const res = await apiFetch<{ success: boolean; inquiries: any[] }>("/api/inquiries");
      return res.inquiries;
    },

    async update(id: string, patch: any) {
      const res = await apiFetch<{ success: boolean; inquiry: any }>(`/api/inquiries/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      return res.inquiry;
    },

    async listBookings() {
      const res = await apiFetch<{ success: boolean; bookings: any[] }>(
        "/api/inquiries/bookings"
      );
      return res.bookings;
    },
  },

  email: {
    async getThread(participantEmail: string) {
      const res = await apiFetch<{
        success: boolean;
        thread: any;
        messages: any[];
      }>(`/api/email/threads?participantEmail=${encodeURIComponent(participantEmail)}`);
      return res;
    },

    async send(payload: {
      thread_id?: string | null;
      to_email: string;
      subject?: string;
      body_text?: string;
      body_html?: string;
      lead_id?: string | null;
    }) {
      return apiFetch("/api/email/send", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },

  agent: {
    async run(payload: {
      workflow?: string;
      query?: string;
      target_category?: string;
      target_area?: string;
      limit?: number;
      prompt?: string;
    }) {
      return apiFetch<{
        success: boolean;
        summary: string;
        steps: Array<{ step: number; action: string; detail: string; status: "completed" | "in_progress" | "failed"; timestamp: string }>;
        stats?: { imported: number; skipped: number };
        drafts?: any[];
        revivedCount?: number;
        error?: string;
      }>("/api/agent/run", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
};
