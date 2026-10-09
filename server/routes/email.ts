import { Hono } from "hono";
import { authMiddleware, getAuthUser } from "../middleware/auth";
import { getEnv } from "../env";
import { getDataAdapter } from "../db/adapter";

export const emailRouter = new Hono();

// GET /api/email/threads?participantEmail=...
emailRouter.get("/threads", authMiddleware, async (c) => {
  const email = c.req.query("participantEmail");
  if (!email) {
    return c.json({ success: false, error: "participantEmail is required." }, 400);
  }

  try {
    const adapter = getDataAdapter(c);
    const { thread, messages } = await adapter.email.getThread(email);

    return c.json({
      success: true,
      thread: thread
        ? {
            id: thread.id,
            lead_id: thread.lead_id || thread.leadId,
            subject: thread.subject,
            participant_email: thread.participant_email || thread.participantEmail,
            status: thread.status,
          }
        : null,
      messages: messages.map((m: any) => ({
        id: m.id,
        thread_id: m.thread_id || m.threadId,
        direction: m.direction,
        from_email: m.from_email || m.fromEmail,
        to_email: m.to_email || m.toEmail,
        body_text: m.body_text || m.bodyText,
        body_html: m.body_html || m.bodyHtml,
        message_id: m.message_id || m.messageId,
        created_at: m.created_at || m.createdAt,
      })),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/email/send - dispatch outbound email via Resend
emailRouter.post("/send", authMiddleware, async (c) => {
  const user = getAuthUser(c);
  const body = await c.req.json().catch(() => ({}));
  const { to_email, subject, body_text, body_html, lead_id, thread_id } = body;

  if (!to_email || (!body_text && !body_html)) {
    return c.json({ success: false, error: "Missing recipient or email body" }, 400);
  }

  const resendKey = getEnv(c, "RESEND_API_KEY");
  const senderAddress = getEnv(c, "SENDER_EMAIL", "inquiries@langratia.com");
  const senderName = getEnv(c, "SENDER_NAME", "LANGRATIA Inquiries");
  const notificationEmail = getEnv(c, "NOTIFICATION_EMAIL", senderAddress);

  let messageId: string | null = null;
  let senderUsed = `${senderName} <${senderAddress}>`;

  // 1. Dispatch via Resend if key is available
  if (resendKey) {
    try {
      const emailPayload: any = {
        from: senderUsed,
        to: [to_email],
        reply_to: notificationEmail,
        subject: subject || "Update from LANGRATIA",
        text: body_text,
        html: body_html || `<div style="font-family:sans-serif;line-height:1.6;">${(body_text || "").replace(/\n/g, "<br/>")}</div>`,
      };

      let resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify(emailPayload),
      });

      // Fallback to onboarding sender if custom domain isn't verified
      if (!resendRes.ok) {
        senderUsed = `${senderName} <onboarding@resend.dev>`;
        emailPayload.from = senderUsed;

        resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify(emailPayload),
        });
      }

      if (resendRes.ok) {
        const resendData: any = await resendRes.json();
        messageId = resendData?.id || null;
      }
    } catch (err: any) {
      console.warn("Resend dispatch error:", err);
    }
  }

  // 2. Persist to database
  try {
    const adapter = getDataAdapter(c);
    const { threadId: activeThreadId, message: savedMessage } = await adapter.email.saveThreadAndMessage({
      threadId: thread_id,
      leadId: lead_id,
      subject: subject || `Conversation with ${to_email}`,
      toEmail: to_email,
      fromEmail: senderAddress,
      bodyText: body_text,
      bodyHtml: body_html,
      messageId,
      userId: user?.id,
    });

    return c.json({
      success: true,
      messageId,
      threadId: activeThreadId,
      message: {
        id: savedMessage.id,
        thread_id: savedMessage.thread_id || savedMessage.threadId,
        direction: savedMessage.direction,
        from_email: savedMessage.from_email || savedMessage.fromEmail,
        to_email: savedMessage.to_email || savedMessage.toEmail,
        body_text: savedMessage.body_text || savedMessage.bodyText,
        delivery: "sent",
        created_at: savedMessage.created_at || savedMessage.createdAt,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

function extractEmail(str: string | null | undefined): string {
  if (!str) return "";
  const match = str.match(/<([^>]+)>/);
  if (match && match[1]) return match[1].trim().toLowerCase();
  return str.trim().toLowerCase();
}

// POST /api/email/webhook - Inbound email reception (Resend or webhook forwarder)
emailRouter.post("/webhook", async (c) => {
  const payload = await c.req.json().catch(() => ({}));
  const data = payload.data || payload;

  const rawFrom = data.from || data.sender || data.from_email || "";
  const rawTo = Array.isArray(data.to) ? data.to[0] : (data.to || data.recipient || data.to_email || "");
  const subject = data.subject || "Inbound message";
  const bodyText = data.text || data.body_text || data.body || "";
  const bodyHtml = data.html || data.body_html || null;
  const messageId = data.email_id || data.id || data.message_id || null;

  const fromEmail = extractEmail(rawFrom);
  const toEmail = extractEmail(rawTo);

  if (!fromEmail || (!bodyText && !bodyHtml)) {
    return c.json({ success: false, message: "Ignored: Missing sender or message body" }, 200);
  }

  try {
    const adapter = getDataAdapter(c);

    // 1. Locate existing thread by participant email
    const { thread } = await adapter.email.getThread(fromEmail);
    let leadId = thread?.lead_id || null;

    // 2. If no thread lead_id, search leads by email
    if (!leadId) {
      const leads = await adapter.leads.list();
      const matchedLead = leads.find((l: any) => l.email?.toLowerCase() === fromEmail);
      if (matchedLead) {
        leadId = matchedLead.id;
      }
    }

    // 3. Save inbound message and attach to thread
    const { threadId, message } = await adapter.email.saveThreadAndMessage({
      threadId: thread?.id,
      leadId,
      subject: thread?.subject || subject,
      toEmail: toEmail || "inquiries@langratia.com",
      fromEmail,
      participantEmail: fromEmail,
      direction: "INBOUND",
      bodyText,
      bodyHtml,
      messageId,
    });

    // 4. Automatically log activity on matching lead
    if (leadId) {
      await adapter.activities
        .create({
          lead_id: leadId,
          activity_type: "Email Inbound",
          description: `Inbound email reply from ${fromEmail}: "${(subject || "").slice(0, 60)}"`,
        })
        .catch(() => {});
    }

    return c.json({
      success: true,
      threadId,
      messageId: message.id,
      leadId,
    });
  } catch (err: any) {
    console.error("Inbound email webhook error:", err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

