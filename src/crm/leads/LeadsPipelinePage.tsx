"use client";

import { useState } from "react";
import { PageHeader } from "@/core/ui";
import { useLeadsData, useLeadProfile, LeadsGate } from "./leads-hooks";
import Pipeline from "./Pipeline";
import LeadProfile from "./LeadProfile";
import AddLeadModal from "./AddLeadModal";
import { updateLead } from "@/crm/leads";

export default function LeadsPipelinePage() {
  const { leads, followups, loading, notInstalled, error, refresh } = useLeadsData();
  const profile = useLeadProfile();
  const [showAddModal, setShowAddModal] = useState(false);

  const move = async (id: string, status: string) => {
    await updateLead(id, { status });
    await refresh();
  };

  const selected = profile.selectedId ? leads.find((l) => l.id === profile.selectedId) ?? null : null;
  const selectedFollowups = profile.selectedId ? followups.filter((f) => f.lead_id === profile.selectedId) : [];

  return (
    <div className="space-y-4">
      <LeadsGate loading={loading} notInstalled={notInstalled} error={error}>
        <Pipeline
          leads={leads}
          onOpenLead={profile.open}
          onMove={move}
          onAddLead={() => setShowAddModal(true)}
        />
      </LeadsGate>

      {/* LEAD PROFILE DRAWER */}
      {selected && (
        <LeadProfile
          lead={selected}
          activities={profile.activities}
          followups={selectedFollowups}
          onClose={profile.close}
          onChanged={() => profile.refreshSelected(selected.id).then(refresh)}
        />
      )}

      {/* ADD LEAD MODAL */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}