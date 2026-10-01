"use client";

import { useState } from "react";
import { PageHeader } from "@/app/admin/ui";
import { useLeadsData, useLeadProfile, LeadsGate } from "./leads-hooks";
import AllLeads from "./AllLeads";
import LeadProfile from "./LeadProfile";
import AddLeadModal, { type LeadDraft } from "./AddLeadModal";
import { bulkUpdate } from "@/lib/leads";

export default function LeadsAllPage() {
  const { leads, followups, loading, notInstalled, error, refresh } = useLeadsData();
  const profile = useLeadProfile();
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");

  const bulkStatus = async (ids: string[], status: string) => {
    await bulkUpdate(ids, { status });
    await refresh();
  };

  const selected = profile.selectedId ? leads.find((l) => l.id === profile.selectedId) ?? null : null;
  const selectedFollowups = profile.selectedId ? followups.filter((f) => f.lead_id === profile.selectedId) : [];

  return (
    <div>
      <PageHeader
        title="All Leads"
        subtitle={`${leads.length} total · search, filter, and manage`}
        actions={
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-500/20 transition-colors hover:bg-sky-400"
          >
            + New Lead
          </button>
        }
      />

      <LeadsGate loading={loading} notInstalled={notInstalled} error={error}>
        <AllLeads
          leads={leads}
          query={query}
          setQuery={setQuery}
          onOpenLead={profile.open}
          onAddLead={() => setShowAdd(true)}
          onBulkStatus={bulkStatus}
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