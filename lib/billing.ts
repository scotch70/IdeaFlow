// ─────────────────────────────────────────────────────────────────────────────
// Billing helpers
//
// Single source of truth for plan limits. Import these in both API routes
// and UI components so limits stay in sync automatically.
//
// Plan values:
//   'free'     — Free tier (10 members, 2 active flows)
//   'standard' — Standard plan €49/year (50 members, unlimited flows)
//   'pro'      — Pro plan €99/year (100 members, unlimited flows)
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum workspace members per plan. */
export const FREE_MEMBER_LIMIT     = 10
export const STANDARD_MEMBER_LIMIT = 50
export const PRO_MEMBER_LIMIT      = 100

/** Maximum *active* IdeaFlows per plan (drafts and closed don't count). */
export const FREE_FLOW_LIMIT = 2

// ── Member gate ───────────────────────────────────────────────────────────────

/**
 * Returns true if the company can add one more member.
 *
 * Free plan     : up to 10 members
 * Standard plan : up to 50 members
 * Pro plan      : up to 100 members
 *
 * `trialEndsAt` is accepted for backwards-compatibility but no longer used
 * — the gate is purely plan-based.
 */
export function canAddMembers({
  plan,
  memberCount,
}: {
  plan: string
  trialEndsAt?: string | null   // kept for API compat; ignored
  memberCount: number
}): boolean {
  if (plan === 'pro')      return memberCount < PRO_MEMBER_LIMIT
  if (plan === 'standard') return memberCount < STANDARD_MEMBER_LIMIT
  return memberCount < FREE_MEMBER_LIMIT
}

// ── IdeaFlow gate ─────────────────────────────────────────────────────────────

/**
 * Returns true if the company can activate one more IdeaFlow.
 *
 * Free plan          : up to 2 concurrently *active* flows
 * Standard/Pro plan  : unlimited
 *
 * `activeFlowCount` should be the count of flows with status = 'active'.
 */
export function canCreateFlow({
  plan,
  activeFlowCount,
}: {
  plan: string
  activeFlowCount: number
}): boolean {
  if (plan === 'pro' || plan === 'standard') return true
  return activeFlowCount < FREE_FLOW_LIMIT
}

// ── Plan display helpers ───────────────────────────────────────────────────────

/** Returns true for any paid plan. */
export function isPaidPlan(plan: string): boolean {
  return plan === 'standard' || plan === 'pro'
}

/** Returns the member limit for a given plan. */
export function memberLimitForPlan(plan: string): number {
  if (plan === 'pro')      return PRO_MEMBER_LIMIT
  if (plan === 'standard') return STANDARD_MEMBER_LIMIT
  return FREE_MEMBER_LIMIT
}

// ── Legacy helper (kept for any remaining call sites) ─────────────────────────

/** @deprecated Use plan-based gates instead. */
export function isTrialActive(trialEndsAt: string | null): boolean {
  if (!trialEndsAt) return false
  return new Date(trialEndsAt) > new Date()
}
