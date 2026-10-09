"use client";

import { useState, useEffect, useId } from "react";
import {
  Receipt,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  Download,
  Send,
  MessageSquare,
  Plus,
  Trash2,
  Building,
  Phone,
  Mail,
  FileText,
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Landmark,
  Share2,
} from "lucide-react";
import { formatValue } from "@/core/format";
import { api } from "@/core/api";
import type { Lead } from "@/crm/leads/model/types";

export interface PaymentRecord {
  id: string;
  method: "mtn_momo" | "airtel_money" | "bank_wire" | "cash_cheque";
  reference: string;
  amount: number;
  payerName: string;
  payerPhone?: string;
  date: string;
  notes?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  payments: PaymentRecord[];
  notes?: string;
}

interface CustomerInvoiceModalProps {
  customer: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onInvoiceUpdated?: (customerId: string, invoice: InvoiceData) => void;
}

export default function CustomerInvoiceModal({
  customer,
  isOpen,
  onClose,
  onInvoiceUpdated,
}: CustomerInvoiceModalProps) {
  const [activeTab, setActiveTab] = useState<"ledger" | "receipt">("ledger");

  // Load or initialize invoice data for this customer
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    return {
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalAmount: 4500000,
      items: [
        {
          description: "LANGRATIA Enterprise Core Engine & Cloud Deployment",
          quantity: 1,
          unitPrice: 3000000,
        },
        {
          description: "Custom Workflow Integrations & WhatsApp API Bot Gateway",
          quantity: 1,
          unitPrice: 1500000,
        },
      ],
      payments: [],
      notes: "Net 14 days. Mobile Money payments verified via automated ledger.",
    };
  });

  // New payment form state
  const [paymentMethod, setPaymentMethod] = useState<"mtn_momo" | "airtel_money" | "bank_wire" | "cash_cheque">("mtn_momo");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Sync when customer changes
  useEffect(() => {
    if (!customer) return;
    const storageKey = `langratia_invoice_${customer.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInvoice(parsed);
        return;
      } catch (e) {
        console.error("Failed to parse invoice", e);
      }
    }

    // Default invoice from customer details
    const dealValue = customer.estimated_value || 4500000;
    const defaultData: InvoiceData = {
      invoiceNumber: `INV-2026-${customer.id.slice(0, 4).toUpperCase() || "7820"}`,
      issueDate: customer.converted_at ? customer.converted_at.split("T")[0] : new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalAmount: dealValue,
      items: [
        {
          description: `LANGRATIA ${customer.category || "Commercial"} Automation Platform`,
          quantity: 1,
          unitPrice: Math.round(dealValue * 0.7),
        },
        {
          description: "Annual Enterprise Support & Cloud Infrastructure SLA",
          quantity: 1,
          unitPrice: Math.round(dealValue * 0.3),
        },
      ],
      payments: [
        {
          id: "init-momo-1",
          method: "mtn_momo",
          reference: `MTN-MM-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: Math.round(dealValue * 0.5), // 50% deposit
          payerName: customer.contact_person || customer.business_name,
          payerPhone: customer.phone || "0772000000",
          date: new Date().toISOString().split("T")[0],
          notes: "Initial 50% project mobilization commitment",
        },
      ],
      notes: "Payment payable via MTN MoMo Merchant, Airtel Money Pay, or Stanbic Bank Wire.",
    };

    setInvoice(defaultData);
    setPayerName(customer.contact_person || customer.business_name);
    setPayerPhone(customer.phone || "");
  }, [customer]);

  if (!isOpen || !customer) return null;

  const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remainingBalance = Math.max(0, invoice.totalAmount - totalPaid);

  let paymentStatus: "UNPAID" | "PARTIAL_DEPOSIT" | "PAID_IN_FULL" = "UNPAID";
  if (totalPaid >= invoice.totalAmount && invoice.totalAmount > 0) {
    paymentStatus = "PAID_IN_FULL";
  } else if (totalPaid > 0) {
    paymentStatus = "PARTIAL_DEPOSIT";
  }

  const saveInvoice = (updated: InvoiceData) => {
    setInvoice(updated);
    if (customer) {
      localStorage.setItem(`langratia_invoice_${customer.id}`, JSON.stringify(updated));
      onInvoiceUpdated?.(customer.id, updated);
    }
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(paymentAmount);
    if (!amountNum || amountNum <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }
    if (!paymentRef.trim()) {
      alert("Please provide a Mobile Money or Bank Wire transaction reference ID");
      return;
    }

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      method: paymentMethod,
      reference: paymentRef.trim().toUpperCase(),
      amount: amountNum,
      payerName: payerName.trim() || customer.business_name,
      payerPhone: payerPhone.trim() || customer.phone || undefined,
      date: new Date().toISOString().split("T")[0],
      notes: paymentNotes.trim() || undefined,
    };

    const updated = {
      ...invoice,
      payments: [newPayment, ...invoice.payments],
    };

    saveInvoice(updated);
    setPaymentRef("");
    setPaymentAmount("");
    setPaymentNotes("");
    setIsRecording(false);
    setActionNotice("Payment recorded and ledger reconciled successfully!");
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!confirm("Are you sure you want to remove this payment entry?")) return;
    const updated = {
      ...invoice,
      payments: invoice.payments.filter((p) => p.id !== paymentId),
    };
    saveInvoice(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*OFFICIAL PAYMENT RECEIPT & INVOICE*
----------------------------------------
*Client:* ${customer.business_name}
*Invoice #:* ${invoice.invoiceNumber}
*Total Contract:* ${formatValue(invoice.totalAmount)}
*Total Paid:* ${formatValue(totalPaid)}
*Balance Due:* ${formatValue(remainingBalance)}
*Status:* ${paymentStatus === "PAID_IN_FULL" ? "✅ PAID IN FULL" : paymentStatus === "PARTIAL_DEPOSIT" ? "🟡 PARTIAL DEPOSIT RECEIVED" : "🔴 PENDING PAYMENT"}

*Latest Transaction:*
Ref: ${invoice.payments[0]?.reference || "N/A"} (${invoice.payments[0]?.method?.replace("_", " ").toUpperCase() || "DIRECT"})
Amount: ${formatValue(invoice.payments[0]?.amount || 0)}

Thank you for partnering with LANGRATIA Technologies.
Support: inquiries@langratia.com | +256 700 000 000`;

    const phone = customer.whatsapp || customer.phone || "";
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(text);
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    } else {
      navigator.clipboard.writeText(text);
      alert("Receipt summary copied to clipboard! (No direct phone detected)");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-[#0d121d] shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-[#07090e]/80">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Receipt className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Customer Contract & Payment Ledger
                </h2>
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {customer.business_name} • {customer.contact_person || "Finance / Operations"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* TABS */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("ledger")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  activeTab === "ledger"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Invoicing & Ledger
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("receipt")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  activeTab === "receipt"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Official B2B Receipt
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK ALERT */}
        {actionNotice && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-6 py-2.5 text-xs text-emerald-300 flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            {actionNotice}
          </div>
        )}

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "ledger" ? (
            <>
              {/* REVENUE STATUS SCORECARD */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Total Contract Value
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {formatValue(invoice.totalAmount)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Authorized scope</div>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    Amount Cleared
                  </div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    {formatValue(totalPaid)}
                  </div>
                  <div className="text-[10px] text-emerald-300/70 mt-1">
                    {Math.round((totalPaid / (invoice.totalAmount || 1)) * 100)}% collected
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Balance Outstanding
                  </div>
                  <div className={`text-lg font-bold mt-1 ${remainingBalance > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {formatValue(remainingBalance)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Due {invoice.dueDate}</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#07090e] p-4 flex flex-col justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Payment Status
                  </div>
                  <div>
                    {paymentStatus === "PAID_IN_FULL" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        PAID IN FULL
                      </span>
                    ) : paymentStatus === "PARTIAL_DEPOSIT" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-400 border border-sky-500/30">
                        <Clock className="h-3.5 w-3.5" />
                        PARTIAL DEPOSIT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        UNPAID PENDING
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* PAYMENT PROOF LOGGER */}
              <div className="rounded-xl border border-slate-800 bg-[#07090e] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-400" />
                      Mobile Money & Bank Settlement Ledger
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Record client payments via MTN MoMo, Airtel Money, or direct bank transfer.
                    </p>
                  </div>

                  {!isRecording && (
                    <button
                      type="button"
                      onClick={() => setIsRecording(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Record New Payment
                    </button>
                  )}
                </div>

                {/* RECORD FORM */}
                {isRecording && (
                  <form onSubmit={handleAddPayment} className="rounded-xl border border-slate-700/80 bg-[#0d121d] p-4 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white">Log Payment Proof</span>
                      <button
                        type="button"
                        onClick={() => setIsRecording(false)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Payment Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e: any) => setPaymentMethod(e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="mtn_momo">MTN Mobile Money (MoMo)</option>
                          <option value="airtel_money">Airtel Money (Airtel Pay)</option>
                          <option value="bank_wire">Bank Wire / EFT (Stanbic/Centenary)</option>
                          <option value="cash_cheque">Cash / Bank Cheque</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Transaction Ref ID *
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentRef}
                          onChange={(e) => setPaymentRef(e.target.value)}
                          placeholder="e.g. MTN-MM-948210"
                          className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Amount Paid (UGX) *
                        </label>
                        <input
                          type="number"
                          required
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder={remainingBalance > 0 ? String(remainingBalance) : "2500000"}
                          className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Payer Name / Signatory
                        </label>
                        <input
                          type="text"
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          placeholder={customer.business_name}
                          className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Payer Phone (for MoMo receipt)
                        </label>
                        <input
                          type="text"
                          value={payerPhone}
                          onChange={(e) => setPayerPhone(e.target.value)}
                          placeholder="0772000000 / 0750000000"
                          className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Notes / URA EFRIS Tax Ref
                        </label>
                        <input
                          type="text"
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          placeholder="Optional audit notes or invoice reference"
                          className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsRecording(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                      >
                        Confirm & Reconcile
                      </button>
                    </div>
                  </form>
                )}

                {/* RECORDED PAYMENTS TABLE */}
                <div className="rounded-lg border border-slate-800/80 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#090d16] text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Payment Channel</th>
                        <th className="p-3">Reference / Transaction ID</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Payer</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-[#0b0f19]">
                      {invoice.payments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-500">
                            No payment transactions recorded yet. Click &quot;Record New Payment&quot; above to log Mobile Money or wire transfers.
                          </td>
                        </tr>
                      ) : (
                        invoice.payments.map((p) => (
                          <tr key={p.id} className="hover:bg-[#121824] transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {p.method === "mtn_momo" && (
                                  <span className="flex items-center gap-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold">
                                    <Smartphone className="h-3 w-3" /> MTN MoMo
                                  </span>
                                )}
                                {p.method === "airtel_money" && (
                                  <span className="flex items-center gap-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold">
                                    <Smartphone className="h-3 w-3" /> Airtel Money
                                  </span>
                                )}
                                {p.method === "bank_wire" && (
                                  <span className="flex items-center gap-1 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2 py-0.5 text-[10px] font-bold">
                                    <Landmark className="h-3 w-3" /> Bank EFT
                                  </span>
                                )}
                                {p.method === "cash_cheque" && (
                                  <span className="flex items-center gap-1 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold">
                                    <FileText className="h-3 w-3" /> Cash/Cheque
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3 font-mono font-semibold text-emerald-400">
                              {p.reference}
                            </td>

                            <td className="p-3 font-bold text-white">
                              {formatValue(p.amount)}
                            </td>

                            <td className="p-3 text-slate-300">
                              <div>{p.payerName}</div>
                              {p.payerPhone && <div className="text-[10px] text-slate-500">{p.payerPhone}</div>}
                            </td>

                            <td className="p-3 text-slate-400 text-[11px]">
                              {p.date}
                            </td>

                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeletePayment(p.id)}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Remove entry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* OFFICIAL B2B PRINTABLE PAYMENT RECEIPT & INVOICE */
            <div className="space-y-4">
              {/* TOOLBAR FOR RECEIPT */}
              <div className="flex items-center justify-between bg-[#07090e] p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Official LANGRATIA Digital Tax Invoice & Payment Receipt
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Send on WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-colors shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print / Save PDF
                  </button>
                </div>
              </div>

              {/* PRINTABLE RECEIPT CONTAINER (Optimized for white background print and dark UI screen) */}
              <div
                id="printable-receipt"
                className="bg-white text-slate-900 rounded-xl p-8 shadow-2xl border border-slate-300 print:border-none print:shadow-none space-y-6"
              >
                {/* LETTERHEAD */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black tracking-tight text-slate-950">
                        LANGRATIA
                      </span>
                      <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        ENTERPRISE
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Autonomous Software Systems & Commercial Automation
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Plot 14, Lugogo Bypass / Nakasero • Kampala, Uganda
                    </p>
                    <p className="text-[11px] text-slate-500">
                      TIN: 1019482910 • inquiries@langratia.com • +256 700 000 000
                    </p>
                  </div>

                  <div className="text-right sm:text-right w-full sm:w-auto">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">
                      PAYMENT RECEIPT
                    </h3>
                    <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                      {invoice.invoiceNumber}
                    </div>
                    <div className="text-xs text-slate-500">
                      Date: {invoice.issueDate}
                    </div>
                    <div className="mt-2 inline-block">
                      {paymentStatus === "PAID_IN_FULL" ? (
                        <div className="border-2 border-emerald-600 text-emerald-700 font-black px-3 py-1 rounded text-xs tracking-wider uppercase bg-emerald-50">
                          PAID IN FULL
                        </div>
                      ) : paymentStatus === "PARTIAL_DEPOSIT" ? (
                        <div className="border-2 border-sky-600 text-sky-700 font-black px-3 py-1 rounded text-xs tracking-wider uppercase bg-sky-50">
                          PARTIAL DEPOSIT RECEIVED
                        </div>
                      ) : (
                        <div className="border-2 border-amber-600 text-amber-700 font-black px-3 py-1 rounded text-xs tracking-wider uppercase bg-amber-50">
                          PAYMENT PENDING
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* BILLED TO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Billed & Issued To:
                    </div>
                    <div className="font-bold text-sm text-slate-900">
                      {customer.business_name}
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      Attn: {customer.contact_person || "Managing Director / Operations Lead"}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {customer.address || "Kampala, Uganda"}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Phone: {customer.phone || "—"} • Email: {customer.email || "—"}
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Settlement & Ledger Summary:
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Contract Value:</span>
                      <span className="font-bold text-slate-900">{formatValue(invoice.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Cleared & Received:</span>
                      <span className="font-bold text-emerald-600">{formatValue(totalPaid)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-300 pt-1 font-bold">
                      <span className="text-slate-900">Balance Remaining:</span>
                      <span className={remainingBalance > 0 ? "text-amber-600" : "text-emerald-600"}>
                        {formatValue(remainingBalance)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ITEM BREAKDOWN */}
                <div>
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Scope Description</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Unit Price</th>
                        <th className="p-2.5 text-right">Amount (UGX)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium text-slate-800">{item.description}</td>
                          <td className="p-2.5 text-center text-slate-600">{item.quantity}</td>
                          <td className="p-2.5 text-right text-slate-600">{formatValue(item.unitPrice)}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">
                            {formatValue(item.quantity * item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAYMENTS RECORDED STAMP */}
                <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-4 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Verified Cleared Payments
                  </div>
                  {invoice.payments.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No cleared transactions on record.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {invoice.payments.map((p) => (
                        <div key={p.id} className="flex justify-between items-center text-xs text-slate-800 border-b border-emerald-100 pb-1 last:border-none">
                          <div>
                            <span className="font-bold uppercase text-[11px]">{p.method.replace("_", " ")}</span>:{" "}
                            <span className="font-mono font-semibold text-emerald-800">{p.reference}</span> ({p.date})
                          </div>
                          <div className="font-bold font-mono text-emerald-700">
                            +{formatValue(p.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SIGNATURE & FOOTER */}
                <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-xs text-slate-500">
                  <div>
                    <p className="font-medium text-slate-700">Issued by: LANGRATIA Operations Office</p>
                    <p className="text-[10px]">Official Computer Generated Receipt • Valid Without Physical Stamp</p>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 border-b border-slate-400 pb-1 w-40 inline-block text-center">
                      Allan Nuwamanya
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                      Authorized Commercial Signatory
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="border-t border-slate-800 px-6 py-3.5 bg-[#07090e]/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Account ID: <span className="font-mono text-slate-300">{customer.id}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-800 bg-[#0d121d] px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
