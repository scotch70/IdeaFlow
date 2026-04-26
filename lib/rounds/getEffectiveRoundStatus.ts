/**
 * Compute the effective open/closed/draft state of an idea round.
 *
 * Priority order:
 *  1. manual_override ('open' | 'closed') — always wins over everything else
 *  2. raw_status === null (no round configured) → 'draft' (locked by default)
 *  3. raw_status === 'draft'  → 'draft'
 *  4. raw_status === 'closed' → 'closed'
 *  5. raw_status === 'active' → check date window:
 *       - now < opens_at  → 'draft'  (not open yet)
 *       - now > closes_at → 'closed' (window expired)
 *       - otherwise       → 'active'
 *  6. Defensive fallback → 'draft'
 *
 * IMPORTANT: The default is 'draft', NOT 'active'. Brand-new workspaces with
 * no round configured are locked until an admin opens IdeaFlow manually or
 * starts a scheduled round.
 */

export type EffectiveRoundStatus = 'active' | 'closed' | 'draft'

export interface RoundFields {
  /** Raw DB value — null means no IdeaFlow has been configured. */
  raw_status:      'draft' | 'active' | 'closed' | null | undefined
  manual_override: 'open'  | 'closed' | null | undefined
  opens_at:        string  | null | undefined   // idea_round_starts_at
  closes_at:       string  | null | undefined   // idea_round_ends_at
}

export function getEffectiveRoundStatus(round: RoundFields): EffectiveRoundStatus {
  const now = new Date()

  // ── 1. Manual override always wins ────────────────────────────────────────
  if (round.manual_override === 'closed') return 'closed'
  if (round.manual_override === 'open')   return 'active'

  // ── 2. No round configured → locked by default ───────────────────────────
  if (!round.raw_status) return 'draft'

  // ── 3. Draft / Closed → pass straight through ────────────────────────────
  if (round.raw_status === 'draft')  return 'draft'
  if (round.raw_status === 'closed') return 'closed'

  // ── 4. Active round — check date window ──────────────────────────────────
  if (round.raw_status === 'active') {
    if (round.opens_at  && now < new Date(round.opens_at))  return 'draft'
    if (round.closes_at && now > new Date(round.closes_at)) return 'closed'
    return 'active'
  }

  // ── 5. Defensive fallback ────────────────────────────────────────────────
  return 'draft'
}
