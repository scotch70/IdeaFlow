-- ================================================================
-- IdeaFlow — complete schema
-- Safe to run on a fresh database, or re-run on an existing one.
-- Uses IF NOT EXISTS / CREATE OR REPLACE / ADD COLUMN IF NOT EXISTS
-- ================================================================


-- ── 0. Helper functions (needed by policies below) ────────────

create or replace function public.get_my_company_id()
returns uuid
language sql
security definer
stable
as $$
  select company_id from public.profiles where id = auth.uid()
$$;


-- ── 1. Tables (in dependency order) ──────────────────────────

create table if not exists companies (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  plan          text        not null default 'free',
  trial_ends_at timestamptz,
  created_at    timestamptz not null default now()
);

create table if not exists profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  company_id   uuid        references companies(id) on delete set null,
  full_name    text,
  last_name    text,
  job_function text,
  avatar_url   text,
  role         text        not null default 'member',
  created_at   timestamptz not null default now()
);

create table if not exists invites (
  id             uuid        primary key default gen_random_uuid(),
  company_id     uuid        not null references companies(id)  on delete cascade,
  created_by     uuid        not null references profiles(id)   on delete cascade,
  invite_code    text        unique not null,
  role           text        not null default 'member',
  name           text,
  email          text,
  used_at        timestamptz,
  expires_at     timestamptz,
  joined_user_id uuid        references profiles(id) on delete set null,
  created_at     timestamptz not null default now()
);

create table if not exists join_requests (
  id             uuid        primary key default gen_random_uuid(),
  company_id     uuid        not null references companies(id) on delete cascade,
  invite_code    text        not null,
  first_name     text        not null,
  last_name      text        not null,
  email          text        not null,
  status         text        not null default 'pending',
  requested_role text        not null default 'member',
  reviewed_at    timestamptz,
  reviewed_by    uuid        references profiles(id) on delete set null,
  created_at     timestamptz          default now()
);

create table if not exists ideas (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  company_id        uuid        not null references companies(id)  on delete cascade,
  title             text        not null,
  description       text,
  likes_count       integer     not null default 0,
  status            text        not null default 'open',
  status_note       text,
  status_changed_at timestamptz,
  status_changed_by uuid        references auth.users(id),
  created_at        timestamptz not null default now()
);

create table if not exists likes (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  idea_id    uuid        not null references ideas(id)      on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, idea_id)
);

create table if not exists comments (
  id         uuid        primary key default gen_random_uuid(),
  idea_id    uuid        not null references ideas(id)      on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  company_id uuid        not null references companies(id)  on delete cascade,
  content    text        not null check (char_length(content) between 1 and 200),
  created_at timestamptz not null default now()
);


-- ── 2. Backfill columns on existing tables ────────────────────
--    (no-ops if the columns already exist)

alter table ideas
  add column if not exists status            text        not null default 'open',
  add column if not exists status_note       text,
  add column if not exists status_changed_at timestamptz,
  add column if not exists status_changed_by uuid        references auth.users(id);

alter table invites
  add column if not exists name           text,
  add column if not exists email          text,
  add column if not exists expires_at     timestamptz,
  add column if not exists joined_user_id uuid references profiles(id) on delete set null;

-- Rename comments.body → content if the old column still exists
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'comments' and column_name = 'body'
  ) then
    alter table comments rename column body to content;
    alter table comments drop constraint if exists comments_body_check;
    alter table comments add constraint comments_content_check
      check (char_length(content) between 1 and 200);
  end if;
end $$;


-- ── 3. Enable RLS on all tables ───────────────────────────────

alter table companies     enable row level security;
alter table profiles      enable row level security;
alter table invites       enable row level security;
alter table join_requests enable row level security;
alter table ideas         enable row level security;
alter table likes         enable row level security;
alter table comments      enable row level security;


-- ── 4. Drop old / conflicting policies ───────────────────────

drop policy if exists "profiles_select_own"                     on profiles;
drop policy if exists "profiles_select_same_company"            on profiles;

drop policy if exists "invites_insert_admin_only"               on invites;
drop policy if exists "invites_select_admin_only"               on invites;
drop policy if exists "invites_select_for_join"                 on invites;
drop policy if exists "invites_delete_admin_only"               on invites;

drop policy if exists "join_requests_insert_public"             on join_requests;
drop policy if exists "join_requests_select_admin_same_company" on join_requests;
drop policy if exists "join_requests_update_admin_same_company" on join_requests;

