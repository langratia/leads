import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  try {
    // Basic verification - in production we'd verify the Resend signature
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Resend webhook payload
    const payload = await req.json();
    console.log("Received webhook:", payload.type);

    if (payload.type === "email.received") {
      const email = payload.data;
      
      const fromEmail = email.from;
      const toEmail = email.to[0];
      const subject = email.subject;
      const bodyText = email.text;
      const bodyHtml = email.html;
      const messageId = email.id; // Resend ID
      
      // Attempt to find an existing thread by participant_email
      // A more robust system would parse In-Reply-To headers, but matching by email is sufficient for v1.
      let { data: thread, error: threadError } = await supabase
        .from("email_threads")
        .select("id, lead_id")
        .eq("participant_email", fromEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
        
      if (threadError && threadError.code !== "PGRST116") { // Not found
        throw threadError;
      }
      
      // If no thread exists, we need to create one. But we need a lead_id.
      // We will look up the lead by email.
      let threadId = thread?.id;
      
      if (!threadId) {
        const { data: lead } = await supabase
          .from("leads")
          .select("id")
          .eq("email", fromEmail)
          .limit(1)
          .single();
          
        if (lead) {
          const { data: newThread, error: newThreadError } = await supabase
            .from("email_threads")
            .insert({
              lead_id: lead.id,
              subject: subject,
              participant_email: fromEmail,
            })
            .select()
            .single();
            
          if (newThreadError) throw newThreadError;
          threadId = newThread.id;
        } else {
          // Email from unknown address - optionally create a new Lead here, 
          // but for now we might just create a thread without a lead_id.
          // Since lead_id is nullable (via leads table FK), we can omit it, but let's check schema.
          // In 0003_email_threads.sql, lead_id has no `NOT NULL` constraint, so we can insert null.
          const { data: newThread, error: newThreadError } = await supabase
            .from("email_threads")
            .insert({
              subject: subject,
              participant_email: fromEmail,
            })
            .select()
            .single();
            
          if (newThreadError) throw newThreadError;
          threadId = newThread.id;
        }
      }

      // Insert message
      const { error: msgError } = await supabase
        .from("email_messages")
        .insert({
          thread_id: threadId,
          direction: "INBOUND",
          from_email: fromEmail,
          to_email: toEmail,
          body_text: bodyText,
          body_html: bodyHtml,
          message_id: messageId,
        });

      if (msgError) throw msgError;
      
      // Update thread
      await supabase.from("email_threads").update({ status: 'OPEN', updated_at: new Date().toISOString() }).eq('id', threadId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
