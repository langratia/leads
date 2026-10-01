# LANGRATIA Leads

**A white-label lead generation and sales pipeline system.** Leads helps a team find local businesses, qualify them, move them through a deal pipeline, and keep follow-ups from going cold.

LANGRATIA builds and runs this for its own sales team, and offers it to other businesses under their own brand. There is one codebase; each deployment is configured for its own market, brand, currency, and target sectors.

Access is controlled by Supabase Auth.

---

## What it does

### Lead Finder

Geo-targeted business discovery built on the Google Places API (New). Staff type a plain query like *"pharmacies near me"* and get back verified businesses with phone number, website, address, coordinates, and Google rating.

- Coordinate biasing — search anchored to a location with an adjustable radius
- Category filter and sort-by-rating over the result set
- Pagination via Google's `nextPageToken`, de-duplicated client-side by `place_id`
- One-click save, or bulk "Save All"
- Address geocoding when a lead is added manually without coordinates

### Pipeline

Horizontal Kanban board with seven stages: `New → Contacted → Qualified → Proposal Sent → Negotiating → Won → Lost`. Cards are drag-and-drop between stages; dropping writes the new status and logs an activity entry. Each column shows a live count and the summed deal value.

### All Leads

Searchable, filterable table over every lead. Filter by status, priority, and source; multi-select for bulk status and priority changes. Row click opens the lead profile. Exports to CSV.

### Follow-ups

Scheduled calls, WhatsApp check-ins, and meetings, bucketed into **overdue**, **due today**, and **upcoming**. Completing or deleting a follow-up updates the lead and writes to its activity timeline.

### Lead scoring

Rule-based, capped at 100 (`src/crm/leads/model/scoring.ts`). Scores category fit, geographic fit against the configured target areas, contact completeness, and product interest. Computed on create and re-computed on edit.

### Email threads

Outbound email through Resend, with replies persisted into a conversation-style thread. Threads are matched to leads by `participant_email`. The composer offers canned templates for discovery, NDA, and pricing replies.

### Lead profile

A drawer over any lead showing full contact details, direct `tel:` / `mailto:` / `wa.me` actions, an activity timeline, follow-up history, status transitions, and the **Convert to Customer** action.

---

## Product scope

Leads is built toward the feature set of a modern AI-native outbound engine, scoped for businesses that sell to local SMEs — the buyer is typically the owner-operator, reached primarily by phone and messaging. This section states the intended scope and where each capability stands today.

**Status key:** ● shipped  ◐ partial  ○ specified, not built

### Discovery and market sizing

| Capability | Status |
| --- | --- |
| Geo-targeted business search across sectors and locations | ● |
| Coordinate biasing, radius control, category filters, pagination | ● |
| Lookalike discovery — find businesses similar to a known customer | ○ |
| Saved searches and reusable segments | ○ |
| Neighbouring-niche clustering with market sizing | ○ |

### Lead qualification

| Capability | Status |
| --- | --- |
| Rule-based lead scoring (category, geography, contact completeness) | ● |
| Per-lead activity timeline and qualification history | ● |
| AI qualification — natural-language questions scored against a lead, e.g. *"is this clinic still keeping manual records?"* | ○ |
| AI-enriched scoring layered over the rule baseline | ○ |
| ICP refinement from real conversion outcomes | ○ |

### Research and enrichment

| Capability | Status |
| --- | --- |
| Google Maps cross-referencing — web and local presence in one record | ● |
| Contact verification and normalisation (phone formats, name variants) | ○ |
| Automated data fill — infer missing fields from what is already known | ○ |
| Website and social crawling to extract what a business does and lacks | ○ |
| Decision-maker identification — the owner-operator is the buyer in this market | ○ |
| Timezone-aware outreach scheduling across multi-zone deployments | ○ |

### Outreach

