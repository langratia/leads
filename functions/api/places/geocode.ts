import { CORS_HEADERS, Env, getAuthUser, rateLimitHit } from "./_shared";
import { errorStatus, handlePlaces } from "./_handler";

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

    const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!(await getAuthUser(token, env))) {
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

    const { status, body } = await handlePlaces("geocode", url.searchParams, env);
    return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("Geocoding exception:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Geocoding failed" }),
      { status: errorStatus(err), headers: CORS_HEADERS }
    );
  }
}
