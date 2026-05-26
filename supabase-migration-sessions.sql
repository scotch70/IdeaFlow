-- ─────────────────────────────────────────────────────────────────────────────
-- IdeaFlow Sessions — Pro-only guided brainstorming workspaces.
--
-- Tables:
--   sessions             — one row per brainstorming session
--   session_cards        — draggable thought cards on the canvas
--   session_connections  — manual links between cards
--   session_steps        — step completion tracking (Define → Action Plan)
--
-- Auth model (matches the rest of the schema):
--   • A session is owned by a user inside a company (workspace).
--   • The owner can do anything to the session and all its children.
--   • Other members of the same company can READ sessions in their workspace
--     (so admins can audit / handover); only the owner can write.
--   • Cards/connections/steps inherit access from their parent session.
--
-- Plan gate is enforced in the application layer (canUseSessions → Pro) — DB
-- still allows insert so an admin downgrading a workspace doesn't corrupt data.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── sessions ────────────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references public.companies(id) on delete cascade,
  user_id        uuid not null references auth.users(id)       on delete cascade,
  title          text not null default 'Untitled session',
  template_type  text not null default 'freeform',
  status         text not null default 'active'   check (status in ('active','finished','archived')),
  summary        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists sessions_company_id_idx on public.sessions (company_id);
create index if not exists sessions_user_id_idx    on public.sessions (user_id);
create index if not exists sessions_updated_at_idx on public.sessions (updated_at desc);

-- ── session_cards ───────────────────────────────────────────────────────────
create table if not exists public.session_cards (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  type        text not null default 'idea'
              check (type in ('problem','audience','pain','cause','idea','risk','decision','task')),
  title       text not null default '',
  content     text,
  x           numeric not null default 0,
  y           numeric not null default 0,
  priority    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists session_cards_session_id_idx on public.session_cards (session_id);

-- ── session_connections ─────────────────────────────────────────────────────
create table if not exists public.session_connections (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.sessions(id)      on delete cascade,
  source_card_id  uuid not null references public.session_cards(id) on delete cascade,
  target_card_id  uuid not null references public.session_cards(id) on delete cascade,
  label           text,
  created_at      timestamptz not null default now(),
  -- No self-loops, no duplicate edges
  check (source_card_id <> target_card_id)
);

create unique index if not exists session_connections_unique
  on public.session_connections (session_id, source_card_id, target_card_id);

-- ── session_steps ───────────────────────────────────────────────────────────
create table if not exists public.session_steps (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  step_key    text not null   check (step_key in ('define','explore','connect','prioritize','action')),
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);

create unique index if not exists session_steps_session_step_unique
  on public.session_steps (session_id, step_key);

-- ── updated_at triggers ─────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

drop trigger if exists session_cards_set_updated_at on public.session_cards;
create trigger session_cards_set_updated_at
  before update on public.session_cards
  for each row execute function public.set_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.sessions             enable row level security;
alter table public.session_cards        enable row level security;
alter table public.session_connections  enable row level security;
alter table public.session_steps        enable row level security;

-- Helper: current user's company_id (avoids repeating the subquery in every policy)
create or replace function public.current_user_company_id()
returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = auth.uid()
$$;

-- sessions ────────────────────────────────────────────────────────────────────
drop policy if exists sessions_read    on public.sessions;
drop policy if exists sessions_insert  on public.sessions;
drop policy if exists sessions_update  on public.sessions;
drop policy if exists sessions_delete  on public.sessions;

create policy sessions_read on public.sessions for select
  using ( company_id = public.current_user_company_id() );

create policy sessions_insert on public.sessions for insert
  with check ( user_id = auth.uid() and company_id = public.current_user_company_id() );

create policy sessions_update on public.sessions for update
  using      ( user_id = auth.uid() )
  with check ( user_id = auth.uid() );

create policy sessions_delete on public.sessions for delete
  using ( user_id = auth.uid() );

-- session_cards ──────────────────────────────────────────────────────────────
drop policy if exists session_cards_read    on public.session_cards;
drop policy if exists session_cards_insert  on public.session_cards;
drop policy if exists session_cards_update  on public.session_cards;
drop policy if exists session_cards_delete  on public.session_cards;

create policy session_cards_read on public.session_cards for select
  using ( exists (
    select 1 from public.sessions s
    where s.id = session_cards.session_id
      and s.company_id = public.current_user_company_id()
  ) );

create policy session_cards_insert on public.session_cards for insert
  with check ( exists (
    select 1 from public.sessions s
    where s.id = session_cards.session_id
      and s.user_id = auth.uid()
  ) );

create policy session_cards_update on public.session_cards for update
  using ( exists (
    select 1 from public.sessions s
    where s.id = session_cards.session_id
      and s.user_id = auth.uid()
  ) );

create policy session_cards_delete on public.session_cards for delete
  using ( exists (
    select 1 from public.sessions s
    where s.id = session_cards.session_id
      and s.user_id = auth.uid()
  ) );

-- session_connections ────────────────────────────────────────────────────────
drop policy if exists session_connections_read    on public.session_connections;
drop policy if exists session_connections_insert  on public.session_connections;
drop policy if exists session_connections_delete  on public.session_connections;

create policy session_connections_read on public.session_connections for select
  using ( exists (
    select 1 from public.sessions s
    where s.id = session_connections.session_id
      and s.company_id = public.current_user_company_id()
  ) );

create policy session_connections_insert on public.session_connections for insert
  with check ( exists (
    select 1 from public.sessions s
    where s.id = session_connections.session_id
      and s.user_id = auth.uid()
  ) );

create policy session_connections_delete on public.session_connections for delete
  using ( exists (
    select 1 from public.sessions s
    where s.id = session_connections.session_id
      and s.user_id = auth.uid()
  ) );

-- session_steps ──────────────────────────────────────────────────────────────
drop policy if exists session_steps_read    on public.session_steps;
drop policy if exists session_steps_insert  on public.session_steps;
drop policy if exists session_steps_update  on public.session_steps;

create policy session_steps_read on public.session_steps for select
  using ( exists (
    select 1 from public.sessions s
    where s.id = session_steps.session_id
      and s.company_id = public.current_user_company_id()
  ) );

create policy session_steps_insert on public.session_steps for insert
  with check ( exists (
    select 1 from public.sessions s
    where s.id = session_steps.session_id
      and s.user_id = auth.uid()
  ) );

create policy session_steps_update on public.session_steps for update
  using ( exists (
    select 1 from public.sessions s
    where s.id = session_steps.session_id
      and s.user_id = auth.uid()
  ) );

-- ── Grants (Supabase convention) ────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete
  on public.sessions, public.session_cards, public.session_connections, public.session_steps
  to authenticated;
