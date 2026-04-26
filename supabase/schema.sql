-- ================================================================
-- IdeaFlow — complete schema
-- Safe to run on a fresh database, or re-run on an existing one.
-- Uses IF NOT EXISTS / CREATE OR REPLACE / ADD COLUMN IF NOT EXISTS
-- ================================================================


-- ── 0. Helper functions ───────────────────────────────────────

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
  id                     uuid        primary key default gen_random_uuid(),
  name                   text        not null,
  plan                   text        not null default 'free',
  trial_ends_at          timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now()
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
  company_id     uuid        not null references companies(id) on delete cascade,
  created_by     uuid        not null references profiles(id)  on delete cascade,
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
  created_at     timestamptz not null default now()
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
  impact_summary    text,
  impact_type       text,
  impact_link       text,
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
--    (no-ops when the column already exists)

alter table profiles
  add column if not exists last_name    text,
  add column if not exists job_function text,
  add column if not exists avatar_url   text;

alter table ideas
  add column if not exists status            text        not null default 'open',
  add column if not exists status_note       text,
  add column if not exists status_changed_at timestamptz,
  add column if not exists status_changed_by uuid        references auth.users(id),
  add column if not exists impact_summary    text,
  add column if not exists impact_type       text,
  add column if not exists impact_link       text;

alter table invites
  add column if not exists name           text,
  add column if not exists email          text,
  add column if not exists expires_at     timestamptz,
  add column if not exists joined_user_id uuid references profiles(id) on delete set null;

alter table companies
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text,
  add column if not exists custom_idea_prompt      text,
  add column if not exists idea_round_name         text,
  add column if not exists idea_round_status       text,
  add column if not exists idea_round_starts_at    timestamptz,
  add column if not exists idea_round_ends_at      timestamptz;

-- Safely rename comments.body → content if the old column still exists
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'comments'
      and column_name  = 'body'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'comments'
      and column_name  = 'content'
  ) then
    alter table public.comments rename column body to content;
  end if;
end $$;


-- ── 3. Constraints ────────────────────────────────────────────
--    All ADD CONSTRAINT ... IF NOT EXISTS is not supported in
--    older Postgres. Drop-then-recreate is safe and idempotent.

-- join_requests.created_at: must never be null
alter table join_requests
  alter column created_at set not null,
  alter column created_at set default now();

-- profiles.role: only known values allowed
alter table profiles
  drop constraint if exists profiles_role_values;
alter table profiles
  add constraint profiles_role_values
  check (role in ('admin', 'member'));

-- invites.role: same; prevents poisoned invites from escalating privilege
alter table invites
  drop constraint if exists invites_role_values;
alter table invites
  add constraint invites_role_values
  check (role in ('admin', 'member'));

-- ideas.status: known values only
alter table ideas
  drop constraint if exists ideas_status_values;
alter table ideas
  add constraint ideas_status_values
  check (status in ('open', 'under_review', 'planned', 'in_progress', 'implemented', 'declined'));

-- ideas: impact_summary required when implemented
alter table ideas
  drop constraint if exists ideas_impact_required_when_implemented;
alter table ideas
  add constraint ideas_impact_required_when_implemented
  check (
    status != 'implemented'
    or (impact_summary is not null and char_length(impact_summary) >= 10)
  );

-- ideas: impact_type known values only
alter table ideas
  drop constraint if exists ideas_impact_type_values;
alter table ideas
  add constraint ideas_impact_type_values
  check (impact_type is null or impact_type in ('revenue', 'cost_saving', 'productivity', 'culture', 'other'));

-- ideas: title and description length caps
alter table ideas
  drop constraint if exists ideas_title_length;
alter table ideas
  add constraint ideas_title_length
  check (char_length(title) between 1 and 200);

alter table ideas
  drop constraint if exists ideas_desc_length;
alter table ideas
  add constraint ideas_desc_length
  check (char_length(description) <= 2000);

-- companies.plan: known values only
alter table companies
  drop constraint if exists companies_plan_values;
alter table companies
  add constraint companies_plan_values
  check (plan in ('free', 'pro'));

-- companies: idea_round_status known values
alter table companies
  drop constraint if exists idea_round_status_values;
alter table companies
  add constraint idea_round_status_values
  check (idea_round_status in ('draft', 'active', 'closed'));

-- companies: custom_idea_prompt length cap
alter table companies
  drop constraint if exists companies_prompt_length;
alter table companies
  add constraint companies_prompt_length
  check (custom_idea_prompt is null or char_length(custom_idea_prompt) <= 120);

-- companies: stripe_customer_id must be unique
alter table companies
  drop constraint if exists companies_stripe_customer_id_unique;
alter table companies
  add constraint companies_stripe_customer_id_unique
  unique (stripe_customer_id);

-- comments: content length (drop/recreate in case column was renamed)
alter table comments drop constraint if exists comments_body_check;
alter table comments drop constraint if exists comments_content_check;
alter table comments
  add constraint comments_content_check
  check (char_length(content) between 1 and 200);

-- invites: prevent multiple active invites to the same email per company
drop index if exists invites_company_email_active_unique;
create unique index invites_company_email_active_unique
  on invites (company_id, lower(email))
  where used_at is null and email is not null;


-- ── 4. Indexes ────────────────────────────────────────────────

