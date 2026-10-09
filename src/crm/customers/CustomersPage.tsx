"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useLeadsData } from "@/crm/leads/leads-context";
import { CustomersIcon } from "@/core/icons/AbstractIcons";
import { exportToCSV } from "@/core/export-utils";
import { formatValue } from "@/core/format";

export default function CustomersPage() {
  const { leads } = useLeadsData();
  const [searchTerm, setSearchTerm] = useState("");

  // Customers are leads that have reached the Won stage
  const customers = leads.filter((l) => l.status === "Won");

  const totalClosedValue = customers.reduce((sum, c) => sum + (c.estimated_value || 0), 0);
  const avgDealSize = customers.length ? Math.round(totalClosedValue / customers.length) : 0;

  const filteredCustomers = customers.filter(
    (c) =>
      c.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contact_person || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (!customers.length) return;
    const exportData = customers.map((c) => ({
      "Business Name": c.business_name,
      Category: c.category || "",
      "Contact Person": c.contact_person || "",
      Phone: c.phone || "",
      Email: c.email || "",
      "Deal Value": c.estimated_value || 0,
      "Conversion Date": c.converted_at || c.updated_at || "",
    }));
    exportToCSV(exportData, `langratia-customers-${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* METRICS HERO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Closed Accounts
            </div>
            <div className="text-2xl font-bold text-white mt-1">{customers.length}</div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3 w-3" /> Converted & Closed Won
            </p>
          </div>
          <span className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CustomersIcon className="h-6 w-6" />
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Closed Revenue Value
            </div>
            <div className="text-2xl font-bold text-sky-400 mt-1">
              {formatValue(totalClosedValue)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Lifetime customer deal volume</p>
          </div>
          <span className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <DollarSign className="h-6 w-6" />
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d121d] p-5 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Average Deal Size
            </div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">
              {formatValue(avgDealSize)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Per closed customer</p>
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
          Export Customers CSV
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
                <th className="p-4">Deal Value</th>
                <th className="p-4">Converted Date</th>
                <th className="p-4 text-right">Status</th>
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
                        When you mark a lead as "Won" in the Pipeline or convert an account, they appear here as active clients.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
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
                      <div className="font-bold text-emerald-400">
                        {customer.estimated_value ? formatValue(customer.estimated_value) : "Custom Tier"}
                      </div>
                    </td>

                    <td className="p-4 text-slate-400 text-[11px]">
                      {customer.converted_at
                        ? new Date(customer.converted_at).toLocaleDateString()
                        : new Date(customer.updated_at).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Closed Won
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
