"use client";

import { Badge, toneFor } from "@/app/admin/ui";
import type { Lead } from "@/lib/leads";

export const STATUS_TONE: Record<string, string> = {
  New: "blue",
  Contacted: "purple",
  Qualified: "amber",
  "Proposal Sent": "violet",
  Negotiating: "amber",
  Won: "green",
  Lost: "red",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = (STATUS_TONE[status] || toneFor(status)) as any;
  return <Badge tone={tone}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, "blue" | "amber" | "red" | "purple"> = {
    Low: "blue",
    Medium: "amber",
    High: "red",
    Hot: "purple",
  };
  return <Badge tone={map[priority] || "gray"}>{priority}</Badge>;
}

export function SourceBadge({ source }: { source: string }) {
  return <Badge tone="gray" dot={false}>{source}</Badge>;
}

export function leadLocation(lead: Lead): string {
  return [lead.address, lead.category].filter(Boolean).join(" · ") || "—";
}

export function leadContact(lead: Lead): string {
  return [lead.phone || lead.whatsapp, lead.email].filter(Boolean).join(" · ") || "—";
}

export function scoreLabel(score: number | null | undefined): string {
  if (score == null) return "—";
  return `${Math.max(0, Math.min(score, 100))}`;
}

export function stageColor(status: string): string {
  const map: Record<string, string> = {
    New: "#0ea5e9",
    Contacted: "#a78bfa",
    Qualified: "#f59e0b",
    "Proposal Sent": "#8b5cf6",
    Negotiating: "#f59e0b",
    Won: "#10b981",
    Lost: "#ef4444",
  };
  return map[status] || "#737373";
}