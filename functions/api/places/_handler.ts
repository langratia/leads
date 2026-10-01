/* Request parsing and Google Places calls, shared by the Cloudflare Pages
   Functions in this directory and the Vite dev proxy in vite.config.ts.

   Keep this free of Workers-only APIs (caches, Request, waitUntil) so both
   runtimes can use it. Auth and rate limiting belong to the caller. */

import { geocodeAddress, searchPlaces, type Env } from "./_shared";

export type PlacesAction = "search" | "geocode";

export interface PlacesResponse {
  status: number;
  body: Record<string, any>;
}

export async function handlePlaces(
  action: PlacesAction,
  params: URLSearchParams,
  env: Env
): Promise<PlacesResponse> {
  if (action === "geocode") {
    const address = (params.get("address") || "").trim();
    if (!address) {
      return { status: 400, body: { success: false, error: "Missing address." } };
    }
    const result = await geocodeAddress(env, address);
    return { status: 200, body: { success: !!result, result } };
  }

  const q = (params.get("q") || "").trim();
  if (!q) {
    return { status: 400, body: { success: false, error: "Missing search query." } };
  }

  const { results, nextPageToken } = await searchPlaces(env, {
    q,
    lat: parseFloat(params.get("lat") || ""),
    lon: parseFloat(params.get("lon") || ""),
    radiusKm: parseFloat(params.get("radius") || "5"),
    type: params.get("type") || undefined,
    pageToken: params.get("pageToken") || undefined,
  });

  return { status: 200, body: { success: true, results, nextPageToken } };
}

/** Query parameters worth recording in search_logs for a given action. */
export function searchMeta(params: URLSearchParams, results: any[] | null) {
  return {
    query: (params.get("q") || "").trim(),
    category: params.get("type") || null,
    count: results?.length ?? 0,
  };
}

/** Upstream Google errors carry a status; anything else is a 502. */
export function errorStatus(err: any): number {
  return err?.status && err.status >= 400 && err.status < 600 ? err.status : 502;
}
