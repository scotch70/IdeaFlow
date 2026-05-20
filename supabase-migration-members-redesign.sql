-- ============================================================
-- Members redesign — Phase 1: explicit audience model + RBAC scaffolding
-- Run this in Supabase SQL editor AFTER all earlier migrations.
-- Safe to run multiple times (idempotent: IF NOT EXISTS / DO blocks).
-- ============================================================

-- ── 1. idea_rounds.audience_mode ────────────────────────────────────────────
-- Replaces the implicit "empty round_members → open, non-empty → restricted"
-- convention with an explicit, schema-enforced flag.
--
--   workspace  → every workspace member can access the flow.
--                round_members rows, if any, are advisory (e.g. role pins).
--   restricted → only users listed in round_members can access the flow.
--
-- Default 'workspace' is safe because the data backfill below promotes any
-- round that already has round_members rows to 'restricted'.

alter table public.idea_rounds
  add column if not exists audience_mode text not null default 'workspace';

-- Replace any prior check constraint to avoid conflicts on re-run.
alter table public.idea_rounds drop constraint if exists idea_rounds_audience_mode_values;
alter table public.idea_rounds add  constraint idea_rounds_audience_mode_values
  check (audience_mode in ('workspace', 'restricted'));


-- ── 2. idea_rounds.owner_id ─────────────────────────────────────────────────
-- Future-proofing for per-flow ownership.  V1 does not use this beyond
-- recording the creator at insert time.

alter table public.idea_rounds
  add column if not exists owner_id uuid references public.profiles(id) on delete set null;


-- ── 3. round_members.role + last_active_at + invited_by ─────────────────────
-- Per-flow role (admin/member/viewer/owner) for future RBAC.  'member' is
-- the safe default that preserves current behaviour for every existing row.

alter table public.round_members
  add column if not exists role text not null default 'member',
  add column if not exists last_active_at timestamptz,
  add column if not exists invited_by uuid references public.profiles(id) on delete set null;

alter table public.round_members drop constraint if exists round_members_role_values;
alter table public.round_members add  constraint round_members_role_values
  check (role in ('owner', 'admin', 'member', 'viewer'));


-- ── 4. profiles.last_active_at ──────────────────────────────────────────────
-- Workspace-level last-active timestamp for the Members overview.

alter table public.profiles
  add column if not exists last_active_at timestamptz;


-- ── 5. Indexes ──────────────────────────────────────────────────────────────
-- The Members page does a profiles → round_members join keyed by user_id.

create index if not exists idx_round_members_user_id on public.round_members (user_id);


-- ── 6. Data backfill ────────────────────────────────────────────────────────
-- 6a. Translate the legacy "empty/non-empty" convention into audience_mode.
--     Any round that already has ≥1 round_members row is restricted today.
update public.idea_rounds r
   set audience_mode = 'restricted'
 where audience_mode = 'workspace'
   and exists (select 1 from public.round_members rm where rm.round_id = r.id);

-- 6b. Best-effort backfill of profiles.last_active_at from ideas/comments/likes.
--     We do not include views or impressions because we do not track them.
--     Only fills rows where last_active_at is NULL — safe to re-run.
update public.profiles p
   set last_active_at = greatest(
     coalesce((select max(created_at) from public.ideas    where user_id = p.id), 'epoch'::timestamptz),
     coalesce((select max(created_at) from public.comments where user_id = p.id), 'epoch'::timestamptz),
     coalesce((select max(created_at) from public.likes    where user_id = p.id), 'epoch'::timestamptz)
   )
 where last_active_at is null
   and (
        exists (select 1 from public.ideas    where user_id = p.id)
     or exists (select 1 from public.comments where user_id = p.id)
     or exists (select 1 from public.likes    where user_id = p.id)
   );


-- ── 7. Comments ─────────────────────────────────────────────────────────────

comment on column public.idea_rounds.audience_mode is
  'Explicit audience scope. workspace = every workspace member; restricted = only round_members. Replaces the previous "empty means open" convention.';

comment on column public.round_members.role is
  'Per-flow role. Today only ''member'' is used at the call sites; ''admin''/''viewer''/''owner'' are reserved for upcoming RBAC.';

comment on column public.profiles.last_active_at is
  'Last activity timestamp across the workspace (ideas + comments + likes). Updated by app writes; backfilled by the members-redesign migration.';
