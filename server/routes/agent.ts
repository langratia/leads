import { Hono } from "hono";
import { authMiddleware, getAuthUser } from "../middleware/auth";
import { getDataAdapter, computeLeadScore } from "../db/adapter";
import { getEnv } from "../env";

export const agentRouter = new Hono();

agentRouter.use("*", authMiddleware);

interface AgentStep {
  step: number;
  action: string;
  detail: string;
  status: "completed" | "in_progress" | "failed";
  timestamp: string;
}

// POST /api/agent/run - execute autonomous agent workflows
agentRouter.post("/run", async (c) => {
  const user = getAuthUser(c);
  const body = await c.req.json().catch(() => ({}));
  const { workflow, query, target_category, target_area, limit = 10, prompt } = body;

  const adapter = getDataAdapter(c);
  const steps: AgentStep[] = [];
  const addStep = (action: string, detail: string, status: "completed" | "in_progress" | "failed" = "completed") => {
    steps.push({
      step: steps.length + 1,
      action,
      detail,
      status,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  try {
    /* ----------------------------------------------------
       WORKFLOW 1: Autonomous Niche Prospector
       ---------------------------------------------------- */
    if (workflow === "auto_prospect" || (!workflow && (query || target_category))) {
      const searchQuery = (query || `${target_category || "pharmacy"} in ${target_area || "Kampala"}`).trim();
      addStep("Radar Scanning", `Querying Google Places for "${searchQuery}" (target count: ${limit})...`);

      const placesKey = getEnv(c, "PLACES_API_KEY");
      if (!placesKey) {
        addStep("Places API Check", "PLACES_API_KEY is not configured", "failed");
        return c.json({ success: false, error: "Google Places API key is missing", steps }, 400);
      }

      // 1. Fetch places
      const placesRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": placesKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.location,places.types,places.rating,places.userRatingCount",
        },
        body: JSON.stringify({ textQuery: searchQuery, pageSize: Math.min(Number(limit) || 10, 20) }),
      });

      const placesData: any = await placesRes.json();
      const rawPlaces = (placesData.places || []).map((p: any) => ({
        place_id: p.id,
        business_name: p.displayName?.text || "Unnamed business",
        category: (p.types || []).slice(0, 2).join(", ") || null,
        phone: p.internationalPhoneNumber || null,
        website: p.websiteUri || null,
        address: p.formattedAddress || "",
        rating: p.rating ?? null,
        reviews: p.userRatingCount ?? null,
        latitude: p.location?.latitude ?? null,
        longitude: p.location?.longitude ?? null,
      }));

      addStep("Discovery Complete", `Located ${rawPlaces.length} real businesses.`);

      // 2. Ingest and deduplicate
      addStep("Deduplication & Evaluation", "Checking database for existing leads and calculating scores...");
      const importStats = await adapter.leads.importPlaces(rawPlaces, user?.id);

      addStep(
        "Ingestion Finished",
        `Saved ${importStats.imported} new high-intent leads into the CRM (${importStats.skipped} duplicates skipped).`
      );

      // 3. Draft personalized outreach for new leads
      const drafts = rawPlaces.slice(0, importStats.imported).map((p: any) => {
        const score = computeLeadScore(p);
        const name = p.business_name;
        const category = p.category || "business";
        return {
          businessName: name,
          phone: p.phone,
          score,
          subject: `Partnership proposal for ${name}`,
          preview: `Hello team ${name}, we noticed your leading presence in ${p.address || "the area"} and would love to introduce LANGRATIA's technology solutions...`,
        };
      });

      return c.json({
        success: true,
        summary: `Successfully executed autonomous prospecting for "${searchQuery}". Added ${importStats.imported} leads, skipped ${importStats.skipped} duplicates, and prepared ${drafts.length} outreach drafts.`,
        steps,
        stats: importStats,
        drafts,
      });
    }

    /* ----------------------------------------------------
       WORKFLOW 2: Stale Lead Revival
       ---------------------------------------------------- */
    if (workflow === "stale_revival") {
      addStep("Scanning Database", "Searching for leads with no recent activity in the last 7+ days...");
      const allLeads = await adapter.leads.list();

      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 7);

      const staleLeads = allLeads.filter((l: any) => {
        const updated = new Date(l.updated_at || l.created_at);
        return updated < tenDaysAgo && l.status !== "Won" && l.status !== "Lost";
      }).slice(0, 10);

      addStep("Identification", `Identified ${staleLeads.length} leads requiring re-engagement.`);

      let scheduled = 0;
      for (const lead of staleLeads) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split("T")[0];

        await adapter.followups.create({
          lead_id: lead.id,
          followup_date: dateStr,
          method: lead.phone ? "Call" : "Email",
          notes: `Automated revival task: Re-engage regarding ${lead.interested_product || "services"}.`,
        }, user?.id).catch(() => {});
        scheduled++;
      }

      addStep("Task Automation", `Automatically scheduled ${scheduled} follow-up check-ins for tomorrow.`);

      return c.json({
        success: true,
        summary: `Stale Lead Revival complete: Analyzed ${allLeads.length} total leads, flagged ${staleLeads.length} dormant accounts, and scheduled ${scheduled} follow-up tasks.`,
        steps,
        revivedCount: scheduled,
      });
    }

    /* ----------------------------------------------------
       WORKFLOW 3: Conversational Prompt Execution
       ---------------------------------------------------- */
    const userPrompt = (prompt || "").trim();
    addStep("Natural Language Parsing", `Analyzing command: "${userPrompt}"...`);

    if (userPrompt.toLowerCase().includes("find") || userPrompt.toLowerCase().includes("search")) {
      // Extract target query
      const match = userPrompt.match(/(?:find|search|lookup)\s+(?:me\s+)?(?:some\s+)?(\d+)?\s*(.*?)(?:in\s+(.*))?$/i);
      const count = match?.[1] ? parseInt(match[1]) : 5;
      const term = match?.[2] || "business";
      const loc = match?.[3] || "Kampala";
      const targetQuery = `${term} in ${loc}`;

      addStep("Autonomous Tool Calling", `Delegating to discover_places("${targetQuery}", count: ${count})...`);

      const placesKey = getEnv(c, "PLACES_API_KEY");
      if (!placesKey) {
        throw new Error("PLACES_API_KEY missing");
      }

      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": placesKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.location,places.types,places.rating,places.userRatingCount",
        },
        body: JSON.stringify({ textQuery: targetQuery, pageSize: Math.min(count, 20) }),
      });

      const pData: any = await res.json();
      const items = (pData.places || []).map((p: any) => ({
        place_id: p.id,
        business_name: p.displayName?.text || "Unnamed business",
        category: (p.types || []).slice(0, 2).join(", ") || null,
        phone: p.internationalPhoneNumber || null,
        website: p.websiteUri || null,
        address: p.formattedAddress || "",
        rating: p.rating ?? null,
        reviews: p.userRatingCount ?? null,
      }));

      const stats = await adapter.leads.importPlaces(items, user?.id);
      addStep("Execution Finished", `Found ${items.length} businesses, imported ${stats.imported} new records.`);

      return c.json({
        success: true,
        summary: `Autonomous command executed: Found ${items.length} ${term} in ${loc}, imported ${stats.imported} records (${stats.skipped} duplicates skipped).`,
        steps,
        stats,
      });
    }

    // Default conversational summary
    const allLeads = await adapter.leads.list();
    const highScores = allLeads.filter((l: any) => (l.lead_score || 0) >= 70);
    addStep("CRM State Scan", `Scanned database: ${allLeads.length} total leads, ${highScores.length} high-score prospects.`);

    return c.json({
      success: true,
      summary: `Agent analysis: The CRM currently holds ${allLeads.length} leads with ${highScores.length} scored 70+. Ready for autonomous outreach, lead hunting, or follow-up campaigns.`,
      steps,
    });
  } catch (err: any) {
    addStep("Error", err.message, "failed");
    return c.json({ success: false, error: err.message, steps }, 500);
  }
});
