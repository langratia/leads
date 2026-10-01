"use client";

import { useCallback, useState } from "react";
import { config } from "@/config";
import { Database, Loader2 } from "lucide-react";
import {
  fetchActivities,
  fetchFollowups,
  type Lead,
  type LeadActivity,
  type LeadFollowup,
} from "@/crm/leads";
import { useLeadsData } from "./leads-context";

/* The dataset itself lives in LeadsDataProvider, mounted by the shell so that
   switching sections does not refetch every lead. Re-exported here because
   every page already imports it from this module. */
export { useLeadsData };

export function useLeadProfile() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [followups, setFollowups] = useState<LeadFollowup[]>([]);

  const open = useCallback(async (id: string) => {
    setSelectedId(id);
    try {
      const [acts, fus] = await Promise.all([fetchActivities(id), fetchFollowups(id)]);
      setActivities(acts);
      setFollowups(fus);
    } catch {
      /* profile still opens without history */
    }
  }, []);

  const refreshSelected = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const [acts, fus] = await Promise.all([fetchActivities(id), fetchFollowups(id)]);
      setActivities(acts);
      setFollowups(fus);
    } catch {
      /* ignore */
    }
  }, []);

  const close = useCallback(() => setSelectedId(null), []);

  return { selectedId, activities, followups, open, close, refreshSelected };
}

/* ---------- navigation helper (section changes) ---------- */

export function navigateSection(id: string) {
  window.dispatchEvent(new CustomEvent(config.events.navigate, { detail: id }));
}

/* ---------- page gate ---------- */

export function LeadsGate({
  loading,
  notInstalled,
  error,
  children,
}: {
  loading: boolean;
  notInstalled: boolean;
  error: string;
  children: React.ReactNode;
}) {
  if (notInstalled) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Leads database is not set up yet</h3>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          The leads tables don't exist in your Supabase project yet. Apply the migration in the Supabase SQL editor:
        </p>
        <p className="mt-3 rounded-lg border border-slate-800 bg-black px-4 py-3 font-mono text-xs text-emerald-400">
          supabase/migrations/0001_leads_crm.sql
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-400">
        {error}
      </div>
    );
  }

  return <>{children}</>;
}