"use client";

import { useState } from "react";
import {
  X,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  Send,
  MessageSquare,
  Printer,
  CheckCircle2,
  RotateCw,
  Building,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { api } from "@/core/api";
import { config } from "@/config";
import type { Lead } from "@/crm/leads";

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.779.98-.955 1.18-.176.2-.352.226-.653.075-1.636-.821-2.708-1.464-3.79-3.32-.286-.492.286-.456.818-1.52.09-.18.045-.338-.023-.488-.068-.15-.678-1.636-.93-2.242-.244-.59-.493-.51-.678-.52-.176-.008-.377-.01-.578-.01-.2 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511 0 1.482 1.08 2.912 1.23 3.113.15.201 2.126 3.247 5.151 4.554 1.776.767 2.479.799 3.364.667.545-.082 1.78-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.578-.352z" />
      <path d="M12.004 0C5.373 0 0 5.373 0 12c0 2.118.552 4.107 1.516 5.839L.055 23.44l5.772-1.492A11.94 11.94 0 0012.004 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 21.84c-1.84 0-3.567-.5-5.06-1.37l-.362-.213-3.754.97.99-3.66-.234-.374A9.816 9.816 0 012.164 12c0-5.426 4.414-9.84 9.84-9.84 5.426 0 9.84 4.414 9.84 9.84 0 5.426-4.414 9.84-9.84 9.84z" />
    </svg>
  );
}

interface ProposalItem {
  id: string;
  name: string;
  priceUGX: number;
  priceUSD: number;
  selected: boolean;
}

const PRESET_MODULES: ProposalItem[] = [
  {
    id: "m1",
    name: "LANGRATIA Enterprise Core & Web Portal Suite",
    priceUGX: 7500000,
    priceUSD: 2000,
    selected: true,
  },
  {
    id: "m2",
    name: "WhatsApp Business Cloud API Auto-Responder Bot",
    priceUGX: 3000000,
    priceUSD: 800,
    selected: true,
  },
  {
    id: "m3",
    name: "Mobile Money (MTN MoMo & Airtel) Automated Clearing Gateway",
    priceUGX: 2500000,
    priceUSD: 680,
    selected: true,
  },
  {
    id: "m4",
    name: "URA EFRIS Fiscal Invoice Compliance Integration",
    priceUGX: 3500000,
    priceUSD: 950,
    selected: false,
  },
  {
    id: "m5",
    name: "Dedicated Cloud Hosting, SSL & 24/7 SLA Engineering Support (Annual)",
    priceUGX: 4000000,
    priceUSD: 1100,
    selected: false,
  },
];

