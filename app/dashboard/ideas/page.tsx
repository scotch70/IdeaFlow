/**
 * /dashboard/ideas — cross-flow ideas overview.
 *
 * Default scope: every IdeaFlow the user can access ("All IdeaFlows").
 * Optional scope: a single flow via ?flow=<id>.
 *
 * Each idea carries its flow's name so cards rendered in "All" mode can show
 * a small flow chip — the user can tell at a glance which IdeaFlow an idea
 * came from. The IdeaList sort dropdown (Most liked / Newest / Oldest /
 * Most comments) is reused unchanged.
 *
 * Access rules:
 *   - admins see every flow in the workspace.
 *   - members see only the flows they're in via round_members (handled by
 *     isRoundAccessible, which also covers the pre-migration legacy fallback).
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import IdeaList from '@/components/IdeaList'
import PageContainer from '@/components/PageContainer'
import IdeasFlowSwitcher from '@/components/IdeasFlowSwitcher'
import type { SwitchableIdeasFlow } from '@/components/IdeasFlowSwitcher'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'
import { isRoundAccessible } from '@/lib/auth/guards'
import type { Database, Idea } from '@/types/database'

type IdeaJoinResult = Database['public']['Tables']['ideas']['Row'] & {
  profiles: { full_name: string | null } | null
  comments?: { count: number }[]
}

type RoundRow = {
  id:               string
  name:             string | null
  status:           string | null
  manual_override:  string | null
  starts_at:        string | null
  ends_at:          string | null
}

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Ideas — IdeaFlow' }

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ flow?: string }>
}) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('id, full_name, company_id, role')
    .eq('id', user.id)
    .single()) as unknown as {
    data: { id: string; full_name: string | null; company_id: string | null; role: string } | null
  }

  if (!profile?.company_id) redirect('/dashboard')

  const isAdmin = profile.role === 'admin'
  const admin   = createAdminClient()

  // ── 1. Every round in the workspace ──────────────────────────────────────
  const { data: roundRows } = await (admin as any)
    .from('idea_rounds')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false }) as { data: RoundRow[] | null }

  const allRounds: RoundRow[] = roundRows ?? []

  // ── 2. round_members for access filtering ────────────────────────────────
  const { data: memberRows } = allRounds.length > 0
    ? await (admin as any)
        .from('round_members')
        .select('round_id, user_id')
        .in('round_id', allRounds.map(r => r.id)) as { data: { round_id: string; user_id: string }[] | null }
    : { data: [] as { round_id: string; user_id: string }[] }

  const assignedByRound: Record<string, string[]> = {}
  for (const row of memberRows ?? []) {
    if (!assignedByRound[row.round_id]) assignedByRound[row.round_id] = []
    assignedByRound[row.round_id].push(row.user_id)
  }

  const accessibleRounds = allRounds.filter(r => isRoundAccessible({
    userId: user.id,
    isAdmin,
    round: { id: r.id, audience_mode: (r as { audience_mode?: 'workspace' | 'restricted' | null }).audience_mode ?? null },
    assignedUserIds: assignedByRound[r.id] ?? [],
  }))

  const switchableFlows: SwitchableIdeasFlow[] = accessibleRounds.map(r => ({
    id:     r.id,
    name:   r.name ?? 'Unnamed IdeaFlow',
    status: getEffectiveRoundStatus({
      raw_status:      (r.status          ?? null) as 'draft' | 'active' | 'closed' | null,
      manual_override: (r.manual_override ?? null) as 'open'  | 'closed' | null,
      opens_at:        r.starts_at ?? null,
      closes_at:       r.ends_at   ?? null,
    }),
  }))

  // ── 3. Resolve selected scope ────────────────────────────────────────────
  const params = await searchParams
  const requestedId = typeof params.flow === 'string' && params.flow ? params.flow : null

  // Validate ?flow=<id> against the accessible set. Unknown id falls back to 'all'.
  const selectedFlow: SwitchableIdeasFlow | null =
    requestedId && requestedId !== 'all'
      ? switchableFlows.find(f => f.id === requestedId) ?? null
      : null

  const scope: 'all' | string = selectedFlow ? selectedFlow.id : 'all'
  const visibleRoundIds = selectedFlow
    ? [selectedFlow.id]
    : accessibleRounds.map(r => r.id)

  // ── 4. Fetch ideas across the selected scope ─────────────────────────────
  // PostgREST's comments(count) aggregate powers the "Most comments" sort
  // in IdeaList without an extra round trip.
  let rawIdeas: IdeaJoinResult[] = []
  if (visibleRoundIds.length > 0) {
    const { data } = await (supabase as any)
      .from('ideas')
      .select('*, profiles(full_name), comments(count)')
      .eq('company_id', profile.company_id)
      .in('idea_round_id', visibleRoundIds)
      .order('likes_count', { ascending: false })
      .order('created_at', { ascending: false }) as { data: IdeaJoinResult[] | null }
    rawIdeas = data ?? []
  }

  // ── 5. Liked-by-current-user decoration ──────────────────────────────────
  let likedIds = new Set<string>()
  if (rawIdeas.length > 0) {
    const { data: userLikes } = await supabase
      .from('likes')
      .select('idea_id')
      .eq('user_id', user.id)
    likedIds = new Set((userLikes ?? []).map((l) => (l as { idea_id: string }).idea_id))
  }

  // Map of round_id → flow name so we can chip the cards in "All" mode.
  const roundNameById: Record<string, string> = {}
  for (const r of allRounds) roundNameById[r.id] = r.name ?? 'Unnamed IdeaFlow'

  const ideas: Idea[] = rawIdeas.map(idea => ({
    ...idea,
    profiles:        idea.profiles ?? undefined,
    liked_by_user:   likedIds.has(idea.id),
    comments_count:  idea.comments?.[0]?.count ?? 0,
    // Only attach a flow_name when we're showing more than one flow's ideas.
    // In single-flow mode the page header already says which flow we're in.
    flow_name:       scope === 'all' && idea.idea_round_id
      ? roundNameById[idea.idea_round_id]
      : undefined,
  }))

  const totalIdeas = ideas.length

  return (
    <div className="page-content-enter">
      {/* ── Sticky page header ── */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(26,107,191,0.09)',
          position: 'sticky',
          top: 0,
          zIndex: 9,
        }}
      >
        <PageContainer style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', minWidth: 0 }}>
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                  Workspace
                </p>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Ideas
                </h1>
              </div>

              {/* Flow switcher — shown only when the user can access at least one flow */}
              {switchableFlows.length > 0 && (
                <IdeasFlowSwitcher flows={switchableFlows} currentId={scope} />
              )}
            </div>

            <p style={{ fontSize: '0.825rem', color: '#9ab0c8', fontWeight: 500 }}>
              {totalIdeas} idea{totalIdeas !== 1 ? 's' : ''}
            </p>
          </div>
        </PageContainer>
      </div>

      <main>
        <PageContainer style={{ paddingTop: '1.75rem', paddingBottom: '3rem' }}>

          {/* No accessible flows → orient the user back to the dashboard. */}
          {switchableFlows.length === 0 ? (
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(26,107,191,0.10)',
              borderRadius: '1.25rem',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: '0 2px 12px rgba(6,14,38,0.05)',
              maxWidth: '32rem',
              margin: '0 auto',
            }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                {isAdmin ? 'No IdeaFlows yet' : 'No IdeaFlows assigned to you'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#9ab0c8', lineHeight: 1.6, maxWidth: '22rem', margin: '0 auto' }}>
                {isAdmin
                  ? 'Create an IdeaFlow from the dashboard, then ideas will appear here.'
                  : 'Once an admin adds you to an IdeaFlow, its ideas will show up here.'}
              </p>
            </div>
          ) : (
            <IdeaList
              ideas={ideas}
              currentUserId={user.id}
              companyId={profile.company_id}
              isAdmin={isAdmin}
            />
          )}
        </PageContainer>
      </main>
    </div>
  )
}
