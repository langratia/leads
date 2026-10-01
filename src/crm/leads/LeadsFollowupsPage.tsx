"use client";

import { useLeadsData, useLeadProfile, LeadsGate } from "./leads-hooks";
import FollowUps from "./FollowUps";
import LeadProfile from "./LeadProfile";

export default function LeadsFollowupsPage() {
  const { leads, followups, loading, notInstalled, error, refresh } = useLeadsData();
  const profile = useLeadProfile();

  const selected = profile.selectedId ? leads.find((l) => l.id === profile.selectedId) ?? null : null;

  return (
    <div>
      <LeadsGate loading={loading} notInstalled={notInstalled} error={error}>
        <FollowUps leads={leads} followups={followups} onRefresh={refresh} />
      </LeadsGate>

      {selected && (
        <LeadProfile
          lead={selected}
          activities={profile.activities}
          followups={followups.filter((f) => f.lead_id === selected.id)}
          onClose={profile.close}
          onChanged={() => profile.refreshSelected(selected.id).then(refresh)}
        />
      )}
    </div>
  );
}