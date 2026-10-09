import { Hono } from "hono";
import { authMiddleware, getAuthUser } from "../middleware/auth";
import { getDataAdapter } from "../db/adapter";

export const leadsRouter = new Hono();

// All lead endpoints require authentication
leadsRouter.use("*", authMiddleware);

// GET /api/leads - list all leads
leadsRouter.get("/", async (c) => {
  try {
    const adapter = getDataAdapter(c);
    const leads = await adapter.leads.list();
    return c.json({ success: true, leads });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// GET /api/leads/:id - get single lead with activities and follow-ups
leadsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const adapter = getDataAdapter(c);
    const result = await adapter.leads.get(id);
    if (!result) {
      return c.json({ success: false, error: "Lead not found" }, 404);
    }
    return c.json({
      success: true,
      lead: result.lead,
      activities: result.activities,
      followups: result.followups,
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/leads - create new lead
leadsRouter.post("/", async (c) => {
  const user = getAuthUser(c);
  const body = await c.req.json().catch(() => ({}));

  if (!body.business_name && !body.businessName) {
    return c.json({ success: false, error: "Business name is required." }, 400);
  }

  try {
    const adapter = getDataAdapter(c);
    const created = await adapter.leads.create(body, user?.id);
    return c.json({ success: true, lead: created }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// PATCH /api/leads/:id - update existing lead
leadsRouter.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const user = getAuthUser(c);
  const body = await c.req.json().catch(() => ({}));

  try {
    const adapter = getDataAdapter(c);
    const updated = await adapter.leads.update(id, body);
    if (!updated) {
      return c.json({ success: false, error: "Lead not found" }, 404);
    }

    if (body.status) {
      await adapter.activities.create({
        lead_id: id,
        activity_type: "Status change",
        description: `Status changed to ${body.status}`,
      }, user?.id).catch(() => {});
    }

    return c.json({ success: true, lead: updated });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// DELETE /api/leads/:id - delete lead
leadsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const adapter = getDataAdapter(c);
    await adapter.leads.delete(id);
    return c.json({ success: true, message: "Lead deleted successfully" });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/leads/bulk - bulk update status or priority
leadsRouter.post("/bulk", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { ids, patch } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return c.json({ success: false, error: "Valid lead IDs are required." }, 400);
  }

  try {
    const adapter = getDataAdapter(c);
    await adapter.leads.bulkUpdate(ids, patch || {});
    return c.json({ success: true, count: ids.length });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/leads/:id/convert - convert lead to customer
leadsRouter.post("/:id/convert", async (c) => {
  const id = c.req.param("id");
  const user = getAuthUser(c);
  const body = await c.req.json().catch(() => ({}));

  try {
    const adapter = getDataAdapter(c);
    const result = await adapter.leads.convertToCustomer(id, body, user?.id);
    return c.json({ success: true, customer: result.customer });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/leads/import-places - import places search results
leadsRouter.post("/import-places", async (c) => {
  const user = getAuthUser(c);
  const body = await c.req.json().catch(() => ({}));
  const places = body.places;

  if (!Array.isArray(places)) {
    return c.json({ success: false, error: "Places array is required." }, 400);
  }

  try {
    const adapter = getDataAdapter(c);
    const stats = await adapter.leads.importPlaces(places, user?.id);
    return c.json({ success: true, ...stats });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
