// ─────────────────────────────────────────────────────────────────────────────
// planFeatures — single source of truth for all plan gating logic.
//
// Plan hierarchy:
//   free  < standard  < pro
//
// Feature ownership:
//   Free        — idea collection, voting, comments, basic analytics
//   Standard    — everything in Free + unlimited flows, full analytics,
//                 member management, workspace metrics
//   Pro         — everything in Standard + AI summaries, executive reports,
//                 AI recommendations, PDF exports, workspace pulse,
//                 trend detection, smart insights
// ─────────────────────────────────────────────────────────────────────────────

/** All plan strings that exist in the DB companies.plan column */
export type PlanName = 'free' | 'standard' | 'pro' | 'pro_plus'

/** True for Standard, Pro, Pro+ — general "paid" check */
export function isPaidPlan(plan: string | null | undefined): boolean {
  return plan === 'standard' || plan === 'pro' || plan === 'pro_plus'
}

/** True for Pro and Pro+ only — gates all AI features */
export function isProPlan(plan: string | null | undefined): boolean {
  return plan === 'pro' || plan === 'pro_plus'
}

/**
 * True when the plan can use the advanced sort + status filters in IdeaList
 * (everything beyond "Most liked"). Free is locked.
 */
export function canUseAdvancedFilters(plan: string | null | undefined): boolean {
  return isPaidPlan(plan)
}

/**
 * True when the plan can call the real AI insights endpoint. Used both for
 * server-side gating and as a hint for the client to render the upgrade
 * teaser vs the actual summary.
 */
export function canUseAIInsights(plan: string | null | undefined): boolean {
  return isProPlan(plan)
}

/** Human-readable label for a plan slug */
export function planLabel(plan: string | null | undefined): string {
  switch (plan) {
    case 'standard':  return 'Standard'
    case 'pro':       return 'Pro'
    case 'pro_plus':  return 'Pro'
    default:          return 'Free'
  }
}

// ── Feature flags by plan ─────────────────────────────────────────────────────

/** Features gated at Standard tier or above */
export const STANDARD_FEATURES = [
  'Unlimited IdeaFlows',
  'Up to 50 members',
  'Full analytics dashboard',
  'Member management',
  'Admin controls & roles',
] as const

/** Features gated at Pro tier only */
export const PRO_AI_FEATURES = [
  'AI workspace summaries',
  'Executive AI reports',
  'AI action recommendations',
  'PDF executive exports',
  'Workspace Pulse insights',
  'Trend detection',
] as const

/** Features available on the Free plan */
export const FREE_FEATURES = [
  'Up to 10 members',
  'Up to 2 active IdeaFlows',
  'Idea submission & voting',
  'Comments on ideas',
  'Basic analytics',
] as const
