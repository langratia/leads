import "dotenv/config";
import { serve } from "@hono/node-server";
import { app } from "./app";

const port = Number(process.env.PORT) || 3001;

console.log(`Starting Leads API Server on http://localhost:${port}...`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Leads API Server is running on http://localhost:${info.port}`);
  }
);
