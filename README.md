# LANGRATIA Leads CRM & Prospecting Engine

Dedicated sales operations system, prospective client discovery platform, and email deal communications hub for LANGRATIA.

## Features

- **Google Places Lead Finder**: Geo-targeted business discovery engine with coordinate biasing, category filters, and 1-click lead saving.
- **Horizontal Kanban Pipeline**: Drag-and-drop lead stages (`New`, `Contacted`, `Qualified`, `Proposal Sent`, `Negotiating`, `Won`, `Lost`).
- **All Leads Table**: Full searchable, filterable table with tag management, bulk actions, and CSV export.
- **Persistent Email Chat**: Conversation-style email threads powered by Resend and Supabase Edge Functions with AI smart reply generation.
- **Scheduled Follow-ups**: Follow-up agenda with overdue alerts and direct WhatsApp/call actions.
- **Automated Lead Scoring**: Algorithmic scoring evaluating deal values, contact completeness, ratings, and velocity.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Database & Auth**: Supabase (PostgreSQL + RLS + Auth + Edge Functions)
- **Deployment**: Cloudflare Pages / Workers

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Add your PLACES_API_KEY
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Server will run at `http://localhost:5174`.

4. Typecheck and build:
   ```bash
   npm run typecheck
   npm run build
   ```
