-- Idea Round: admins can open/close a named idea collection window.
--
-- idea_round_status is NULL  →  feature not activated; submission always open (backward-compat).
-- idea_round_status = 'draft'  →  round being set up; employees cannot submit yet.
-- idea_round_status = 'active' →  round is open; employees can submit.
-- idea_round_status = 'closed' →  round is done; submission is locked.
--
-- A NULL end date means "no automatic close"; the admin closes manually.
-- If idea_round_ends_at is in the past while status = 'active', the UI treats it as closed.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS idea_round_name       TEXT,
  ADD COLUMN IF NOT EXISTS idea_round_status     TEXT
    CONSTRAINT idea_round_status_values
    CHECK (idea_round_status IN ('draft', 'active', 'closed')),
  ADD COLUMN IF NOT EXISTS idea_round_starts_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS idea_round_ends_at    TIMESTAMPTZ;
