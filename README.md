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

Rule-based, capped at 100 (`src/lib/leads.ts`). Scores category fit, geographic fit against a configured list of target areas, contact completeness, and product interest. Computed on create and re-computed on edit. The current target lists are hardcoded — see [White-labelling](#white-labelling).

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

The same build serves LANGRATIA and any client deployment. What changes per deployment:

| Layer | Currently | Per-deployment target |
| --- | --- | --- |
| **Brand** | LANGRATIA name, copy, and colours throughout | Client brand, from a config object or theme tokens |
| **Currency** | `formatValue()` hardcodes `en-UG` / UGX, no decimals | Configured locale and currency code — KES, USD, GBP, ZAR |
| **Scoring geography** | `TARGET_AREAS` hardcodes Kampala-area localities | Configured list of target areas for the deployment's market |
| **Scoring categories** | `TARGET_CATEGORIES` hardcodes one sector list | Configured list of the client's target sectors |
| **Email sender** | `functions/api/email/send.ts` hardcodes the LANGRATIA sender and falls back to the Resend onboarding address | Client sender domain and reply-to address |
| **Auth** | One Supabase project, all staff share every lead | Per-client Supabase project, or a tenant column with scoped RLS |

**What is genuinely shared:** the entire CRM — Lead Finder, pipeline, follow-ups, scoring, email threads, lead profile, and the schema. A new client deployment is configuration, not redevelopment.

**What a client deployment still needs before it is safe to hand over:** tenant isolation (see the access-model note under [Schema](#schema)), sender-domain verification in Resend, and their own Places and Resend API keys.

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

| Variable | Used by | Notes |
| --- | --- | --- |
| `PLACES_API_KEY` | `functions/api/places/*`, Vite dev proxy | Google Places (New) Text Search key |
| `SUPABASE_URL` | Server functions | Falls back to a hardcoded project URL |
| `SUPABASE_ANON_KEY` | Server functions | Anon key — safe to expose, RLS does the gating |
| `RESEND_API_KEY` | `functions/api/email/send.ts` | Required for outbound email |
| `NOTIFICATION_EMAIL` | `functions/api/email/send.ts` | Reply-to address for outbound mail |
| `VITE_SUPABASE_URL` | `src/lib/supabase.ts` | Falls back to the hardcoded project URL |
| `VITE_SUPABASE_ANON_KEY` | `src/lib/supabase.ts` | Falls back to the hardcoded anon key |

**Supabase keys are committed to the repo by design.** The anon key is the public half of Supabase's auth model and is only meaningful alongside RLS. Secrets that must *not* be public — `PLACES_API_KEY` and `RESEND_API_KEY` — belong in `.env` and in Cloudflare's dashboard, not in git.

---

## Architecture

**The browser talks to Supabase directly.** There is no application backend for CRM data. `src/lib/leads.ts` is the data layer; components never construct Supabase queries themselves.

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

Three migrations, applied in order via the Supabase SQL editor. There is no migration runner — the SQL files are the source of truth.

| Table | Holds |
| --- | --- |
| `leads` | The core record — 33 columns covering business identity, contact, geo, sales, and follow-up state |
| `lead_activities` | Append-only timeline per lead; cascades on lead delete |
| `lead_followups` | Scheduled follow-ups; cascades on lead delete |
| `customers` | Created on conversion from a won lead |
| `email_threads` | Conversations, keyed by `participant_email` |
| `email_messages` | Individual messages within a thread |
| `search_logs` | Lead Finder usage analytics |

**Access model:** all authenticated staff can read and manage every lead — this is a shared team CRM, and RLS is `using (true)` across the tables. There is no per-user ownership.

---

## Project structure

```text
src/
  App.tsx                  Routes, auth gate, session state
  LeadsShell.tsx           CRM chrome: sidebar, nav, command palette
  LoginPage.tsx            Staff sign-in
  data.ts                  Nav structure and section metadata
  ui.tsx                   Design system: Card, DataTable, StatCard, Badge, Field
  export-utils.ts          CSV export
  lib/
    leads.ts               Data layer — all Supabase access, types, scoring
    supabase.ts            Supabase client
  sections/
    leads/                 CRM: one container per section + presentational views
    Inquiries.tsx          Email threads and consultation bookings
  pages/                   Public marketing site
  components/
    marketing/             Navbar, footer, layout
    EmailChatThread.tsx    Conversation view and composer
    CommandPalette.tsx     Cmd/Ctrl+K navigation
functions/api/             Cloudflare Pages Functions
  places/                  Google Places proxy (search, geocode, shared)
  email/send.ts            Resend dispatch
supabase/
  migrations/              Schema, applied manually
  functions/               Deno edge functions (inbound/outbound email)
```

**Conventions:** database columns are `snake_case`; TypeScript is `camelCase`. New data access goes in `src/lib/leads.ts`. CRM components import the design system through `@/app/admin/ui`. Mutations call `refresh()` afterward — there is no realtime subscription.

---

## Deployment

Cloudflare Pages, configured via `wrangler.json` (`pages_build_output_dir: "dist"`). Build command `npm run build`, output `dist`.

Set `PLACES_API_KEY`, `RESEND_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` as encrypted environment variables in the Cloudflare dashboard.

`public/_redirects` sends all unmatched routes to `index.html` for SPA routing; `public/_routes.json` excludes `/api/*` from that rewrite so Pages Functions are reached.

---

## Known limitations

- **No automated tests, linter, or CI.** `npm run build` (which typechecks) is the only quality gate.
- **Migrations are applied by hand.** Nothing verifies the live database matches the SQL files.
- **`Website Inquiries` runs on mock data.** It queries an `inquiries` table that no migration creates; the error is caught and the section falls back to hardcoded records. Status changes and notes there are local-state only and are lost on refresh.
- **"AI smart reply" is a template, not a model.** The composer interpolates a canned string after a short delay. There is no LLM call in the codebase.
- **The `/demo` page is a scripted mock** with hardcoded sample companies, not a live preview.
- **Email threads load once on mount** and do not poll or subscribe, despite the "auto-synced" label in the UI.
- **Lead score is rule-based**, not learned from outcomes.
- **White-labelling is documented, not implemented.** Currency, target areas, target sectors, sender identity, and branding are all still hardcoded to one deployment. The [White-labelling](#white-labelling) table is the specification for what must move into configuration before a second client can be onboarded.
- **Google Places returns no email addresses.** The `leads.email` column is only ever populated by manual entry, which is why outreach leads with phone and WhatsApp rather than email.
