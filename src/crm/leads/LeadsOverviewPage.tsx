"use client";

import { useState } from "react";
import { useLeadsData, useLeadProfile, LeadsGate } from "./leads-hooks";
import Overview, { type RecentEvent } from "./Overview";
import LeadProfile from "./LeadProfile";
import AddLeadModal, { type LeadDraft } from "./AddLeadModal";

export default function LeadsOverviewPage() {
  const { leads, followups, loading, notInstalled, error, refresh } = useLeadsData();
  const profile = useLeadProfile();
  const [showAdd, setShowAdd] = useState(false);
  const [finderDraft, setFinderDraft] = useState<LeadDraft | undefined>(undefined);

  /* Ordered newest-first and capped, so a large lead table does not produce a
     "recent activity" list that is entirely lead-creation noise. */
  const recent: RecentEvent[] = [];
  for (const f of followups) {
    const lead = leads.find((x) => x.id === f.lead_id);
    if (!lead) continue;
    if (f.completed_at) recent.push({ lead, at: f.completed_at, text: "Follow-up completed" });
  }
  for (const l of leads) {
    if (l.converted_at) recent.push({ lead: l, at: l.converted_at, text: "Converted to customer" });
  }
  for (const l of leads) {
    recent.push({ lead: l, at: l.created_at, text: "Added to CRM" });
  }

  const selected = profile.selectedId ? leads.find((l) => l.id === profile.selectedId) ?? null : null;
  const selectedFollowups = profile.selectedId ? followups.filter((f) => f.lead_id === profile.selectedId) : [];

  return (
    <div>
      <LeadsGate loading={loading} notInstalled={notInstalled} error={error}>
        <Overview
          leads={leads}
          followups={followups}
          recent={recent}
          onAddLead={() => { setFinderDraft(undefined); setShowAdd(true); }}
          onOpenLead={profile.open}
        />
      </LeadsGate>

      {showAdd && (
        <AddLeadModal
          initial={finderDraft}
          onClose={() => setShowAdd(false)}
          onSaved={async (id) => {
            setShowAdd(false);
            await refresh();
            profile.open(id);
          }}
        />
      )}

      {selected && (
        <LeadProfile
          lead={selected}
          activities={profile.activities}
          followups={selectedFollowups}
          onClose={profile.close}
          onChanged={() => profile.refreshSelected(selected.id).then(refresh)}
        />
      )}
    </div>
  );
}
