-- Migration: flow-scoped invite links
-- Run in Supabase SQL Editor. Safe to re-run.

alter table public.invites
  add column if not exists idea_round_id uuid
    references public.idea_rounds(id) on delete cascade;

comment on column public.invites.idea_round_id is
  'When set, this is a flow-scoped invite. Redeeming it adds the user to round_members for this flow rather than (or in addition to) the workspace.';

-- Index for looking up all flow invites for a given round (e.g. to display in admin panel)
create index if not exists idx_invites_idea_round_id
  on public.invites (idea_round_id)
  where idea_round_id is not null;
