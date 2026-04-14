-- Add custom_idea_prompt to companies
-- Admins can personalise the "Share your idea" heading per workspace.
-- NULL means fall back to the default copy in the UI.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS custom_idea_prompt TEXT
  CONSTRAINT custom_idea_prompt_length CHECK (char_length(custom_idea_prompt) <= 80);