drop policy if exists "ideas_select"                            on ideas;
drop policy if exists "ideas_insert"                            on ideas;
drop policy if exists "update own ideas"                        on ideas;
drop policy if exists "delete own ideas"                        on ideas;
drop policy if exists "ideas_select_same_company"               on ideas;
drop policy if exists "ideas_insert_same_company"               on ideas;
drop policy if exists "ideas_update_own_same_company"           on ideas;
drop policy if exists "ideas_delete_own_same_company"           on ideas;

drop policy if exists "likes_select"                            on likes;
drop policy if exists "likes_insert"                            on likes;
drop policy if exists "likes_delete_own"                        on likes;
drop policy if exists "likes_select_same_company"               on likes;
drop policy if exists "likes_insert_same_company"               on likes;
drop policy if exists "likes_delete_own_same_company"           on likes;

drop policy if exists "company members can read comments"       on comments;
drop policy if exists "company members can insert comments"     on comments;


-- ── 5. Policies ───────────────────────────────────────────────

-- profiles --------------------------------------------------------
create policy "profiles_select_own"
  on profiles for select to authenticated
  using (auth.uid() = id);

create policy "profiles_select_same_company"
  on profiles for select to authenticated
  using (company_id = public.get_my_company_id());

-- invites ---------------------------------------------------------
create policy "invites_insert_admin_only"
  on invites for insert to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin' and company_id = invites.company_id
    )
  );

create policy "invites_select_admin_only"
  on invites for select to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin' and company_id = invites.company_id
    )
  );

create policy "invites_select_for_join"
  on invites for select to authenticated
  using (true);

create policy "invites_delete_admin_only"
  on invites for delete to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin' and company_id = invites.company_id
    )
  );

-- join_requests ---------------------------------------------------
create policy "join_requests_insert_public"
  on join_requests for insert to anon, authenticated
  with check (true);

create policy "join_requests_select_admin_same_company"
  on join_requests for select to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
        and profiles.company_id = join_requests.company_id
    )
  );

create policy "join_requests_update_admin_same_company"
  on join_requests for update to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
        and profiles.company_id = join_requests.company_id
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
        and profiles.company_id = join_requests.company_id
    )
  );

-- ideas -----------------------------------------------------------
create policy "ideas_select_same_company"
  on ideas for select to authenticated
  using (
    company_id = (select company_id from profiles where id = auth.uid())
  );

create policy "ideas_insert_same_company"
  on ideas for insert to authenticated
  with check (
    user_id = auth.uid()
    and company_id = (select company_id from profiles where id = auth.uid())
  );

create policy "ideas_update_own_same_company"
  on ideas for update to authenticated
  using (
    user_id = auth.uid()
    and company_id = (select company_id from profiles where id = auth.uid())
  )
  with check (
    user_id = auth.uid()
    and company_id = (select company_id from profiles where id = auth.uid())
  );

create policy "ideas_delete_own_same_company"
  on ideas for delete to authenticated
  using (
    user_id = auth.uid()
    and company_id = (select company_id from profiles where id = auth.uid())
  );

-- likes -----------------------------------------------------------
create policy "likes_select_same_company"
  on likes for select to authenticated
  using (
    exists (
      select 1 from ideas
      where ideas.id = likes.idea_id
        and ideas.company_id = (select company_id from profiles where id = auth.uid())
    )
  );

create policy "likes_insert_same_company"
  on likes for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from ideas
      where ideas.id = likes.idea_id
        and ideas.company_id = (select company_id from profiles where id = auth.uid())
    )
  );

create policy "likes_delete_own_same_company"
  on likes for delete to authenticated
  using (
    user_id = auth.uid()
    and exists (
      select 1 from ideas
      where ideas.id = likes.idea_id
        and ideas.company_id = (select company_id from profiles where id = auth.uid())
    )
  );

-- comments --------------------------------------------------------
create policy "company members can read comments"
  on comments for select to authenticated
  using (
    company_id = (select company_id from profiles where id = auth.uid())
  );

create policy "company members can insert comments"
  on comments for insert to authenticated
  with check (
    user_id = auth.uid()
    and company_id = (select company_id from profiles where id = auth.uid())
  );


-- ── 6. Auth trigger: create profile + company on signup ──────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  new_company_id   uuid;
  new_company_name text;
begin
  new_company_name := nullif(trim(new.raw_user_meta_data->>'company_name'), '');

  if new_company_name is not null then
    insert into public.companies (name, plan, trial_ends_at)
    values (new_company_name, 'free', now() + interval '30 days')
    returning id into new_company_id;
  end if;

  insert into public.profiles (id, full_name, company_id, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new_company_id,
    case when new_company_id is not null then 'admin' else 'member' end
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