export default function ProposalModal({
  lead,
  isOpen,
  onClose,
  onProposalSent,
}: {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onProposalSent: () => Promise<void>;
}) {
  const [currency, setCurrency] = useState<"UGX" | "USD">("UGX");
  const [items, setItems] = useState<ProposalItem[]>(PRESET_MODULES);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [validDays, setValidDays] = useState<number>(30);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemUGX, setCustomItemUGX] = useState<number>(1500000);
  const [customItemUSD, setCustomItemUSD] = useState<number>(400);

  const [sendingEmail, setSendingEmail] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const addCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;
    const newItem: ProposalItem = {
      id: `custom-${Date.now()}`,
      name: customItemName.trim(),
      priceUGX: Number(customItemUGX) || 0,
      priceUSD: Number(customItemUSD) || 0,
      selected: true,
    };
    setItems((prev) => [...prev, newItem]);
    setCustomItemName("");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const selectedItems = items.filter((i) => i.selected);

  const subtotalUGX = selectedItems.reduce((acc, i) => acc + i.priceUGX, 0);
  const subtotalUSD = selectedItems.reduce((acc, i) => acc + i.priceUSD, 0);

  const discountUGX = Math.round(subtotalUGX * (discountPercent / 100));
  const discountUSD = Math.round(subtotalUSD * (discountPercent / 100));

  const totalUGX = subtotalUGX - discountUGX;
  const totalUSD = subtotalUSD - discountUSD;

  const formatCurrency = (amount: number, curr: "UGX" | "USD") => {
    if (curr === "UGX") {
      return `UGX ${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const generateProposalText = () => {
    const lines = [
      `*LANGRATIA B2B SOFTWARE SCOPING QUOTATION*`,
      `Client: ${lead.business_name} (${lead.contact_person || "Management"})`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Validity: ${validDays} Days`,
      ``,
      `*Scope Deliverables:*`,
      ...selectedItems.map((item, idx) => {
        const cost = currency === "UGX" ? formatCurrency(item.priceUGX, "UGX") : formatCurrency(item.priceUSD, "USD");
        return `${idx + 1}. ${item.name} - ${cost}`;
      }),
      ``,
      `*Subtotal:* ${currency === "UGX" ? formatCurrency(subtotalUGX, "UGX") : formatCurrency(subtotalUSD, "USD")}`,
    ];

    if (discountPercent > 0) {
      lines.push(`*Discount (${discountPercent}%):* -${currency === "UGX" ? formatCurrency(discountUGX, "UGX") : formatCurrency(discountUSD, "USD")}`);
    }

    lines.push(
      `*Total Investment:* ${currency === "UGX" ? formatCurrency(totalUGX, "UGX") : formatCurrency(totalUSD, "USD")}`,
      ``,
      `*Payment Structure:* 50% mobilization deposit upon signing, 50% upon User Acceptance Testing (UAT).`,
      `*Payment Channels:* MTN MoMo Merchant, Airtel Money & Standard Bank Wire (Langratia Ltd).`,
      ``,
      `Best regards,`,
      `LANGRATIA Enterprise Solutions Team`,
      `inquiries@langratia.com | +256 782 123 456`
    );

    return lines.join("\n");
  };

  const handleSendWhatsApp = () => {
    const text = generateProposalText();
    const phone = lead.whatsapp || lead.phone;
    if (!phone) {
      alert("No phone number associated with this lead.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
    recordProposalSent();
  };

  const handleSendEmail = async () => {
    if (!lead.email) {
      alert("No email address listed for this lead.");
      return;
    }
    setSendingEmail(true);
    setSuccessMsg(null);
    try {
      const text = generateProposalText();
      await api.email.send({
        to_email: lead.email,
        subject: `Software Project Proposal & Quotation - ${lead.business_name}`,
        body_text: text,
        lead_id: lead.id,
      });
      setSuccessMsg("Proposal sent successfully via Resend!");
      await recordProposalSent();
    } catch (err: any) {
      alert(`Email dispatch error: ${err.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  const recordProposalSent = async () => {
    try {
      // 1. Advance lead stage to 'Proposal Sent'
      await api.leads.update(lead.id, {
        status: "Proposal Sent",
        estimated_value: totalUSD,
      });

      // 2. Log activity
      await api.activities.add(
        lead.id,
        "Proposal",
        `Issued formal software quotation: ${currency === "UGX" ? formatCurrency(totalUGX, "UGX") : formatCurrency(totalUSD, "USD")}`
      );

      await onProposalSent();
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[92vh] rounded-2xl border border-sky-500/30 bg-[#07090e] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-sky-950/40 via-[#0d121d] to-[#07090e] p-5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                B2B Software Scoping Quotation & Proposal
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building className="h-3.5 w-3.5 text-slate-500" />
                <span className="font-semibold text-slate-200">{lead.business_name}</span>
                <span>·</span>
                <span>{lead.category || "Enterprise"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <div className="flex rounded-lg border border-slate-800 bg-[#0b0f19] p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCurrency("UGX")}
                className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                  currency === "UGX"
                    ? "bg-sky-500 text-slate-950 font-bold shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                UGX
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                  currency === "USD"
                    ? "bg-sky-500 text-slate-950 font-bold shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                USD ($)
              </button>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#090d16]">
          {successMsg && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SCOPE MODULE SELECTOR */}
          <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Select Scope Deliverables & Features
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedItems.length} of {items.length} Selected
              </span>
            </div>

            <div className="space-y-2">
              {items.map((item) => {
                const cost = currency === "UGX" ? formatCurrency(item.priceUGX, "UGX") : formatCurrency(item.priceUSD, "USD");
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                      item.selected
                        ? "border-sky-500/40 bg-sky-500/10 text-white"
                        : "border-slate-800/80 bg-[#0b0f19] text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-medium">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-sky-300">{cost}</span>
                      {item.id.startsWith("custom-") && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ADD CUSTOM LINE ITEM */}
            <form onSubmit={addCustomItem} className="pt-2 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                placeholder="Add custom deliverable (e.g. Data Migration, Biometric Scanner)..."
                className="flex-1 rounded-lg border border-slate-800 bg-[#0b0f19] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={currency === "UGX" ? customItemUGX : customItemUSD}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (currency === "UGX") setCustomItemUGX(val);
                    else setCustomItemUSD(val);
                  }}
                  placeholder="Price"
                  className="w-28 rounded-lg border border-slate-800 bg-[#0b0f19] px-3 py-1.5 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!customItemName.trim()}
                  className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </form>
          </div>

          {/* FINANCIAL SUMMARY & DISCOUNT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 space-y-3 shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Discount & Validity
              </span>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Discount Percentage:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-16 rounded-md border border-slate-800 bg-[#0b0f19] px-2 py-1 text-xs text-right text-white font-mono"
                    />
                    <Percent className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Quote Validity:</span>
                  <select
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="rounded-md border border-slate-800 bg-[#0b0f19] px-2 py-1 text-xs text-slate-300"
                  >
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={60}>60 Days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-[#07090e] to-[#07090e] p-4 space-y-2.5 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Total Investment Quote
                </span>

                <div className="space-y-1 mt-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">
                      {currency === "UGX" ? formatCurrency(subtotalUGX, "UGX") : formatCurrency(subtotalUSD, "USD")}
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Discount ({discountPercent}%):</span>
                      <span className="font-mono">
                        -{currency === "UGX" ? formatCurrency(discountUGX, "UGX") : formatCurrency(discountUSD, "USD")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-bold text-white pt-1.5 border-t border-slate-800">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-400">
                      {currency === "UGX" ? formatCurrency(totalUGX, "UGX") : formatCurrency(totalUSD, "USD")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 bg-[#0b0f19] p-2 rounded border border-slate-800/80">
                Payment Terms: 50% mobilization advance deposit · 50% completion balance.
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-800/80 bg-[#090d16] px-5 py-3.5 shrink-0 gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#0d121d] px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" /> Print / PDF
          </button>

          <div className="flex items-center gap-2">
            {(lead.whatsapp || lead.phone) && (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors cursor-pointer shadow-sm shadow-emerald-500/10"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" /> Send via WhatsApp
              </button>
            )}

            {lead.email && (
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors cursor-pointer shadow-md shadow-sky-500/20 disabled:opacity-50"
              >
                {sendingEmail ? (
                  <RotateCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send via Email & Advance Stage
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
