import { Hono } from "hono";
import { authMiddleware, getAuthUser } from "../middleware/auth";
import { getDataAdapter } from "../db/adapter";

export const activitiesRouter = new Hono();

activitiesRouter.use("*", authMiddleware);

// GET /api/activities - list activities
activitiesRouter.get("/", async (c) => {
  const leadId = c.req.query("leadId");
  if (!leadId) {
    return c.json({ success: false, error: "leadId query param is required." }, 400);
  }

  try {
    const adapter = getDataAdapter(c);
    const activities = await adapter.activities.list(leadId);
    return c.json({ success: true, activities });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/activities - add an activity
activitiesRouter.post("/", async (c) => {
  const user = getAuthUser(c);
  const body = await c.req.json().catch(() => ({}));
  const leadId = body.lead_id || body.leadId;
  const activityType = body.activity_type || body.activityType;

  if (!leadId || !activityType) {
    return c.json({ success: false, error: "lead_id and activity_type are required." }, 400);
  }

  try {
    const adapter = getDataAdapter(c);
    const activity = await adapter.activities.create(body, user?.id);
    return c.json({ success: true, activity }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
