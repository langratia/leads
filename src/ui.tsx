import type { ReactNode } from "react";
import { Search, ChevronDown } from "lucide-react";

/* ============================================================
   DESIGN TOKENS (Refined Dark Slate / Linear & Stripe Style)
   ============================================================ */

export const tint = {
  bg: "bg-[#090d16]",
  surface: "bg-[#0d121d]",
  elevated: "bg-[#141b29]",
  hover: "hover:bg-[#182030]",
  border: "border-slate-800/80",
  borderSoft: "border-slate-800/50",
  borderHover: "hover:border-slate-700",
  text: "text-slate-100",
  text2: "text-slate-400",
  text3: "text-slate-500",
  accent: "text-sky-400",
};

export const btnPrimary =
  "inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-sky-500/20 transition-all hover:bg-sky-400 hover:shadow-sky-400/30";

export const btnGhost =
  "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-[#121724] px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:bg-[#182030] hover:text-white";

export const inputCls =
  "w-full rounded-lg border border-slate-800 bg-[#0b0f19] px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20";

/* ============================================================
   BADGE
   ============================================================ */

export type Tone = "blue" | "green" | "amber" | "red" | "purple" | "gray";

const toneMap: Record<Tone, string> = {
  blue: "bg-sky-950/40 text-sky-300 border-sky-800/40",
  green: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40",
  amber: "bg-amber-950/40 text-amber-300 border-amber-800/40",
  red: "bg-rose-950/40 text-rose-300 border-rose-800/40",
  purple: "bg-indigo-950/40 text-indigo-300 border-indigo-800/40",
  gray: "bg-slate-800/50 text-slate-300 border-slate-700/50",
};

export function toneFor(status: string): Tone {
  const s = status.toLowerCase();
  if (["new", "open", "active", "paid", "completed", "resolved", "won", "published", "delivered"].includes(s)) return "green";
  if (["contacted", "active blue", "assigned"].includes(s)) return "blue";
  if (["qualified", "interested", "proposal", "watching"].includes(s)) return "purple";
  if (["pending", "processing", "quoted", "negotiating", "expiring", "in progress", "waiting", "waiting for customer", "unpaid", "partially paid", "draft", "medium", "outstanding"].includes(s)) return "amber";
  if (["expired", "lost", "cancelled", "canceled", "overdue", "suspended", "refunded", "high", "inactive"].includes(s)) return "red";
  return "gray";
}

export function Badge({
  tone,
  children,
  dot = true,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-4 ${
        toneMap[tone ?? toneFor(String(children))]
      }`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ============================================================
   AVATAR (initials)
   ============================================================ */

const avatarPalette = [
  "bg-sky-500/15 text-sky-300",
  "bg-violet-500/15 text-violet-300",
  "bg-emerald-500/15 text-emerald-300",
  "bg-amber-500/15 text-amber-300",
  "bg-rose-500/15 text-rose-300",
  "bg-cyan-500/15 text-cyan-300",
];

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color =
    avatarPalette[
      [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % avatarPalette.length
    ];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-semibold ${color} ${
        size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs"
      }`}
    >
      {initials}
    </span>
  );
}

/* ============================================================
   PAGE HEADER
   ============================================================ */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

