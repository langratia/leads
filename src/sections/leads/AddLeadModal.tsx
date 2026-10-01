"use client";

import { useState, type FormEvent } from "react";
import { X, MapPin, Building2, Phone, Globe, Loader2, Star } from "lucide-react";
import { btnPrimary, btnGhost, inputCls, Field } from "@/app/admin/ui";
import {
  createLead,
  geocodeAddress,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  FOLLOWUP_METHODS,
  computeLeadScore,
  todayIso,
  type LeadInput,
  type FoundBusiness,
} from "@/lib/leads";

export interface LeadDraft {
  business_name: string;
  category?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  place_id?: string | null;
  rating?: number | null;
  review_count?: number | null;
}

export default function AddLeadModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: LeadDraft;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const [form, setForm] = useState<Record<string, string>>({
    business_name: initial?.business_name ?? "",
    category: initial?.category ?? "",
    contact_person: initial?.contact_person ?? "",
    phone: initial?.phone ?? "",
    whatsapp: initial?.whatsapp ?? "",
    email: initial?.email ?? "",
    website: initial?.website ?? "",
    address: initial?.address ?? "",
    interested_product: "",
    lead_source: initial ? "Lead Finder" : "Website",
    status: "New",
    priority: "Medium",
    assigned_to: "",
    estimated_value: "",
    next_followup_date: "",
    followup_time: "",
    followup_method: "Call",
    tags: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState("");
  const [geoNote, setGeoNote] = useState("");

  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.business_name.trim()) {
      setError("Business name is required.");
      return;
    }
    setSaving(true);

    let latitude: number | null = initial?.latitude ?? null;
    let longitude: number | null = initial?.longitude ?? null;

    if (latitude == null && form.address.trim()) {
      setGeocoding(true);
      setGeoNote("Locating the address…");
      try {
        const hit = await geocodeAddress(form.address.trim());
        if (hit) {
          latitude = hit.latitude;
          longitude = hit.longitude;
          setGeoNote("Location found from address.");
        } else {
          setGeoNote("Could not locate the address — lead saved without map pin.");
        }
      } catch {
        setGeoNote("Could not locate the address — lead saved without map pin.");
      }
      setGeocoding(false);
    }

    const input: LeadInput = {
      business_name: form.business_name.trim(),
      category: form.category || null,
      contact_person: form.contact_person || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      website: form.website || null,
      address: form.address || null,
      latitude,
      longitude,
      place_id: initial?.place_id ?? null,
      rating: initial?.rating ?? null,
      review_count: initial?.review_count ?? null,
      interested_product: form.interested_product || null,
      lead_source: form.lead_source,
      status: form.status,
      priority: form.priority,
      assigned_to: form.assigned_to || null,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      notes: form.notes || null,
      next_followup_date: form.next_followup_date || null,
      next_followup_time: form.followup_time || null,
      followup_method: form.followup_method || null,
    };
    input.lead_score = computeLeadScore({ ...input, tags: input.tags });
    try {
      const lead = await createLead(input);
      onSaved(lead.id);
    } catch (err: any) {
      setError(err?.message || "Failed to save lead.");
    } finally {
      setSaving(false);
    }
  };

  const coord = initial?.latitude != null && initial?.longitude != null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#242424] bg-[#0a0a0a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1c1c1c] bg-[#0a0a0a] px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              {initial ? "Save business as lead" : "Add new lead"}
            </h3>
            <p className="text-xs text-[#8a8a8a]">Business, contact, sales, and follow-up</p>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-[#8a8a8a] hover:bg-[#141414] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {initial && coord && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#1c1c1c] bg-[#0d141a] px-6 py-3 text-xs text-sky-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              From Lead Finder · {initial.address}
            </span>
            {initial.rating != null && (
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="h-3 w-3 fill-current" />
                {initial.rating.toFixed(1)}
                {initial.review_count != null && <span className="text-[#8a8a8a]">({initial.review_count})</span>}
              </span>
            )}
            {initial.place_id && <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold">Dedup via Google ID</span>}
          </div>
        )}

        {initial && !coord && form.address && (
          <div className="border-b border-[#1c1c1c] bg-[#0d141a] px-6 py-3 text-xs text-sky-400">
            <MapPin className="mr-1 inline h-3.5 w-3.5" />
            From Lead Finder · {initial.business_name}
            {geocoding ? (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-400">
                <Loader2 className="h-3 w-3 animate-spin" /> Locating {initial.address}…
              </span>
            ) : geoNote ? (
              <span className="ml-2 text-[#a3a3a3]">{geoNote}</span>
            ) : (
              <span className="ml-2 text-[#a3a3a3]">No coordinates — will geocode from the address on save.</span>
            )}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6 px-6 py-5">
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a]">
              <Building2 className="h-3.5 w-3.5" /> Business
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Business name *">
                <input className={inputCls} required value={form.business_name} onChange={set("business_name")} placeholder="Hope Pharmacy" />
              </Field>
              <Field label="Category">
                <input className={inputCls} value={form.category} onChange={set("category")} placeholder="Pharmacy" />
              </Field>
              <Field label="Contact person">
                <input className={inputCls} value={form.contact_person} onChange={set("contact_person")} placeholder="John Doe" />
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+256 ..." />
              </Field>
              <Field label="WhatsApp">
                <input className={inputCls} value={form.whatsapp} onChange={set("whatsapp")} placeholder="+256 ..." />
              </Field>
              <Field label="Email">
                <input className={inputCls} type="email" value={form.email} onChange={set("email")} placeholder="info@..." />
              </Field>
              <Field label="Website">
                <input className={inputCls} value={form.website} onChange={set("website")} placeholder="https://" />
              </Field>
              <Field label="Address">
                <input className={inputCls} value={form.address} onChange={set("address")} placeholder="Ntinda, Kampala" />
              </Field>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a]">Sales</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Interested product">
                <input className={inputCls} value={form.interested_product} onChange={set("interested_product")} placeholder="POS, Website…" />
              </Field>
              <Field label="Source">
                <select className={inputCls} value={form.lead_source} onChange={set("lead_source")}>
                  {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Estimated value (UGX)">
                <input className={inputCls} type="number" value={form.estimated_value} onChange={set("estimated_value")} placeholder="300000" />
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={set("status")}>
                  {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select className={inputCls} value={form.priority} onChange={set("priority")}>
                  {LEAD_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Assigned staff">
                <input className={inputCls} value={form.assigned_to} onChange={set("assigned_to")} placeholder="Daniel K." />
              </Field>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a]">Follow-up</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Next follow-up date">
                <input className={inputCls} type="date" min={todayIso()} value={form.next_followup_date} onChange={set("next_followup_date")} />
              </Field>
              <Field label="Time">
                <input className={inputCls} type="time" value={form.followup_time} onChange={set("followup_time")} />
              </Field>
              <Field label="Method">
                <select className={inputCls} value={form.followup_method} onChange={set("followup_method")}>
                  {FOLLOWUP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a]">Internal</h4>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Tags" hint="Comma separated — e.g. Pharmacy, High Value, Kampala">
                <input className={inputCls} value={form.tags} onChange={set("tags")} placeholder="Pharmacy, High Value, Kampala" />
              </Field>
              <Field label="Notes">
                <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.notes} onChange={set("notes")} placeholder="Currently using manual records…" />
              </Field>
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-red-400">{error}</p>}

          <div className="flex items-center justify-end gap-2 border-t border-[#1c1c1c] pt-4">
            <button type="button" onClick={onClose} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={`${btnPrimary} disabled:opacity-50`}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Phone className="h-3.5 w-3.5" />}
              {initial ? "Save as Lead" : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}