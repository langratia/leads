import { getAuthUser } from "../places/_shared";

// Edge Function for Outbound Email Dispatch via Resend
interface Env {
  RESEND_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  NOTIFICATION_EMAIL?: string;
}

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const DEFAULT_SUPABASE_URL = "https://sriwrevcvwrzkgppzvst.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaXdyZXZjdndyemtncHB6dnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjE4NTcsImV4cCI6MjEwMjE5Nzg1N30.jsBudnBdVjhGGqyd9HxBHuepjnqo_lD7H9uwtyjkHX8";

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  try {
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    const user = await getAuthUser(token, env);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized. Sign in to the CRM to send emails." }),
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body: any = await request.json().catch(() => ({}));
    const { thread_id, to_email, subject, body_text, body_html } = body;

    if (!to_email || (!body_text && !body_html)) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing recipient or email body" }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const resendKey = env.RESEND_API_KEY;
    if (!resendKey) {
      return new Response(
        JSON.stringify({ success: false, error: "RESEND_API_KEY is not configured on Cloudflare" }),
        { status: 500, headers: CORS_HEADERS }
      );
    }
    const notificationEmail = env.NOTIFICATION_EMAIL || "allan.info.comp@gmail.com";

    // 1. Dispatch through Resend
    let messageId: string | null = null;
    let senderUsed = "LANGRATIA Inquiries <inquiries@langratia.com>";

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

    // Fallback if custom domain is not yet verified on Resend
    if (!resendRes.ok) {
      const errData = await resendRes.json().catch(() => ({}));
      console.warn("Retrying with onboarding sender:", errData);
      senderUsed = "LANGRATIA Inquiries <onboarding@resend.dev>";
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

    // 2. Persist to Supabase email_messages table if thread_id is provided
    const sbUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const sbKey = env.SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

    if (thread_id) {
      try {
        await fetch(`${sbUrl}/rest/v1/email_messages`, {
          method: "POST",
          headers: {
            apikey: sbKey,
            Authorization: `Bearer ${token || sbKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            thread_id,
            direction: "OUTBOUND",
            from_email: "inquiries@langratia.com",
            to_email,
            body_text,
            body_html,
            message_id: messageId,
            created_by: user.id,
          }),
        });

        await fetch(`${sbUrl}/rest/v1/email_threads?id=eq.${encodeURIComponent(thread_id)}`, {
          method: "PATCH",
          headers: {
            apikey: sbKey,
            Authorization: `Bearer ${token || sbKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            status: "OPEN",
            updated_at: new Date().toISOString(),
          }),
        });
      } catch (sbErr) {
        console.warn("Could not save to email_messages table:", sbErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId,
        sender: senderUsed,
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("Email dispatch failed:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal error" }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
