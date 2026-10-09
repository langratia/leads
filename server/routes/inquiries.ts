import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { getDataAdapter } from "../db/adapter";

export const inquiriesRouter = new Hono();

// GET /api/inquiries - list inquiries (staff only)
inquiriesRouter.get("/", authMiddleware, async (c) => {
  try {
    const adapter = getDataAdapter(c);
    const inquiries = await adapter.inquiries.list();

    const mapped = inquiries.map((i: any) => ({
      id: i.id,
      fullName: i.full_name || i.fullName,
      email: i.email,
      phone: i.phone || undefined,
      company: i.company || undefined,
      category: i.category || undefined,
      projectDescription: i.project_description || i.projectDescription || undefined,
      ndaRequested: Boolean(i.nda_requested || i.ndaRequested),
      source: i.source,
      status: i.status || "NEW_LEAD",
      internalNotes: i.internal_notes || i.internalNotes || undefined,
      createdAt: i.created_at || i.createdAt || new Date().toISOString(),
      full_name: i.full_name || i.fullName,
      created_at: i.created_at || i.createdAt || new Date().toISOString(),
    }));

    return c.json({ success: true, inquiries: mapped });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/inquiries - public submission from website
inquiriesRouter.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));

  if (!body.email || (!body.fullName && !body.full_name)) {
    return c.json({ success: false, error: "Name and email are required." }, 400);
  }

  try {
    const adapter = getDataAdapter(c);
    const inquiry = await adapter.inquiries.create(body);
    return c.json({ success: true, inquiry }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// PATCH /api/inquiries/:id - update inquiry status/notes (staff only)
inquiriesRouter.patch("/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));

  try {
    const adapter = getDataAdapter(c);
    const updated = await adapter.inquiries.update(id, {
      status: body.status,
      internal_notes: body.internalNotes ?? body.internal_notes,
    });

    return c.json({ success: true, inquiry: updated });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// GET /api/inquiries/bookings - list bookings (staff only)
inquiriesRouter.get("/bookings", authMiddleware, async (c) => {
  return c.json({ success: true, bookings: [] });
});

// POST /api/inquiries/bookings - public booking submission
inquiriesRouter.post("/bookings", async (c) => {
  const body = await c.req.json().catch(() => ({}));

  if (!body.name || !body.email || !body.date || !body.time) {
    return c.json({ success: false, error: "Name, email, date, and time are required." }, 400);
  }

  const booking = {
    id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: body.name,
    email: body.email,
    phone: body.phone || null,
    date: body.date,
    time: body.time,
    notes: body.notes || "",
    status: "CONFIRMED",
    meetLink: body.meetLink || body.meet_link || null,
    createdAt: new Date().toISOString(),
  };

  return c.json({ success: true, booking }, 201);
});
