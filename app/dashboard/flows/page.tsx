/**
 * /dashboard/flows
 *
 * Lists every IdeaFlow in the workspace:
 *   - Admins see all flows (active, draft, closed) with a "New IdeaFlow" button.
 *   - Members see only flows they're assigned to, plus open-to-all flows.
 */

import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PageContainer     from '@/components/PageContainer'
import FlowCard          from '@/components/FlowCard'
import CreateFlowButton  from '@/components/CreateFlowButton'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'
import { isRoundAccessible } from '@/lib/auth/guards'
import type { IdeaRoundWithStatus } from '@/types/database'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'IdeaFlows — IdeaFlow' }

export default async function FlowsPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()) as unknown as { data: { company_id: string | null; role: string } | null }

  if (!profile?.company_id) redirect('/dashboard')

  const admin    = createAdminClient()
  const isAdmin  = profile.role === 'admin'

  // Fetch all rounds for this company
  const { data: rounds } = await (admin as any)
    .from('idea_rounds')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })

  const allRounds: any[] = rounds ?? []

  // Fetch idea counts + member assignments in parallel
  const roundIds = allRounds.map((r: any) => r.id)

  const [ideaResult, memberResult] = await Promise.all([
    roundIds.length > 0
      ? (admin as any).from('ideas').select('idea_round_id').in('idea_round_id', roundIds)
      : { data: [] },
    roundIds.length > 0
      ? (admin as any).from('round_members').select('round_id, user_id').in('round_id', roundIds)
      : { data: [] },
  ])

  const ideaCountMap: Record<string, number>  = {}
  for (const row of ideaResult.data ?? []) {
    ideaCountMap[row.idea_round_id] = (ideaCountMap[row.idea_round_id] ?? 0) + 1
  }

  const memberCountMap: Record<string, number>  = {}
  const memberSetMap:   Record<string, string[]> = {}
  for (const row of memberResult.data ?? []) {
    memberCountMap[row.round_id] = (memberCountMap[row.round_id] ?? 0) + 1
    if (!memberSetMap[row.round_id]) memberSetMap[row.round_id] = []
    memberSetMap[row.round_id].push(row.user_id)
  }

  // Build enriched list, filtering for member access
  const flows: IdeaRoundWithStatus[] = allRounds
    .filter((round: any) => isRoundAccessible({
      userId: user.id,
      isAdmin,
      round: { id: round.id, audience_mode: round.audience_mode ?? null },
      assignedUserIds: memberSetMap[round.id] ?? [],
    }))
    .map((round: any): IdeaRoundWithStatus => ({
      ...round,
      effectiveStatus: getEffectiveRoundStatus({
        raw_status:      round.status,
        manual_override: round.manual_override ?? null,
        opens_at:        round.starts_at ?? null,
        closes_at:       round.ends_at   ?? null,
      }),
      ideaCount:   ideaCountMap[round.id]   ?? 0,
      memberCount: memberCountMap[round.id] ?? 0,
    }))

  // Split by status for display sections
  const activeFlows = flows.filter(f => f.effectiveStatus === 'active')
  const draftFlows  = flows.filter(f => f.effectiveStatus === 'draft')
  const closedFlows = flows.filter(f => f.effectiveStatus === 'closed')

  return (
    <div className="page-content-enter">
      {/* ── Sticky header ── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(26,107,191,0.09)',
        position: 'sticky', top: 0, zIndex: 9,
      }}>
        <PageContainer style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                Workspace
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
                IdeaFlows
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '0.825rem', color: '#9ab0c8', fontWeight: 500 }}>
                {flows.length} flow{flows.length !== 1 ? 's' : ''}
              </p>
              {isAdmin && (
                <CreateFlowButton companyId={profile.company_id} />
              )}
            </div>
          </div>
        </PageContainer>
      </div>

      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

          {flows.length === 0 ? (
            /* ── Empty state ── */
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
              <div style={{
                width: '3rem', height: '3rem',
                borderRadius: '0.875rem',
                background: 'rgba(249,115,22,0.08)',
                border: '1px solid rgba(249,115,22,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.25rem',
              }}>
                💡
              </div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                {isAdmin ? 'No IdeaFlows yet' : 'No IdeaFlows assigned'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#9ab0c8', lineHeight: 1.6, maxWidth: '22rem', margin: '0 auto 1.75rem' }}>
                {isAdmin
                  ? 'Create your first IdeaFlow to start collecting ideas from your team.'
                  : 'Your admin hasn\'t assigned you to any IdeaFlows yet.'}
              </p>
              {isAdmin && (
                <CreateFlowButton companyId={profile.company_id} />
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Active */}
              {activeFlows.length > 0 && (
                <FlowSection title="Active" flows={activeFlows} isAdmin={isAdmin} />
              )}

              {/* Draft */}
              {isAdmin && draftFlows.length > 0 && (
                <FlowSection title="Draft" flows={draftFlows} isAdmin={isAdmin} />
              )}

              {/* Closed — admin only; members only see active flows */}
              {isAdmin && closedFlows.length > 0 && (
                <FlowSection title="Closed" flows={closedFlows} isAdmin={isAdmin} />
              )}
            </div>
          )}
        </PageContainer>
      </main>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

function FlowSection({ title, flows, isAdmin }: {
  title:   string
  flows:   IdeaRoundWithStatus[]
  isAdmin: boolean
}) {
  return (
    <div>
      <p style={{
        fontSize: '0.68rem', fontWeight: 700,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: '#9ab0c8',
        marginBottom: '0.875rem',
      }}>
        {title} · {flows.length}
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
        gap: '0.875rem',
      }}>
        {flows.map(flow => (
          <FlowCard key={flow.id} flow={flow} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  )
}
