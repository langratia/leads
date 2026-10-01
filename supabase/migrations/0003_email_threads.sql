-- ============================================================
-- Langratia Admin OS — Email CRM
-- Migration 0003: email_threads, email_messages
-- ============================================================

-- ---------- email_threads ----------
create table if not exists public.email_threads (
  id                uuid primary key default gen_random_uuid(),
  lead_id           uuid references public.leads(id) on delete cascade,
  subject           text not null,
  participant_email text not null,
  status            text not null default 'OPEN', -- OPEN, ARCHIVED
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists email_threads_lead_idx on public.email_threads (lead_id);
create index if not exists email_threads_participant_idx on public.email_threads (participant_email);

-- ---------- email_messages ----------
create table if not exists public.email_messages (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid not null references public.email_threads(id) on delete cascade,
  direction     text not null, -- INBOUND, OUTBOUND
  from_email    text not null,
  to_email      text not null,
  body_text     text,
  body_html     text,
  message_id    text, -- External Resend/SMTP message ID
  created_by    uuid references auth.users(id), -- For outbound emails sent by staff
  created_at    timestamptz not null default now()
);

create index if not exists email_messages_thread_idx on public.email_messages (thread_id);
create index if not exists email_messages_message_id_idx on public.email_messages (message_id);

-- ---------- updated_at trigger ----------
drop trigger if exists email_threads_updated_at on public.email_threads;
create trigger email_threads_updated_at
before update on public.email_threads
for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.email_threads enable row level security;
alter table public.email_messages enable row level security;

create policy "email_threads_authenticated_all"
  on public.email_threads for all to authenticated using (true) with check (true);

create policy "email_messages_authenticated_all"
  on public.email_messages for all to authenticated using (true) with check (true);

-- ---------- expose to Data API (authenticated role only) ----------
grant select, insert, update, delete on public.email_threads, public.email_messages to authenticated;
