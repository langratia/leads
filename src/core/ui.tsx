import { Search } from "lucide-react";
import type { ReactNode } from "react";

/* ============================================================
   DESIGN TOKENS
   ============================================================
   One slate ramp, used by every surface in the CRM. Previously the shell and
   Finder/Pipeline used these bluish values while every component in this file
   used pure neutral greys, so cards rendered as holes punched through the page
   rather than objects sitting on it. Nothing outside this file should use a
   hex literal — that is what makes a client re-theme possible. */

export const surface = {
  /** Page background. */
  page: "bg-[#07090e]",
  /** Cards, panels, table containers. */
  card: "bg-[#0d121d]",
  /** Rows, inputs, and anything nested inside a card. */
  inset: "bg-[#090d16]",
  /** Hover on an inset surface. */
  insetHover: "hover:bg-[#141b29]",
};

export const border = {
  DEFAULT: "border-slate-800/80",
  soft: "border-slate-800/50",
  strong: "border-slate-700",
};

export const text = {
  primary: "text-slate-100",
  secondary: "text-slate-400",
  muted: "text-slate-500",
  accent: "text-sky-400",
};

/* Kept as the historical name because marketing pages still import `tint`. */
export const tint = {
  bg: surface.page,
  surface: surface.card,
  elevated: "bg-[#141b29]",
  hover: "hover:bg-[#182030]",
  border: border.DEFAULT,
  borderSoft: border.soft,
  borderHover: border.strong,
  text: text.primary,
  text2: text.secondary,
  text3: text.muted,
  accent: text.accent,
};

export const btnPrimary =
  "inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-sm shadow-sky-500/20 transition-colors hover:bg-sky-400 disabled:opacity-50 disabled:pointer-events-none";

export const btnGhost =
  "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-[#141b29] px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:bg-[#182030] hover:text-white";

export const inputCls =
  "w-full rounded-lg border border-slate-800 bg-[#0b0f19] px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none transition-colors focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20";

/* ============================================================
   BADGE
   ============================================================ */

export type Tone = "blue" | "green" | "amber" | "red" | "purple" | "violet" | "gray";

const toneMap: Record<Tone, string> = {
  blue: "bg-sky-950/40 text-sky-300 border-sky-800/40",
  green: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40",
  amber: "bg-amber-950/40 text-amber-300 border-amber-800/40",
  red: "bg-rose-950/40 text-rose-300 border-rose-800/40",
  purple: "bg-indigo-950/40 text-indigo-300 border-indigo-800/40",
  violet: "bg-violet-950/40 text-violet-300 border-violet-800/40",
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
    <div className={`rounded-xl border border-slate-800/80 bg-[#0d121d] ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
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
  onClick,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "green" | "red" | "amber";
  icon?: ReactNode;
  footer?: string;
  onClick?: () => void;
}) {
  const deltaCls =
    deltaTone === "green"
      ? "text-emerald-400"
      : deltaTone === "amber"
        ? "text-amber-400"
        : "text-red-400";
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`group rounded-xl border border-slate-800/80 bg-[#0d121d] p-5 transition-colors hover:border-slate-700 ${
        onClick ? "cursor-pointer text-left" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {icon && <span className="text-slate-600 transition-colors group-hover:text-sky-400">{icon}</span>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-white">{value}</span>
        {delta && <span className={`text-xs font-semibold ${deltaCls}`}>{delta}</span>}
      </div>
      {footer && <p className="mt-1 text-[11px] text-slate-500">{footer}</p>}
    </Wrapper>
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
    return <div className="px-5 py-16 text-center text-sm text-slate-500">{empty}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-800/80">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${alignCls[c.align ?? "left"]}`}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`transition-colors hover:bg-slate-800/40 ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`whitespace-nowrap px-5 py-3.5 text-[13px] text-slate-200 ${alignCls[c.align ?? "left"]}`}
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
   FORMS
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
      <label className="mb-1.5 block text-xs font-semibold text-slate-400">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

/* ============================================================
   SEGMENTED CONTROL
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
    <div
      role="tablist"
      className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-slate-800/80 bg-[#0d121d] p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === o.value ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   TOOLBAR — the one filter surface every screen shares
   ============================================================ */

export interface ToolbarSelect {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}

/* FilterBar previously rendered an input and selects with no value or
   onChange, so it could never have worked; every screen built its own. */
export function Toolbar({
  query,
  onQuery,
  placeholder,
  selects,
  actions,
}: {
  query: string;
  onQuery: (v: string) => void;
  placeholder: string;
  selects?: ToolbarSelect[];
  actions?: ReactNode;
}) {
  const selectCls =
    "cursor-pointer rounded-lg border border-slate-800 bg-[#0b0f19] px-2.5 py-2 text-xs font-medium text-slate-300 outline-none transition-colors hover:border-slate-700 focus:border-sky-500/60";
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <label className="relative min-w-[200px] flex-1 sm:max-w-xs">
        <span className="sr-only">Search</span>
        <SearchIcon />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-800 bg-[#0b0f19] py-2 pl-9 pr-3 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none transition-colors focus:border-sky-500/60"
        />
      </label>
      {selects?.map((s, i) => (
        <label key={i} className="relative">
          <span className="sr-only">{s.allLabel}</span>
          <select value={s.value} onChange={(e) => s.onChange(e.target.value)} className={selectCls}>
            <option value="">{s.allLabel}</option>
            {s.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      {actions}
    </div>
  );
}

function SearchIcon() {
  return (
    <Search
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
      aria-hidden
    />
  );
}

/* ============================================================
   MISC
   ============================================================ */

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-slate-700 bg-[#141b29] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
      {children}
    </kbd>
  );
}