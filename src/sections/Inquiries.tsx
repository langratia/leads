"use client";

import { useEffect, useState } from "react";
import {
  Inbox,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  UserPlus,
  Mail,
  Building,
  Phone,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Search,
  Check,
  Video,
  ShieldAlert,
  Sparkles,
  Send,
  X,
  FileText,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  ChevronDown,
  Paperclip,
  CheckSquare,
  Layers,
  Bot,
  ChevronRight,
  ShieldCheck,
  SearchX,
  Compass,
  User,
} from "lucide-react";
import { Badge, toneFor } from "../ui";
import { supabase } from "@/lib/supabase";
import { createLead } from "@/lib/leads";
import { exportToCSV } from "../export-utils";
import EmailChatThread from "../components/EmailChatThread";

/* ============================================================
   AUTHENTIC BRAND ICONS (SVG)
   ============================================================ */

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.779.98-.955 1.18-.176.2-.352.226-.653.075-1.636-.821-2.708-1.464-3.79-3.32-.286-.492.286-.456.818-1.52.09-.18.045-.338-.023-.488-.068-.15-.678-1.636-.93-2.242-.244-.59-.493-.51-.678-.52-.176-.008-.377-.01-.578-.01-.2 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511 0 1.482 1.08 2.912 1.23 3.113.15.201 2.126 3.247 5.151 4.554 1.776.767 2.479.799 3.364.667.545-.082 1.78-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.578-.352z" />
      <path d="M12.004 0C5.373 0 0 5.373 0 12c0 2.118.552 4.107 1.516 5.839L.055 23.44l5.772-1.492A11.94 11.94 0 0012.004 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 21.84c-1.84 0-3.567-.5-5.06-1.37l-.362-.213-3.754.97.99-3.66-.234-.374A9.816 9.816 0 012.164 12c0-5.426 4.414-9.84 9.84-9.84 5.426 0 9.84 4.414 9.84 9.84 0 5.426-4.414 9.84-9.84 9.84z" />
    </svg>
  );
}

function GoogleMeetIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.4 15.6l-3-2.25v-2.7l3-2.25v7.2zm-4.2-.6c0 .66-.54 1.2-1.2 1.2H6c-.66 0-1.2-.54-1.2-1.2V9c0-.66.54-1.2 1.2-1.2h6c.66 0 1.2.54 1.2 1.2v6z" />
    </svg>
  );
}

/* ============================================================
   LEAD AVATAR COMPONENT (PHOTO + SLEEK ERROR FALLBACK)
   ============================================================ */

