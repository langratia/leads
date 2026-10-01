/* Single source of truth for the leads dataset.

   Lives at the shell so switching sections does not re-download every lead.
   Pages call useLeadsData() as before — it now reads the shared copy. */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  LeadsNotInstalledError,
  fetchAllFollowups,
  fetchLeads,
  type Lead,
  type LeadFollowup,
  type InquiryRow,
  fetchInquiries,
} from "@/crm/leads";

interface LeadsContextValue {
  leads: Lead[];
  followups: LeadFollowup[];
  inquiries: InquiryRow[];
  loading: boolean;
  notInstalled: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function LeadsDataProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followups, setFollowups] = useState<LeadFollowup[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notInstalled, setNotInstalled] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [l, f, i] = await Promise.all([fetchLeads(), fetchAllFollowups(), fetchInquiries()]);
      setLeads(l);
      setFollowups(f);
      setInquiries(i);
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

  return (
    <LeadsContext.Provider
      value={{ leads, followups, inquiries, loading, notInstalled, error, refresh }}
    >
      {children}
    </LeadsContext.Provider>
  );
}

/* Returns the shared dataset. Falls back to an empty set outside the shell so
   a page rendered standalone still renders rather than throwing. */
export function useLeadsData(): LeadsContextValue {
  return (
    useContext(LeadsContext) ?? {
      leads: [],
      followups: [],
      inquiries: [],
      loading: false,
      notInstalled: false,
      error: "",
      refresh: async () => {},
    }
  );
}