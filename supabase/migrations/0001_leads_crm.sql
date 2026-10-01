-- ============================================================
-- Langratia Admin OS — Leads CRM
-- Migration 0001: leads, lead_activities, lead_followups, customers
--
-- Access model: this is an internal staff tool. Entry is gated by
-- Supabase Auth (the /admin login). All authenticated staff can read
-- and manage leads (shared team CRM). Tables are exposed via the Data
-- API and RLS is enabled; update this if you later need per-staff
-- ownership (e.g. `created_by = auth.uid()` predicates).
-- ============================================================

-- ---------- leads ----------
create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  business_name     text not null,
  category          text,
  contact_person    text,
  phone             text,
  whatsapp          text,
  email             text,
  website           text,
  address           text,
  latitude          double precision,
  longitude         double precision,
  interested_product text,
  lead_source       text not null default 'Lead Finder',
  status            text not null default 'New',
  priority          text not null default 'Medium',
  lead_score        integer not null default 0,
  estimated_value   numeric,
  assigned_to       text,
  tags              text[] not null default '{}',
  notes             text,
  next_followup_date date,
  next_followup_time time,
  followup_method   text,
  created_by        uuid references auth.users(id),
  converted_at      timestamptz,
  customer_id       uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists leads_status_idx      on public.leads (status);
create index if not exists leads_created_at_idx  on public.leads (created_at desc);
create index if not exists leads_source_idx      on public.leads (lead_source);

-- ---------- lead_activities (activity timeline) ----------
create table if not exists public.lead_activities (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references public.leads(id) on delete cascade,
  activity_type text not null,
  description   text,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

create index if not exists lead_activities_lead_idx on public.lead_activities (lead_id, created_at desc);

-- ---------- lead_followups ----------
create table if not exists public.lead_followups (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references public.leads(id) on delete cascade,
  followup_date date not null,
  followup_time time,
  method        text,
  notes         text,
  assigned_to   text,
  completed     boolean not null default false,
  completed_at  timestamptz,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

create index if not exists lead_followups_lead_idx    on public.lead_followups (lead_id);
create index if not exists lead_followups_date_idx    on public.lead_followups (followup_date);

-- ---------- customers (created on conversion) ----------
create table if not exists public.customers (
  id                uuid primary key default gen_random_uuid(),
  lead_id           uuid references public.leads(id),
  business_name     text not null,
  category          text,
  contact_person    text,
  phone             text,
  email             text,
  website           text,
  address           text,
  latitude          double precision,
  longitude         double precision,
  interested_product text,
  estimated_value   numeric,
  converted_by      uuid references auth.users(id),
  converted_at      timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.leads           enable row level security;
alter table public.lead_activities enable row level security;
alter table public.lead_followups  enable row level security;
alter table public.customers       enable row level security;

create policy "leads_authenticated_all"
  on public.leads for all to authenticated using (true) with check (true);

create policy "lead_activities_authenticated_all"
  on public.lead_activities for all to authenticated using (true) with check (true);

create policy "lead_followups_authenticated_all"
  on public.lead_followups for all to authenticated using (true) with check (true);

create policy "customers_authenticated_all"
  on public.customers for all to authenticated using (true) with check (true);

-- ---------- expose to Data API (authenticated role only) ----------
grant select, insert, update, delete on public.leads, public.lead_activities, public.lead_followups, public.customers to authenticated;