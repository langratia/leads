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
       WORKFLOW 3: Daily Executive Morning Briefing
       ---------------------------------------------------- */
    if (workflow === "morning_briefing") {
      addStep("Pipeline Health Scan", "Aggregating pipeline volume, active stages, and deal values...");
      const allLeads = await adapter.leads.list();
      const allFollowups = await adapter.followups.list();
      const today = new Date().toISOString().split("T")[0];

      const totalPipelineValue = allLeads.reduce((acc: number, l: any) => acc + (Number(l.estimated_value) || 0), 0);
      const wonDeals = allLeads.filter((l: any) => l.status === "Won");
      const wonValue = wonDeals.reduce((acc: number, l: any) => acc + (Number(l.estimated_value) || 0), 0);
      const activeDeals = allLeads.filter((l: any) => l.status !== "Won" && l.status !== "Lost");
      const highIntentLeads = activeDeals.filter((l: any) => (l.lead_score || 0) >= 60);

      addStep("Follow-up Audit", "Identifying overdue and due-today customer commitments...");
      const dueFollowups = allFollowups.filter((f: any) => !f.completed && f.followup_date === today);
      const overdueFollowups = allFollowups.filter((f: any) => !f.completed && f.followup_date < today);

      addStep("Action Prioritization", "Synthesizing top 3 highest-impact actions for the sales rep today...");
      const leadMap = new Map(allLeads.map((l: any) => [l.id, l]));

      const urgentActions: Array<{
        leadId: string;
        businessName: string;
        category?: string;
        phone?: string;
        email?: string;
        reason: string;
        priority: "Urgent" | "High" | "Medium";
        channel: "WhatsApp" | "Call" | "Email";
        pitchSnippet: string;
      }> = [];

      // Priority 1: Overdue follow-up with highest deal value
      if (overdueFollowups.length > 0) {
        const sortedOverdue = [...overdueFollowups].sort((a: any, b: any) => {
          const leadA = leadMap.get(a.lead_id);
          const leadB = leadMap.get(b.lead_id);
          return (Number(leadB?.estimated_value) || 0) - (Number(leadA?.estimated_value) || 0);
        });
        const topOverdue = sortedOverdue[0];
        const lead = leadMap.get(topOverdue.lead_id);
        if (lead) {
          urgentActions.push({
            leadId: lead.id,
            businessName: lead.business_name,
            category: lead.category,
            phone: lead.phone || lead.whatsapp,
            email: lead.email,
            reason: `Overdue follow-up scheduled for ${topOverdue.followup_date} (${topOverdue.notes || "Check-in"})`,
            priority: "Urgent",
            channel: lead.whatsapp || lead.phone ? "WhatsApp" : "Email",
            pitchSnippet: `Hello ${lead.contact_person || 'team ' + lead.business_name}, following up on our previous conversation regarding your software requirements.`,
          });
        }
      }

      // Priority 2: High intent lead that is still in New status
      const freshHighIntent = highIntentLeads.find((l: any) => l.status === "New");
      if (freshHighIntent) {
        urgentActions.push({
          leadId: freshHighIntent.id,
          businessName: freshHighIntent.business_name,
          category: freshHighIntent.category,
          phone: freshHighIntent.phone || freshHighIntent.whatsapp,
          email: freshHighIntent.email,
          reason: `High Intent Lead (Score ${freshHighIntent.lead_score}/100) awaiting initial outreach`,
          priority: "High",
          channel: freshHighIntent.whatsapp || freshHighIntent.phone ? "WhatsApp" : "Email",
          pitchSnippet: `Hello ${freshHighIntent.contact_person || 'team ' + freshHighIntent.business_name}, we noticed your leading presence in ${freshHighIntent.address ? freshHighIntent.address.split(',')[0] : 'the area'} and would love to introduce LANGRATIA technology.`,
        });
      }

      // Priority 3: Active negotiation in Contacted or Meeting Scheduled with no follow-up scheduled
      const activeNegotiation = activeDeals.find((l: any) =>
        (l.status === "Contacted" || l.status === "Meeting Scheduled") &&
        !urgentActions.some((a) => a.leadId === l.id)
      );
      if (activeNegotiation) {
        urgentActions.push({
          leadId: activeNegotiation.id,
          businessName: activeNegotiation.business_name,
          category: activeNegotiation.category,
          phone: activeNegotiation.phone || activeNegotiation.whatsapp,
          email: activeNegotiation.email,
          reason: `Deal in progress (${activeNegotiation.status}) — nurture towards proposal or close`,
          priority: "Medium",
          channel: activeNegotiation.phone ? "Call" : "WhatsApp",
          pitchSnippet: `Hello ${activeNegotiation.contact_person || activeNegotiation.business_name}, checking in to see if you have any questions before we finalize your solution brief.`,
        });
      }

      addStep("Executive Briefing Assembled", "Morning Briefing is prepared and ready for execution.");

      const briefing = {
        date: today,
        pipelineValue: totalPipelineValue,
        wonValue,
        activeDealsCount: activeDeals.length,
        dueCount: dueFollowups.length,
        overdueCount: overdueFollowups.length,
        highIntentCount: highIntentLeads.length,
        urgentActions,
        executiveAdvice: overdueFollowups.length > 0
          ? `Priority 1 today is recovering ${overdueFollowups.length} overdue customer follow-up(s) to avoid deal stagnation.`
          : highIntentLeads.length > 0
          ? `Great position: You have ${highIntentLeads.length} high-intent prospects primed for outreach.`
          : "Pipeline is healthy. Focus today on running Google Radar prospecting to discover new niche accounts.",
      };

      return c.json({
        success: true,
        summary: `Morning Briefing Ready: Active pipeline at $${totalPipelineValue.toLocaleString()} with ${urgentActions.length} high-impact actions prioritized for today.`,
        steps,
        briefing,
      });
    }

    /* ----------------------------------------------------
       WORKFLOW 4: Conversational Prompt Execution
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

// POST /api/agent/dossier - Deep AI research & strategic sales dossier for a lead
agentRouter.post("/dossier", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { leadId, lead: customLead } = body;
  const adapter = getDataAdapter(c);

  let lead = customLead;
  if (!lead && leadId) {
    const fetched = await adapter.leads.get(leadId).catch(() => null);
    lead = fetched?.lead;
  }

  if (!lead) {
    return c.json({ success: false, error: "Lead information or leadId is required" }, 400);
  }

  const name = lead.business_name || "Enterprise Prospect";
  const cat = lead.category || "General Enterprise";
  const address = lead.address || "Uganda / East Africa";
  const catLower = cat.toLowerCase();

  // Sector-tailored pain points & solutions for Uganda / East Africa
  let sectorOverview = "";
  let corePainPoints: string[] = [];
  let solutionTitle = "";
  let architecture: string[] = [];
  let estimatedImpact = "";

  if (catLower.includes("health") || catLower.includes("clinic") || catLower.includes("pharmacy") || catLower.includes("hospital")) {
    sectorOverview = `${name} operates in the fast-growing private healthcare sector in ${address}. Patient retention, medication inventory auditing, and appointment adherence are high-impact bottlenecks.`;
    corePainPoints = [
      "Manual patient appointment tracking resulting in high no-show rates (estimated 25-35%).",
      "Pharmaceutical inventory slippage and lack of automated batch expiration alerts.",
      "URA EFRIS fiscal e-receipting friction during peak clinic hours.",
      "Lack of direct WhatsApp prescription readiness & lab results notification channel.",
    ];
    solutionTitle = "LANGRATIA HealthCloud & Automated Patient WhatsApp Portal";
    architecture = [
      "Real-time Clinic Inventory & Expiry Tracking with URA EFRIS compliance.",
      "WhatsApp Business API Bot: Automated SMS/WhatsApp appointment reminders & lab result dispatch.",
      "Cashless billing engine with MTN MoMo & Airtel Money automated reconciliation.",
    ];
    estimatedImpact = "40% reduction in appointment no-shows and complete elimination of manual billing discrepancy.";
  } else if (catLower.includes("school") || catLower.includes("college") || catLower.includes("educat")) {
    sectorOverview = `${name} is an educational institution in ${address} managing high volumes of student enrollments, fee collections, and parent communications.`;
    corePainPoints = [
      "Fee payment tracking friction: Manual verification of bank slips and mobile money transactions.",
      "High cost and time spent manually sending terminal report cards and circulars to parents.",
      "Lack of centralized student attendance and academic tracking system.",
    ];
    solutionTitle = "LANGRATIA EduPortal & School Fees Mobile Gateway";
    architecture = [
      "Automated Mobile Money School Fees Reconciliation (direct student ID matching).",
      "Parent WhatsApp & SMS Broadcast Gateway for report cards and alerts.",
      "Teacher grading & digital attendance ledger accessible on mobile phones.",
    ];
    estimatedImpact = "Collect fees 2x faster with automated reminders and 90% reduction in paper/SMS printing expenses.";
  } else if (catLower.includes("hotel") || catLower.includes("restaurant") || catLower.includes("lodge")) {
    sectorOverview = `${name} serves hospitality and dining clientele in ${address}. Key revenue drivers are direct guest bookings, room occupancy, and point-of-sale inventory.`;
    corePainPoints = [
      "Over-reliance on foreign OTA booking platforms taking 15-20% commission on every room.",
      "Kitchen food & beverage inventory leakage due to disconnected POS and store room tracking.",
      "Manual guest check-in / check-out records on paper registers.",
    ];
    solutionTitle = "LANGRATIA Hospitality Suite & Direct Booking Engine";
    architecture = [
      "0% Commission Direct Booking Engine with Instant Mobile Money & Card deposit.",
      "Real-time Kitchen POS & Store Inventory synchronization.",
      "Guest WhatsApp concierge for room service ordering and automatic check-in.",
    ];
    estimatedImpact = "Save thousands of dollars in OTA booking commissions and boost bar/restaurant margins by 18%.";
  } else {
    sectorOverview = `${name} is an established commercial enterprise in ${address} specializing in ${cat}. Operations rely heavily on field sales, customer orders, and cash flow reconciliation.`;
    corePainPoints = [
      "Disjointed sales channels: WhatsApp inquiries, phone calls, and walk-in orders are not centrally tracked.",
      "Paper or unbacked Excel accounting creating vulnerability to device crashes and staff turnover.",
      "Manual collection follow-ups leading to delayed B2B receivables and slow cash flow.",
      "Need for seamless integration with mobile payments (MTN MoMo / Airtel Money) and tax compliance.",
    ];
    solutionTitle = "LANGRATIA Enterprise Core: Unified Operations & Sales Automation";
    architecture = [
      "Cloud ERP & Order Ledger with role-based staff access and audit logs.",
      "WhatsApp Sales Pipeline Automation: Convert social inquiries to paid invoices in 60 seconds.",
      "Automated Payment Webhooks for instant bank and mobile money clearing.",
    ];
    estimatedImpact = "Save 15+ hours weekly of manual admin work and accelerate accounts receivable collections by 30%.";
  }

  const objectionHandlers = [
    {
      objection: "Our budget is constrained right now.",
      counter: "We structure deployments in modular milestones with immediate cash flow impact. The system typically pays for itself within 45 to 60 days through automated recovery and eliminated leakage.",
    },
    {
      objection: "Our staff is used to paper and Excel; change is too disruptive.",
      counter: "Our interface is specifically optimized for African business realities: mobile-first, requires zero software installation, and staff training takes less than 2 hours. We run parallel with your current method until 100% confidence.",
    },
    {
      objection: "We already have an internal IT person / vendor.",
      counter: "LANGRATIA does not replace internal IT; we provide the enterprise infrastructure and dedicated engineering muscle so internal staff can focus on daily support rather than building complex systems from scratch.",
    },
  ];

  const whatsAppHook = `Hello ${lead.contact_person || 'Team ' + name}, hope your week is off to a great start. I was reviewing ${name}'s operations and noticed an opportunity to streamline your customer workflows and payment tracking with LANGRATIA technology. Would you have 10 minutes this week for a brief walkthrough?`;

  const emailPitch = {
    subject: `Digital modernization & workflow automation for ${name}`,
    body: `Dear Leadership Team at ${name},\n\nI hope this email finds you well.\n\nAt LANGRATIA, we engineer tailored enterprise software and automation systems for high-performing organizations in East Africa. Having studied your operations in ${address}, we see an immediate opportunity to implement ${solutionTitle}.\n\nKey benefits we deliver:\n• ${architecture[0]}\n• ${architecture[1]}\n• ${estimatedImpact}\n\nCould we arrange a 15-minute scoping call this week?\n\nWarm regards,\nLANGRATIA Solutions Team\ninquiries@langratia.com`,
  };

  const dossier = {
    businessName: name,
    category: cat,
    sectorOverview,
    corePainPoints,
    recommendedSolution: {
      title: solutionTitle,
      architecture,
      estimatedImpact,
    },
    objectionHandlers,
    whatsAppHook,
    emailPitch,
  };

  return c.json({ success: true, dossier });
});
