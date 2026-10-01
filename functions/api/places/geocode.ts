import {
  CORS_HEADERS,
  Env,
  getAuthUser,
  rateLimitHit,
  geocodeAddress,
} from "./_shared";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
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
          error: "Too many geocoding requests. Wait a moment and try again.",
        }),
        { status: 429, headers: CORS_HEADERS }
      );
    }

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
  } catch (err: any) {
    console.error("Geocoding exception:", err);
    const status = err?.status && err.status >= 400 && err.status < 600 ? err.status : 502;
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || "Geocoding failed",
      }),
      { status, headers: CORS_HEADERS }
    );
  }
}