| Capability | Status |
| --- | --- |
| Phone and WhatsApp deep links from every lead surface | ◐ |
| Multi-step sequence builder for scheduled outreach | ○ |
| Behaviour-triggered autonomous follow-ups | ○ |
| Personalised copy drafted from enrichment data | ○ |
| Email deliverability and bounce monitoring | ○ |
| Reply routing into a shared team inbox | ◐ |
| Deduplication limits across campaigns | ○ |

### Pipeline and conversion

| Capability | Status |
| --- | --- |
| Seven-stage Kanban with drag-and-drop stage changes | ● |
| Bulk search, filter, status and priority updates, CSV export | ● |
| Scheduled follow-ups with overdue detection | ● |
| Lead-to-customer conversion | ● |
| Deal-level and campaign-level reporting | ○ |

**Two constraints shape this scope.**

*Email reach is bounded by the data source.* Google Places returns business name, category, phone, website, address, and rating — it does not return email addresses. The `leads.email` column is only populated by manual entry. Outreach is therefore phone and messaging first, with email reserved for leads whose address has been verified. Inferred or generated addresses are never sent to.

*Scope is set by the buyer, not the list.* Enterprise-oriented outbound tools sell to companies selling to companies. Their filters for founder origin, workforce distribution, and CRM-stack detection address a market that does not exist for a pharmacy, clinic, or small retailer. Those capabilities are deliberately out of scope; the enrichment and qualification work that does apply is prioritised instead.

---

## White-labelling

The same build serves LANGRATIA and any client deployment. Every client-specific value is read from `src/config/index.ts`; nothing else in `src/` may hardcode one.

