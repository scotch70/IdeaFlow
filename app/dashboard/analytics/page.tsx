import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AnalyticsPanel from '@/components/AnalyticsPanel'
import type { DailyPoint, Contributor } from '@/components/AnalyticsPanel'
import AnalyticsFlowSwitcher from '@/components/AnalyticsFlowSwitcher'
import type { SwitchableFlow } from '@/components/AnalyticsFlowSwitcher'
import PageContainer from '@/components/PageContainer'
import DownloadReportButton from '@/components/DownloadReportButton'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Analytics — IdeaFlow' }

type IdeaRow = {
  created_at: string
  user_id: string
  likes_count: number | null
  title: string
  profiles: { full_name: string | null } | null
}

type RoundRow = {
  id: string
  name: string | null
  status: string | null
  manual_override: string | null
  starts_at: string | null
  ends_at: string | null
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ flow?: string }>
}) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()) as unknown as { data: { company_id: string | null; role: string } | null }

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const { data: company } = (await supabase
    .from('companies')
    .select('plan')
    .eq('id', profile.company_id!)
    .single()) as unknown as { data: { plan: string } | null }

  const isPro = company?.plan === 'pro'

  // ── Resolve flows ────────────────────────────────────────────────────────
  // Query idea_rounds directly. We expose ALL non-deleted rounds in the
  // switcher (active, draft, and closed) so admins can review historical
  // analytics, but default the initial scope to the same "ranked round"
  // the dashboard would pick (newest active, else newest any).
  const admin = createAdminClient()

  const { data: allRounds } = await (admin as any)
    .from('idea_rounds')
    .select('id, name, status, manual_override, starts_at, ends_at')
    .eq('company_id', profile.company_id!)
    .order('created_at', { ascending: false }) as { data: RoundRow[] | null }

  const rounds: RoundRow[] = allRounds ?? []

  const enrichedRounds: SwitchableFlow[] = rounds.map(r => ({
    id:     r.id,
    name:   r.name ?? 'Unnamed IdeaFlow',
    status: getEffectiveRoundStatus({
      raw_status:      (r.status          ?? null) as 'draft' | 'active' | 'closed' | null,
      manual_override: (r.manual_override ?? null) as 'open'  | 'closed' | null,
      opens_at:        r.starts_at ?? null,
      closes_at:       r.ends_at   ?? null,
    }),
  }))

  // The "ranked" default — newest effectively active, else newest of any status.
  const defaultRound =
    enrichedRounds.find(r => r.status === 'active')
    ?? enrichedRounds[0]
    ?? null

  // Caller-supplied ?flow=<id> wins, but only if it's a real flow in this workspace.
  const params = await searchParams
  const requestedId = typeof params.flow === 'string' && params.flow ? params.flow : null
  const requestedRound = requestedId
    ? enrichedRounds.find(r => r.id === requestedId) ?? null
    : null
  const selectedRound: SwitchableFlow | null = requestedRound ?? defaultRound

  const currentRoundId = selectedRound?.id ?? null

  // ── Ideas scoped to the selected flow ────────────────────────────────────
  // When there is no flow at all, render the empty analytics view rather
  // than fall through to an unscoped query.
  const ideasQuery = supabase
    .from('ideas')
    .select('*, profiles(full_name)')
    .eq('company_id', profile.company_id!)
    .order('created_at', { ascending: false })

  const { data: ideas } = (await (
    currentRoundId
      ? (ideasQuery as any).eq('idea_round_id', currentRoundId)
      : (ideasQuery as any).eq('idea_round_id', 'no-round-configured')
  )) as unknown as { data: IdeaRow[] | null }

  const now = new Date()
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const dailyActivity: DailyPoint[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (6 - i))
    const isToday = i === 6
    const count = (ideas ?? []).filter((idea) => {
      const created = new Date(idea.created_at)
      return (
        created.getFullYear() === date.getFullYear() &&
        created.getMonth() === date.getMonth() &&
        created.getDate() === date.getDate()
      )
    }).length
    return { label: dayLabels[date.getDay()].slice(0, 2), count, isToday }
  })

  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const ideasThisWeek = (ideas ?? []).filter((idea) => new Date(idea.created_at) >= oneWeekAgo).length

  const countByUser: Record<string, { name: string; count: number }> = {}
  for (const idea of ideas ?? []) {
    const uid = idea.user_id
    const name = idea.profiles?.full_name || 'Anonymous'
    if (!countByUser[uid]) countByUser[uid] = { name, count: 0 }
    countByUser[uid].count++
  }

  const topContributors: Contributor[] = Object.values(countByUser)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const totalLikes = (ideas ?? []).reduce((sum, idea) => sum + (idea.likes_count ?? 0), 0)
  const activeMembers = Object.keys(countByUser).length

  const sortedByLikes = [...(ideas ?? [])].sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0))
  const topIdea =
    sortedByLikes.length > 0 && (sortedByLikes[0].likes_count ?? 0) > 0
      ? { title: sortedByLikes[0].title, likes: sortedByLikes[0].likes_count ?? 0 }
      : null

  return (
    <div>
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

            {/* ── Title block ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', minWidth: 0 }}>
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                  Management
                </p>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
                  Analytics
                </h1>
              </div>

              {/* Flow switcher — shown only when there is at least one flow */}
              {enrichedRounds.length > 0 && selectedRound && (
                <AnalyticsFlowSwitcher flows={enrichedRounds} currentId={selectedRound.id} />
              )}
            </div>

            {/* PDF export button — pro gated */}
            <DownloadReportButton isPro={isPro} />
          </div>
        </PageContainer>
      </div>
      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>

          {/* When there is no flow at all, surface a clear empty state instead
              of a panel full of zeroes. */}
          {!selectedRound ? (
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
              <p style={{ fontSize: '0.875rem', color: '#9ab0c8', lineHeight: 1.6, maxWidth: '22rem', margin: '0 auto' }}>
                Create an IdeaFlow from the dashboard, and analytics will populate as ideas come in.
              </p>
            </div>
          ) : (
            <AnalyticsPanel
              totalIdeas={(ideas ?? []).length}
              totalLikes={totalLikes}
              ideasThisWeek={ideasThisWeek}
              activeMembers={activeMembers}
              topContributors={topContributors}
              dailyActivity={dailyActivity}
              topIdea={topIdea}
            />
          )}
        </PageContainer>
      </main>
    </div>
  )
}
