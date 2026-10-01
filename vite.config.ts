import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { handlePlaces, errorStatus } from "./functions/api/places/_handler";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        /* Dev stand-in for the Cloudflare Pages Function in functions/api/places/.
           Both call the same handlePlaces(), so search and geocode behave
           identically in dev and production. Auth and rate limiting are
           production-only concerns and are not replicated here. */
        name: "places-dev-proxy",
        configureServer(server) {
          server.middlewares.use("/api/places", async (req, res) => {
            res.setHeader("Content-Type", "application/json");

            if (!env.PLACES_API_KEY) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({ success: false, error: "PLACES_API_KEY is not set. Add it to .env" })
              );
              return;
            }

            try {
              const url = new URL(req.url || "/", "http://localhost");
              const action = url.pathname.endsWith("/geocode") ? "geocode" : "search";
              const { status, body } = await handlePlaces(action, url.searchParams, env);
              res.statusCode = status;
              res.end(JSON.stringify(body));
            } catch (err: any) {
              res.statusCode = errorStatus(err);
              res.end(
                JSON.stringify({
                  success: false,
                  error: err?.message || "Places proxy failed",
                })
              );
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
    build: {
      rollupOptions: {
        output: {
          /* Everything shipped as one ~800 kB chunk, so any change to a single
             React component invalidated the whole bundle for every returning
             visitor. Splitting the vendors out means a code change re-downloads
             ~230 kB of application code and leaves the ~590 kB of React,
             Supabase, motion and icons cached by content hash.

             These are all real dependencies rather than first-party modules, so
             this is the split least likely to rot as the source changes. Order
             matters: it is a first-match list.

             Note what this does NOT do. The marketing site and the CRM are one
             SPA, so their own code still shares the main chunk and both are
             fetched by a visitor who only wanted one of them. Splitting that
             would need route-level lazy loading, which changes loading
             behaviour and is a larger change than a build tweak. */
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return;
            if (id.includes("/react/") || id.includes("/react-dom/")) return "react";
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("framer-motion") || id.includes("/motion-dom/") ||
                id.includes("/motion-utils/")) return "motion";
            if (id.includes("lucide-react")) return "icons";
            /* Anything left that is not one of the above is small enough to
               stay in the main chunk rather than become a single-use file. */
            return undefined;
          },
        },
      },
    },
  };
});