create index if not exists idx_profiles_company_id on profiles (company_id);
create index if not exists idx_ideas_company_id    on ideas    (company_id);
create index if not exists idx_ideas_user_id       on ideas    (user_id);
create index if not exists idx_comments_idea_id    on comments (idea_id);
create index if not exists idx_invites_company_id  on invites  (company_id);


-- ── 5. Enable RLS ─────────────────────────────────────────────

alter table companies     enable row level security;
alter table profiles      enable row level security;
alter table invites       enable row level security;
alter table join_requests enable row level security;
alter table ideas         enable row level security;
alter table likes         enable row level security;
alter table comments      enable row level security;


-- ── 6. Drop old / conflicting policies ───────────────────────

drop policy if exists "companies_select_same_company"            on companies;
drop policy if exists "companies_update_admin_same_company"      on companies;

drop policy if exists "profiles_select_own"                      on profiles;
drop policy if exists "profiles_select_same_company"             on profiles;
drop policy if exists "profiles_insert_own"                      on profiles;
drop policy if exists "profiles_update_own"                      on profiles;

drop policy if exists "invites_insert_admin_only"                on invites;
drop policy if exists "invites_select_admin_only"                on invites;
drop policy if exists "invites_select_for_join"                  on invites;
drop policy if exists "invites_delete_admin_only"                on invites;

drop policy if exists "join_requests_insert_public"              on join_requests;
drop policy if exists "join_requests_select_admin_same_company"  on join_requests;
drop policy if exists "join_requests_update_admin_same_company"  on join_requests;

drop policy if exists "ideas_select"                             on ideas;
drop policy if exists "ideas_insert"                             on ideas;
drop policy if exists "update own ideas"                         on ideas;
drop policy if exists "delete own ideas"                         on ideas;
drop policy if exists "ideas_select_same_company"                on ideas;
drop policy if exists "ideas_insert_same_company"                on ideas;
drop policy if exists "ideas_update_own_same_company"            on ideas;
drop policy if exists "ideas_delete_own_same_company"            on ideas;

drop policy if exists "likes_select"                             on likes;
drop policy if exists "likes_insert"                             on likes;
drop policy if exists "likes_delete_own"                         on likes;
drop policy if exists "likes_select_same_company"                on likes;
drop policy if exists "likes_insert_same_company"                on likes;
drop policy if exists "likes_delete_own_same_company"            on likes;

drop policy if exists "company members can read comments"        on comments;
drop policy if exists "company members can insert comments"      on comments;


-- ── 7. Policies ───────────────────────────────────────────────

-- companies ------------------------------------------------------
create policy "companies_select_same_company"
  on companies for select to authenticated
  using (id = public.get_my_company_id());

create policy "companies_update_admin_same_company"
  on companies for update to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
        and profiles.company_id = companies.id
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
        and profiles.company_id = companies.id
    )
  );

-- profiles -------------------------------------------------------
create policy "profiles_select_own"
  on profiles for select to authenticated
  using (auth.uid() = id);

create policy "profiles_select_same_company"
  on profiles for select to authenticated
  using (company_id = public.get_my_company_id());

create policy "profiles_insert_own"
  on profiles for insert to authenticated
  with check (auth.uid() = id);

-- Restricted update: users may only change safe profile columns.
-- role and company_id are read from the existing row and must be
-- unchanged — prevents self-promotion and workspace-hopping via
-- a direct Supabase client call.
create policy "profiles_update_own"
  on profiles for update to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role       = (select role       from profiles where id = auth.uid())
    and company_id is not distinct from (select company_id from profiles where id = auth.uid())
  );

-- invites --------------------------------------------------------
create policy "invites_insert_admin_only"
  on invites for insert to authenticated
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role = 'admin'
        and company_id = invites.company_id
    )
  );

create policy "invites_select_admin_only"
  on invites for select to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role = 'admin'
        and company_id = invites.company_id
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
      where id = auth.uid()
        and role = 'admin'
        and company_id = invites.company_id
    )
  );

-- join_requests --------------------------------------------------
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

-- ideas ----------------------------------------------------------
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

-- likes ----------------------------------------------------------
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

-- comments -------------------------------------------------------
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


-- ── 8. Auth trigger: create bare profile only ─────────────────
-- Does NOT create a company or assign admin.
-- Workspace creation is handled by /api/onboard (idempotent fallback).
-- Invite joining is handled by /api/join.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'member'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 9. likes_count trigger ────────────────────────────────────
-- Keeps ideas.likes_count in sync with the likes table.
-- Uses a full recount (not +1/-1) to stay correct under concurrent ops.

create or replace function public.sync_likes_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    update ideas
    set likes_count = (select count(*) from likes where idea_id = new.idea_id)
    where id = new.idea_id;
  elsif tg_op = 'DELETE' then
    update ideas
    set likes_count = greatest(0, (select count(*) from likes where idea_id = old.idea_id))
    where id = old.idea_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_like_change on likes;

create trigger on_like_change
  after insert or delete on likes
  for each row execute procedure public.sync_likes_count();

-- Backfill any existing likes_count values that may have drifted
update ideas
set likes_count = (select count(*) from likes where idea_id = ideas.id);


-- ── 10. Storage: avatars bucket ───────────────────────────────

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Anyone can view avatars"           on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can delete their own avatar" on storage.objects;

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
