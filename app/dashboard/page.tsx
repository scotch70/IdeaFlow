import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import IdeaList from '@/components/IdeaList'
import NewIdeaForm from '@/components/NewIdeaForm'
import type { Database, Idea } from '@/types/database'
import AnalyticsPanel from '@/components/AnalyticsPanel'
import type { DailyPoint, Contributor } from '@/components/AnalyticsPanel'
import UpgradePlans from '@/components/UpgradePlans'
import PageContainer from '@/components/PageContainer'
import IdeaRoundBanner from '@/components/IdeaRoundBanner'
import RoundGateCard from '@/components/RoundGateCard'
import WorkspaceMetrics from '@/components/WorkspaceMetrics'
import AISummaryCard from '@/components/AISummaryCard'
import WorkspacePulse from '@/components/WorkspacePulse'
import ActionRecommendations from '@/components/ActionRecommendations'
import OnboardingChecklist from '@/components/OnboardingChecklist'
import FlowTemplates from '@/components/FlowTemplates'
import ExecutiveReport from '@/components/ExecutiveReport'
import UpgradeCheckout from '@/components/UpgradeCheckout'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const { upgraded } = await searchParams
  const justUpgraded = upgraded === 'true'
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
    .select('id, name, status, prompt, manual_override, starts_at, ends_at')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false }) as {
    data: Array<{
      id: string; name: string | null; status: string | null;
      prompt: string | null; manual_override: string | null;
      starts_at: string | null; ends_at: string | null;
    }> | null
  }

  const rankedRound = (() => {
    const rounds = allRoundsForDash ?? []
    const activeRound = rounds.find(r =>
      getEffectiveRoundStatus({
        raw_status:      (r.status           ?? null) as 'draft' | 'active' | 'closed' | null,
        manual_override: (r.manual_override  ?? null) as 'open'  | 'closed' | null,
        opens_at:        r.starts_at ?? null,
        closes_at:       r.ends_at   ?? null,
      }) === 'active'
    )
    return activeRound ?? rounds[0] ?? null
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

      accessibleActiveFlowCount = activeRoundRows.filter(r => {
        const eff = getEffectiveRoundStatus({
          raw_status:      'active',
          manual_override: (r.manual_override ?? null) as 'open' | 'closed' | null,
          opens_at:        r.starts_at ?? null,
          closes_at:       r.ends_at   ?? null,
        })
        if (eff !== 'active') return false
        const assigned = memberSetMap[r.id] ?? []
        return assigned.length === 0 || assigned.includes(user.id)
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

  const firstName = profile.full_name?.split(' ')[0] ?? 'there'
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

  // ── Derived metrics for participation + AI cards ────────────────────────────
  const participationRate = Math.round((activeMembers / Math.max(memberCount, 1)) * 100)
  const avgLikesPerIdea =
    ideasWithLikeStatus.length > 0
      ? parseFloat((totalLikes / ideasWithLikeStatus.length).toFixed(1))
      : 0
  const isPaidPlan = company?.plan === 'standard' || company?.plan === 'pro' || company?.plan === 'pro_plus'
  const isProPlan  = company?.plan === 'pro'      || company?.plan === 'pro_plus'

  return (
    <main className="page-content-enter">
      <PageContainer className="dashboard-content-container">

        {/* ── Welcome header ── */}
        <div className="stagger-fade-1" style={{ marginBottom: 'clamp(1.75rem, 4vw, 2.75rem)', paddingTop: '0.5rem' }}>
          <h1
            style={{
              fontSize:      'clamp(1.5rem, 4vw, 2rem)',
              fontWeight:    800,
              color:         '#0d1f35',
              letterSpacing: '-0.03em',
              lineHeight:    1.1,
              marginBottom:  '0.4rem',
              fontFamily:    "'DM Sans', sans-serif",
            }}
          >
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#8b96a8', fontWeight: 400, lineHeight: 1.5 }}>
            Here&apos;s what&apos;s happening in your workspace
            {isProPlan ? <span style={{ color: '#c2540a', fontWeight: 600 }}> · Pro AI</span> : isPaidPlan ? <span style={{ color: '#f97316', fontWeight: 600 }}> · Standard</span> : null}.
          </p>
        </div>

        {/* ── Onboarding checklist (admin, fresh workspace) ── */}
        {profile.role === 'admin' && (memberCount <= 1 || effectiveStatus !== 'active' || ideasWithLikeStatus.length < 3) && (
          <OnboardingChecklist
            memberCount={memberCount}
            hasActiveFlow={effectiveStatus === 'active'}
            ideaCount={ideasWithLikeStatus.length}
            companyId={profile.company_id}
          />
        )}

        {/* ── Workspace participation metrics strip ── */}
        {ideasWithLikeStatus.length > 0 && (
          <WorkspaceMetrics
            participationRate={participationRate}
            ideasThisWeek={ideasThisWeek}
            totalIdeas={ideasWithLikeStatus.length}
            memberCount={memberCount}
            activeMembers={activeMembers}
            avgLikesPerIdea={avgLikesPerIdea}
          />
        )}

        {/* ── Workspace pulse (Pro-only live intelligence strip) ── */}
        <WorkspacePulse
          ideas={ideasWithLikeStatus}
          ideasThisWeek={ideasThisWeek}
          activeMembers={activeMembers}
          memberCount={memberCount}
          isProPlan={isProPlan}
        />

        {/* ── Just upgraded ── */}
        {justUpgraded && (company?.plan === 'pro' || company?.plan === 'standard') && (
          <div
            style={{
              marginBottom: '1.5rem',
              borderRadius: '0.875rem',
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1px solid rgba(16,185,129,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🎉</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#065f46' }}>
                You&apos;re on IdeaFlow {company.plan === 'standard' ? 'Standard' : 'Pro'}!
              </p>
              <p style={{ fontSize: '0.8rem', color: '#047857' }}>
                {company.plan === 'standard'
                  ? 'Up to 50 members · unlimited IdeaFlows · full analytics.'
                  : 'Up to 100 members · AI summaries · executive reports · PDF exports.'}
              </p>
            </div>
          </div>
        )}

        {/* ── Free plan upgrade banner (premium redesign) ── */}
        {company?.plan === 'free' && (
          <div className="free-plan-banner stagger-fade-2">
            {/* Left: headline + feature bullets */}
            <div className="free-plan-banner__left">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: '#b0bac8',
                  background: 'rgba(0,0,0,0.04)', borderRadius: '999px',
                  padding: '0.2rem 0.6rem', border: '1px solid rgba(0,0,0,0.07)',
                }}>
                  Free plan · {memberCount} / 10 members
                </span>
              </div>
              <p style={{
                fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)',
                fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em',
                lineHeight: 1.2, marginBottom: '0.4rem',
              }}>
                Unlock AI-powered team insights
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#5d667a', lineHeight: 1.6, marginBottom: '0.75rem', maxWidth: '26rem' }}>
                Generate executive summaries, trend analysis, PDF reports, and smart recommendations.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.75rem' }}>
                {['AI summaries', 'Executive PDF exports', 'Trend detection', 'Participation analytics'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#8b96a8' }}>
                    <span style={{ color: '#f97316', fontSize: '0.6rem' }}>✦</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: plan buttons — client component (onClick needs hydration) */}
            <UpgradeCheckout memberCount={memberCount} />
          </div>
        )}

        {/* ── Multi-flow switcher ── */}
        {accessibleActiveFlowCount > 1 && (
          <div
            style={{
              marginBottom: '1.5rem',
              borderRadius: '0.875rem',
              padding: '0.875rem 1.125rem',
              background: 'rgba(26,107,191,0.03)',
              border: '1px solid rgba(26,107,191,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0d1f35', marginBottom: '0.1rem' }}>
                You have access to {accessibleActiveFlowCount} active IdeaFlows
              </p>
              <p style={{ fontSize: '0.75rem', color: '#8b96a8' }}>
                This page shows one flow. Switch to see all of them.
              </p>
            </div>
            <a
              href="/dashboard/flows"
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                height: '2rem',
                padding: '0 0.875rem',
                borderRadius: '0.45rem',
                border: '1px solid rgba(26,107,191,0.18)',
                background: '#fff',
                fontSize: '0.775rem',
                fontWeight: 600,
                color: '#1a6bbf',
                textDecoration: 'none',
              }}
            >
              Switch IdeaFlow →
            </a>
          </div>
        )}

        {/* ── Idea round banner (all users: active / closed / expired / draft) ── */}
        {showRoundBanner && (
          <IdeaRoundBanner
            name={roundName}
            status={effectiveStatus ?? 'active'}
            endsAt={roundEndsAt}
            isAdmin={profile.role === 'admin'}
            companyId={profile.company_id}
            manualOverride={(roundManualOverride as 'open' | 'closed' | null) ?? undefined}
            ideaCount={ideasWithLikeStatus.length}
            memberCount={memberCount}
          />
        )}

        <section className="stagger-fade-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {effectiveStatus === 'active' ? (
            <>
              {/* ── Onboarding empty state ── */}
              {ideasWithLikeStatus.length === 0 && (
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: '1rem',
                    padding: '2.5rem 2rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '2.75rem',
                      height: '2.75rem',
                      borderRadius: '0.875rem',
                      background: 'rgba(249,115,22,0.07)',
                      border: '1px solid rgba(249,115,22,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      fontSize: '1.25rem',
                    }}
                  >
                    💡
                  </div>
                  <h2
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#0d1f35',
                      letterSpacing: '-0.02em',
                      marginBottom: '0.4rem',
                    }}
                  >
                    No ideas yet
                  </h2>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#8b96a8',
                      lineHeight: 1.65,
                      maxWidth: '22rem',
                      margin: '0 auto 1.75rem',
                    }}
                  >
                    The best ideas come from the people doing the work. Be the first to share one.
                  </p>
                  <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a
                      href="#new-idea-form"
                      className="btn-primary"
                      style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem', textDecoration: 'none' }}
                    >
                      Post your first idea →
                    </a>
                  </div>
                </div>
              )}

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

              <IdeaList
                ideas={ideasWithLikeStatus}
                currentUserId={user.id}
                companyId={profile.company_id}
                isAdmin={profile.role === 'admin'}
              />

              {/* ── AI Workspace Insights (Pro gate — teaser shown for Free/Standard) ── */}
              {ideasWithLikeStatus.length > 0 && (
                <AISummaryCard
                  ideas={ideasWithLikeStatus}
                  isProPlan={isProPlan}
                  roundName={roundName}
                  participationRate={participationRate}
                  memberCount={memberCount}
                  activeMembers={activeMembers}
                />
              )}

              {/* ── Executive insight report (Pro + 5+ ideas) ── */}
              <ExecutiveReport
                ideas={ideasWithLikeStatus}
                participationRate={participationRate}
                memberCount={memberCount}
                activeMembers={activeMembers}
                ideasThisWeek={ideasThisWeek}
                roundName={roundName}
                isProPlan={isProPlan}
              />

              {/* ── Action recommendations (Pro only) ── */}
              <ActionRecommendations
                ideas={ideasWithLikeStatus}
                participationRate={participationRate}
                memberCount={memberCount}
                activeMembers={activeMembers}
                isProPlan={isProPlan}
                roundName={roundName}
              />

            </>
          ) : (
            /* ── Gate card + optional template picker when round is not active ── */
            <>
              {rankedRound && effectiveStatus && (
                <RoundGateCard
                  status={effectiveStatus}
                  isAdmin={profile.role === 'admin'}
                  companyId={profile.company_id}
                  roundName={roundName}
                />
              )}
              {/* Show template launcher when admin has no flow configured at all */}
              {profile.role === 'admin' && !rankedRound && (
                <FlowTemplates companyId={profile.company_id} />
              )}
            </>
          )}
        </section>

        {/* id=analytics — sidebar "Analytics" link scrolls here */}
        <div
          className="stagger-fade-4"
          id="analytics"
          style={{
            marginTop: '2.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <AnalyticsPanel
            totalIdeas={ideasWithLikeStatus.length}
            totalLikes={totalLikes}
            ideasThisWeek={ideasThisWeek}
            activeMembers={activeMembers}
            topContributors={topContributors}
            dailyActivity={dailyActivity}
            topIdea={topIdea}
            heading="Workspace insights"
          />
        </div>
      </PageContainer>
    </main>
  )
}