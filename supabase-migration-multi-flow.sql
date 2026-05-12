-- ============================================================
-- Multi-IdeaFlow migration
-- Run this in Supabase SQL editor AFTER the main schema.
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS).
-- ============================================================

-- 1. Extend idea_rounds with per-round scheduling + metadata
--    These columns let each flow own its own schedule and override,
--    independent of the companies-level denormalized fields.
alter table public.idea_rounds
  add column if not exists created_by      uuid       references public.profiles(id) on delete set null,
  add column if not exists starts_at       timestamptz,
  add column if not exists ends_at         timestamptz,
  add column if not exists manual_override text       check (manual_override in ('open', 'closed'));

-- 2. round_members — optional per-flow audience assignment.
--    When a round has zero rows here, every company member can access it.
--    When at least one row exists, only listed members can see/submit.
create table if not exists public.round_members (
  id         uuid        primary key default gen_random_uuid(),
  round_id   uuid        not null references public.idea_rounds(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  company_id uuid        not null references public.companies(id) on delete cascade,
  added_by   uuid        references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(round_id, user_id)
);

alter table public.round_members enable row level security;

-- Company members can read all assignments for their workspace
-- (needed to show member picker & access-check logic).
create policy "Company members can view round_members"
  on public.round_members for select
  to authenticated
  using (
    company_id = (
      select company_id from public.profiles where id = auth.uid()
    )
  );

-- Admins can insert/update/delete assignments in their company.
create policy "Admins can manage round_members"
  on public.round_members for all
  to authenticated
  using (
    company_id = (
      select company_id from public.profiles where id = auth.uid()
    )
  )
  with check (
    company_id = (
      select company_id from public.profiles where id = auth.uid()
    )
  );
