import { Hono } from "hono";
import { authMiddleware, getAuthUser } from "../middleware/auth";
import { getDataAdapter } from "../db/adapter";

export const followupsRouter = new Hono();

followupsRouter.use("*", authMiddleware);

// GET /api/followups - list follow-ups
followupsRouter.get("/", async (c) => {
  const leadId = c.req.query("leadId");

  try {
    const adapter = getDataAdapter(c);
    const followups = await adapter.followups.list(leadId);
    return c.json({ success: true, followups });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/followups - schedule follow-up
followupsRouter.post("/", async (c) => {
  const user = getAuthUser(c);
  const body = await c.req.json().catch(() => ({}));
  const leadId = body.lead_id || body.leadId;
  const followupDate = body.followup_date || body.followupDate;

  if (!leadId || !followupDate) {
    return c.json({ success: false, error: "lead_id and followup_date are required." }, 400);
  }

  try {
    const adapter = getDataAdapter(c);
    const followup = await adapter.followups.create(body, user?.id);

    // Update lead next followup date
    await adapter.leads.update(leadId, {
      next_followup_date: followupDate,
      next_followup_time: body.followup_time || body.followupTime || null,
      followup_method: body.method || "Call",
    }).catch(() => {});

    // Record activity
    await adapter.activities.create({
      lead_id: leadId,
      activity_type: "Follow-up",
      description: `Follow-up scheduled for ${followupDate}`,
    }, user?.id).catch(() => {});

    return c.json({ success: true, followup }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// PATCH /api/followups/:id/complete - complete follow-up
followupsRouter.patch("/:id/complete", async (c) => {
  const id = c.req.param("id");
  const user = getAuthUser(c);

  try {
    const adapter = getDataAdapter(c);
    const followup = await adapter.followups.update(id, { completed: true });

    if (followup?.lead_id) {
      await adapter.activities.create({
        lead_id: followup.lead_id,
        activity_type: "Follow-up",
        description: "Follow-up completed",
      }, user?.id).catch(() => {});
    }

    return c.json({ success: true, message: "Follow-up marked completed", followup });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// DELETE /api/followups/:id - delete follow-up
followupsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const adapter = getDataAdapter(c);
    await adapter.followups.delete(id);
    return c.json({ success: true, message: "Follow-up deleted" });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
