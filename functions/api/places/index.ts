import {
  CORS_HEADERS,
  Env,
  getAuthUser,
  rateLimitHit,
  searchPlaces,
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
    const q = (url.searchParams.get("q") || "").trim();

    if (!q) {
      return new Response(
        JSON.stringify({
          success: true,
          service: "LANGRATIA Places Gateway",
          status: "online",
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

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

    const { results, nextPageToken } = await searchPlaces(env, { q });
    return new Response(
      JSON.stringify({ success: true, results, nextPageToken }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Places proxy failed" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
