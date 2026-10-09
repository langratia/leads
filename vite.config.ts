import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { getRequestListener } from "@hono/node-server";
import { app } from "./server/app";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        /* Integrates the unified Hono API into the Vite dev server.
           All /api/* requests execute the full server backend directly. */
        name: "api-server-middleware",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith("/api")) {
              return getRequestListener(app.fetch)(req, res);
            }
            next();
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
