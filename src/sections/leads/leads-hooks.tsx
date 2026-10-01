"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Loader2 } from "lucide-react";
import {
  LeadsNotInstalledError,
  fetchActivities,
  fetchAllFollowups,
  fetchFollowups,
  fetchLeads,
  type Lead,
  type LeadActivity,
  type LeadFollowup,
} from "@/lib/leads";

/* ============================================================
   Shared data loading for the Leads sub-pages.
   Each sub-page is its own "page" — it fetches on mount and
   shows a loading state, the migration banner, or the view.
   ============================================================ */

export function useLeadsData() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followups, setFollowups] = useState<LeadFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const [notInstalled, setNotInstalled] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [l, f] = await Promise.all([fetchLeads(), fetchAllFollowups()]);
      setLeads(l);
      setFollowups(f);
      setError("");
      setNotInstalled(false);
    } catch (err) {
      if (err instanceof LeadsNotInstalledError) setNotInstalled(true);
      else setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { leads, followups, loading, notInstalled, error, refresh };
}

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
  window.dispatchEvent(new CustomEvent("langratia:nav", { detail: id }));
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
        <p className="mt-2 text-sm text-[#d4d4d4]">
          The leads tables don't exist in your Supabase project yet. Apply the migration in the Supabase SQL editor:
        </p>
        <p className="mt-3 rounded-lg border border-[#2b2b2b] bg-black px-4 py-3 font-mono text-xs text-emerald-400">
          artifacts/langratia/supabase/migrations/0001_leads_crm.sql
        </p>
        <p className="mt-2 text-xs text-[#8a8a8a]">
          Open Supabase → project <span className="font-mono">sriwrevcvwrzkgppzvst</span> → SQL editor → paste the file →
          Run. Then refresh.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5c5c5c]">Loading…</p>
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