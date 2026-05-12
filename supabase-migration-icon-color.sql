-- Migration: add icon + color to idea_rounds
-- Run this in the Supabase SQL editor (or via supabase db push).

alter table public.idea_rounds
  add column if not exists icon  text,           -- emoji, e.g. '💡', '🚀', '🎯'
  add column if not exists color text;           -- hex accent, e.g. '#f97316', '#3b82f6'

-- No RLS changes needed — idea_rounds already uses the admin client throughout.
