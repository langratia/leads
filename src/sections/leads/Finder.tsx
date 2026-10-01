"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Phone,
  Globe,
  Save,
  Loader2,
  Star,
  RefreshCw,
  ListChecks,
  Check,
  X,
  Building2,
  Sparkles,
  ExternalLink,
  Plus,
} from "lucide-react";
import { createLead, findBusinesses, type FinderSearchResult, type Lead } from "@/lib/leads";

const CATEGORY_COLORS: [string, string][] = [
  ["pharmacy", "#10b981"],
  ["drugstore", "#10b981"],
  ["clinic", "#38bdf8"],
  ["hospital", "#0ea5e9"],
  ["doctor", "#38bdf8"],
  ["dental", "#38bdf8"],
  ["school", "#a78bfa"],
  ["university", "#818cf8"],
  ["church", "#f59e0b"],
  ["place_of_worship", "#f59e0b"],
  ["restaurant", "#f97316"],
  ["cafe", "#f97316"],
  ["hotel", "#facc15"],
  ["supermarket", "#0ea5e9"],
  ["grocery", "#0ea5e9"],
  ["store", "#38bdf8"],
];

function categoryColor(category: string | null): string {
  const c = (category || "").toLowerCase();
  for (const [k, v] of CATEGORY_COLORS) if (c.includes(k)) return v;
  return "#94a3b8";
}

function StarRow({ rating, reviews }: { rating: number | null; reviews: number | null }) {
  if (rating == null) return <span className="text-slate-500 text-[10px]">No rating</span>;
  return (
    <span className="flex items-center gap-1 text-amber-400 font-semibold text-xs">
      <Star className="h-3 w-3 fill-current" />
      <span className="text-white">{rating.toFixed(1)}</span>
      {reviews != null && <span className="text-slate-500 text-[10px]">({reviews})</span>}
    </span>
  );
}

