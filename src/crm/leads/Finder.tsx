"use client";

import { config } from "@/config";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Save,
  Loader2,
  Star,
  RefreshCw,
  ListChecks,
  Check,
  X,
  Building2,
  ExternalLink,
  Plus,
  Compass,
  Square,
  SquareCheckBig,
  Keyboard,
} from "lucide-react";
import {
  createLead,
  deleteLead,
  findBusinesses,
  type FinderSearchResult,
  type Lead,
  type LeadInput,
} from "@/crm/leads";
import { useToast } from "@/core/toast";
import { Kbd } from "@/core/ui";

const cap = (s: string) => s.replace(/^./, (c) => c.toUpperCase());
const area = (i: number) => cap(config.targetAreas[i] ?? config.targetAreas[0] ?? "your area");
const sector = (i: number) =>
  cap(config.targetCategories[i] ?? config.targetCategories[0] ?? "businesses");
const exampleSearchOne = `${sector(0)} in ${area(0)}`;
const exampleSearchTwo = `${sector(1)} in ${area(1)}`;

/* Sector dots are decorative, so the palette is assigned by position in the
   deployment's own sector list rather than by a hardcoded category table that
   would not match a client's market. */
const DOT_COLORS = [
  "#10b981",
  "#38bdf8",
  "#a78bfa",
  "#f59e0b",
  "#f97316",
  "#facc15",
  "#22d3ee",
  "#fb7185",
];

