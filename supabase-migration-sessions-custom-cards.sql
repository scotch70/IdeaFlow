-- ─────────────────────────────────────────────────────────────────────────────
-- Sessions: custom card type
--
-- 1) Adds 'custom' to the session_cards.type CHECK so users can create their
--    own categories (Opportunity, Competitor, Question, Assumption, …).
-- 2) Adds session_cards.custom_label — the user-supplied label that shows on
--    the card's chip when type='custom'. Null for built-in types.
--
-- Safe to re-run. No data migration needed.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Drop the old CHECK and recreate with 'custom' included ──────────────
-- The constraint is created inline by CREATE TABLE, so its system-generated
-- name is session_cards_type_check. If you renamed it, adjust accordingly.
alter table public.session_cards
  drop constraint if exists session_cards_type_check;

alter table public.session_cards
  add constraint session_cards_type_check
  check (type in (
    'problem','audience','pain','cause','idea','risk','decision','task','custom'
  ));

-- ── 2. Custom label column ────────────────────────────────────────────────
alter table public.session_cards
  add column if not exists custom_label text;

-- (Optional) tiny sanity check — disallow blank labels on custom cards.
-- Stays as a CHECK so the application layer can ignore it.
alter table public.session_cards
  drop constraint if exists session_cards_custom_label_check;
alter table public.session_cards
  add constraint session_cards_custom_label_check
  check (
    type <> 'custom'
    or (custom_label is not null and char_length(trim(custom_label)) between 1 and 40)
  );
