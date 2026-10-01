-- 0005_finder_dedup.sql
--
-- Enforces at the database what the Lead Finder has only ever enforced in the
-- browser.
--
-- Migration 0002 added place_id and a plain index:
--     create index leads_place_id_idx on public.leads (place_id);
-- That index is not unique, so nothing stops the same Google Places business
-- being inserted twice. Finder deduped client-side from an in-memory Set of
-- lead.place_id, which cannot see a second browser tab, a stale dataset, or two
-- staff running the same search. Duplicates were therefore possible.
--
-- READ THIS BEFORE RUNNING — the deduplication step deletes rows.
-- Check what it will remove first:
--
--     select place_id, count(*) as copies,
--            array_agg(business_name order by created_at) as names
--     from public.leads
--     where place_id is not null
--     group by place_id
--     having count(*) > 1
--     order by copies desc;
--
-- The survivor of each group is the most recently created row, on the
-- assumption that later means a more deliberate save. If a duplicate has
-- follow-ups, notes, or a converted customer on it and an older sibling does
-- not, promote that one instead by editing the keeper expression before
-- running.

begin;

-- Customers point at a lead with no cascade (0001: lead_id uuid references
-- public.leads(id)). Without this the delete below fails on the FK.
update public.customers
   set lead_id = null
 where lead_id in (
   select id from public.leads
    where place_id is not null
      and id not in (
        select distinct on (place_id) id
          from public.leads
         where place_id is not null
         order by place_id, created_at desc, id desc
      )
 );

-- lead_activities and lead_followups are `on delete cascade`, so their rows go
-- with the lead and need no explicit handling.
delete from public.leads
 where place_id is not null
   and id not in (
     select distinct on (place_id) id
       from public.leads
      where place_id is not null
      order by place_id, created_at desc, id desc
   );

-- Partial, because place_id is nullable: a lead typed in by hand has no Google
-- ID, and several of those must be allowed to share the null value.
create unique index if not exists leads_place_id_unique
  on public.leads (place_id)
  where place_id is not null;

commit;