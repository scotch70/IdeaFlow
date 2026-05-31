// ─────────────────────────────────────────────────────────────────────────────
// Sessions — TypeScript types
//
// Shape mirrors the supabase-migration-sessions.sql tables 1:1 so the mock
// localStorage store and the eventual Supabase queries return identical data.
// ─────────────────────────────────────────────────────────────────────────────

export const SESSION_STATUSES = ['active', 'finished', 'archived'] as const
export type SessionStatus = typeof SESSION_STATUSES[number]

// Thinking frameworks. Old session rows with legacy template_type values
// (e.g. 'startup-idea') still load — getTemplate() falls back to 'freeform'.
export const TEMPLATE_TYPES = [
  'starbursting',
  'swot',
  'decision-matrix',
  'customer-discovery',
  'problem-solving',
  'freeform',
] as const
export type TemplateType = typeof TEMPLATE_TYPES[number]

export const CARD_TYPES = [
  'problem',
  'audience',
  'pain',
  'cause',
  'idea',
  'risk',
  'decision',
  'task',
  'custom',
] as const
export type CardType = typeof CARD_TYPES[number]

export const STEP_KEYS = ['define', 'explore', 'connect', 'prioritize', 'action'] as const
export type StepKey = typeof STEP_KEYS[number]

// ── Row shapes ────────────────────────────────────────────────────────────────

export interface Session {
  id:            string
  company_id:    string
  user_id:       string
  title:         string
  template_type: TemplateType
  status:        SessionStatus
  summary:       string | null
  created_at:    string
  updated_at:    string
}

export interface SessionCard {
  id:          string
  session_id:  string
  type:        CardType
  /** User-defined label shown on the chip when type='custom'. Null otherwise. */
  custom_label: string | null
  title:       string
  content:     string | null
  x:           number
  y:           number
  priority:    number
  /** auth.uid() of the user who created the card. Nullable for backfill rows. */
  created_by:  string | null
  created_at:  string
  updated_at:  string
}

/**
 * Minimal profile shape used to attribute cards in the UI (avatar initials +
 * subtle "Admin / Member" metadata). Returned by getSession.
 */
export interface SessionMember {
  id:        string
  fullName:  string | null
  role:      'admin' | 'member' | string
}

export interface SessionConnection {
  id:              string
  session_id:      string
  source_card_id:  string
  target_card_id:  string
  label:           string | null
  created_at:      string
}

export interface SessionStepRow {
  id:         string
  session_id: string
  step_key:   StepKey
  completed:  boolean
  created_at: string
}

// ── Combined detail payload (used by getSession) ─────────────────────────────

export interface SessionDetail {
  session:     Session
  cards:       SessionCard[]
  connections: SessionConnection[]
  steps:       SessionStepRow[]
  /** Map from user_id → minimal profile, populated for every workspace member.
   *  Used to render card avatar initials + the "Admin / Member" hint without
   *  having to refetch profiles per card. */
  members:     Record<string, SessionMember>
}
