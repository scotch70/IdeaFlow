-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: impact fields on ideas + Stripe fields on companies
-- Safe to re-run (all ADD COLUMN IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────

-- Part 1: Impact fields on ideas
-- impact_summary is required (enforced in app layer) when status = 'implemented'
-- impact_type and impact_link are optional

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS impact_summary text,
  ADD COLUMN IF NOT EXISTS impact_type    text
    CHECK (impact_type IS NULL OR impact_type IN ('revenue','cost_saving','productivity','culture','other')),
  ADD COLUMN IF NOT EXISTS impact_link    text;

-- Part 2: Stripe billing fields on companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS stripe_customer_id     text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
