"use client";

import { useState } from "react";
import { PageHeader } from "@/app/admin/ui";
import { useLeadsData, useLeadProfile, LeadsGate, navigateSection } from "./leads-hooks";
import Overview, { type RecentEvent } from "./Overview";
import LeadProfile from "./LeadProfile";
import AddLeadModal, { type LeadDraft } from "./AddLeadModal";
import { formatValue, todayIso } from "@/lib/leads";

export default function LeadsOverviewPage() {
  const { leads, followups, loading, notInstalled, error, refresh } = useLeadsData();
  const profile = useLeadProfile();
  const [showAdd, setShowAdd] = useState(false);
  const [finderDraft, setFinderDraft] = useState<LeadDraft | undefined>(undefined);

  const recent: RecentEvent[] = [];
  for (const l of leads) {
    if (l.converted_at) recent.push({ lead: l, at: l.converted_at, text: "Converted to customer" });
    recent.push({ lead: l, at: l.created_at, text: "Lead created" });
  }
  for (const f of followups) {
    const lead = leads.find((x) => x.id === f.lead_id);
    if (!lead) continue;
    recent.push({ lead, at: f.created_at, text: `Follow-up scheduled for ${f.followup_date}` });
    if (f.completed_at) recent.push({ lead, at: f.completed_at, text: "Follow-up completed" });
  }

  const selected = profile.selectedId ? leads.find((l) => l.id === profile.selectedId) ?? null : null;
  const selectedFollowups = profile.selectedId ? followups.filter((f) => f.lead_id === profile.selectedId) : [];

  return (
    <div>
      <PageHeader
        title="Leads · Overview"
        subtitle="Discover, qualify, follow up, and convert"
        actions={
          <button
            onClick={() => { setFinderDraft(undefined); setShowAdd(true); }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-500/20 transition-colors hover:bg-sky-400"
          >
            + New Lead
          </button>
        }
      />

      <LeadsGate loading={loading} notInstalled={notInstalled} error={error}>
        <Overview
          leads={leads}
          recent={recent}
          onAddLead={() => setShowAdd(true)}
          onOpenLead={profile.open}
          onFinder={() => navigateSection("leads_finder")}
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