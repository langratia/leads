/* Rule-based lead scoring. Pure — no I/O, no Supabase. */

import { config } from "@/config";
import type { Lead } from "./types";

const TARGET_AREAS = config.targetAreas;
const TARGET_CATEGORIES = config.targetCategories;

export function computeLeadScore(lead: Partial<Lead>): number {
  let score = 0;
  const category = (lead.category || "").toLowerCase();
  const address = (lead.address || "").toLowerCase();

  if (TARGET_CATEGORIES.some((c) => category.includes(c))) score += 20;
  if (TARGET_AREAS.some((a) => address.includes(a))) score += 15;
  if (lead.phone || lead.whatsapp) score += 10;
  if (lead.email) score += 10;
  if (lead.website) score += 5;
  if (lead.interested_product) score += 20;
  if ((lead.tags || []).length > 1) score += 5;
  if ((lead.tags || []).some((t) => t.toLowerCase().includes("branch"))) score += 15;

  return Math.min(score, 100);
}