| Layer | Status | Set by |
| --- | --- | --- |
| **Brand and product name** | ● Configurable | `VITE_BRAND_NAME`, `VITE_BRAND_FULL_NAME`, `VITE_PRODUCT_NAME` |
| **Links out of the CRM** | ● Configurable | `VITE_SITE_URL`, `VITE_SITE_DOMAIN` |
| **Currency and locale** | ● Configurable | `VITE_CURRENCY`, `VITE_LOCALE`, `VITE_CURRENCY_DECIMALS` |
| **Scoring geography and sectors** | ● Configurable | `VITE_TARGET_AREAS`, `VITE_TARGET_CATEGORIES` |
| **Email sender identity** | ● Configurable | `SENDER_EMAIL`, `SENDER_NAME`, `NOTIFICATION_EMAIL` (server) |
| **Cross-component event names** | ● Configurable | `VITE_EVENT_NAMESPACE` |
| **Copy and colour theme** | ○ Hardcoded | Marketing page copy, Tailwind colour values |
| **Data isolation** | ○ Not implemented | See the access-model note under [Schema](#schema) |

**What is genuinely shared:** the entire CRM — Lead Finder, pipeline, follow-ups, scoring, email threads, lead profile, and the schema. For a new client, the work is setting the variables above, applying their Tailwind theme, and pointing them at their own Supabase and Resend projects.

**What a client deployment still needs before handover:** a Tailwind theme for their brand, sender-domain verification in Resend, and their own Places and Resend API keys.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| **Framework** | React 19 + TypeScript |
| **Build** | Vite 7 |
| **Routing** | wouter |
| **Styling** | Tailwind CSS v4 |
| **Icons / motion** | lucide-react, framer-motion |
| **Database & auth** | Supabase — PostgreSQL, RLS, Auth |
| **Business data** | Google Places API (New), proxied server-side |
| **Email** | Resend |
| **Hosting** | Cloudflare Pages + Pages Functions |

---

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values
npm run dev               # http://localhost:5174
```

| Script | Does |
| --- | --- |
| `npm run dev` | Vite dev server on port 5174, with a dev proxy for `/api/places` |
| `npm run build` | `tsc -b` then `vite build` into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc --noEmit` |

### Environment variables

Secrets, needed on every deployment:

| Variable | Used by | Notes |
| --- | --- | --- |
| `PLACES_API_KEY` | `functions/api/places/*`, Vite dev proxy | Google Places (New) Text Search key |
| `SUPABASE_URL` | Server functions | Falls back to a hardcoded project URL |
| `SUPABASE_ANON_KEY` | Server functions | Anon key — safe to expose, RLS does the gating |
| `RESEND_API_KEY` | `functions/api/email/send.ts` | Required for outbound email |
| `SENDER_EMAIL` / `SENDER_NAME` | `functions/api/email/send.ts` | Outbound sender identity |
| `NOTIFICATION_EMAIL` | `functions/api/email/send.ts` | Reply-to address for outbound mail |
| `VITE_SUPABASE_URL` | `src/core/supabase.ts` | Falls back to the hardcoded project URL |
| `VITE_SUPABASE_ANON_KEY` | `src/core/supabase.ts` | Falls back to the hardcoded anon key |

White-label configuration, all optional — see [White-labelling](#white-labelling). Every one has a LANGRATIA default in `src/config/index.ts`, so they are only needed when deploying for another client.

| Variable | Default | Sets |
| --- | --- | --- |
| `VITE_BRAND_NAME` / `VITE_BRAND_FULL_NAME` | `LANGRATIA` | CRM chrome and login screen |
| `VITE_PRODUCT_NAME` | `Leads` | Product name beside the brand mark |
| `VITE_SITE_URL` / `VITE_SITE_DOMAIN` | `https://langratia.com` | Links out of the CRM |
| `VITE_SENDER_EMAIL` / `VITE_REPLY_TO_EMAIL` | `inquiries@langratia.com` | Sender shown in the email thread |
| `VITE_DEFAULT_USER_EMAIL` | `sales@langratia.com` | Shown when no session email is available |
| `VITE_LOCALE` / `VITE_CURRENCY` / `VITE_CURRENCY_DECIMALS` | `en-UG` / `UGX` / `0` | Date and money formatting |
| `VITE_TARGET_AREAS` / `VITE_TARGET_CATEGORIES` | Kampala areas, SME sectors | Lead scoring and search examples |
| `VITE_EVENT_NAMESPACE` | `langratia` | Cross-component event names |

**Supabase keys are committed to the repo by design.** The anon key is the public half of Supabase's auth model and is only meaningful alongside RLS. Secrets that must *not* be public — `PLACES_API_KEY` and `RESEND_API_KEY` — belong in `.env` and in Cloudflare's dashboard, not in git.

---

## Architecture

**The browser talks to Supabase directly.** There is no application backend for CRM data. `src/crm/leads/api/repository.ts` is the data layer; components never construct Supabase queries themselves.

**Cloudflare Pages Functions exist only to keep secrets server-side.** They proxy Google Places (so the API key is never sent to the browser) and dispatch email through Resend. They do raw `fetch` calls against the Supabase REST API — they are not a general-purpose backend.

**Auth** is Supabase Auth. `src/App.tsx` holds the session, and every CRM route renders `LoginPage` until a session exists. `LeadsShell` gates the app sections behind it.

### Data flow

```text
Lead Finder  ──>  /api/places/search  ──>  Cloudflare Fn  ──>  Google Places
                                                          └─> search_logs (analytics)

CRM reads/writes  ──>  Supabase Data API  ──>  Postgres + RLS
                       (anon key + user JWT)

Outbound email  ──>  /api/email/send  ──>  Resend  ──>  email_messages, email_threads
Inbound replies ──>  Resend webhook  ──>  email_threads, email_messages
```

### Schema

Four migrations, applied in order via the Supabase SQL editor. There is no migration runner — the SQL files are the source of truth.

| Table | Holds |
| --- | --- |
| `leads` | The core record — 33 columns covering business identity, contact, geo, sales, and follow-up state |
| `lead_activities` | Append-only timeline per lead; cascades on lead delete |
| `lead_followups` | Scheduled follow-ups; cascades on lead delete |
| `customers` | Created on conversion from a won lead |
| `email_threads` | Conversations, keyed by `participant_email` |
| `email_messages` | Individual messages within a thread |
| `search_logs` | Lead Finder usage analytics |
| `inquiries` | Website scoping submissions, written by the marketing site's contact form |
| `bookings` | Consultation requests made through the site calendar |

**Access model:** all authenticated staff can read and manage every lead — this is a shared team CRM, and RLS is `using (true)` across the tables. There is no per-user ownership.

---

## Project structure

```text
src/
  App.tsx                  Routes and auth gate
  config/
    index.ts               White-label config — brand, locale, currency,
                           scoring geography and sectors, sender identity
  core/                    Shared, product-agnostic
    ui.tsx                 Design system: Card, DataTable, StatCard, Badge, Field
    data.ts                Nav structure and section metadata
    format.ts              Date and money formatting
    export-utils.ts        CSV export
    supabase.ts            Supabase client
  crm/                     The product clients are given
    shell/                 LeadsShell, CommandPalette, NotificationsDrawer
    auth/                  LoginPage
    leads/                 The main vertical slice
      index.ts             Public surface — import from "@/crm/leads"
      model/               types, constants, scoring (pure, no I/O)
      api/repository.ts    All Supabase CRUD
      finder/places.ts     Client for the server-side Places proxy
      *.tsx                One container per route + its view components
    inquiries/
      model/               Types and placeholder rows
      Inquiries.tsx        Email threads and consultation bookings
      EmailChatThread.tsx  Conversation view and composer
  marketing/               LANGRATIA's public site — separate product
    pages/
    components/
functions/api/             Cloudflare Pages Functions
  places/
    _shared.ts             Auth, CORS, rate limiting, Supabase access
    _handler.ts            Request parsing — shared with the Vite dev proxy
    search.ts              GET /api/places/search
    geocode.ts             GET /api/places/geocode
  email/send.ts            Resend dispatch
supabase/
  migrations/              Schema, applied manually
  functions/               Deno edge functions (inbound email)
```

**Conventions:** database columns are `snake_case`; TypeScript is `camelCase`. Import across folders with the `@/` alias (`@/core/ui`, `@/crm/leads`); import siblings with `./`. New data access goes in `src/crm/leads/api/repository.ts`, new record shapes in `src/crm/leads/model/types.ts`. **No client-specific value may be hardcoded outside `src/config/index.ts`** — brand, currency, locale, target areas, target sectors, and sender identity all come from there. Mutations call `refresh()` afterward — there is no realtime subscription.

---

## Deployment

Cloudflare Pages, configured via `wrangler.json` (`pages_build_output_dir: "dist"`). Build command `npm run build`, output `dist`.

Set `PLACES_API_KEY`, `RESEND_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` as encrypted environment variables in the Cloudflare dashboard.

`public/_redirects` sends all unmatched routes to `index.html` for SPA routing; `public/_routes.json` excludes `/api/*` from that rewrite so Pages Functions are reached.

---

## Known limitations

- **No automated tests, linter, or CI.** `npm run build` (which typechecks) is the only quality gate.
- **Migrations are applied by hand.** Nothing verifies the live database matches the SQL files.
- **The composer cannot attach files.** There is no upload path, so replies go out as plain text. Any document referenced in a template has to be sent separately.
- **Email threads load once on mount** and do not poll or subscribe, so a reply arriving in the inbox does not appear until the thread is reopened. Inbound mail is only ever written to `email_messages` if a Resend webhook is configured; without one the thread stays one-sided.
- **The `/demo` page is a scripted mock** with hardcoded sample companies, not a live preview.
- **Lead score is rule-based**, not learned from outcomes.
- **White-labelling is configured, not themed.** Brand, currency, locale, scoring geography, sectors, and sender identity all come from `src/config/index.ts`. Copy and colour are not parameterised, and there is no tenant isolation — a second client needs their own Supabase project. See [White-labelling](#white-labelling).
- **Google Places returns no email addresses.** The `leads.email` column is only ever populated by manual entry, which is why outreach leads with phone and WhatsApp rather than email.
