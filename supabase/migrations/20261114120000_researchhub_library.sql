-- CivilEng ResearchHub: personal research library
--
-- Creates a dedicated "researchhub" schema so this app's tables stay separate
-- from the future Digital CV Portfolio (which can use its own schema).
-- Both apps share Supabase Auth (auth.users), so one account works on both.
--
-- Security model:
--   * Only signed-in users ("authenticated") can use these tables. Anonymous
--     visitors have no access at all.
--   * Row Level Security on every table: a user can only see and change rows
--     they own. user_id is filled in automatically from the login session.
--   * Publications themselves are not stored, only a small snapshot of what a
--     user saved, so the library loads without calling OpenAlex.
--
-- Safe to run once on an empty project. Creates objects only; drops nothing.

create schema if not exists researchhub;
comment on schema researchhub is 'CivilEng ResearchHub: saved publications and collections';

revoke all on schema researchhub from public, anon;
grant usage on schema researchhub to authenticated;

-- Keeps updated_at current on every update.
create or replace function researchhub.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Saved publications
-- ---------------------------------------------------------------------------
create table researchhub.saved_works (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  work_id     text not null check (work_id ~ '^W[0-9]+$'),           -- OpenAlex id, e.g. W2741809807
  title       text not null check (char_length(title) between 1 and 1000),
  authors     text check (char_length(authors) <= 1000),             -- display line, e.g. "A. Author, B. Author, et al."
  venue       text check (char_length(venue) <= 500),
  year        smallint check (year between 1500 and 2200),
  doi         text check (char_length(doi) <= 300),
  note        text check (char_length(note) <= 5000),                -- private note by the user
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, work_id)
);
comment on table researchhub.saved_works is 'Publications a user has saved to their library (snapshot of OpenAlex metadata)';

create index saved_works_user_created_idx on researchhub.saved_works (user_id, created_at desc);

create trigger saved_works_updated_at
  before update on researchhub.saved_works
  for each row execute function researchhub.set_updated_at();

-- ---------------------------------------------------------------------------
-- Collections (named folders of saved publications)
-- ---------------------------------------------------------------------------
create table researchhub.collections (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name         text not null check (char_length(btrim(name)) between 1 and 120),
  description  text check (char_length(description) <= 1000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, name)
);
comment on table researchhub.collections is 'User-defined collections of saved publications';

create index collections_user_idx on researchhub.collections (user_id);

create trigger collections_updated_at
  before update on researchhub.collections
  for each row execute function researchhub.set_updated_at();

-- ---------------------------------------------------------------------------
-- Collection membership
-- ---------------------------------------------------------------------------
create table researchhub.collection_items (
  collection_id  uuid not null references researchhub.collections (id) on delete cascade,
  saved_work_id  uuid not null references researchhub.saved_works (id) on delete cascade,
  added_at       timestamptz not null default now(),
  primary key (collection_id, saved_work_id)
);
comment on table researchhub.collection_items is 'Which saved publications belong to which collection';

create index collection_items_saved_work_idx on researchhub.collection_items (saved_work_id);

-- ---------------------------------------------------------------------------
-- Privileges: signed-in users only, and only the operations the app needs
-- ---------------------------------------------------------------------------
revoke all on all tables in schema researchhub from public, anon;
grant select, insert, update, delete on researchhub.saved_works to authenticated;
grant select, insert, update, delete on researchhub.collections to authenticated;
grant select, insert, delete on researchhub.collection_items to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- (select auth.uid()) is evaluated once per query, which keeps policies fast.
-- ---------------------------------------------------------------------------
alter table researchhub.saved_works enable row level security;
alter table researchhub.collections enable row level security;
alter table researchhub.collection_items enable row level security;

create policy "Users read their own saved works"
  on researchhub.saved_works for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users save works to their own library"
  on researchhub.saved_works for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users update their own saved works"
  on researchhub.saved_works for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users delete their own saved works"
  on researchhub.saved_works for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users read their own collections"
  on researchhub.collections for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users create their own collections"
  on researchhub.collections for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users update their own collections"
  on researchhub.collections for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users delete their own collections"
  on researchhub.collections for delete to authenticated
  using ((select auth.uid()) = user_id);

-- A user may only link their own saved work into their own collection.
create policy "Users read items in their own collections"
  on researchhub.collection_items for select to authenticated
  using (exists (
    select 1 from researchhub.collections c
    where c.id = collection_id and c.user_id = (select auth.uid())
  ));
create policy "Users add their own works to their own collections"
  on researchhub.collection_items for insert to authenticated
  with check (
    exists (select 1 from researchhub.collections c
            where c.id = collection_id and c.user_id = (select auth.uid()))
    and exists (select 1 from researchhub.saved_works w
                where w.id = saved_work_id and w.user_id = (select auth.uid()))
  );
create policy "Users remove items from their own collections"
  on researchhub.collection_items for delete to authenticated
  using (exists (
    select 1 from researchhub.collections c
    where c.id = collection_id and c.user_id = (select auth.uid())
  ));