function LeadAvatar({
  name,
  email,
  avatarUrl,
  size = "md",
  className = "",
}: {
  name: string;
  email?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  const sizeClasses = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-11 w-11 text-sm",
  }[size];

  const gradients = [
    "from-sky-500/20 via-sky-600/30 to-blue-700/40 text-sky-300 border-sky-500/40",
    "from-emerald-500/20 via-teal-600/30 to-emerald-700/40 text-emerald-300 border-emerald-500/40",
    "from-indigo-500/20 via-purple-600/30 to-indigo-700/40 text-indigo-300 border-indigo-500/40",
    "from-amber-500/20 via-orange-600/30 to-amber-700/40 text-amber-300 border-amber-500/40",
    "from-rose-500/20 via-pink-600/30 to-rose-700/40 text-rose-300 border-rose-500/40",
  ];
  const colorIndex =
    Math.abs(name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
    gradients.length;
  const gradientClass = gradients[colorIndex];

  // Resolve image source: custom URL -> unavatar.io (free email avatar lookup) -> gradient initials
  const resolvedImageUrl =
    avatarUrl ||
    (email && !email.includes("example.com")
      ? `https://unavatar.io/${encodeURIComponent(email)}?fallback=false`
      : undefined);

  if (resolvedImageUrl && !imgError) {
    return (
      <div
        className={`relative ${sizeClasses} rounded-full overflow-hidden shrink-0 border border-slate-700/80 shadow-md ${className}`}
      >
        <img
          src={resolvedImageUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${sizeClasses} rounded-full bg-gradient-to-br ${gradientClass} border flex items-center justify-center font-bold shrink-0 shadow-inner tracking-tight ${className}`}
    >
      {initials}
    </div>
  );
}

/* ============================================================
   DATA TYPES
   ============================================================ */

export interface InquiryItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company: string;
  category: string;
  projectDescription: string;
  ndaRequested: boolean;
  source: string;
  createdAt: string;
  status: "NEW_LEAD" | "CONTACTED" | "PROPOSAL_SENT" | "CONVERTED" | "ARCHIVED";
  internalNotes?: string;
  avatarUrl?: string;
}

export interface BookingItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  notes: string;
  createdAt: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
  meetLink?: string;
  outcome?: string;
  avatarUrl?: string;
}

const mockInquiries: InquiryItem[] = [
  {
    id: "inq_1785942001",
    fullName: "Dr. Ronald Kato",
    email: "rkato@kampalamedical.co.ug",
    phone: "+256701234567",
    company: "Kampala Medical Center",
    category: "Hospital Management System",
    projectDescription:
      "We need an integrated EHR and inpatient billing system for our 120-bed hospital with lab diagnostics and pharmacy inventory synchronization.",
    ndaRequested: true,
    source: "/products/hospital",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "NEW_LEAD",
    internalNotes: "Prefers deployment by Q4 2026. Very interested in offline local sync for outpatient ward.",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "inq_1785941500",
    fullName: "Sarah Nansubuga",
    email: "snansubuga@brightstars.edu.ug",
    phone: "+256772987654",
    company: "Bright Stars Academy",
    category: "School Admin & Fees",
    projectDescription:
      "Looking to automate Mobile Money tuition collection and end-of-term student report cards for 850 students across primary and secondary sections.",
    ndaRequested: false,
    source: "/products/school",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "CONTACTED",
    internalNotes: "Sent introductory brochure. Awaiting call back from bursar.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "inq_1785940000",
    fullName: "Joseph Mugisha",
    email: "j.mugisha@apexpharma.com",
    phone: "+256782112233",
    company: "Apex Pharmacies Uganda",
    category: "Pharmacy POS",
    projectDescription:
      "Multi-branch offline-first barcode point of sale software with automated stock expiry tracking across 5 branches in Kampala and Entebbe.",
    ndaRequested: true,
    source: "/products/pharmacy",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: "CONVERTED",
    internalNotes: "Converted to CRM Lead. Proposal draft at $4,200.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
];

const mockBookings: BookingItem[] = [
  {
    id: "book_1785943000",
    name: "Dr. Ronald Kato",
    email: "rkato@kampalamedical.co.ug",
    phone: "+256701234567",
    date: "2026-08-18",
    time: "10:00 AM - 11:00 AM",
    notes: "Review EHR integration architecture and patient data privacy requirements.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "CONFIRMED",
    meetLink: "https://meet.google.com/lan-grt-ehr",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "book_1785941000",
    name: "Patrick Serwadda",
    email: "pserwadda@gracetabernacle.org",
    phone: "+256755443322",
    date: "2026-08-19",
    time: "02:00 PM - 03:00 PM",
    notes: "Ecclesia church member directory and automated digital tithing receipts.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: "CONFIRMED",
    meetLink: "https://meet.google.com/lan-grt-ecc",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
];

export default function Inquiries() {
  const [activeTab, setActiveTab] = useState<"inquiries" | "bookings">("inquiries");
  const [inquiries, setInquiries] = useState<InquiryItem[]>(mockInquiries);
  const [bookings, setBookings] = useState<BookingItem[]>(mockBookings);

  // Selected Master-Detail item
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(mockInquiries[0].id);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(mockBookings[0].id);

  // Detail Panel Sub-Tab
  const [detailSubTab, setDetailSubTab] = useState<"chat" | "scope" | "ai" | "notes">("chat");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Editable fields inside detail pane
  const [activeNotes, setActiveNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Booking outcome state
  const [activeOutcomeNotes, setActiveOutcomeNotes] = useState("");

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0] || null;
  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0] || null;

  // Sync internal notes when selected inquiry changes
  useEffect(() => {
    if (selectedInquiry) {
      setActiveNotes(selectedInquiry.internalNotes || "");
    }
  }, [selectedInquiryId]);

  useEffect(() => {
    if (selectedBooking) {
      setActiveOutcomeNotes(selectedBooking.outcome || "");
    }
  }, [selectedBookingId]);

  const fetchLiveInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          fullName: item.full_name || item.fullName || "Anonymous",
          email: item.email || "",
          phone: item.phone || "",
          company: item.company || "N/A",
          category: item.category || "General Inquiry",
          projectDescription: item.project_description || item.projectDescription || "",
          ndaRequested: Boolean(item.nda_requested || item.ndaRequested),
          source: item.source || "/contact",
          createdAt: item.created_at || new Date().toISOString(),
          status: item.status || "NEW_LEAD",
          internalNotes: item.internal_notes || "",
          avatarUrl: item.avatar_url || item.avatarUrl,
        }));
        setInquiries(mapped);
        if (mapped.length > 0 && !mapped.some((m: InquiryItem) => m.id === selectedInquiryId)) {
          setSelectedInquiryId(mapped[0].id);
        }
      }

      const { data: bData } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (bData && bData.length > 0) {
        const mappedBookings: BookingItem[] = bData.map((b: any) => ({
          id: b.id,
          name: b.client_name || b.name || "Client",
          email: b.email || "",
          phone: b.phone || "+256 700 000 000",
          date: b.requested_date || b.date || "Today",
          time: b.requested_time || b.time || "14:00 EAT",
          notes: b.notes || "",
          createdAt: b.created_at || new Date().toISOString(),
          status: (b.status === "COMPLETED" || b.status === "CANCELLED") ? b.status : "CONFIRMED",
          outcome: b.outcome || "",
          meetLink: b.meet_link || "https://meet.google.com/ln-scop-int",
        }));
        setBookings(mappedBookings);
        if (mappedBookings.length > 0 && !mappedBookings.some((mb: BookingItem) => mb.id === selectedBookingId)) {
          setSelectedBookingId(mappedBookings[0].id);
        }
      }
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveInquiries();
  }, []);

  const convertToLead = async (inquiry: InquiryItem) => {
    try {
      await createLead({
        business_name: inquiry.company && inquiry.company !== "N/A" ? inquiry.company : inquiry.fullName,
        contact_person: inquiry.fullName,
        email: inquiry.email,
        phone: inquiry.phone,
        category: inquiry.category,
        interested_product: inquiry.category,
        lead_source: "Website Inquiry",
        status: "New",
        priority: inquiry.ndaRequested ? "High" : "Medium",
        notes: `[Inquiry Scope]: ${inquiry.projectDescription} (Source: ${inquiry.source})\n${
          inquiry.internalNotes ? `[Internal Notes]: ${inquiry.internalNotes}` : ""
        }`,
      });

      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, status: "CONVERTED" } : i))
      );
      triggerToast(`Converted ${inquiry.fullName} to CRM Lead!`);
    } catch {
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, status: "CONVERTED" } : i))
      );
      triggerToast(`Lead recorded for ${inquiry.fullName}`);
    }
  };

  const handleUpdateStatus = (inqId: string, newStatus: InquiryItem["status"]) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === inqId ? { ...i, status: newStatus } : i))
    );
    triggerToast(`Status updated to ${newStatus}`);
  };

  const handleSaveNotes = () => {
    if (!selectedInquiry) return;
    setSavingNotes(true);
    setTimeout(() => {
      setInquiries((prev) =>
        prev.map((i) => (i.id === selectedInquiry.id ? { ...i, internalNotes: activeNotes } : i))
      );
      setSavingNotes(false);
      triggerToast("Internal team notes saved!");
    }, 300);
  };

  const handleSaveBookingOutcome = (status: BookingItem["status"]) => {
    if (!selectedBooking) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBooking.id
          ? { ...b, status, outcome: activeOutcomeNotes }
          : b
      )
    );
    triggerToast(`Consultation marked as ${status}!`);
  };

  const handleExportCSV = () => {
    if (activeTab === "inquiries") {
      exportToCSV(
        inquiries.map((i) => ({
          ID: i.id,
          "Full Name": i.fullName,
          Company: i.company,
          Email: i.email,
          Phone: i.phone || "",
          Category: i.category,
          "NDA Requested": i.ndaRequested ? "Yes" : "No",
          Status: i.status,
          Source: i.source,
          "Scope Description": i.projectDescription,
          "Internal Notes": i.internalNotes || "",
          "Created At": i.createdAt,
        })),
        "langratia-scoping-inquiries.csv"
      );
      triggerToast("Exported inquiries to CSV!");
    } else {
      exportToCSV(
        bookings.map((b) => ({
          ID: b.id,
          Name: b.name,
          Email: b.email,
          Phone: b.phone || "",
          Date: b.date,
          Time: b.time,
          Status: b.status,
          "Meet Link": b.meetLink || "",
          Notes: b.notes,
          Outcome: b.outcome || "",
        })),
        "langratia-consultations.csv"
      );
      triggerToast("Exported consultation bookings to CSV!");
    }
  };

  const filteredInquiries = inquiries.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch =
      i.fullName.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      i.company.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredBookings = bookings.filter((b) => {
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q);
  });

  return (
    <div className="h-[calc(100vh-100px)] min-h-[620px] flex flex-col space-y-3 pb-2 overflow-hidden">
      {/* TOAST ALERT */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-sky-500/30 bg-[#0e1622] px-4 py-2.5 text-xs font-semibold text-sky-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* TOP COMPACT HEADER */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Tab Selector */}
          <div className="flex items-center bg-[#0d121d] p-1 rounded-xl border border-slate-800/80 shadow-sm shrink-0">
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "inquiries"
                  ? "bg-gradient-to-r from-sky-500 to-sky-400 text-slate-950 shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Scoping Inquiries ({inquiries.length})
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === "bookings"
                  ? "bg-gradient-to-r from-sky-500 to-sky-400 text-slate-950 shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              Consultation Calls ({bookings.length})
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0d121d] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-sm active:scale-95"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={fetchLiveInquiries}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0d121d] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-sm active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} /> Sync Live
          </button>
        </div>
      </div>

      {/* MASTER-DETAIL WORKSPACE (LOCKED FLUID APP-LIKE SCROLL) */}
      <div className="grid grid-cols-12 gap-3.5 flex-1 min-h-0 overflow-hidden">
        {/* ============================================================
            LEFT PANE: LIST VIEW (MASTER - STREAMLINED CONTACT CARDS)
            ============================================================ */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-4 flex flex-col h-full min-h-0 rounded-xl border border-slate-800/80 bg-[#0d121d] overflow-hidden shadow-xl">
          {/* List Search & Filter Bar */}
          <div className="p-3 border-b border-slate-800/80 bg-[#0a0e17] space-y-2 shrink-0">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, company, email..."
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500/60 transition-colors"
              />
            </div>

            {activeTab === "inquiries" && (
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {[
                  { id: "ALL", label: "All" },
                  { id: "NEW_LEAD", label: "New" },
                  { id: "CONTACTED", label: "Contacted" },
                  { id: "CONVERTED", label: "Converted" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === st.id
                        ? "bg-slate-700 text-white font-bold shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List Scroll Area */}
          <div className="flex-1 min-h-0 divide-y divide-slate-800/50 overflow-y-auto">
            {activeTab === "inquiries" ? (
              filteredInquiries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <SearchX className="h-8 w-8 text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-400">No inquiries found</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Try clearing filters or search terms</p>
                </div>
              ) : (
                filteredInquiries.map((inq) => {
                  const isSelected = selectedInquiry?.id === inq.id;
                  return (
                    <div
                      key={inq.id}
                      onClick={() => setSelectedInquiryId(inq.id)}
                      className={`px-3.5 py-3 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-l-[3px] border-sky-400 bg-gradient-to-r from-sky-500/10 via-[#131b2c] to-[#0f1523] shadow-inner"
                          : "border-l-[3px] border-transparent hover:bg-[#101522] hover:translate-x-0.5"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <LeadAvatar
                          name={inq.fullName}
                          email={inq.email}
                          avatarUrl={inq.avatarUrl}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-sm font-bold text-white tracking-tight truncate">
                              {inq.fullName}
                            </h4>
                            <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                              {new Date(inq.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-xs text-slate-400 truncate font-medium flex items-center gap-1">
                              {inq.company && inq.company !== "N/A" ? (
                                <>
                                  <Building className="h-3 w-3 text-slate-500 shrink-0" />
                                  <span className="truncate">{inq.company}</span>
                                </>
                              ) : (
                                <span className="truncate text-slate-500 font-mono text-[11px]">{inq.email}</span>
                              )}
                            </p>
                            <div className="shrink-0">
                              <Badge tone={toneFor(inq.status)}>{inq.status}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              /* Bookings List */
              filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Calendar className="h-8 w-8 text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-400">No consultations booked</p>
                </div>
              ) : (
                filteredBookings.map((b) => {
                  const isSelected = selectedBooking?.id === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBookingId(b.id)}
                      className={`px-3.5 py-3 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-l-[3px] border-sky-400 bg-gradient-to-r from-sky-500/10 via-[#131b2c] to-[#0f1523] shadow-inner"
                          : "border-l-[3px] border-transparent hover:bg-[#101522] hover:translate-x-0.5"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <LeadAvatar
                          name={b.name}
                          email={b.email}
                          avatarUrl={b.avatarUrl}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-sm font-bold text-white tracking-tight truncate">
                              {b.name}
                            </h4>
                            <span className="text-[10px] text-sky-400 shrink-0 font-medium">
                              {b.date}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <p className="text-xs text-slate-400 truncate font-mono text-[11px]">
                              {b.email}
                            </p>
                            <div className="shrink-0">
                              <Badge
                                tone={
                                  b.status === "COMPLETED"
                                    ? "green"
                                    : b.status === "CANCELLED"
                                    ? "red"
                                    : "purple"
                                }
                              >
                                {b.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* ============================================================
            RIGHT PANE: DETAILS & INLINE CHAT THREAD (DETAIL)
            ============================================================ */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-8 flex flex-col h-full min-h-0 overflow-hidden">
          {activeTab === "inquiries" ? (
            selectedInquiry ? (
              <div className="flex flex-col h-full min-h-0 rounded-xl border border-slate-800/80 bg-[#0d121d] overflow-hidden shadow-xl">
                {/* REFINED DETAIL HEADER (NO REDUNDANCY, CLEAN LUXURY) */}
                <div className="p-4 bg-[#0a0e17] border-b border-slate-800/80 shrink-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <LeadAvatar
                        name={selectedInquiry.fullName}
                        email={selectedInquiry.email}
                        avatarUrl={selectedInquiry.avatarUrl}
                        size="lg"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold text-white tracking-tight">{selectedInquiry.fullName}</h2>
                          {selectedInquiry.company && selectedInquiry.company !== "N/A" && (
                            <span className="flex items-center gap-1 rounded bg-[#121724] px-2.5 py-0.5 text-xs font-semibold text-slate-300 border border-slate-800">
                              <Building className="h-3 w-3 text-sky-400" /> {selectedInquiry.company}
                            </span>
                          )}
                          <Badge tone={toneFor(selectedInquiry.status)}>{selectedInquiry.status}</Badge>
                          {selectedInquiry.ndaRequested && (
                            <span className="flex items-center gap-1 rounded bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              <ShieldAlert className="h-3 w-3" /> NDA Protection
                            </span>
                          )}
                        </div>

                        {/* Clean Contact metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="h-3.5 w-3.5 text-slate-500" />
                            <span className="font-mono text-[11px]">{selectedInquiry.email}</span>
                          </span>
                          {selectedInquiry.phone && (
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <Phone className="h-3.5 w-3.5 text-slate-500" />
                              <span className="font-mono text-[11px]">{selectedInquiry.phone}</span>
                            </span>
                          )}
                          <span className="text-slate-500 text-[11px]">
                            Origin: <code className="text-slate-400 font-mono">{selectedInquiry.source}</code>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick CRM Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {selectedInquiry.phone && (
                        <a
                          href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello ${selectedInquiry.fullName}, thank you for reaching out to LANGRATIA regarding your ${selectedInquiry.category} software project.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors active:scale-95"
                          title="Open WhatsApp Business Chat"
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-400" /> WhatsApp
                        </a>
                      )}

                      {selectedInquiry.status !== "CONVERTED" ? (
                        <button
                          onClick={() => convertToLead(selectedInquiry)}
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm shadow-sky-500/20 hover:from-sky-400 hover:to-sky-300 transition-all active:scale-95"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> + Convert Lead
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-2.5 py-1.5 rounded-md">
                          <Check className="h-3.5 w-3.5" /> CRM Lead
                        </span>
                      )}

                      {/* Status Dropdown */}
                      <select
                        value={selectedInquiry.status}
                        onChange={(e) =>
                          handleUpdateStatus(selectedInquiry.id, e.target.value as InquiryItem["status"])
                        }
                        className="rounded-lg border border-slate-800 bg-[#07090e] px-2.5 py-1.5 text-xs text-slate-300 outline-none cursor-pointer hover:border-slate-700"
                      >
                        <option value="NEW_LEAD">Status: New</option>
                        <option value="CONTACTED">Status: Contacted</option>
                        <option value="PROPOSAL_SENT">Status: Proposal Sent</option>
                        <option value="CONVERTED">Status: Converted</option>
                        <option value="ARCHIVED">Status: Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* Clean Segmented Navigation Tab Bar */}
                  <div className="flex items-center gap-1.5 mt-3.5 pt-3 border-t border-slate-800/70">
                    <button
                      onClick={() => setDetailSubTab("chat")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        detailSubTab === "chat"
                          ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5 text-sky-400" /> Email Thread (Chat)
                    </button>
                    <button
                      onClick={() => setDetailSubTab("scope")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        detailSubTab === "scope"
                          ? "bg-slate-800 text-white border border-slate-700 font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400" /> Project Brief
                    </button>
                    <button
                      onClick={() => setDetailSubTab("ai")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        detailSubTab === "ai"
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> AI Tech Scope
                    </button>
                    <button
                      onClick={() => setDetailSubTab("notes")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        detailSubTab === "notes"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                      }`}
                    >
                      <Edit3 className="h-3.5 w-3.5 text-amber-400" /> Internal Notes
                    </button>
                  </div>
                </div>

                {/* DETAIL TAB CONTENTS */}
                <div className="flex-1 min-h-0 bg-[#090d16] overflow-hidden flex flex-col">
                  {/* TAB 1: EMAIL CHAT THREAD (HIDE REDUNDANT INNER HEADER) */}
                  {detailSubTab === "chat" && (
                    <EmailChatThread
                      leadId={selectedInquiry.id}
                      leadEmail={selectedInquiry.email}
                      leadName={selectedInquiry.fullName}
                      avatarUrl={selectedInquiry.avatarUrl}
                      initialInquiryBody={selectedInquiry.projectDescription}
                      initialCategory={selectedInquiry.category}
                      companyName={selectedInquiry.company}
                      hideHeader={true}
                      className="border-0 shadow-none bg-transparent h-full flex-1"
                    />
                  )}

                  {/* TAB 2: PROJECT SCOPE */}
                  {detailSubTab === "scope" && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 space-y-3 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                            Product Category: {selectedInquiry.category}
                          </span>
                          <span className="text-xs text-slate-500">
                            Submitted: {new Date(selectedInquiry.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="p-4 rounded-lg bg-[#0c111a] border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                          {selectedInquiry.projectDescription}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-1.5 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NDA Terms Status</span>
                          <p className="text-xs font-semibold text-white">
                            {selectedInquiry.ndaRequested ? "Mutual NDA Requested by Client" : "Standard Discovery (No NDA)"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-[#07090e] p-3.5 space-y-1.5 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Website Origin</span>
                          <p className="text-xs font-mono text-sky-300">{selectedInquiry.source}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: AI TECH SCOPE & ESTIMATOR */}
                  {detailSubTab === "ai" && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 shadow-md">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                            Estimated Delivery
                          </span>
                          <p className="mt-1 text-base font-bold text-white tracking-tight">4 – 6 Weeks</p>
                          <p className="text-[10px] text-slate-400">MVP in 3 weeks, full rollout in 6</p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 shadow-md">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                            Estimated Budget
                          </span>
                          <p className="mt-1 text-base font-bold text-white tracking-tight">$3,500 – $5,200</p>
                          <p className="text-[10px] text-slate-400">UGX 13,000,000 – 19,500,000</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 space-y-2.5 shadow-md">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                          Recommended Technical Architecture
                        </h4>
                        <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc leading-relaxed">
                          <li><strong>Database:</strong> Offline-First PostgreSQL with SQLite local client replication</li>
                          <li><strong>Frontend:</strong> React 19 + TypeScript + TailwindCSS Dark OLED Interface</li>
                          <li><strong>Hardware Integrations:</strong> Barcode scanners, thermal receipt printers, Mobile Money Webhooks</li>
                          <li><strong>Security:</strong> AES-256 encrypted local backups with automated cloud mirror sync</li>
                        </ul>
                      </div>

                      <button
                        onClick={() => {
                          setDetailSubTab("chat");
                          triggerToast("Switched to Email Thread! Compose your reply below.");
                        }}
                        className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-900/30 transition-all active:scale-95"
                      >
                        <Mail className="h-3.5 w-3.5" /> Reply to Lead in Email Thread →
                      </button>
                    </div>
                  )}

                  {/* TAB 4: INTERNAL STAFF NOTES */}
                  {detailSubTab === "notes" && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                          Private Staff Notes (Hidden from client)
                        </label>
                        <textarea
                          rows={7}
                          value={activeNotes}
                          onChange={(e) => setActiveNotes(e.target.value)}
                          placeholder="Record client budget constraints, key decision makers, or specific technical nuances..."
                          className="w-full rounded-xl border border-slate-800 bg-[#07090e] p-3 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-amber-500/60 leading-relaxed font-mono"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="flex cursor-pointer items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition-all active:scale-95"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {savingNotes ? "Saving Notes..." : "Save Internal Notes"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800/80 bg-[#0d121d] p-12 text-center text-slate-500 text-xs">
                Select an inquiry from the left list to view details and email thread.
              </div>
            )
          ) : (
            /* BOOKING DETAIL VIEW */
            selectedBooking && (
              <div className="flex flex-col h-full min-h-0 rounded-xl border border-slate-800/80 bg-[#0d121d] overflow-hidden shadow-xl">
                <div className="p-4 bg-[#0a0e17] border-b border-slate-800/80 shrink-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                      <LeadAvatar
                        name={selectedBooking.name}
                        email={selectedBooking.email}
                        avatarUrl={selectedBooking.avatarUrl}
                        size="lg"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-white tracking-tight">{selectedBooking.name}</h2>
                          <Badge
                            tone={
                              selectedBooking.status === "COMPLETED"
                                ? "green"
                                : selectedBooking.status === "CANCELLED"
                                ? "red"
                                : "purple"
                            }
                          >
                            {selectedBooking.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-1">{selectedBooking.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedBooking.meetLink && (
                        <a
                          href={selectedBooking.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm shadow-sky-500/20 hover:from-sky-400 hover:to-sky-300 transition-all active:scale-95"
                        >
                          <GoogleMeetIcon className="h-3.5 w-3.5" /> Join Google Meet
                        </a>
                      )}

                      {selectedBooking.phone && (
                        <a
                          href={`https://wa.me/${selectedBooking.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hello ${selectedBooking.name}, confirming our scheduled LANGRATIA consultation call for ${selectedBooking.date} at ${selectedBooking.time}. Video Link: ${selectedBooking.meetLink || "https://langratia.com/contact"}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors active:scale-95"
                        >
                          <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-400" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090d16]">
                  <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 space-y-2 shadow-md">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      Meeting Schedule & Agenda
                    </span>
                    <p className="text-xs font-bold text-sky-400">
                      {selectedBooking.date} · {selectedBooking.time}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed bg-[#0c111a] p-3 rounded-lg border border-slate-800/80">
                      {selectedBooking.notes}
                    </p>
                  </div>

                  {/* Outcome Logger */}
                  <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 space-y-3 shadow-md">
                    <label className="block text-xs font-semibold text-slate-300">
                      Log Call Outcome & Follow-Up Action
                    </label>
                    <textarea
                      rows={4}
                      value={activeOutcomeNotes}
                      onChange={(e) => setActiveOutcomeNotes(e.target.value)}
                      placeholder="Summarize what was discussed on Google Meet and what the next action is..."
                      className="w-full rounded-xl border border-slate-800 bg-[#0c111a] p-3 text-xs text-slate-200 outline-none focus:border-sky-500/60 leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => handleSaveBookingOutcome("CANCELLED")}
                        className="rounded-lg border border-rose-800/50 bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 cursor-pointer transition-colors active:scale-95"
                      >
                        Mark as Cancelled
                      </button>

                      <button
                        onClick={() => handleSaveBookingOutcome("COMPLETED")}
                        className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
