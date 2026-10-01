import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { thread_id, to_email, subject, body_text, body_html, created_by } = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    // 1. Send the email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Langratia Admin <inquiries@langratia.com>", // Should be verified domain
        to: to_email,
        subject: subject,
        text: body_text,
        html: body_html,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Resend error:", resData);
      throw new Error(resData.message || "Failed to send email via Resend");
    }

    const message_id = resData.id;

    // 2. Log it in our database
    const { data, error } = await supabase
      .from("email_messages")
      .insert({
        thread_id,
        direction: "OUTBOUND",
        from_email: "inquiries@langratia.com",
        to_email,
        body_text,
        body_html,
        message_id,
        created_by,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    // 3. Update thread status (Optional)
    await supabase.from("email_threads").update({ status: 'OPEN', updated_at: new Date().toISOString() }).eq('id', thread_id);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
