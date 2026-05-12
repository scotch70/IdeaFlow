/**
 * /dashboard/idea-flow
 *
 * Admin-only IdeaFlow management page.
 * Lists all IdeaFlows (active, draft, closed) with a "New IdeaFlow" button.
 * Clicking a flow card opens the per-flow detail at /dashboard/flows/[id].
 */

import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PageContainer     from '@/components/PageContainer'
import FlowCard          from '@/components/FlowCard'
import CreateFlowButton  from '@/components/CreateFlowButton'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'
import type { IdeaRoundWithStatus } from '@/types/database'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'IdeaFlows — IdeaFlow' }

export default async function IdeaFlowPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()) as unknown as { data: { company_id: string | null; role: string } | null }

  // Admin-only
  if (!profile?.company_id || profile.role !== 'admin') redirect('/dashboard')

  const admin = createAdminClient()

  // ── Fetch all rounds for this company ────────────────────────────────────────
  const { data: rounds } = await (admin as any)
    .from('idea_rounds')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })

  const allRounds: any[] = rounds ?? []

  // ── Enrich: idea counts + member counts ──────────────────────────────────────
  const roundIds = allRounds.map((r: any) => r.id)

  const [ideaResult, memberResult] = await Promise.all([
    roundIds.length > 0
      ? (admin as any).from('ideas').select('idea_round_id').in('idea_round_id', roundIds)
      : { data: [] },
    roundIds.length > 0
      ? (admin as any).from('round_members').select('round_id').in('round_id', roundIds)
      : { data: [] },
  ])

  const ideaCountMap:   Record<string, number> = {}
  const memberCountMap: Record<string, number> = {}

  for (const row of ideaResult.data ?? []) {
    ideaCountMap[row.idea_round_id] = (ideaCountMap[row.idea_round_id] ?? 0) + 1
  }
  for (const row of memberResult.data ?? []) {
    memberCountMap[row.round_id] = (memberCountMap[row.round_id] ?? 0) + 1
  }

  // ── Build enriched list ──────────────────────────────────────────────────────
  const flows: IdeaRoundWithStatus[] = allRounds.map((round: any): IdeaRoundWithStatus => ({
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

  const activeFlows = flows.filter(f => f.effectiveStatus === 'active')
  const draftFlows  = flows.filter(f => f.effectiveStatus === 'draft')
  const closedFlows = flows.filter(f => f.effectiveStatus === 'closed')

  return (
    <div>
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
                Management
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
                IdeaFlows
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.825rem', color: '#9ab0c8', fontWeight: 500 }}>
                {flows.length} flow{flows.length !== 1 ? 's' : ''}
              </p>
              <CreateFlowButton companyId={profile.company_id} />
            </div>
          </div>
        </PageContainer>
      </div>

      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

          {flows.length === 0 ? (
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
                No IdeaFlows yet
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#9ab0c8', lineHeight: 1.6, maxWidth: '22rem', margin: '0 auto 1.75rem' }}>
                Create your first IdeaFlow to start collecting ideas from your team.
              </p>
              <CreateFlowButton companyId={profile.company_id} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {activeFlows.length > 0 && (
                <FlowSection title="Active" flows={activeFlows} />
              )}
              {draftFlows.length > 0 && (
                <FlowSection title="Draft" flows={draftFlows} />
              )}
              {closedFlows.length > 0 && (
                <FlowSection title="Closed" flows={closedFlows} />
              )}
            </div>
          )}

        </PageContainer>
      </main>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

function FlowSection({ title, flows }: { title: string; flows: IdeaRoundWithStatus[] }) {
  return (
    <div>
      <p style={{
        fontSize: '0.68rem', fontWeight: 700,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: '#9ab0c8', marginBottom: '0.875rem',
      }}>
        {title} · {flows.length}
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
        gap: '0.875rem',
      }}>
        {flows.map(flow => (
          <FlowCard key={flow.id} flow={flow} isAdmin={true} />
        ))}
      </div>
    </div>
  )
}
