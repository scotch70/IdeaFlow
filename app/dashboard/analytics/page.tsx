import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnalyticsPanel from '@/components/AnalyticsPanel'
import type { DailyPoint, Contributor } from '@/components/AnalyticsPanel'
import PageContainer from '@/components/PageContainer'
import DownloadReportButton from '@/components/DownloadReportButton'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Analytics — IdeaFlow' }

type IdeaRow = {
  created_at: string
  user_id: string
  likes_count: number | null
  title: string
  profiles: { full_name: string | null } | null
}

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()) as unknown as { data: { company_id: string | null; role: string } | null }

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const { data: ideas } = (await supabase
    .from('ideas')
    .select('*, profiles(full_name)')
    .eq('company_id', profile.company_id!)
    .order('created_at', { ascending: false })) as unknown as { data: IdeaRow[] | null }

  // Fetch plan for the PDF export button gating
  const { data: company } = (await supabase
    .from('companies')
    .select('plan')
    .eq('id', profile.company_id!)
    .single()) as unknown as { data: { plan: string } | null }

  const isPro = company?.plan === 'pro'

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                Management
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
                Analytics
              </h1>
            </div>
            {/* PDF export button — pro gated */}
            <DownloadReportButton isPro={isPro} />
          </div>
        </PageContainer>
      </div>
      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <AnalyticsPanel
            totalIdeas={(ideas ?? []).length}
            totalLikes={totalLikes}
            ideasThisWeek={ideasThisWeek}
            activeMembers={activeMembers}
            topContributors={topContributors}
            dailyActivity={dailyActivity}
            topIdea={topIdea}
          />
        </PageContainer>
      </main>
    </div>
  )
}
