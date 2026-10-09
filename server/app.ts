import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRouter } from "./routes/auth";
import { leadsRouter } from "./routes/leads";
import { followupsRouter } from "./routes/followups";
import { activitiesRouter } from "./routes/activities";
import { inquiriesRouter } from "./routes/inquiries";
import { emailRouter } from "./routes/email";
import { placesRouter } from "./routes/places";
import { agentRouter } from "./routes/agent";

export const app = new Hono();

app.use("*", async (c, next) => {
  if (c.env && typeof c.env === "object") {
    for (const [key, val] of Object.entries(c.env)) {
      if (typeof val === "string" && (!process.env[key] || process.env[key] === "")) {
        process.env[key] = val;
      }
    }
  }
  await next();
});

app.use("*", cors());
app.use("*", logger());

// Health checks
app.get("/api/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    envKeys: Object.keys((c.env as Record<string, any>) || {}),
    hasPlacesKey: Boolean((c.env as any)?.PLACES_API_KEY || process.env.PLACES_API_KEY),
  })
);
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Mount sub-routers
app.route("/api/auth", authRouter);
app.route("/api/leads", leadsRouter);
app.route("/api/followups", followupsRouter);
app.route("/api/activities", activitiesRouter);
app.route("/api/inquiries", inquiriesRouter);
app.route("/api/email", emailRouter);
app.route("/api/places", placesRouter);
app.route("/api/agent", agentRouter);

// Fallback 404 handler for API routes
app.notFound((c) => {
  return c.json({ success: false, error: "Endpoint not found" }, 404);
});
