// Proxy for Google Places API (New) Text Search — Lead Finder backend.
//
// Security & cost guards:
//   * Requires a valid Supabase admin session (JWT) — enforced in production.
//   * Per-IP rate limit (Cache API counter) so the Places quota can't be drained.
//   * The Places API key stays server-side (env var PLACES_API_KEY).
//
// Endpoints (same-origin, all under /api/places):
//   GET /api/places/search?q=&lat=&lon=&radius=&type=&pageToken=
//   GET /api/places/geocode?address=
interface Env {
  PLACES_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const ADMIN_SUPABASE_URL = "https://sriwrevcvwrzkgppzvst.supabase.co";
const ADMIN_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaXdyZXZjdndyemtncHB6dnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjE4NTcsImV4cCI6MjEwMjE5Nzg1N30.jsBudnBdVjhGGqyd9HxBHuepjnqo_lD7H9uwtyjkHX8";

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

const RATE_LIMIT_PER_MINUTE = 30;

/* ---------- helpers ---------- */

function normalize(p: any) {
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

async function getAuthUser(token: string, env: Env): Promise<{ id: string } | null> {
  if (!token) return null;
  const url = env.SUPABASE_URL || ADMIN_SUPABASE_URL;
  const anon = env.SUPABASE_ANON_KEY || ADMIN_ANON_KEY;
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

async function rateLimitHit(request: Request, limit = RATE_LIMIT_PER_MINUTE): Promise<boolean> {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const minute = Math.floor(Date.now() / 60000);
  const key = `https://ratelimit.local/${ip}/${minute}`;
  try {
    const cache = (caches as any).default;
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

async function searchPlaces(
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
      "X-Goog-Api-Key": env.PLACES_API_KEY || "",
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

async function geocodeAddress(env: Env, address: string) {
  const body = { textQuery: address, pageSize: 1 };
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.PLACES_API_KEY || "",
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

async function logSearch(
  env: Env,
  token: string,
  query: string,
  category: string | null,
  count: number
): Promise<void> {
  try {
    const url = env.SUPABASE_URL || ADMIN_SUPABASE_URL;
    const anon = env.SUPABASE_ANON_KEY || ADMIN_ANON_KEY;
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

/* ---------- request handlers ---------- */

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
  waitUntil?: (p: Promise<any>) => void;
}) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);

    const auth = request.headers.get("Authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    const user = await getAuthUser(token, env);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized. Sign in to the admin console." }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    if (await rateLimitHit(request)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Too many searches. Wait a moment and try again.",
        }),
        { status: 429, headers: CORS_HEADERS }
      );
    }

    const apiKey = env.PLACES_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "PLACES_API_KEY is not configured on the server.",
        }),
        { status: 500, headers: CORS_HEADERS }
      );
    }

    /* ---- search ---- */
    if (url.pathname.endsWith("/search")) {
      const q = (url.searchParams.get("q") || "").trim();
      if (!q) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing query." }),
          { status: 400, headers: CORS_HEADERS }
        );
      }
      const lat = parseFloat(url.searchParams.get("lat") || "");
      const lon = parseFloat(url.searchParams.get("lon") || "");
      const radius = parseFloat(url.searchParams.get("radius") || "5");
      const type = url.searchParams.get("type") || undefined;
      const pageToken = url.searchParams.get("pageToken") || undefined;

      const { results, nextPageToken } = await searchPlaces(env, {
        q,
        lat,
        lon,
        radiusKm: radius,
        type,
        pageToken,
      });

      const count = results.length;
      const logP = logSearch(env, token, q, type || null, count);
      if (context.waitUntil) context.waitUntil(logP);
      else logP.catch(() => {});

      return new Response(
        JSON.stringify({ success: true, results, nextPageToken }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    /* ---- geocode ---- */
    if (url.pathname.endsWith("/geocode")) {
      const address = (url.searchParams.get("address") || "").trim();
      if (!address) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing address." }),
          { status: 400, headers: CORS_HEADERS }
        );
      }
      const hit = await geocodeAddress(env, address);
      return new Response(
        JSON.stringify({ success: !!hit, result: hit }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Unknown endpoint." }),
      { status: 404, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("Places proxy exception:", err);
    const status = err?.status && err.status >= 400 && err.status < 600 ? err.status : 502;
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || "Places proxy failed",
      }),
      { status, headers: CORS_HEADERS }
    );
  }
}