"use client";

import { useState, useEffect } from "react";
import { config } from "@/config";
import { useLeadsData, useLeadProfile, LeadsGate } from "./leads-hooks";
import AllLeads from "./AllLeads";
import LeadProfile from "./LeadProfile";
import AddLeadModal, { type LeadDraft } from "./AddLeadModal";
import { bulkUpdate } from "@/crm/leads";

export default function LeadsAllPage() {
  const { leads, followups, loading, notInstalled, error, refresh } = useLeadsData();
  const profile = useLeadProfile();
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleOpen = () => setShowAdd(true);
    window.addEventListener(config.events.openAddLead, handleOpen);
    return () => window.removeEventListener(config.events.openAddLead, handleOpen);
  }, []);

  const bulkApply = async (
    ids: string[],
    patch: { status?: string; priority?: string },
  ) => {
    await bulkUpdate(ids, patch);
    await refresh();
  };

  const selected = profile.selectedId ? leads.find((l) => l.id === profile.selectedId) ?? null : null;
  const selectedFollowups = profile.selectedId ? followups.filter((f) => f.lead_id === profile.selectedId) : [];

  return (
    <div>
      <LeadsGate loading={loading} notInstalled={notInstalled} error={error}>
        <AllLeads
          leads={leads}
          query={query}
          setQuery={setQuery}
          onOpenLead={profile.open}
          onBulkUpdate={bulkApply}
        />
      </LeadsGate>

      {showAdd && (
        <AddLeadModal
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