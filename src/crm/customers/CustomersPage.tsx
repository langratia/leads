"use client";

import { useState, useEffect } from "react";
import {
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  ExternalLink,
  Search,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Receipt,
  CreditCard,
  Clock,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { useLeadsData } from "@/crm/leads/leads-context";
import { CustomersIcon } from "@/core/icons/AbstractIcons";
import { exportToCSV } from "@/core/export-utils";
import { formatValue } from "@/core/format";
import WhatsAppModal from "../leads/WhatsAppModal";
import CustomerInvoiceModal, { type InvoiceData } from "./CustomerInvoiceModal";

export default function CustomersPage() {
  const { leads } = useLeadsData();
  const [searchTerm, setSearchTerm] = useState("");
  const [whatsAppLead, setWhatsAppLead] = useState<any>(null);
  const [invoiceCustomer, setInvoiceCustomer] = useState<any>(null);
  const [invoicesCache, setInvoicesCache] = useState<Record<string, InvoiceData>>({});

  // Customers are leads that have reached the Won stage
  const customers = leads.filter((l) => l.status === "Won");

  // Load invoices cache from localStorage
  useEffect(() => {
    const cache: Record<string, InvoiceData> = {};
    customers.forEach((c) => {
      const saved = localStorage.getItem(`langratia_invoice_${c.id}`);
      if (saved) {
        try {
          cache[c.id] = JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    });
    setInvoicesCache(cache);
  }, [leads]);

  const getCustomerPaymentInfo = (c: any) => {
    const inv = invoicesCache[c.id];
    const totalAmount = inv ? inv.totalAmount : (c.estimated_value || 4500000);
    // If inv exists, sum payments; otherwise default to 50% deposit for demo
    const totalPaid = inv
      ? inv.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
      : Math.round(totalAmount * 0.5);

    const remaining = Math.max(0, totalAmount - totalPaid);
    let status: "PAID_IN_FULL" | "PARTIAL_DEPOSIT" | "UNPAID" = "PARTIAL_DEPOSIT";
    if (totalPaid >= totalAmount && totalAmount > 0) {
      status = "PAID_IN_FULL";
    } else if (totalPaid === 0) {
      status = "UNPAID";
    }

    return { totalAmount, totalPaid, remaining, status };
  };

  const totalContractValue = customers.reduce((sum, c) => {
    const info = getCustomerPaymentInfo(c);
    return sum + info.totalAmount;
  }, 0);

  const totalCollectedValue = customers.reduce((sum, c) => {
    const info = getCustomerPaymentInfo(c);
    return sum + info.totalPaid;
  }, 0);

  const totalOutstandingValue = Math.max(0, totalContractValue - totalCollectedValue);
  const collectionRate = totalContractValue > 0 ? Math.round((totalCollectedValue / totalContractValue) * 100) : 0;

  // Conversion cycle velocity
  const convertedWithDates = customers.filter((c) => c.converted_at && c.created_at);
  const avgDaysToClose = convertedWithDates.length
    ? Math.round(
        convertedWithDates.reduce((sum, c) => {
          const days = Math.max(
            1,
            Math.round(
              (new Date(c.converted_at!).getTime() - new Date(c.created_at).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );
          return sum + days;
        }, 0) / convertedWithDates.length
      )
    : 12;

  const winRate = leads.length ? Math.round((customers.length / leads.length) * 100) : 0;

  const filteredCustomers = customers.filter(
    (c) =>
      c.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contact_person || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (!customers.length) return;
    const exportData = customers.map((c) => {
      const info = getCustomerPaymentInfo(c);
      return {
        "Business Name": c.business_name,
        Category: c.category || "",
        "Contact Person": c.contact_person || "",
        Phone: c.phone || "",
        Email: c.email || "",
        "Contract Value": info.totalAmount,
        "Amount Cleared": info.totalPaid,
        "Balance Outstanding": info.remaining,
        "Payment Status": info.status,
        "Conversion Date": c.converted_at || c.updated_at || "",
      };
    });
    exportToCSV(exportData, `langratia-customers-invoicing-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleInvoiceUpdated = (customerId: string, invoice: InvoiceData) => {
    setInvoicesCache((prev) => ({
      ...prev,
      [customerId]: invoice,
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ENTERPRISE FINANCIAL & LEDGER HERO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Contract Revenue
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {formatValue(totalContractValue)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> {customers.length} Won Accounts ({winRate}% Win Rate)
            </p>
          </div>
          <span className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <DollarSign className="h-6 w-6" />
          </span>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Collections Cleared (MoMo & Bank)
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {formatValue(totalCollectedValue)}
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-1">
              {collectionRate}% Realized Cash Settlement
            </p>
          </div>
          <span className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CreditCard className="h-6 w-6" />
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Outstanding Receivables
            </div>
            <div className={`text-2xl font-bold mt-1 ${totalOutstandingValue > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {formatValue(totalOutstandingValue)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Pending milestone settlement</p>
          </div>
          <span className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-6 w-6" />
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Cycle Velocity & Invoicing
            </div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">
              {avgDaysToClose} Days
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Avg days lead-to-won contract</p>
          </div>
          <span className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <TrendingUp className="h-6 w-6" />
          </span>
        </div>
      </div>

      {/* FILTER & EXPORT BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers by company or contact..."
            className="w-full rounded-lg border border-slate-800 bg-[#0d121d] pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleExport}
          disabled={!customers.length}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-[#0d121d] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          Export Contract Ledger CSV
        </button>
      </div>

      {/* CUSTOMERS ROSTER TABLE */}
      <div className="rounded-xl border border-slate-800 bg-[#0d121d] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-[#07090e]/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">Customer Account</th>
                <th className="p-4">Industry / Category</th>
                <th className="p-4">Key Contact</th>
                <th className="p-4">Contract Value</th>
                <th className="p-4">Payment Ledger</th>
                <th className="p-4 text-right">Actions & Invoicing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CustomersIcon className="h-8 w-8 text-slate-700" />
                      <p className="font-semibold text-slate-400">No Won Customers Yet</p>
                      <p className="text-[11px] text-slate-500 max-w-sm">
                        When you mark a lead as &quot;Won&quot; in the Pipeline or convert an account, they appear here as active clients with full payment ledgers.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const paymentInfo = getCustomerPaymentInfo(customer);
                  return (
                    <tr key={customer.id} className="hover:bg-[#141b29] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                            {customer.business_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{customer.business_name}</div>
                            <div className="text-[11px] text-slate-400">{customer.address || "Uganda"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="rounded-md bg-slate-800/80 px-2 py-1 text-[11px] text-slate-300 font-medium">
                          {customer.category || "General"}
                        </span>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <div className="font-medium text-slate-200">
                          {customer.contact_person || "Operations Lead"}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          {customer.phone && <span>{customer.phone}</span>}
                          {customer.email && <span>{customer.email}</span>}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-white">
                          {formatValue(paymentInfo.totalAmount)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Cleared: <span className="text-emerald-400 font-semibold">{formatValue(paymentInfo.totalPaid)}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {paymentInfo.status === "PAID_IN_FULL" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            Paid In Full
                          </span>
                        ) : paymentInfo.status === "PARTIAL_DEPOSIT" ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/30">
                              <Clock className="h-3 w-3" />
                              Partial Deposit
                            </span>
                            <div className="text-[10px] text-amber-400/90 font-medium">
                              Due: {formatValue(paymentInfo.remaining)}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                            <AlertCircle className="h-3 w-3" />
                            Unpaid
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setInvoiceCustomer(customer)}
                            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 transition-colors shadow-sm cursor-pointer"
                            title="Manage contract invoices and Mobile Money receipts"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>Invoicing & MoMo</span>
                          </button>

                          {(customer.whatsapp || customer.phone) && (
                            <button
                              type="button"
                              onClick={() => setWhatsAppLead(customer)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer transition-colors"
                              title="Direct WhatsApp outreach"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerInvoiceModal
        customer={invoiceCustomer}
        isOpen={!!invoiceCustomer}
        onClose={() => setInvoiceCustomer(null)}
        onInvoiceUpdated={handleInvoiceUpdated}
      />

      <WhatsAppModal
        lead={whatsAppLead}
        isOpen={!!whatsAppLead}
        onClose={() => setWhatsAppLead(null)}
      />
    </div>
  );
}
