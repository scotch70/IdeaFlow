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


// Supabase's select-string type inference can return `never` for partial column
// lists in v2.44. We define explicit result shapes here instead.
type ProfileResult   = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'company_id' | 'role'>
type MemberResult    = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'role'>
type InviteResult    = Database['public']['Tables']['invites']['Row']
type LikeResult      = Pick<Database['public']['Tables']['likes']['Row'], 'idea_id'>
type IdeaJoinResult  = Database['public']['Tables']['ideas']['Row'] & {profiles: { full_name: string | null } | null}
type CompanyResult = Pick<Database['public']['Tables']['companies']['Row'],'plan' | 'trial_ends_at'>

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

  

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, company_id, role')
    .eq('id', user.id)
    .single() as unknown as { data: ProfileResult | null; error: Error | null }

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

  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: true }) as unknown as { data: MemberResult[] | null }

  const { data: invites } = await supabase
  .from('invites')
  .select('id, invite_code, role, used_at, created_at, name, email, expires_at, joined_user_id, profiles!invites_joined_user_id_fkey(full_name)')
  .eq('company_id', profile.company_id)
  .order('created_at', { ascending: false }) as unknown as {
    data: (InviteResult & { profiles?: { full_name: string | null } | null })[] | null
  }

  const { data: ideas } = await supabase
    .from('ideas')
    .select('*, profiles(full_name)')
    .eq('company_id', profile.company_id)
    .order('likes_count', { ascending: false })
    .order('created_at', { ascending: false }) as unknown as { data: IdeaJoinResult[] | null }

  const { data: userLikes } = await supabase
    .from('likes')
    .select('idea_id')
    .eq('user_id', user.id) as unknown as { data: LikeResult[] | null }

  const likedIds = new Set((userLikes ?? []).map((l) => l.idea_id))

  const ideasWithLikeStatus: Idea[] = (ideas ?? []).map((idea) => ({
    ...idea,
    profiles: idea.profiles ?? undefined,
    liked_by_user: likedIds.has(idea.id),
  }))

  const firstName = profile.full_name?.split(' ')[0] ?? 'there'
  const totalLikes = ideasWithLikeStatus.reduce((sum, idea) => sum + (idea.likes_count ?? 0), 0)

  // ── Analytics ─────────────────────────────────────────────────────────────

  // Daily activity — last 7 days
  const now = new Date()
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dailyActivity: DailyPoint[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (6 - i))
    const isToday = i === 6
    const count = (ideas ?? []).filter((idea) => {
      const d = new Date(idea.created_at)
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      )
    }).length
    return { label: DAY_LABELS[date.getDay()].slice(0, 2), count, isToday }
  })

  // Ideas this week
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const ideasThisWeek = (ideas ?? []).filter(
    (idea) => new Date(idea.created_at) >= oneWeekAgo
  ).length

  // Top contributors — group by user, count ideas
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

  // Top liked idea
  const topIdea =
    ideasWithLikeStatus.length > 0 && (ideasWithLikeStatus[0].likes_count ?? 0) > 0
      ? { title: ideasWithLikeStatus[0].title, likes: ideasWithLikeStatus[0].likes_count }
      : null

  const { data: company } = await supabase
  .from('companies')
  .select('plan, trial_ends_at')
  .eq('id', profile.company_id)
  .single() as unknown as { data: CompanyResult | null }

  const memberCount = members?.length ?? 0

const trialEndsAt = company?.trial_ends_at
const trialDaysLeft = trialEndsAt
  ? Math.ceil(
      (new Date(trialEndsAt).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )
  : 0

const trialActive = company?.plan === 'free' && trialDaysLeft > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>

      {/* Welcome header strip */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(26,107,191,0.09)',
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.3rem' }}>
                Dashboard
              </p>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Welcome back, {firstName}
              </h1>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ab0c8', fontWeight: 500 }}>
              {memberCount} member{memberCount !== 1 ? 's' : ''} · {ideasWithLikeStatus.length} idea{ideasWithLikeStatus.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">

  {/* 🚀 Billing banner */}
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
        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#065f46' }}>
          You&apos;re on IdeaFlow Pro!
        </p>
        <p style={{ fontSize: '0.8rem', color: '#047857' }}>
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
            ? `Free trial — ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left`
            : 'Free trial ended'}
        </p>
        <p style={{ fontSize: '0.8rem', color: '#7c2d12' }}>
          {memberCount} / 10 members used
        </p>
      </div>
      <UpgradeButton />
    </div>
  )}

  {/* Existing grid */}
  <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          {/* Main column */}
          <section className="space-y-6">
            {profile.role === 'admin' && <InviteMembers />}

            <NewIdeaForm userId={user.id} companyId={profile.company_id} />

            <IdeaList
              ideas={ideasWithLikeStatus}
              currentUserId={user.id}
              companyId={profile.company_id}
              isAdmin={profile.role === 'admin'}
            />
          </section>

          {/* Sidebar */}
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
          </aside>
        </div>

        {/* Implemented ideas — full width, below grid */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--tint-border)' }}>
          <ImplementedIdeas ideas={ideasWithLikeStatus} />
        </div>

        {/* Analytics — full width below the grid */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--tint-border)' }}>
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
      </main>
    </div>
  )
}