export default function Finder({
  leads,
  onSaveBusiness,
  onLeadsChanged,
}: {
  leads: Lead[];
  onSaveBusiness: (b: FinderSearchResult) => void;
  onLeadsChanged?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [results, setResults] = useState<FinderSearchResult[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selected, setSelected] = useState<FinderSearchResult | null>(null);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "rating">("relevance");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const savedIds = useMemo(
    () => new Set(leads.map((l) => l.place_id).filter(Boolean) as string[]),
    [leads],
  );

  const runSearch = async (pageToken?: string) => {
    const q = query.trim();
    if (!q) return;
    if (pageToken) setLoadingMore(true);
    else {
      setSearching(true);
      setSelected(null);
      setCategoryFilter(null);
    }
    setError("");
    try {
      const { results: found, nextPageToken: npt } = await findBusinesses(q, undefined, undefined, {
        pageToken,
      });
      setNextPageToken(npt);
      setResults((prev) => {
        if (!pageToken) return found;
        const seen = new Set(prev.map((r) => r.place_id));
        return [...prev, ...found.filter((r) => !seen.has(r.place_id))];
      });
    } catch (err) {
      setError((err as Error).message || "Search failed. Please try again.");
    } finally {
      setSearching(false);
      setLoadingMore(false);
    }
  };

  const categoryOptions = useMemo(() => {
    const s = new Set(results.map((r) => (r.category || "Other").split(",")[0].trim()));
    return [...s];
  }, [results]);

  const visible = useMemo(() => {
    let arr = categoryFilter
      ? results.filter((r) => (r.category || "Other").split(",")[0].trim() === categoryFilter)
      : results;
    if (sortBy === "rating") arr = [...arr].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    return arr;
  }, [results, categoryFilter, sortBy]);

  const unsaved = useMemo(
    () => results.filter((r) => !savedIds.has(r.place_id)).length,
    [results, savedIds],
  );

  const bulkSave = async () => {
    const toSave = visible.filter((r) => !savedIds.has(r.place_id));
    if (toSave.length === 0) return;
    setBulkSaving(true);
    setError("");
    try {
      for (const r of toSave) {
        await createLead({
          business_name: r.business_name,
          category: r.category,
          phone: r.phone,
          website: r.website,
          address: r.address,
          latitude: r.latitude,
          longitude: r.longitude,
          place_id: r.place_id,
          rating: r.rating,
          review_count: r.reviews,
          lead_source: "Lead Finder",
          status: "New",
          priority: "Medium",
        });
      }
      onLeadsChanged?.();
    } catch (err) {
      setError((err as Error).message || "Failed to save leads.");
    } finally {
      setBulkSaving(false);
    }
  };

  const chipCls = (active: boolean) =>
    `cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
      active
        ? "bg-slate-700 text-white font-bold shadow-sm"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  const select = (r: FinderSearchResult) => setSelected(selected?.place_id === r.place_id ? null : r);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
      {/* ================= LEFT: search + results ================= */}
      <div className="flex min-w-0 flex-col gap-4">
        {/* Search Box */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0d121d] p-3 shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search target businesses, e.g. 'Pharmacies in Kampala', 'Hospitals in Entebbe'..."
              className="h-11 w-full rounded-xl border border-slate-700/80 bg-[#07090e] py-2 pl-10 pr-24 text-xs font-medium text-white placeholder:text-slate-500 outline-none transition-colors focus:border-sky-500/60"
            />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-sky-400 disabled:opacity-40 transition-all cursor-pointer"
            >
              {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Discover"}
            </button>
          </form>
        </div>

        {error && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
            {error}
          </p>
        )}

        {/* Results Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0d121d] shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-[#0a0e17]">
            <div className="flex items-baseline gap-2">
              <h3 className="text-xs font-bold text-white tracking-tight uppercase">
                {results.length ? `Discovered Businesses (${results.length})` : "Business Results"}
              </h3>
              {results.length > 0 && (
                <span className="text-[11px] font-bold text-sky-400 font-mono">
                  {unsaved > 0 ? `· ${unsaved} unsaved` : "· All saved to CRM"}
                </span>
              )}
            </div>
            {results.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="cursor-pointer rounded-lg border border-slate-800 bg-[#07090e] px-2 py-1 text-xs font-semibold text-slate-300 outline-none"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="rating">Sort: Highest Rating</option>
                </select>
                <button
                  onClick={bulkSave}
                  disabled={bulkSaving || unsaved === 0}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 px-3 py-1 text-xs font-bold text-slate-950 shadow-sm shadow-sky-500/20 hover:from-sky-400 hover:to-sky-300 disabled:opacity-40 transition-all active:scale-95"
                >
                  {bulkSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <ListChecks className="h-3 w-3" />}
                  Save All ({unsaved})
                </button>
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <div className="px-5 py-16 text-center space-y-2">
              <Building2 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">
                {searching ? "Discovering local enterprises in East Africa..." : "Ready to discover qualified leads."}
              </p>
              <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
                Type a sector and city (e.g. &quot;Private Schools in Kampala&quot;) to discover phone numbers, Google reviews, and addresses.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/80 px-4 py-2 bg-[#090d16]">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Filter:</span>
                <button onClick={() => setCategoryFilter(null)} className={chipCls(categoryFilter === null)}>
                  All
                </button>
                {categoryOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c === categoryFilter ? null : c)}
                    className={chipCls(c === categoryFilter)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-slate-800/60">
                {visible.map((r) => {
                  const saved = savedIds.has(r.place_id);
                  const isSelected = selected?.place_id === r.place_id;
                  return (
                    <div
                      key={r.place_id}
                      onClick={() => select(r)}
                      className={`cursor-pointer py-3 px-4 transition-all ${
                        isSelected
                          ? "border-l-[3px] border-sky-400 bg-[#131b2c]"
                          : "border-l-[3px] border-transparent hover:bg-[#101522]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                          style={{ background: categoryColor(r.category) }}
                          title={r.category || "Business"}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-white tracking-tight">{r.business_name}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                            <StarRow rating={r.rating} reviews={r.reviews} />
                            {r.phone && <span className="truncate text-slate-400 font-mono text-[11px]">{r.phone}</span>}
                          </div>
                          <p className="truncate text-[11px] text-slate-500 mt-0.5">{r.address}</p>
                        </div>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            if (!saved) onSaveBusiness(r);
                          }}
                          disabled={saved}
                          className={`shrink-0 rounded-lg p-2 transition-all ${
                            saved
                              ? "cursor-default text-emerald-400 bg-emerald-950/40 border border-emerald-800/40"
                              : "cursor-pointer border border-slate-700 bg-[#07090e] text-slate-300 hover:border-sky-500/60 hover:text-sky-400"
                          }`}
                          title={saved ? "Already saved to Pipeline" : "Save to CRM Pipeline"}
                        >
                          {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {nextPageToken && (
                <div className="border-t border-slate-800/80 p-3 text-center bg-[#0a0e17]">
                  <button
                    onClick={() => runSearch(nextPageToken)}
                    disabled={loadingMore}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-[#0d121d] px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700"
                  >
                    {loadingMore ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Load More Results
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ================= RIGHT: selected business details ================= */}
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.aside
            key={selected.place_id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="lg:sticky lg:top-4 lg:self-start space-y-4"
          >
            <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0d121d] shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-[#0a0e17]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Building2 className="h-3.5 w-3.5 text-sky-400" /> Business Profile
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-3.5 bg-[#090d16]">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{selected.business_name}</h4>
                  <p className="text-xs text-sky-400 font-medium mt-0.5">{selected.category || "Commercial Entity"}</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#07090e] p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Google Rating:</span>
                    <StarRow rating={selected.rating} reviews={selected.reviews} />
                  </div>
                  {selected.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span className="text-slate-200 font-mono">{selected.phone}</span>
                    </div>
                  )}
                  {selected.website && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Website:</span>
                      <a
                        href={selected.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline flex items-center gap-1 truncate max-w-[180px]"
                      >
                        {selected.website.replace(/^https?:\/\//, "")} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  )}
                  {selected.address && (
                    <div className="pt-1 border-t border-slate-800/80">
                      <span className="text-slate-500 block mb-0.5">Address:</span>
                      <span className="text-slate-300 text-[11px] leading-relaxed">{selected.address}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (!savedIds.has(selected.place_id)) onSaveBusiness(selected);
                  }}
                  disabled={savedIds.has(selected.place_id)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 ${
                    savedIds.has(selected.place_id)
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 cursor-default"
                      : "bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-slate-950 shadow-sky-500/20 cursor-pointer"
                  }`}
                >
                  {savedIds.has(selected.place_id) ? (
                    <>
                      <Check className="h-4 w-4" /> Lead in Pipeline
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Save to Pipeline
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}