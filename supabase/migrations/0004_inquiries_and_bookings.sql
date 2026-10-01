-- ============================================================
-- Langratia Admin OS & Marketing Portal
-- Migration 0004: inquiries & bookings
-- ============================================================

-- ---------- inquiries table ----------
create table if not exists public.inquiries (
  id                  uuid primary key default gen_random_uuid(),
  full_name           text not null,
  email               text not null,
  phone               text,
  company             text,
  category            text,
  project_description text,
  nda_requested       boolean not null default false,
  source              text default '/contact',
  status              text not null default 'NEW_LEAD', -- NEW_LEAD, CONTACTED, QUALIFIED, ARCHIVED
  internal_notes      text,
  avatar_url          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists inquiries_email_idx on public.inquiries (email);
create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

-- ---------- bookings table ----------
create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  client_name         text not null,
  email               text not null,
  requested_date      text not null,
  requested_time      text not null,
  notes               text,
  status              text not null default 'CONFIRMED', -- CONFIRMED, COMPLETED, NO_SHOW, CANCELLED
  outcome             text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists bookings_email_idx on public.bookings (email);
create index if not exists bookings_date_idx on public.bookings (requested_date);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

-- ---------- RLS ----------
alter table public.inquiries enable row level security;
alter table public.bookings enable row level security;

-- Public website visitors can submit inquiries and bookings
create policy "inquiries_public_insert"
  on public.inquiries for insert to anon with check (true);

create policy "bookings_public_insert"
  on public.bookings for insert to anon with check (true);

-- Authenticated staff can view, manage, and update inquiries & bookings
create policy "inquiries_staff_all"
  on public.inquiries for all to authenticated using (true) with check (true);

create policy "bookings_staff_all"
  on public.bookings for all to authenticated using (true) with check (true);

-- Permissions
grant insert on public.inquiries, public.bookings to anon;
grant select, insert, update, delete on public.inquiries, public.bookings to authenticated;