/* ============================================================
   CARD CONTAINER
   ============================================================ */

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = "",
  bodyClassName = "p-5",
}: {
  title?: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#242424] bg-[#0a0a0a] ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between gap-4 border-b border-[#1c1c1c] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-[#8a8a8a]">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

/* ============================================================
   STAT CARD
   ============================================================ */

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "green",
  icon,
  footer,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "green" | "red" | "amber";
  icon?: ReactNode;
  footer?: string;
}) {
  const deltaCls =
    deltaTone === "green"
      ? "text-emerald-400"
      : deltaTone === "amber"
        ? "text-amber-400"
        : "text-red-400";
  return (
    <div className="group rounded-xl border border-[#242424] bg-[#0a0a0a] p-5 transition-colors hover:border-[#3a3a3a]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
          {label}
        </span>
        {icon && <span className="text-[#5c5c5c] group-hover:text-sky-400 transition-colors">{icon}</span>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-white">{value}</span>
        {delta && <span className={`text-xs font-semibold ${deltaCls}`}>{delta}</span>}
      </div>
      {footer && <p className="mt-1 text-[11px] text-[#737373]">{footer}</p>}
    </div>
  );
}

/* ============================================================
   DATA TABLE
   ============================================================ */

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  width?: string;
  render?: (row: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty = "No records found.",
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
  onRowClick?: (row: T) => void;
}) {
  const alignCls = { left: "text-left", right: "text-right", center: "text-center" };
  if (rows.length === 0) {
    return (
      <div className="px-5 py-16 text-center text-sm text-[#737373]">{empty}</div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#1f1f1f]">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#737373] ${alignCls[c.align ?? "left"]}`}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#161616]">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`transition-colors hover:bg-[#0e0e0e] ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`whitespace-nowrap px-5 py-3.5 text-[13px] text-[#e5e5e5] ${alignCls[c.align ?? "left"]}`}
                >
                  {c.render ? c.render(row) : (row as Record<string, ReactNode>)[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   SEGMENTED CONTROL (tabs / chips)
   ============================================================ */

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-[#242424] bg-[#0a0a0a] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === o.value
              ? "bg-[#1a1a1a] text-white shadow-sm"
              : "text-[#8a8a8a] hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   FILTER BAR
   ============================================================ */

export function FilterBar({
  searchPlaceholder = "Search…",
  selects = [],
  actions,
}: {
  searchPlaceholder?: string;
  selects?: { value?: string; label: string }[][];
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c5c5c]" />
        <input
          placeholder={searchPlaceholder}
          className={`${inputCls} w-56 pl-9`}
        />
      </label>
      {selects.map((opts, i) => (
        <label key={i} className="relative">
          <select className={`${inputCls} w-44 appearance-none pr-8`}>
            {opts.map((o) => (
              <option key={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5c5c5c]" />
        </label>
      ))}
      {actions}
    </div>
  );
}

/* ============================================================
   FORMS (settings)
   ============================================================ */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#a3a3a3]">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-[#6b6b6b]">{hint}</p>}
    </div>
  );
}

export function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  return (
    <button
      type="button"
      className="relative h-5.5 w-10 cursor-pointer rounded-full transition-colors"
      style={{
        background: defaultOn ? "rgba(14,165,233,0.9)" : "#2b2b2b",
        height: 22,
      }}
      onClick={(e) => {
        const el = e.currentTarget;
        el.style.background =
          el.style.background === "rgba(14, 165, 233, 0.9)" ? "#2b2b2b" : "rgba(14,165,233,0.9)";
      }}
    >
      <span
        className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-all"
        style={{ left: defaultOn ? "calc(100% - 20px)" : 2 }}
      />
    </button>
  );
}

/* ============================================================
   CHART HELPERS (pure CSS)
   ============================================================ */

export function BarChart({
  data,
  accent = "#0ea5e9",
}: {
  data: { label: string; value: number }[];
  accent?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-44 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-[11px] font-semibold text-[#d4d4d4]">{d.value}k</span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${Math.max((d.value / max) * 78, 4)}%`,
              background: `linear-gradient(180deg, ${accent}66 0%, ${accent}22 100%)`,
              boxShadow: `inset 0 0 0 1px ${accent}55`,
            }}
          />
          <span className="text-[10px] text-[#737373]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ProgressBar({
  value,
  color = "bg-sky-500",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1c1c1c]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

/* ============================================================
   MISC
   ============================================================ */

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-[#2b2b2b] bg-[#141414] px-1.5 py-0.5 font-mono text-[10px] text-[#a3a3a3]">
      {children}
    </kbd>
  );
}
