/**
 * Centralised authorization helpers used by API routes and Server Components.
 *
 * Each helper returns a discriminated result so call sites can route on
 * `result.ok`. This avoids the ad-hoc `{ error, status, user, profile }`
 * shape that several routes were reinventing.
 *
 * All helpers read the caller's session via the SSR Supabase client
 * (RLS-aware). Where a privileged read is required (e.g. reading another
 * user's profile to validate cross-user actions), pass `{ admin: true }`
 * to opt into the service-role client.
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database, AudienceMode } from '@/types/database'

type CallerProfile = {
  id: string
  company_id: string
  role: 'admin' | 'member'
  full_name: string | null
}

type Round = Database['public']['Tables']['idea_rounds']['Row']

export type GuardOk<T> = { ok: true; value: T }
export type GuardErr   = { ok: false; status: number; error: string }
export type GuardResult<T> = GuardOk<T> | GuardErr

function err(status: number, error: string): GuardErr {
  return { ok: false, status, error }
}

// ─── Internal: load caller's profile ─────────────────────────────────────────

async function loadCaller(): Promise<GuardResult<{ userId: string; profile: CallerProfile }>> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return err(401, 'Unauthorized')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('id, company_id, role, full_name')
    .eq('id', user.id)
    .single()) as unknown as { data: CallerProfile | null }

  if (!profile)            return err(404, 'Profile not found')
  if (!profile.company_id) return err(403, 'No workspace')

  return { ok: true, value: { userId: user.id, profile } }
}

// ─── requireSignedIn ─────────────────────────────────────────────────────────

/** Caller must be signed in AND have a workspace. */
export async function requireSignedIn(): Promise<GuardResult<{ userId: string; profile: CallerProfile }>> {
  return loadCaller()
}

// ─── requireWorkspaceAdmin ───────────────────────────────────────────────────

/** Caller must be an admin of their workspace. */
export async function requireWorkspaceAdmin(): Promise<GuardResult<{ userId: string; profile: CallerProfile }>> {
  const caller = await loadCaller()
  if (!caller.ok) return caller
  if (caller.value.profile.role !== 'admin') return err(403, 'Admins only')
  return caller
}

// ─── requireRoundAdmin ───────────────────────────────────────────────────────

/**
 * Caller must be allowed to administrate this specific round.
 * Today: workspace admin in the round's company. Tomorrow (RBAC V2): also a
 * round_members row with role in ('owner', 'admin').
 *
 * Returns the round row alongside the caller so the route doesn't need to
 * re-fetch it.
 */
export async function requireRoundAdmin(roundId: string): Promise<GuardResult<{
  userId: string
  profile: CallerProfile
  round: Round
}>> {
  const caller = await loadCaller()
  if (!caller.ok) return caller

  const admin = createAdminClient()
  const { data: round } = await (admin as any)
    .from('idea_rounds')
    .select('*')
    .eq('id', roundId)
    .eq('company_id', caller.value.profile.company_id)
    .single() as { data: Round | null }

  if (!round) return err(404, 'IdeaFlow not found')

  // V1: only workspace admins can manage rounds.
  // V2 will additionally allow round_members.role in ('owner', 'admin').
  if (caller.value.profile.role !== 'admin') return err(403, 'Admins only')

  return { ok: true, value: { ...caller.value, round } }
}

// ─── canAccessRound ──────────────────────────────────────────────────────────

/**
 * Returns true if `userId` (in `companyId`) can access `round` for reads.
 *
 * Reads `audience_mode` when present (post-migration) and falls back to the
 * legacy "empty round_members = open" convention so a half-deployed system
 * stays correct. After the legacy reads can be removed, simplify this.
 *
 * Workspace admins always have access regardless of audience.
 */
export async function canAccessRound(args: {
  userId: string
  isAdmin: boolean
  round: Pick<Round, 'id' | 'company_id'> & { audience_mode?: AudienceMode | null }
}): Promise<boolean> {
  if (args.isAdmin) return true

  const mode: AudienceMode | null = args.round.audience_mode ?? null
  const admin = createAdminClient()

  if (mode === 'workspace') return true

  if (mode === 'restricted') {
    const { data: row } = await (admin as any)
      .from('round_members')
      .select('user_id')
      .eq('round_id', args.round.id)
      .eq('user_id', args.userId)
      .maybeSingle()
    return !!row
  }

  // Legacy fallback: no audience_mode → infer from round_members presence.
  // Empty → open to all. Non-empty → restricted to listed users.
  const { data: rows } = await (admin as any)
    .from('round_members')
    .select('user_id')
    .eq('round_id', args.round.id) as { data: { user_id: string }[] | null }

  const list = rows ?? []
  if (list.length === 0) return true
  return list.some(r => r.user_id === args.userId)
}

// ─── filterAccessibleRounds ──────────────────────────────────────────────────

/**
 * Bulk version of canAccessRound — used by dashboard/flows listing pages that
 * want to filter many rounds at once without N round_members queries.
 *
 * Pass the set of (roundId → assignedUserIds) you already have in scope.
 * The helper handles both audience_mode and the legacy fallback.
 */
export function isRoundAccessible(args: {
  userId: string
  isAdmin: boolean
  round: { id: string; audience_mode?: AudienceMode | null }
  assignedUserIds: string[]   // round_members.user_id for this round
}): boolean {
  if (args.isAdmin) return true

  const mode: AudienceMode | null = args.round.audience_mode ?? null
  if (mode === 'workspace') return true
  if (mode === 'restricted') return args.assignedUserIds.includes(args.userId)

  // Legacy fallback
  if (args.assignedUserIds.length === 0) return true
  return args.assignedUserIds.includes(args.userId)
}
