/**
 * Server-side helper that returns every workspace member with the set of
 * IdeaFlows they currently belong to.
 *
 * Used by /dashboard/members (and reusable by analytics/insights).
 *
 * Semantics:
 *   - audience_mode = 'workspace' → every workspace profile is considered to
 *     be a participant (joinedAt = null, role = null = inherited).
 *   - audience_mode = 'restricted' → only round_members rows count.
 *   - Closed flows are excluded (they are "archived" from the member's POV).
 *   - Legacy rounds without an audience_mode value are handled via the
 *     "empty round_members = open" fallback.
 *   - Deleted flows are not shown because their round_members rows are
 *     cascaded on delete (see DELETE /api/rounds/[id]).
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type {
  AudienceMode,
  FlowRole,
  FlowSummary,
  WorkspaceMemberWithFlows,
} from '@/types/database'

// Every "members-redesign" column is marked optional in these row types so
// the helper keeps working before the migration has been applied — at which
// point those columns simply come back as undefined / null and the legacy
// "empty round_members = workspace" fallback below kicks in.
type RoundRow = {
  id: string
  name: string | null
  status: 'draft' | 'active' | 'closed' | null
  audience_mode?: AudienceMode | null
}

type RoundMemberRow = {
  round_id: string
  user_id: string
  created_at: string | null
  role?: FlowRole | null
}

type ProfileRow = {
  id: string
  full_name: string | null
  role: string
  last_active_at?: string | null
}

export async function getWorkspaceMembersWithFlows(
  companyId: string,
): Promise<WorkspaceMemberWithFlows[]> {
  const admin = createAdminClient()

  // All three queries use select('*') so they survive a pre-migration DB
  // that doesn't yet have the new members-redesign columns. PostgREST simply
  // returns whatever exists; the row types above mark the new columns as
  // optional so TypeScript stays happy.

  // ── 1. All profiles in the workspace ────────────────────────────────────
  const { data: profileRows } = await (admin as any)
    .from('profiles')
    .select('*')
    .eq('company_id', companyId)
    .order('full_name', { ascending: true }) as { data: ProfileRow[] | null }

  const profiles: ProfileRow[] = profileRows ?? []
  if (profiles.length === 0) return []

  // ── 2. Every round in the workspace (we filter closed below) ────────────
  const { data: roundRows } = await (admin as any)
    .from('idea_rounds')
    .select('*')
    .eq('company_id', companyId) as { data: RoundRow[] | null }

  const rounds: RoundRow[] = (roundRows ?? []).filter(r => r.status !== 'closed')

  // ── 3. All round_members rows scoped to the visible rounds ──────────────
  let memberRows: RoundMemberRow[] = []
  if (rounds.length > 0) {
    const { data } = await (admin as any)
      .from('round_members')
      .select('*')
      .in('round_id', rounds.map(r => r.id)) as { data: RoundMemberRow[] | null }
    memberRows = data ?? []
  }

  // Build a per-round set of assigned user IDs — used for the legacy fallback
  // and for "is this user listed?" lookups when building each member's view.
  const assignedByRound = new Map<string, Map<string, RoundMemberRow>>()
  for (const row of memberRows) {
    let inner = assignedByRound.get(row.round_id)
    if (!inner) {
      inner = new Map()
      assignedByRound.set(row.round_id, inner)
    }
    inner.set(row.user_id, row)
  }

  // ── 4. For each profile, compute the flows they can access ──────────────
  const result: WorkspaceMemberWithFlows[] = profiles.map(profile => {
    const flows: FlowSummary[] = []

    for (const round of rounds) {
      const assigned = assignedByRound.get(round.id)
      const myRow    = assigned?.get(profile.id) ?? null

      // Resolve effective audience mode (handles legacy rounds with NULL)
      const mode: AudienceMode = round.audience_mode
        ?? ((assigned && assigned.size > 0) ? 'restricted' : 'workspace')

      let included = false
      let joinedAt: string | null = null
      let roleInFlow: FlowRole | null = null

      if (mode === 'workspace') {
        included = true
        // If the user also has a round_members row (e.g. owner pin), expose
        // joinedAt + role; otherwise null = inherited.
        if (myRow) {
          joinedAt   = myRow.created_at ?? null
          roleInFlow = myRow.role ?? null
        }
      } else if (mode === 'restricted') {
        if (myRow) {
          included = true
          joinedAt   = myRow.created_at ?? null
          roleInFlow = myRow.role ?? 'member'
        }
      }

      if (included) {
        flows.push({
          id:           round.id,
          name:         round.name ?? 'Unnamed IdeaFlow',
          status:       (round.status ?? 'draft') as FlowSummary['status'],
          joinedAt,
          role:         roleInFlow,
          audienceMode: mode,
        })
      }
    }

    return {
      id:            profile.id,
      fullName:      profile.full_name,
      workspaceRole: profile.role,
      lastActiveAt:  profile.last_active_at ?? null,
      flows,
    }
  })

  return result
}
