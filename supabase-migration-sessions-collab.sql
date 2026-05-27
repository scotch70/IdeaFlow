-- ─────────────────────────────────────────────────────────────────────────────
-- Sessions collaboration patch
--
-- 1) Adds session_cards.created_by so we can attribute each card to a user
--    (avatar initials + admin/member metadata on the card body).
-- 2) Broadens RLS so any same-company user can insert/update/delete cards,
--    connections, and steps. Sessions themselves can still only be deleted
--    by the owner OR a company admin; metadata edits on the session row
--    (title, status, summary) likewise.
--
-- Safe to re-run. Apply after supabase-migration-sessions.sql (or after the
-- consolidated schema.sql section 10).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. created_by on cards ──────────────────────────────────────────────────
alter table public.session_cards
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists session_cards_created_by_idx on public.session_cards (created_by);

-- ── 2. Helper: am I an admin in the same company as the session? ────────────
-- Wrapped in a function so each policy stays readable.
create or replace function public.is_admin_of_session_company(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sessions s
    join public.profiles p
      on p.company_id = s.company_id
    where s.id = p_session_id
      and p.id = auth.uid()
      and p.role = 'admin'
  )
$$;

-- ── 3. Sessions — owner OR admin can update / delete ────────────────────────
drop policy if exists sessions_update on public.sessions;
drop policy if exists sessions_delete on public.sessions;

create policy sessions_update on public.sessions for update to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin_of_session_company(id)
  )
  with check (
    user_id = auth.uid()
    or public.is_admin_of_session_company(id)
  );

create policy sessions_delete on public.sessions for delete to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin_of_session_company(id)
  );

-- ── 4. session_cards — any same-company user can write ──────────────────────
drop policy if exists session_cards_insert on public.session_cards;
drop policy if exists session_cards_update on public.session_cards;
drop policy if exists session_cards_delete on public.session_cards;

create policy session_cards_insert on public.session_cards for insert to authenticated
  with check ( exists (
    select 1 from public.sessions s
    where s.id = session_cards.session_id
      and s.company_id = public.get_my_company_id()
  ) );

create policy session_cards_update on public.session_cards for update to authenticated
  using ( exists (
    select 1 from public.sessions s
    where s.id = session_cards.session_id
      and s.company_id = public.get_my_company_id()
  ) )
  with check ( exists (
    select 1 from public.sessions s
    where s.id = session_cards.session_id
      and s.company_id = public.get_my_company_id()
  ) );

create policy session_cards_delete on public.session_cards for delete to authenticated
  using ( exists (
    select 1 from public.sessions s
    where s.id = session_cards.session_id
      and s.company_id = public.get_my_company_id()
  ) );

-- ── 5. session_connections — any same-company user can write ────────────────
drop policy if exists session_connections_insert on public.session_connections;
drop policy if exists session_connections_delete on public.session_connections;

create policy session_connections_insert on public.session_connections for insert to authenticated
  with check ( exists (
    select 1 from public.sessions s
    where s.id = session_connections.session_id
      and s.company_id = public.get_my_company_id()
  ) );

create policy session_connections_delete on public.session_connections for delete to authenticated
  using ( exists (
    select 1 from public.sessions s
    where s.id = session_connections.session_id
      and s.company_id = public.get_my_company_id()
  ) );

-- ── 6. session_steps — any same-company user can toggle ────────────────────
drop policy if exists session_steps_insert on public.session_steps;
drop policy if exists session_steps_update on public.session_steps;

create policy session_steps_insert on public.session_steps for insert to authenticated
  with check ( exists (
    select 1 from public.sessions s
    where s.id = session_steps.session_id
      and s.company_id = public.get_my_company_id()
  ) );

create policy session_steps_update on public.session_steps for update to authenticated
  using ( exists (
    select 1 from public.sessions s
    where s.id = session_steps.session_id
      and s.company_id = public.get_my_company_id()
  ) );

-- Reads continue to be scoped to the same company via the original sessions_read
-- / session_cards_read / session_connections_read / session_steps_read policies,
-- which still use public.get_my_company_id() (or current_user_company_id in the
-- original migration — both query the same row). No change needed there.
