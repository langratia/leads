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

    // Automatically convert to high-intent CRM lead
    const fullName = body.fullName || body.full_name || "Website Lead";
    const company = body.company || fullName;
    const category = body.category || "Custom Software & Cloud";
    const phone = body.phone || null;
    const email = body.email;
    const description = body.projectDescription || body.project_description || "";

    const leads = await adapter.leads.list().catch(() => []);
    const existingLead = leads.find(
      (l: any) =>
        (email && l.email?.toLowerCase() === email.toLowerCase()) ||
        (phone && l.phone && l.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""))
    );

    let createdLeadId: string | null = existingLead?.id || null;

    if (!existingLead) {
      const createdLead = await adapter.leads
        .create({
          business_name: company,
          contact_person: fullName,
          email,
          phone,
          category,
          lead_source: "Website Inbound",
          priority: "High",
          tags: ["Website Inbound", body.ndaRequested ? "NDA Requested" : "Direct Inquiry"],
          notes: `Inbound inquiry via ${body.source || "/contact"}:\n${description}`,
          estimated_value: 5000,
        })
        .catch(() => null);

      if (createdLead) {
        createdLeadId = createdLead.id;
        await adapter.activities
          .create({
            lead_id: createdLead.id,
            activity_type: "Inbound",
            description: `Website inquiry submitted by ${fullName} (${email}).`,
          })
          .catch(() => {});
      }
    } else {
      await adapter.activities
        .create({
          lead_id: existingLead.id,
          activity_type: "Inbound",
          description: `New website inquiry from ${fullName}: "${description.slice(0, 80)}"`,
        })
        .catch(() => {});
    }

    return c.json({ success: true, inquiry, leadId: createdLeadId }, 201);
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

  try {
    const adapter = getDataAdapter(c);
    const booking = {
      id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      date: body.date,
      time: body.time,
      notes: body.notes || "",
      status: "CONFIRMED",
      meetLink: body.meetLink || body.meet_link || "https://meet.google.com/lan-soft-call",
      createdAt: new Date().toISOString(),
    };

    // Auto-create lead or followup
    const leads = await adapter.leads.list().catch(() => []);
    let lead = leads.find((l: any) => l.email?.toLowerCase() === body.email.toLowerCase());

    if (!lead) {
      lead = await adapter.leads
        .create({
          business_name: body.company || body.name,
          contact_person: body.name,
          email: body.email,
          phone: body.phone || null,
          category: "Demo Booking",
          lead_source: "Website Demo",
          priority: "Hot",
          tags: ["Booked Demo", "High Intent"],
          notes: `Demo booked for ${body.date} at ${body.time}:\n${body.notes || ""}`,
          next_followup_date: body.date,
          next_followup_time: body.time,
          followup_method: "Demo Call",
        })
        .catch(() => null);
    }

    if (lead) {
      await adapter.followups
        .create({
          lead_id: lead.id,
          followup_date: body.date,
          followup_time: body.time,
          method: "Demo Call",
          notes: `Scoping & demo call: ${body.notes || "Live walkthrough"}`,
        })
        .catch(() => {});

      await adapter.activities
        .create({
          lead_id: lead.id,
          activity_type: "Booking",
          description: `Booked scoping demo for ${body.date} at ${body.time}`,
        })
        .catch(() => {});
    }

    return c.json({ success: true, booking, leadId: lead?.id || null }, 201);
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});
