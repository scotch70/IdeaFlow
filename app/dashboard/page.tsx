import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import IdeaList from '@/components/IdeaList'
import NewIdeaForm from '@/components/NewIdeaForm'
import type { Database, Idea } from '@/types/database'
import AnalyticsPanel from '@/components/AnalyticsPanel'
import type { DailyPoint, Contributor } from '@/components/AnalyticsPanel'
import PageContainer from '@/components/PageContainer'
import IdeaRoundBanner from '@/components/IdeaRoundBanner'
import RoundGateCard from '@/components/RoundGateCard'
import FlowTemplates from '@/components/FlowTemplates'
import AnalyticsSummaryLink from '@/components/AnalyticsSummaryLink'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'
import { isRoundAccessible } from '@/lib/auth/guards'

type ProfileResult = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'company_id' | 'role'
>

type LikeResult = Pick<
  Database['public']['Tables']['likes']['Row'],
  'idea_id'
>

type IdeaJoinResult = Database['public']['Tables']['ideas']['Row'] & {
  profiles: { full_name: string | null } | null
}

// Core billing data — always exists; never depends on optional migrations.
type CompanyResult = Pick<
  Database['public']['Tables']['companies']['Row'],
  'plan' | 'trial_ends_at'
>


export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth')
  }

  const { data: profile, error: profileError } = (await supabase
    .from('profiles')
    .select('id, full_name, company_id, role')
    .eq('id', user.id)
    .single()) as unknown as {
    data: ProfileResult | null
    error: Error | null
  }

  // Admins who created a workspace have company_name in user_metadata.
  // Invited members do not — sending them to /api/onboard causes a sign-out loop
  // because /api/onboard checks for company_name and signs out anyone who lacks it.
  const isWorkspaceCreator = !!(user.user_metadata?.company_name as string | undefined)?.trim()

  // Profile missing or no company_id:
  // • Admins  → /api/onboard creates the company + profile idempotently
  // • Members → /join-workspace: auto-attaches by pending invite or shows the
  //             invite-code / create-workspace form — never a loop
  if (profileError || !profile) {
    redirect(isWorkspaceCreator ? '/api/onboard' : '/join-workspace')
  }

  if (!profile.company_id) {
    redirect(isWorkspaceCreator ? '/api/onboard' : '/join-workspace')
  }

  // Parallelise the two independent company-scoped queries.
  const [
    { data: members },
    { data: company },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: true }) as unknown as Promise<{
      data: { id: string; full_name: string | null; role: string }[] | null
    }>,
    // Billing query — always reliable; never includes optional migrated columns.
    supabase
      .from('companies')
      .select('plan, trial_ends_at')
      .eq('id', profile.company_id)
      .single() as unknown as Promise<{ data: CompanyResult | null }>,
  ])

  const adminClient = createAdminClient()

  // ── Select the best current IdeaFlow ─────────────────────────────────────
  // Query idea_rounds directly so the dashboard always reflects the newest
  // state — the old companies.current_idea_round_id pointer is NOT updated
  // when a new flow is created, so relying on it caused stale data.
  //
  // Priority:
  //   1. The most recently created round that is *effectively* active
  //      (manual_override / schedule applied)
  //   2. Fall back to the most recently created round of any status
  const { data: allRoundsForDash } = await (adminClient as any)
    .from('idea_rounds')
    .select('id, name, status, prompt, manual_override, starts_at, ends_at, audience_mode')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false }) as {
    data: Array<{
      id: string; name: string | null; status: string | null;
      prompt: string | null; manual_override: string | null;
      starts_at: string | null; ends_at: string | null;
      audience_mode: 'workspace' | 'restricted' | null;
    }> | null
  }

  // ── Round selection ──────────────────────────────────────────────────────
  // `allRoundsForDash` is already ordered by created_at DESC.
  //
  //   1. Newest *effectively* active round (manual_override / schedule applied).
  //   2. Otherwise the newest round of any status (draft or closed).
  //   3. Otherwise null — workspace has no rounds at all.
  const allRounds = allRoundsForDash ?? []
  const hasAnyRounds = allRounds.length > 0

  const rankedRound = (() => {
    if (!hasAnyRounds) return null
    const activeRound = allRounds.find(r =>
      getEffectiveRoundStatus({
        raw_status:      (r.status           ?? null) as 'draft' | 'active' | 'closed' | null,
        manual_override: (r.manual_override  ?? null) as 'open'  | 'closed' | null,
        opens_at:        r.starts_at ?? null,
        closes_at:       r.ends_at   ?? null,
      }) === 'active'
    )
    return activeRound ?? allRounds[0] ?? null
  })()

  // ── Vars derived from the selected round ─────────────────────────────────
  const currentRoundId      = rankedRound?.id              ?? null
  const roundPrompt         = rankedRound?.prompt          ?? null
  const roundName           = rankedRound?.name            ?? null
  const roundEndsAt         = rankedRound?.ends_at         ?? null
  const roundManualOverride = rankedRound?.manual_override ?? null

  const effectiveStatus = rankedRound
    ? getEffectiveRoundStatus({
        raw_status:      (rankedRound.status          ?? null) as 'draft' | 'active' | 'closed' | null,
        manual_override: (rankedRound.manual_override ?? null) as 'open'  | 'closed' | null,
        opens_at:        rankedRound.starts_at ?? null,
        closes_at:       rankedRound.ends_at   ?? null,
      })
    : null

  // ── Count accessible active flows ────────────────────────────────────────
  // Drives the "Switch IdeaFlow" card when the user can access > 1 active flow.
  // Reuses allRoundsForDash (already fetched) to avoid an extra DB round-trip.
  let accessibleActiveFlowCount = 0
  {
    const activeRoundRows = (allRoundsForDash ?? []).filter(r => r.status === 'active')
    const activeIds: string[] = activeRoundRows.map(r => r.id)
    if (activeIds.length > 0) {
      const { data: memberRows } = await (adminClient as any)
        .from('round_members')
        .select('round_id, user_id')
        .in('round_id', activeIds)

      const memberSetMap: Record<string, string[]> = {}
      for (const row of memberRows ?? []) {
        if (!memberSetMap[row.round_id]) memberSetMap[row.round_id] = []
        memberSetMap[row.round_id].push(row.user_id)
      }

      const isCallerAdmin = profile.role === 'admin'
      accessibleActiveFlowCount = activeRoundRows.filter(r => {
        const eff = getEffectiveRoundStatus({
          raw_status:      'active',
          manual_override: (r.manual_override ?? null) as 'open' | 'closed' | null,
          opens_at:        r.starts_at ?? null,
          closes_at:       r.ends_at   ?? null,
        })
        if (eff !== 'active') return false
        return isRoundAccessible({
          userId: user.id,
          isAdmin: isCallerAdmin,
          round: { id: r.id, audience_mode: r.audience_mode ?? null },
          assignedUserIds: memberSetMap[r.id] ?? [],
        })
      }).length
    }
  }


  // ── Ideas — only fetch when there is an active round with a valid ID ───────
  // No active round → empty list. Never show legacy/unscoped ideas.
  let ideas: IdeaJoinResult[] = []
  if (effectiveStatus === 'active' && currentRoundId) {
    const { data: roundIdeas } = (await (supabase as any)
      .from('ideas')
      .select('*, profiles(full_name)')
      .eq('company_id', profile.company_id)
      .eq('idea_round_id', currentRoundId)
      .order('likes_count', { ascending: false })
      .order('created_at', { ascending: false })) as unknown as {
      data: IdeaJoinResult[] | null
    }
    ideas = roundIdeas ?? []
  }

  // Only fetch likes when there are ideas to decorate.
  let likedIds = new Set<string>()
  if (ideas.length > 0) {
    const { data: userLikes } = (await supabase
      .from('likes')
      .select('idea_id')
      .eq('user_id', user.id)) as unknown as {
      data: LikeResult[] | null
    }
    likedIds = new Set((userLikes ?? []).map((like) => like.idea_id))
  }

  const ideasWithLikeStatus: Idea[] = (ideas ?? []).map((idea) => ({
    ...idea,
    profiles: idea.profiles ?? undefined,
    liked_by_user: likedIds.has(idea.id),
  }))

  const memberCount = members?.length ?? 0
  const totalLikes = ideasWithLikeStatus.reduce(
    (sum, idea) => sum + (idea.likes_count ?? 0),
    0
  )

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

    return {
      label: dayLabels[date.getDay()].slice(0, 2),
      count,
      isToday,
    }
  })

  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const ideasThisWeek = (ideas ?? []).filter(
    (idea) => new Date(idea.created_at) >= oneWeekAgo
  ).length

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

  const activeMembers = Object.keys(countByUser).length

  const topIdea =
    ideasWithLikeStatus.length > 0 &&
    (ideasWithLikeStatus[0].likes_count ?? 0) > 0
      ? {
          title: ideasWithLikeStatus[0].title,
          likes: ideasWithLikeStatus[0].likes_count,
        }
      : null

  const showRoundBanner = rankedRound !== null

  return (
    <main className="page-content-enter">
      <PageContainer>

        {/* ── IdeaFlow status banner ── */}
        {showRoundBanner && (
          <IdeaRoundBanner
            name={roundName}
            status={effectiveStatus ?? 'active'}
            endsAt={roundEndsAt}
            isAdmin={profile.role === 'admin'}
            companyId={profile.company_id}
            roundId={currentRoundId ?? undefined}
            manualOverride={(roundManualOverride as 'open' | 'closed' | null) ?? undefined}
            ideaCount={ideasWithLikeStatus.length}
            memberCount={memberCount}
          />
        )}

        {/* ── Multiple flows: subtle nav hint ── */}
        {accessibleActiveFlowCount > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <a
              href="/dashboard/flows"
              style={{ fontSize: '0.775rem', fontWeight: 600, color: '#1a6bbf', textDecoration: 'none' }}
            >
              {accessibleActiveFlowCount} active IdeaFlows · Switch →
            </a>
          </div>
        )}

        {/* ── Core: centered idea feed ── */}
        <div style={{ maxWidth: '700px', margin: '0 auto', paddingTop: showRoundBanner ? '0' : '1rem' }}>

          {effectiveStatus === 'active' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* New idea form */}
              <div
                id="new-idea-form"
                style={{
                  borderRadius: '0.875rem',
                  border: '1px solid rgba(0,0,0,0.07)',
                  background: '#ffffff',
                  padding: '1.25rem',
                }}
              >
                <NewIdeaForm
                  userId={user.id}
                  companyId={profile.company_id}
                  isAdmin={profile.role === 'admin'}
                  roundPrompt={roundPrompt}
                  roundActive={true}
                  roundName={roundName}
                  defaultOpen={ideasWithLikeStatus.length === 0}
                  roundIsDraft={false}
                />
              </div>

              {/* Idea list */}
              <IdeaList
                ideas={ideasWithLikeStatus}
                currentUserId={user.id}
                companyId={profile.company_id}
                isAdmin={profile.role === 'admin'}
              />

            </div>
          ) : (
            /* ── Inactive ── */
            /* If at least one round exists (draft / closed / inactive) show the
             * gate card explaining the current state. The template launcher is
             * ONLY shown when the workspace has zero rounds at all — driven by
             * `hasAnyRounds` above so the condition is explicit and matches the
             * audit (no longer relying on the truthiness of rankedRound alone). */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {rankedRound && effectiveStatus && (
                <RoundGateCard
                  status={effectiveStatus}
                  isAdmin={profile.role === 'admin'}
                  companyId={profile.company_id}
                  roundName={roundName}
                />
              )}
              {profile.role === 'admin' && !hasAnyRounds && (
                <FlowTemplates companyId={profile.company_id} />
              )}
            </div>
          )}

        </div>

        {/* ── Analytics (collapsible) ── */}
        <details
          style={{
            marginTop: '2.5rem',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <summary
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 0',
              cursor: 'pointer',
              userSelect: 'none',
              listStyle: 'none',
              WebkitAppearance: 'none',
            }}
          >
            <span style={{
              fontSize: '0.6rem',
              color: '#94a3b8',
              display: 'inline-block',
              transition: 'transform 0.15s ease',
            }}>▶</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
              Analytics overview
            </span>
            <AnalyticsSummaryLink />
          </summary>

          <div style={{ paddingBottom: '2rem' }}>
            <AnalyticsPanel
              totalIdeas={ideasWithLikeStatus.length}
              totalLikes={totalLikes}
              ideasThisWeek={ideasThisWeek}
              activeMembers={activeMembers}
              topContributors={topContributors}
              dailyActivity={dailyActivity}
              topIdea={topIdea}
              heading=""
            />
          </div>
        </details>

      </PageContainer>
    </main>
  )
}