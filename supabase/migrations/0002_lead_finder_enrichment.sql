-- ============================================================
-- Langratia Admin OS — Lead Finder enrichment + search analytics
-- Migration 0002:
--   * lead enrichment columns from Google Places (place_id, rating, review_count)
--   * search_logs table for Lead Finder usage analytics
-- ============================================================

-- ---------- lead enrichment ----------
alter table public.leads
  add column if not exists place_id      text,
  add column if not exists rating        numeric,
  add column if not exists review_count  integer;

create index if not exists leads_place_id_idx on public.leads (place_id);

-- ---------- search analytics ----------
create table if not exists public.search_logs (
  id            uuid primary key default gen_random_uuid(),
  query         text not null,
  category      text,
  results_count integer not null default 0,
  source        text not null default 'Lead Finder',
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

create index if not exists search_logs_created_at_idx on public.search_logs (created_at desc);

-- ---------- RLS ----------
alter table public.search_logs enable row level security;

create policy "search_logs_authenticated_all"
  on public.search_logs for all to authenticated using (true) with check (true);

grant select, insert, update, delete on public.search_logs to authenticated;