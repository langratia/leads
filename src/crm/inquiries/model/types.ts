/* Record shapes for scoping inquiries and consultation bookings. */

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
