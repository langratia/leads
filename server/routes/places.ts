import { Hono } from "hono";
import { authMiddleware, getAuthUser } from "../middleware/auth";
import { getEnv } from "../env";
import { getDataAdapter } from "../db/adapter";

export const placesRouter = new Hono();

placesRouter.use("*", authMiddleware);

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

// GET /api/places/search?q=...&lat=...&lon=...&radius=...&type=...&pageToken=...
placesRouter.get("/search", async (c) => {
  const apiKey = getEnv(c, "PLACES_API_KEY");
  if (!apiKey) {
    return c.json({ success: false, error: "PLACES_API_KEY is not configured on server" }, 500);
  }

  const q = (c.req.query("q") || "").trim();
  if (!q) {
    return c.json({ success: false, error: "Missing search query." }, 400);
  }

  const lat = parseFloat(c.req.query("lat") || "");
  const lon = parseFloat(c.req.query("lon") || "");
  const radiusKm = parseFloat(c.req.query("radius") || "5");
  const type = c.req.query("type");
  const pageToken = c.req.query("pageToken");

  const body: Record<string, any> = { textQuery: q, pageSize: 20 };
  if (type) body.includedType = type;
  if (pageToken) body.pageToken = pageToken;
  if (!isNaN(lat) && !isNaN(lon)) {
    body.locationBias = {
      circle: {
        center: { latitude: lat, longitude: lon },
        radius: (isNaN(radiusKm) || !radiusKm ? 5 : Math.max(radiusKm, 1)) * 1000,
      },
    };
  }

  try {
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
      return c.json({ success: false, error: data?.error?.message || "Places API error" }, res.status as any);
    }

    const results = (data.places || []).map(normalize);
    const npt = data.nextPageToken || null;

    // Log search analytics in background
    try {
      const adapter = getDataAdapter(c);
      await adapter.searchLogs.create({
        query: q,
        category: type || null,
        results_count: results.length,
      });
    } catch {
      // analytics best effort
    }

    return c.json({ success: true, results, nextPageToken: npt });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// GET /api/places/geocode?address=...
placesRouter.get("/geocode", async (c) => {
  const apiKey = getEnv(c, "PLACES_API_KEY");
  if (!apiKey) {
    return c.json({ success: false, error: "PLACES_API_KEY is not configured on server" }, 500);
  }

  const address = (c.req.query("address") || "").trim();
  if (!address) {
    return c.json({ success: false, error: "Missing address." }, 400);
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.formattedAddress,places.location",
      },
      body: JSON.stringify({ textQuery: address, pageSize: 1 }),
    });

    const data: any = await res.json();
    if (!res.ok || !data.places?.[0]?.location) {
      return c.json({ success: false, result: null });
    }

    const p = data.places[0];
    return c.json({
      success: true,
      result: {
        place_id: p.id,
        formatted_address: p.formattedAddress || address,
        latitude: p.location.latitude,
        longitude: p.location.longitude,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
