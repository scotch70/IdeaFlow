import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import IdeaList from '@/components/IdeaList'
import NewIdeaForm from '@/components/NewIdeaForm'
import type { Database, Idea } from '@/types/database'
import InviteMembers from '@/components/InviteMembers'
import TeamMembers from '@/components/TeamMembers'
import ActiveInvites from '@/components/ActiveInvites'
import AnalyticsPanel from '@/components/AnalyticsPanel'
import type { DailyPoint, Contributor } from '@/components/AnalyticsPanel'
import UpgradeButton from '@/components/UpgradeButton'
import ManagerQueue from '@/components/ManagerQueue'
import ImplementedIdeas from '@/components/ImplementedIdeas'
import PageContainer from '@/components/PageContainer'

type ProfileResult = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'company_id' | 'role'
>

type MemberResult = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'role'
>

type InviteResult = Database['public']['Tables']['invites']['Row']

type LikeResult = Pick<
  Database['public']['Tables']['likes']['Row'],
  'idea_id'
>

type IdeaJoinResult = Database['public']['Tables']['ideas']['Row'] & {
  profiles: { full_name: string | null } | null
}

type CompanyResult = Pick<
  Database['public']['Tables']['companies']['Row'],
  'plan' | 'trial_ends_at'
>

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string }
}) {
  const justUpgraded = searchParams.upgraded === 'true'
  const supabase = createClient()

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

  if (profileError || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-500">
        Could not load your profile yet. Please sign out and sign back in.
      </div>
    )
  }

  if (!profile.company_id) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-500">
        Setting up your workspace… please refresh in a moment.
      </div>
    )
  }

  const { data: members } = (await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: true })) as unknown as {
    data: MemberResult[] | null
  }

  const { data: invites } = (await supabase
    .from('invites')
    .select(
      'id, invite_code, role, used_at, created_at, name, email, expires_at, joined_user_id, profiles!invites_joined_user_id_fkey(full_name)'
    )
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false })) as unknown as {
    data: (InviteResult & {
      profiles?: { full_name: string | null } | null
    })[] | null
  }

  const { data: ideas } = (await supabase
    .from('ideas')
    .select('*, profiles(full_name)')
    .eq('company_id', profile.company_id)
    .order('likes_count', { ascending: false })
    .order('created_at', { ascending: false })) as unknown as {
    data: IdeaJoinResult[] | null
  }

  const { data: userLikes } = (await supabase
    .from('likes')
    .select('idea_id')
    .eq('user_id', user.id)) as unknown as {
    data: LikeResult[] | null
  }

  const likedIds = new Set((userLikes ?? []).map((like) => like.idea_id))

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

  const { data: company } = (await supabase
    .from('companies')
    .select('plan, trial_ends_at')
    .eq('id', profile.company_id)
    .single()) as unknown as {
    data: CompanyResult | null
  }

  const trialEndsAt = company?.trial_ends_at
  const trialDaysLeft = trialEndsAt
    ? Math.ceil(
        (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : 0

  const trialActive = company?.plan === 'free' && trialDaysLeft > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(26,107,191,0.09)',
        }}
      >
        <PageContainer style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#9ab0c8',
                  marginBottom: '0.3rem',
                }}
              >
                Dashboard
              </p>
              <h1
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 800,
                  color: '#0d1f35',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Welcome back, {firstName}
              </h1>
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: '#9ab0c8',
                fontWeight: 500,
              }}
            >
              {memberCount} member{memberCount !== 1 ? 's' : ''} ·{' '}
              {ideasWithLikeStatus.length} idea
              {ideasWithLikeStatus.length !== 1 ? 's' : ''}
            </p>
          </div>
        </PageContainer>
      </div>

      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          {justUpgraded && company?.plan === 'pro' && (
            <div
              style={{
                marginBottom: '1.5rem',
                borderRadius: '1rem',
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '1px solid rgba(16,185,129,0.30)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🎉</span>
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#065f46',
                  }}
                >
                  You&apos;re on IdeaFlow Pro!
                </p>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#047857',
                  }}
                >
                  Unlimited members, full feature access. Welcome to the team.
                </p>
              </div>
            </div>
          )}

          {company?.plan === 'free' && (
            <div
              style={{
                marginBottom: '1.5rem',
                borderRadius: '1rem',
                padding: '1rem 1.25rem',
                background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
                border: '1px solid rgba(249,115,22,0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {trialActive
                    ? `Free trial — ${trialDaysLeft} day${
                        trialDaysLeft !== 1 ? 's' : ''
                      } left`
                    : 'Free trial ended'}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#7c2d12' }}>
                  {memberCount} / 10 members used
                </p>
              </div>
              <UpgradeButton />
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <section className="space-y-6">

              {/* ── Onboarding empty state ── */}
              {ideasWithLikeStatus.length === 0 && (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid rgba(26,107,191,0.10)',
                  borderRadius: '1.25rem',
                  padding: '2.5rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 12px rgba(6,14,38,0.05)',
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
                  <h2 style={{
                    fontSize: '1.05rem', fontWeight: 800,
                    color: '#0d1f35', letterSpacing: '-0.02em',
                    marginBottom: '0.4rem',
                  }}>
                    No ideas yet
                  </h2>
                  <p style={{
                    fontSize: '0.875rem', color: '#9ab0c8',
                    lineHeight: 1.6, maxWidth: '22rem',
                    margin: '0 auto 1.75rem',
                  }}>
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
                    {profile.role === 'admin' && (
                      <a
                        href="#invite-team"
                        style={{
                          fontSize: '0.85rem', fontWeight: 600,
                          color: '#5a7fa8', textDecoration: 'none',
                          padding: '0.55rem 1.25rem',
                          border: '1px solid rgba(26,107,191,0.18)',
                          borderRadius: '0.5rem',
                        }}
                      >
                        Invite your team
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div
                id="new-idea-form"
                style={{
                  borderRadius: '1.25rem',
                  border: '1px solid rgba(26,107,191,0.11)',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,255,1) 100%)',
                  boxShadow: '0 6px 24px rgba(6,14,38,0.04)',
                  padding: '1.25rem',
                }}
              >
                <NewIdeaForm
                  userId={user.id}
                  companyId={profile.company_id}
                  isAdmin={profile.role === 'admin'}
                />
              </div>

              <IdeaList
                ideas={ideasWithLikeStatus}
                currentUserId={user.id}
                companyId={profile.company_id}
                isAdmin={profile.role === 'admin'}
              />
            </section>

            <aside className="space-y-6 self-start lg:sticky lg:top-24">
              {profile.role === 'admin' && (
                <ManagerQueue ideas={ideasWithLikeStatus} />
              )}

              <TeamMembers
                members={members ?? []}
                currentUserId={user.id}
                currentUserRole={profile.role}
              />

              {profile.role === 'admin' && (
                <ActiveInvites invites={invites ?? []} />
              )}

              {profile.role === 'admin' && (
                <div id="invite-team">
                  <InviteMembers />
                </div>
              )}
            </aside>
          </div>

          <div
            style={{
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--tint-border)',
            }}
          >
            <ImplementedIdeas ideas={ideasWithLikeStatus} />
          </div>

          <div
            style={{
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--tint-border)',
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
            />
          </div>
        </PageContainer>
      </main>
    </div>
  )
}