function categoryColor(category: string | null): string {
  const c = (category || "").toLowerCase();
  const idx = config.targetCategories.findIndex((t) => c.includes(t));
  if (idx >= 0) return DOT_COLORS[idx % DOT_COLORS.length];
  return "#64748b";
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

/* Result sets are cached at module scope so returning to the Finder restores the
   previous search instantly.

   The shell renders sections with `key={active}`, so every navigation remounts
   this component and local state is gone. Re-running the search instead would
   cost a round trip and burn quota against the rate limiter for results the
   user was just looking at a moment ago. A Map keyed by query also keeps a
   shared link working — a fresh tab misses the cache and searches for real. */
const resultCache = new Map<string, FinderSearchResult[]>();

/* Google already returns these for every result, so a Finder save needs no
   input from the user. Kept in one place because the single-save, the bulk
   save, and the modal all have to agree on it. */
function toLeadInput(r: FinderSearchResult): LeadInput {
  return {
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
  };
}

/* Writes the Finder's own params without disturbing the shell's `?section=`,
   which the shell owns and rewrites on its own navigation. */
function writeUrl(query: string, category: string, sort: string) {
  const params = new URLSearchParams(window.location.search);
  if (query) params.set("q", query);
  else params.delete("q");
  if (category) params.set("cat", category);
  else params.delete("cat");
  if (sort && sort !== "relevance") params.set("sort", sort);
  else params.delete("sort");
  const search = params.toString();
  window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
}

export default function Finder({
  leads,
  onSaveBusiness,
  onLeadsChanged,
  onOpenSavedLead,
  onOpenRoutePlanner,
}: {
  leads: Lead[];
  onSaveBusiness: (b: FinderSearchResult) => void;
  onLeadsChanged?: () => void;
  onOpenSavedLead?: (leadId: string) => void;
  onOpenRoutePlanner?: () => void;
}) {
  const toast = useToast();

  const initial = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      query: p.get("q") ?? "",
      categoryFilter: p.get("cat") ?? "",
      sortBy: (p.get("sort") === "rating" ? "rating" : "relevance") as "relevance" | "rating",
    };
    /* Read once. Everything after this is driven by state; re-reading would
       fight the user's edits on every remount. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [query, setQuery] = useState(initial.query);
  const [sortBy, setSortBy] = useState(initial.sortBy);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(initial.categoryFilter || null);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [results, setResults] = useState<FinderSearchResult[]>(
    () => (initial.query ? (resultCache.get(initial.query) ?? []) : []),
  );
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selected, setSelected] = useState<FinderSearchResult | null>(null);
  const [error, setError] = useState("");
  const [focusIndex, setFocusIndex] = useState(-1);
  const [showShortcuts, setShowShortcuts] = useState(false);

  /* place_ids saved in this session but not yet reflected in `leads`.
     refresh() is async, so between the insert resolving and the shared dataset
     catching up, `savedIds` still says "unsaved" — a second click in that
     window would insert the same business twice. */
  const [pendingSaved, setPendingSaved] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [checked, setChecked] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number; failed: string[] } | null>(
    null,
  );

  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const searchInputId = "finder-search";

  const savedIds = useMemo(() => {
    const set = new Set(leads.map((l) => l.place_id).filter(Boolean) as string[]);
    pendingSaved.forEach((id) => set.add(id));
    return set;
  }, [leads, pendingSaved]);

  /* Once the shared dataset includes what we just wrote, the local guard has
     done its job and can be dropped. */
  useEffect(() => {
    if (pendingSaved.length === 0) return;
    const real = new Set(leads.map((l) => l.place_id).filter(Boolean) as string[]);
    const stillPending = pendingSaved.filter((id) => !real.has(id));
    if (stillPending.length !== pendingSaved.length) setPendingSaved(stillPending);
  }, [leads, pendingSaved]);

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

  /* Same invariant AllLeads.tsx keeps: a bulk action must never apply to rows
     the user can no longer see. */
  useEffect(() => {
    setChecked([]);
  }, [categoryFilter, sortBy, query]);

  const unsaved = useMemo(
    () => results.filter((r) => !savedIds.has(r.place_id)).length,
    [results, savedIds],
  );

  /* Keep the ring inside the filtered list. */
  useEffect(() => {
    if (focusIndex >= visible.length) setFocusIndex(visible.length - 1);
  }, [visible.length, focusIndex]);

  useEffect(() => {
    writeUrl(query, categoryFilter ?? "", sortBy);
  }, [query, categoryFilter, sortBy]);

  const runSearch = useCallback(
    async (pageToken?: string, qOverride?: string) => {
      const q = (qOverride ?? query).trim();
      if (!q) return;
      if (pageToken) setLoadingMore(true);
      else {
        setSearching(true);
        setSelected(null);
        setCategoryFilter(null);
        setFocusIndex(-1);
      }
      setError("");
      try {
        const { results: found, nextPageToken: npt } = await findBusinesses(q, undefined, undefined, {
          pageToken,
        });
        setNextPageToken(npt);
        resultCache.set(q, found);
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
    },
    [query],
  );

  /* Restore from the URL when arriving with a shared link and no cache. */
  const bootstrapped = useRef(false);
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    const q = initial.query.trim();
    if (q && !resultCache.has(q)) runSearch(undefined, q);
  }, [initial.query, runSearch]);

  /* ---- writes ---- */

  const quickSave = useCallback(
    async (r: FinderSearchResult) => {
      if (savedIds.has(r.place_id) || savingId) return;
      setSavingId(r.place_id);
      try {
        const lead = await createLead(toLeadInput(r));
        setPendingSaved((prev) => [...prev, r.place_id]);
        toast.push(`${r.business_name} added to the pipeline.`, {
          tone: "success",
          durationMs: 7000,
          action: onOpenSavedLead
            ? {
                label: "Undo",
                onClick: async () => {
                  try {
                    await deleteLead(lead.id);
                    setPendingSaved((prev) => prev.filter((id) => id !== r.place_id));
                    toast.push(`${r.business_name} removed.`, { tone: "info" });
                    onLeadsChanged?.();
                  } catch (err) {
                    toast.push(`Could not undo: ${(err as Error).message}`, { tone: "error" });
                  }
                },
              }
            : undefined,
        });
        onLeadsChanged?.();
      } catch (err) {
        toast.push(`Could not save ${r.business_name}: ${(err as Error).message}`, {
          tone: "error",
        });
      } finally {
        setSavingId(null);
      }
    },
    [savedIds, savingId, toast, onLeadsChanged, onOpenSavedLead],
  );

  const saveMany = useCallback(
    async (rows: FinderSearchResult[]) => {
      const targets = rows.filter((r) => !savedIds.has(r.place_id));
      if (targets.length === 0) {
        toast.push("Everything in that selection is already saved.", { tone: "info" });
        return;
      }
      setProgress({ done: 0, total: targets.length, failed: [] });

      /* Chunks of 5 rather than one giant batch: a single 20-row insert that
         fails tells you nothing about which business caused it, and a serial
         loop abandons everything after the first error. This reports each one. */
      const failed: string[] = [];
      let done = 0;
      const CHUNK = 5;
      for (let i = 0; i < targets.length; i += CHUNK) {
        const batch = targets.slice(i, i + CHUNK);
        const settled = await Promise.allSettled(batch.map((r) => createLead(toLeadInput(r))));
        settled.forEach((outcome, idx) => {
          if (outcome.status === "rejected") {
            failed.push(batch[idx].business_name);
          } else {
            done += 1;
          }
        });
        setPendingSaved((prev) => [
          ...prev,
          ...settled
            .map((o, idx) => (o.status === "fulfilled" ? batch[idx].place_id : null))
            .filter((id): id is string => id != null),
        ]);
        setProgress({ done, total: targets.length, failed: [...failed] });
      }

      setProgress(null);
      setChecked([]);
      onLeadsChanged?.();

      if (failed.length === 0) {
        toast.push(`${done} ${done === 1 ? "lead" : "leads"} added to the pipeline.`, {
          tone: "success",
        });
      } else {
        toast.push(`${done} saved, ${failed.length} failed: ${failed.join(", ")}.`, {
          tone: "error",
          durationMs: 8000,
        });
      }
    },
    [savedIds, toast, onLeadsChanged],
  );

  /* ---- keyboard ---- */

  const toggleCheck = useCallback((placeId: string) => {
    setChecked((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId],
    );
  }, []);

  const allVisibleChecked =
    visible.length > 0 && visible.every((r) => checked.includes(r.place_id));

  const toggleAll = useCallback(() => {
    setChecked((prev) =>
      allVisibleChecked
        ? prev.filter((id) => !visible.some((r) => r.place_id === id))
        : [...new Set([...prev, ...visible.map((r) => r.place_id)])],
    );
  }, [allVisibleChecked, visible]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        !!el &&
        (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");

      /* Slash and Escape stay live while typing; everything else is a
         single-key command and would fire mid-word otherwise. */
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (e.key === "Escape") {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (selected) {
          setSelected(null);
          return;
        }
        if (checked.length > 0) {
          setChecked([]);
          return;
        }
        if (document.activeElement === searchRef.current) searchRef.current?.blur();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      const focused = visible[focusIndex];

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusIndex((i) => Math.min(i + 1, visible.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusIndex((i) => Math.max(i - 1, 0));
          break;
        case "ArrowRight":
        case "Enter":
          if (focused) {
            e.preventDefault();
            setSelected(focused);
          }
          break;
        case "s":
        case "S":
          if (focused) {
            e.preventDefault();
            quickSave(focused);
          }
          break;
        case "a":
        case "A":
          e.preventDefault();
          saveMany(results);
          break;
        case "?":
          e.preventDefault();
          setShowShortcuts((v) => !v);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, focusIndex, selected, checked.length, quickSave, saveMany, results, showShortcuts]);

  /* Scroll the ringed row into view so keyboard navigation is usable past the
     first screenful. */
  useEffect(() => {
    if (focusIndex < 0 || !listRef.current) return;
    const row = listRef.current.querySelector(`[data-index="${focusIndex}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [focusIndex]);

  const chipCls = (active: boolean) =>
    `cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
      active
        ? "bg-slate-700 text-white font-bold shadow-sm"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  const select = (r: FinderSearchResult) => setSelected(selected?.place_id === r.place_id ? null : r);

  /* The detail column only earns its width once a business is selected. */
  const gridCls = selected
    ? "grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]"
    : "grid grid-cols-1 gap-4";

  const selectedRow = visible[focusIndex];

  return (
    <div className={gridCls}>
      {/* ================= LEFT: search + results ================= */}
      <div className="flex min-w-0 flex-col gap-4">
        {/* Search Box */}
        <div className="rounded-xl border border-slate-800/80 bg-[#0d121d] p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              /* Hand focus back to the list once results land. Left focused,
                 the typing guard would swallow every arrow key, so the user
                 would have to press Escape before they could move through
                 what they just searched for. */
              searchRef.current?.blur();
              runSearch();
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <label htmlFor={searchInputId} className="sr-only">
              Search for businesses
            </label>
            <input
              id={searchInputId}
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search target businesses, e.g. '${exampleSearchOne}', '${exampleSearchTwo}'...`}
              className="h-11 w-full rounded-lg border border-slate-800 bg-[#0b0f19] py-2 pl-10 pr-24 text-xs font-medium text-white placeholder:text-slate-500 outline-none transition-colors focus:border-sky-500/60"
            />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-sky-400 disabled:opacity-40"
            >
              {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Discover"}
            </button>
          </form>
          <p className="mt-2 flex items-center gap-1.5 px-0.5 text-[11px] text-slate-500">
            <Keyboard className="h-3 w-3" />
            <Kbd>/</Kbd> search
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> move
            <Kbd>Enter</Kbd> details
            <Kbd>S</Kbd> save
            <Kbd>A</Kbd> save all
            <button
              type="button"
              onClick={() => setShowShortcuts((v) => !v)}
              className="cursor-pointer text-slate-400 underline underline-offset-2 hover:text-white"
            >
              all shortcuts
            </button>
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
            {error}
          </p>
        )}

        {showShortcuts && (
          <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-300">
                <span><Kbd>/</Kbd> focus search</span>
                <span><Kbd>↑</Kbd> <Kbd>↓</Kbd> move through results</span>
                <span><Kbd>Enter</Kbd> <Kbd>→</Kbd> open details</span>
                <span><Kbd>S</Kbd> save the focused result</span>
                <span><Kbd>A</Kbd> save every unsaved result</span>
                <span><Kbd>Esc</Kbd> close, then clear, then blur</span>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                aria-label="Close shortcuts"
                className="cursor-pointer rounded p-1 text-slate-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Results Container */}
        <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-[#0d121d]">
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#090d16] px-4 py-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-xs font-bold uppercase tracking-tight text-white">
                {results.length ? `Results (${results.length})` : "Business results"}
              </h3>
              {results.length > 0 && (
                <span className="text-[11px] font-bold tabular-nums text-sky-400">
                  {unsaved > 0 ? `${unsaved} unsaved` : "All saved to CRM"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onOpenRoutePlanner && (
                <button
                  type="button"
                  onClick={onOpenRoutePlanner}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 px-2.5 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-colors shadow-sm"
                  title="Plan sequenced multi-stop sales visits in Kampala"
                >
                  <Compass className="h-3.5 w-3.5 text-sky-400" />
                  <span>Territory Route Planner</span>
                </button>
              )}
              {results.length > 0 && (
                <>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sort results"
                    className="cursor-pointer rounded-lg border border-slate-800 bg-[#0b0f19] px-2 py-1.5 text-xs font-semibold text-slate-300 outline-none"
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="rating">Sort: Highest Rating</option>
                  </select>
                  <button
                    onClick={() => saveMany(visible)}
                    disabled={progress != null || unsaved === 0}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm shadow-sky-500/20 transition-colors hover:bg-sky-400 disabled:opacity-40"
                  >
                    {progress ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <ListChecks className="h-3 w-3" />
                    )}
                    {progress ? `${progress.done}/${progress.total}` : `Save all (${unsaved})`}
                  </button>
                </>
              )}
            </div>
          </div>

          {results.length === 0 ? (
            searching ? (
              <SkeletonList />
            ) : (
              <div className="space-y-2 px-5 py-16 text-center">
                <Compass className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                <p className="text-xs font-bold text-slate-400">Find businesses to add to your pipeline</p>
                <p className="mx-auto max-w-sm text-[11px] leading-relaxed text-slate-500">
                  Type a sector and location, such as &quot;{sector(0)} in {area(0)}&quot;, to
                  return phone numbers, websites, ratings, and addresses.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {config.targetCategories.slice(0, 4).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setQuery(`${c} in ${config.targetAreas[0] ?? ""}`.trim());
                      }}
                      className="cursor-pointer rounded-lg border border-slate-800 bg-[#090d16] px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                    >
                      {cap(c)}
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/80 bg-[#090d16] px-4 py-2">
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

              <div className="flex items-center gap-3 border-b border-slate-800/80 bg-[#090d16] px-4 py-2">
                <button
                  onClick={toggleAll}
                  disabled={visible.length === 0}
                  className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-slate-400 transition-colors hover:text-white disabled:cursor-default disabled:opacity-40"
                >
                  {allVisibleChecked ? (
                    <SquareCheckBig className="h-3.5 w-3.5 text-sky-400" />
                  ) : (
                    <Square className="h-3.5 w-3.5" />
                  )}
                  {allVisibleChecked ? "Clear selection" : "Select all shown"}
                </button>
                {categoryFilter && (
                  <span className="text-[11px] text-slate-500">
                    {visible.length} of {results.length} shown
                  </span>
                )}
              </div>

              <div ref={listRef} className="divide-y divide-slate-800/60">
                {visible.map((r, i) => {
                  const saved = savedIds.has(r.place_id);
                  const isSelected = selected?.place_id === r.place_id;
                  const isChecked = checked.includes(r.place_id);
                  const isFocused = i === focusIndex;
                  const isSaving = savingId === r.place_id;
                  return (
                    <div
                      key={r.place_id}
                      data-index={i}
                      onClick={() => select(r)}
                      className={`flex cursor-pointer items-center gap-3 border-l-[3px] px-4 py-3 transition-colors ${
                        isSelected
                          ? "border-l-sky-400 bg-[#182030]"
                          : isFocused
                            ? "border-l-sky-500/60 bg-[#141b29]"
                            : "border-l-transparent hover:bg-[#182030]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={saved}
                        onChange={() => toggleCheck(r.place_id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${r.business_name}`}
                        className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-sky-500 disabled:cursor-default disabled:opacity-30"
                      />
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                        style={{ background: categoryColor(r.category) }}
                        title={r.category || "Business"}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-white tracking-tight">{r.business_name}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                          <StarRow rating={r.rating} reviews={r.reviews} />
                          {r.phone ? (
                            <span className="truncate text-slate-400 font-mono text-[11px]">{r.phone}</span>
                          ) : (
                            <span className="text-[11px] text-slate-600">No phone — cannot call</span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-slate-500 mt-0.5">{r.address}</p>
                      </div>
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (!saved) quickSave(r);
                        }}
                        disabled={saved || isSaving}
                        aria-label={saved ? `${r.business_name} is saved` : `Save ${r.business_name} to the pipeline`}
                        className={`shrink-0 rounded-lg p-2 transition-all ${
                          saved
                            ? "cursor-default text-emerald-400 bg-emerald-950/40 border border-emerald-800/40"
                            : isSaving
                              ? "cursor-wait text-sky-400 border border-sky-500/30 bg-sky-500/10"
                              : "cursor-pointer border border-slate-700 bg-[#07090e] text-slate-300 hover:border-sky-500/60 hover:text-sky-400"
                        }`}
                        title={saved ? "Already in the pipeline" : "Save to the pipeline"}
                      >
                        {isSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : saved ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {nextPageToken && (
                <div className="border-t border-slate-800/80 p-3 text-center bg-[#090d16]">
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

        {/* Bulk bar. Always rendered once there are results so the list does
            not jump the first time a box is ticked. */}
        {results.length > 0 && (
          <div
            className={`sticky bottom-0 flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors ${
              checked.length > 0
                ? "border-sky-500/30 bg-[#0d121d]"
                : "border-slate-800/80 bg-[#0d121d]"
            }`}
          >
            {checked.length > 0 ? (
              <>
                <ListChecks className="h-4 w-4 shrink-0 text-sky-400" />
                <span className="text-xs font-semibold text-white">
                  {checked.length} selected
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setChecked([])}
                    className="cursor-pointer rounded-lg border border-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() =>
                      saveMany(visible.filter((r) => checked.includes(r.place_id)))
                    }
                    disabled={progress != null}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-sm shadow-sky-500/20 transition-colors hover:bg-sky-400 disabled:opacity-40"
                  >
                    {progress ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    {progress ? `Saving ${progress.done}/${progress.total}` : `Save ${checked.length}`}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-slate-500">
                Tick businesses to save a chosen few, or use{" "}
                <Kbd>A</Kbd> to save every unsaved result.
              </p>
            )}
          </div>
        )}
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
              <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-[#090d16]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Building2 className="h-3.5 w-3.5 text-sky-400" /> Business Profile
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Close details"
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

                {savedIds.has(selected.place_id) ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-800/40 bg-emerald-950/40 py-2.5 text-xs font-bold text-emerald-400">
                      <Check className="h-4 w-4" /> Lead in Pipeline
                    </div>
                    {onOpenSavedLead && (() => {
                      const match = leads.find((l) => l.place_id === selected.place_id);
                      return match ? (
                        <button
                          onClick={() => onOpenSavedLead(match.id)}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-800 py-2.5 text-xs font-bold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Open full profile
                        </button>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => quickSave(selected)}
                      disabled={savingId != null}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-sky-500/20 transition-colors hover:bg-sky-400 disabled:opacity-40"
                    >
                      {savingId === selected.place_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save to Pipeline
                    </button>
                    <button
                      onClick={() => onSaveBusiness(selected)}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-800 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" /> Save &amp; add details
                    </button>
                  </div>
                )}

                {selectedRow && (
                  <p className="text-[11px] text-slate-600">
                    Row {focusIndex + 1} of {visible.length} · press{" "}
                    <Kbd>S</Kbd> to save without leaving the keyboard
                  </p>
                )}
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="divide-y divide-slate-800/60" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 px-4 py-3.5">
          <div className="h-3.5 w-3.5 rounded bg-slate-800" />
          <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-2.5 w-1/3 rounded bg-slate-800" />
            <div className="h-2 w-1/4 rounded bg-slate-800/70" />
            <div className="h-2 w-2/3 rounded bg-slate-800/50" />
          </div>
        </div>
      ))}
    </div>
  );
}