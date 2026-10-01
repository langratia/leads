/* Lead Finder — client for the server-side Google Places proxy.

   The API key never reaches the browser: /api/places/* is handled by a
   Cloudflare Pages Function in production and by a Vite dev proxy in dev. */

import { supabase } from "@/core/supabase";

/* ---------- Lead Finder (Google Places) ----------
   Interactive business search. The Places API key stays server-side:
   in dev, Vite proxies /api/places (see vite.config.ts); in production
   the Cloudflare Pages Functions in functions/api/places/ handle it.
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
    const token = session?.access_token || localStorage.getItem("leads_auth_token");
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
