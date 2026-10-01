/**
 * Deployment configuration — the white-label layer.
 *
 * Every client-specific value in the CRM comes from here: brand, locale,
 * currency, the geography and sectors that lead scoring favours, and the
 * sender identity used in outbound email. Nothing else in `src/` may hardcode
 * these.
 *
 * A client deployment is this file plus environment variables — no forked
 * code. Defaults below describe the LANGRATIA deployment.
 *
 * Server-only values (API keys, sender domain) live in Cloudflare env vars and
 * are read by `functions/`, never from here.
 */

const env = import.meta.env;

function csv(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  const parsed = value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return parsed.length > 0 ? parsed : fallback;
}

export interface DeploymentConfig {
  /** Short brand mark shown in the CRM chrome, e.g. the sidebar wordmark. */
  brandName: string;
  /** Long form, used on the login screen. */
  brandFullName: string;
  /** Product name shown beside the brand mark. */
  productName: string;
  /** Public marketing site for this deployment. */
  siteUrl: string;
  /** Bare domain, shown under the brand mark. */
  siteDomain: string;
  /** Address outbound mail is sent from. */
  senderEmail: string;
  /** Where replies to outbound mail are routed. */
  replyToEmail: string;
  /** Fallback shown for the signed-in user when no session email is available. */
  defaultUserEmail: string;

  /** BCP-47 locale for date and number formatting. */
  locale: string;
  /** ISO 4217 currency code for deal values. */
  currency: string;
  /** Minor units — 0 for currencies without decimals. */
  currencyDecimals: number;

  /** Localities that count as in-market for lead scoring. */
  targetAreas: string[];
  /** Business categories that count as in-market for lead scoring. */
  targetCategories: string[];

  /** Custom event names used for cross-component shell navigation. */
  events: {
    navigate: string;
    openAddLead: string;
  };
}

export const config: DeploymentConfig = {
  brandName: env.VITE_BRAND_NAME || "LANGRATIA",
  brandFullName: env.VITE_BRAND_FULL_NAME || "LANGRATIA",
  productName: env.VITE_PRODUCT_NAME || "Leads",
  siteUrl: env.VITE_SITE_URL || "https://langratia.com",
  siteDomain: env.VITE_SITE_DOMAIN || "langratia.com",
  senderEmail: env.VITE_SENDER_EMAIL || "inquiries@langratia.com",
  replyToEmail: env.VITE_REPLY_TO_EMAIL || env.VITE_SENDER_EMAIL || "inquiries@langratia.com",
  defaultUserEmail: env.VITE_DEFAULT_USER_EMAIL || "sales@langratia.com",

  locale: env.VITE_LOCALE || "en-UG",
  currency: env.VITE_CURRENCY || "UGX",
  currencyDecimals: env.VITE_CURRENCY_DECIMALS
    ? Number(env.VITE_CURRENCY_DECIMALS)
    : 0,

  targetAreas: csv(env.VITE_TARGET_AREAS, [
    "kampala", "ntinda", "wakiso", "entebbe", "kawempe", "makerere",
    "muyenga", "kansanga", "bugolobi", "nakawa", "lugogo",
  ]),
  targetCategories: csv(env.VITE_TARGET_CATEGORIES, [
    "pharmacy", "clinic", "hospital", "school", "church",
    "retail", "hotel", "restaurant", "hardware", "shop",
  ]),

  events: {
    navigate: `${env.VITE_EVENT_NAMESPACE || "langratia"}:nav`,
    openAddLead: `${env.VITE_EVENT_NAMESPACE || "langratia"}:open-add-lead`,
  },
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: config.currencyDecimals,
  }).format(value);
};
