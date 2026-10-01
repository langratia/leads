import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const PLACES_FIELD_MASK = [
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

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "places-dev-proxy",
        configureServer(server) {
          server.middlewares.use("/api/places", async (req, res) => {
            const apiKey = env.PLACES_API_KEY;
            res.setHeader("Content-Type", "application/json");
            if (!apiKey) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  success: false,
                  error: "PLACES_API_KEY is not set. Add it to .env",
                })
              );
              return;
            }
            try {
              const url = new URL(req.url || "/", "http://localhost");
              const pathName = url.pathname;
              const callGoogle = async (body: Record<string, any>, fieldMask: string) => {
                const upstream = await fetch(
                  "https://places.googleapis.com/v1/places:searchText",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "X-Goog-Api-Key": apiKey,
                      "X-Goog-FieldMask": fieldMask,
                    },
                    body: JSON.stringify(body),
                  }
                );
                const data: any = await upstream.json();
                if (!upstream.ok) {
                  const err: any = new Error(data?.error?.message || "Places API error");
                  err.status = upstream.status;
                  throw err;
                }
                return data;
              };

              /* ---- geocode ---- */
              if (pathName.endsWith("/geocode")) {
                const address = (url.searchParams.get("address") || "").trim();
                if (!address) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, error: "Missing address." }));
                  return;
                }
                const data = await callGoogle(
                  { textQuery: address, pageSize: 1 },
                  "places.id,places.formattedAddress,places.location"
                );
                const p = data.places?.[0];
                if (!p?.location) {
                  res.end(JSON.stringify({ success: false, result: null }));
                  return;
                }
                res.end(
                  JSON.stringify({
                    success: true,
                    result: {
                      place_id: p.id,
                      formatted_address: p.formattedAddress || address,
                      latitude: p.location.latitude,
                      longitude: p.location.longitude,
                    },
                  })
                );
                return;
              }

              /* ---- search ---- */
              const q = (url.searchParams.get("q") || "").trim();
              if (!q) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: "Missing query." }));
                return;
              }
              const lat = parseFloat(url.searchParams.get("lat") || "");
              const lon = parseFloat(url.searchParams.get("lon") || "");
              const radiusKm = parseFloat(url.searchParams.get("radius") || "5");
              const type = url.searchParams.get("type") || undefined;
              const pageToken = url.searchParams.get("pageToken") || undefined;

              const body: Record<string, any> = { textQuery: q, pageSize: 20 };
              if (type) body.includedType = type;
              if (pageToken) body.pageToken = pageToken;
              if (!isNaN(lat) && !isNaN(lon)) {
                body.locationBias = {
                  circle: {
                    center: { latitude: lat, longitude: lon },
                    radius: (isNaN(radiusKm) ? 5 : Math.max(radiusKm, 1)) * 1000,
                  },
                };
              }
              const data = await callGoogle(body, PLACES_FIELD_MASK);
              const results = (data.places || []).map((p: any) => ({
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
              }));
              res.end(
                JSON.stringify({
                  success: true,
                  results,
                  nextPageToken: data.nextPageToken || null,
                })
              );
            } catch (err: any) {
              res.statusCode = err?.status && err.status >= 400 && err.status < 600 ? err.status : 502;
              res.end(JSON.stringify({ success: false, error: err?.message || "Places proxy failed" }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5174,
      host: "0.0.0.0",
    },
  };
});
