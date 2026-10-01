"use client";

import { useState } from "react";
import { useLeadsData, LeadsGate, useLeadProfile } from "./leads-hooks";
import Finder from "./Finder";
import LeadProfile from "./LeadProfile";
import AddLeadModal, { type LeadDraft } from "./AddLeadModal";

export default function LeadsFinderPage() {
  const { leads, followups, loading, notInstalled, error, refresh } = useLeadsData();
  const profile = useLeadProfile();
  const [draft, setDraft] = useState<LeadDraft | undefined>(undefined);
  const [showAdd, setShowAdd] = useState(false);

  const selected = profile.selectedId ? leads.find((l) => l.id === profile.selectedId) ?? null : null;
  const selectedFollowups = profile.selectedId
    ? followups.filter((f) => f.lead_id === profile.selectedId)
    : [];

  return (
    <div>
      <LeadsGate loading={loading} notInstalled={notInstalled} error={error}>
        <Finder
          leads={leads}
          onLeadsChanged={refresh}
          onOpenSavedLead={profile.open}
          onSaveBusiness={(b) => {
            setDraft({
              business_name: b.business_name,
              category: b.category,
              phone: b.phone,
              website: b.website,
              address: b.address,
              latitude: b.latitude,
              longitude: b.longitude,
              place_id: b.place_id,
              rating: b.rating,
              review_count: b.reviews,
            });
            setShowAdd(true);
          }}
        />
      </LeadsGate>

      {/* LEAD PROFILE DRAWER — the "Add details" path from a saved result. */}
      {selected && (
        <LeadProfile
          lead={selected}
          activities={profile.activities}
          followups={selectedFollowups}
          onClose={profile.close}
          onChanged={() => profile.refreshSelected(selected.id).then(refresh)}
        />
      )}

      {/* ADD LEAD MODAL — the deliberate, thorough save path. */}
      {showAdd && (
        <AddLeadModal
          initial={draft}
          onClose={() => { setShowAdd(false); setDraft(undefined); }}
          onSaved={async (id) => {
            setShowAdd(false);
            setDraft(undefined);
            await refresh();
            profile.open(id);
          }}
        />
      )}
    </div>
  );
}