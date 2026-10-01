"use client";

import { useState } from "react";
import { useLeadsData, LeadsGate } from "./leads-hooks";
import Finder from "./Finder";
import AddLeadModal, { type LeadDraft } from "./AddLeadModal";
import { useLeadProfile } from "./leads-hooks";

export default function LeadsFinderPage() {
  const { leads, loading, notInstalled, error, refresh } = useLeadsData();
  const profile = useLeadProfile();
  const [draft, setDraft] = useState<LeadDraft | undefined>(undefined);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <LeadsGate loading={loading} notInstalled={notInstalled} error={error}>
        <Finder
          leads={leads}
          onLeadsChanged={refresh}
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