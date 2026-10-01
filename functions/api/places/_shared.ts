// Shared utilities for Google Places API proxy

export interface Env {
  PLACES_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

export const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const DEFAULT_SUPABASE_URL = "https://sriwrevcvwrzkgppzvst.supabase.co";
export const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaXdyZXZjdndyemtncHB6dnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjE4NTcsImV4cCI6MjEwMjE5Nzg1N30.jsBudnBdVjhGGqyd9HxBHuepjnqo_lD7H9uwtyjkHX8";
export const DEFAULT_PLACES_API_KEY = "AIzaSyCf_-OtSx1IE7QD3StAuDGX-abzQzh8EyA";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.location",
  "places.types",
  "places.rating",
  "places.userRatingCount",
  "nextPageToken",
].join(",");

const RATE_LIMIT_PER_MINUTE = 60;

export function normalize(p: any) {
  return {
    place_id: p.id,
    business_name: p.displayName?.text || "Unnamed business",
    category: (p.types || []).slice(0, 2).join(", ") || null,
    phone: p.internationalPhoneNumber || null,
    website: p.websiteUri || null,
    address: p.formattedAddress || "",
    rating: p.rating ?? null,
    reviews: p.userRatingCount ?? null,
    latitude: p.location?.latitude ?? null,
    longitude: p.location?.longitude ?? null,
  };
}

export async function getAuthUser(token: string, env: Env): Promise<{ id: string } | null> {
  if (!token) return null;
  // Support dev bypass token
  if (token === "dev-token" || token === "dev-bypass") {
    return { id: "dev-user" };
  }

  const url = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anon = env.SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    return data?.id ? { id: data.id } : null;
  } catch {
    return null;
  }
}

export async function rateLimitHit(request: Request, limit = RATE_LIMIT_PER_MINUTE): Promise<boolean> {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const minute = Math.floor(Date.now() / 60000);
  const key = `https://ratelimit.local/${ip}/${minute}`;
  try {
    const cache = (caches as any).default;
    if (!cache) return false;
    const cached = await cache.match(key);
    const count = cached ? Number(await cached.text()) + 1 : 1;
    if (count > limit) return true;
    await cache.put(
      key,
      new Response(String(count), { headers: { "Cache-Control": "max-age=60" } })
    );
  } catch {
    /* cache unavailable — fail open */
  }
  return false;
}

export async function searchPlaces(
  env: Env,
  opts: {
    q: string;
    lat?: number;
    lon?: number;
    radiusKm?: number;
    type?: string;
    pageToken?: string;
  }
): Promise<{ results: any[]; nextPageToken: string | null }> {
  const apiKey = env.PLACES_API_KEY || DEFAULT_PLACES_API_KEY;
  const body: Record<string, any> = { textQuery: opts.q, pageSize: 20 };
  if (opts.type) body.includedType = opts.type;
  if (opts.pageToken) body.pageToken = opts.pageToken;
  if (opts.lat != null && opts.lon != null && !isNaN(opts.lat) && !isNaN(opts.lon)) {
    body.locationBias = {
      circle: {
        center: { latitude: opts.lat, longitude: opts.lon },
        radius: (isNaN(opts.radiusKm ?? NaN) || !opts.radiusKm ? 5 : Math.max(opts.radiusKm, 1)) * 1000,
      },
    };
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  const data: any = await res.json();
  if (!res.ok) {
    const err: any = new Error(data?.error?.message || "Places API error");
    err.status = res.status;
    throw err;
  }
  return {
    results: (data.places || []).map(normalize),
    nextPageToken: data.nextPageToken || null,
  };
}

export async function geocodeAddress(env: Env, address: string) {
  const apiKey = env.PLACES_API_KEY || DEFAULT_PLACES_API_KEY;
  const body = { textQuery: address, pageSize: 1 };
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.formattedAddress,places.location",
    },
    body: JSON.stringify(body),
  });
  const data: any = await res.json();
  if (!res.ok || !data.places?.[0]?.location) return null;
  const p = data.places[0];
  return {
    place_id: p.id,
    formatted_address: p.formattedAddress || address,
    latitude: p.location.latitude,
    longitude: p.location.longitude,
  };
}

export async function logSearch(
  env: Env,
  token: string,
  query: string,
  category: string | null,
  count: number
): Promise<void> {
  try {
    const url = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const anon = env.SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
    await fetch(`${url}/rest/v1/search_logs`, {
      method: "POST",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        query,
        category,
        results_count: count,
      }),
    });
  } catch {
    /* analytics are best-effort */
  }
}
