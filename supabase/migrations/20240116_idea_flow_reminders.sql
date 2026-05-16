-- ─────────────────────────────────────────────────────────────────────────────
-- idea_flow_reminders
--
-- Tracks which reminder emails have been dispatched for each IdeaFlow so the
-- daily cron job never sends a duplicate regardless of how many times it runs.
--
-- Run this in the Supabase SQL editor (or via `supabase db push`) before
-- deploying the flow-reminders cron route.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists idea_flow_reminders (
  id             uuid        primary key default gen_random_uuid(),
  idea_round_id  uuid        not null references idea_rounds(id) on delete cascade,
  reminder_type  text        not null
                               check (reminder_type in ('7_days_before', '1_day_before')),
  sent_at        timestamptz not null default now(),

  -- One row per (flow, reminder_type) — the unique constraint is the idempotency key
  unique (idea_round_id, reminder_type)
);

-- Fast lookups during cron run ("have we already sent X for round Y?")
create index if not exists idea_flow_reminders_round_idx
  on idea_flow_reminders (idea_round_id);

-- RLS: only the service role (used by the admin client) can read/write
alter table idea_flow_reminders enable row level security;

-- Drop before recreate so re-running the migration is safe
drop policy if exists "service_role_only" on idea_flow_reminders;

create policy "service_role_only" on idea_flow_reminders
  using   (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
