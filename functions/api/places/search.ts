import {
  CORS_HEADERS,
  Env,
  getAuthUser,
  rateLimitHit,
  searchPlaces,
  logSearch,
} from "./_shared";

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
        JSON.stringify({ success: false, error: "Unauthorized. Sign in to the CRM." }),
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

    const q = (url.searchParams.get("q") || "").trim();
    if (!q) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing search query." }),
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
  } catch (err: any) {
    console.error("Places search error:", err);
    const status = err?.status && err.status >= 400 && err.status < 600 ? err.status : 502;
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || "Places search failed",
      }),
      { status, headers: CORS_HEADERS }
    );
  }
}
