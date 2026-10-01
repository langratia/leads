import { CORS_HEADERS, Env, getAuthUser, rateLimitHit, logSearch } from "./_shared";
import { errorStatus, handlePlaces, searchMeta } from "./_handler";

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

    const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!(await getAuthUser(token, env))) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized. Sign in to the CRM." }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    if (await rateLimitHit(request)) {
      return new Response(
        JSON.stringify({ success: false, error: "Too many searches. Wait a moment and try again." }),
        { status: 429, headers: CORS_HEADERS }
      );
    }

    const { status, body } = await handlePlaces("search", url.searchParams, env);
    if (status === 200) {
      const meta = searchMeta(url.searchParams, body.results);
      const logP = logSearch(env, token, meta.query, meta.category, meta.count);
      if (context.waitUntil) context.waitUntil(logP);
      else logP.catch(() => {});
    }
    return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("Places search error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Places search failed" }),
      { status: errorStatus(err), headers: CORS_HEADERS }
    );
  }
}
