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
      const [leadsRes, followupsRes, inquiriesRes] = await Promise.allSettled([
        fetchLeads(),
        fetchAllFollowups(),
        fetchInquiries(),
      ]);

      if (leadsRes.status === "fulfilled") {
        setLeads(leadsRes.value);
        setError("");
        setNotInstalled(false);
      } else {
        if (leadsRes.reason instanceof LeadsNotInstalledError) setNotInstalled(true);
        else setError((leadsRes.reason as Error)?.message || "Failed to load leads");
      }

      if (followupsRes.status === "fulfilled") {
        setFollowups(followupsRes.value);
      } else {
        setFollowups([]);
      }

      if (inquiriesRes.status === "fulfilled") {
        setInquiries(inquiriesRes.value);
      } else {
        setInquiries([]);
      }
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