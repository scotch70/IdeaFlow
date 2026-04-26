import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import IdeaList from '@/components/IdeaList'
import NewIdeaForm from '@/components/NewIdeaForm'
import PageContainer from '@/components/PageContainer'
import type { Idea } from '@/types/database'
import type { Database } from '@/types/database'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'

type IdeaJoinResult = Database['public']['Tables']['ideas']['Row'] & {
  profiles: { full_name: string | null } | null
}

type CompanyResult = Pick<
  Database['public']['Tables']['companies']['Row'],
  'plan' | 'trial_ends_at' | 'custom_idea_prompt'
>

type RoundDataResult = Pick<
  Database['public']['Tables']['companies']['Row'],
  'idea_round_name' | 'idea_round_status' | 'idea_round_starts_at' | 'idea_round_ends_at' | 'idea_round_manual_override'
>

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Ideas — IdeaFlow' }

export default async function IdeasPage() {
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

  // ── Ideas ─────────────────────────────────────────────────────────────────
  const { data: ideas } = (await supabase
    .from('ideas')
    .select('*, profiles(full_name)')
    .eq('company_id', profile.company_id)
    .order('likes_count', { ascending: false })
    .order('created_at', { ascending: false })) as unknown as {
    data: IdeaJoinResult[] | null
  }

  // ── User's own likes (for heart toggle state) ──────────────────────────────
  const { data: userLikes } = await supabase
    .from('likes')
    .select('idea_id')
    .eq('user_id', user.id)

  const likedIds = new Set((userLikes ?? []).map((l) => (l as { idea_id: string }).idea_id))

  const ideasWithLikeStatus: Idea[] = (ideas ?? []).map((idea) => ({
    ...idea,
    profiles: idea.profiles ?? undefined,
    liked_by_user: likedIds.has(idea.id),
  }))

  // ── Company (billing + custom prompt) ─────────────────────────────────────
  const { data: company } = (await supabase
    .from('companies')
    .select('plan, trial_ends_at, custom_idea_prompt')
    .eq('id', profile.company_id)
    .single()) as unknown as { data: CompanyResult | null }

  // ── Round data ─────────────────────────────────────────────────────────────
  const { data: roundData } = (await supabase
    .from('companies')
    .select('idea_round_name, idea_round_status, idea_round_starts_at, idea_round_ends_at, idea_round_manual_override')
    .eq('id', profile.company_id)
    .single()) as unknown as { data: RoundDataResult | null }

  const roundStatus         = roundData?.idea_round_status          ?? null
  const roundEndsAt         = roundData?.idea_round_ends_at         ?? null
  const roundManualOverride = roundData?.idea_round_manual_override ?? null

  const effectiveStatus = getEffectiveRoundStatus({
    raw_status:      roundStatus,
    manual_override: roundManualOverride,
    opens_at:        roundData?.idea_round_starts_at ?? null,
    closes_at:       roundEndsAt,
  })

  const isRoundActive = effectiveStatus === 'active'

  const totalIdeas = ideasWithLikeStatus.length

  return (
    <div>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                Workspace
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Ideas
              </h1>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#9ab0c8', fontWeight: 500 }}>
              {totalIdeas} idea{totalIdeas !== 1 ? 's' : ''}
            </p>
          </div>
        </PageContainer>
      </div>

      <main>
        <PageContainer style={{ paddingTop: '1.75rem', paddingBottom: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ── New idea form ── */}
            <div
              style={{
                borderRadius: '1.25rem',
                border: '1px solid rgba(26,107,191,0.11)',
                background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,255,1) 100%)',
                boxShadow: '0 6px 24px rgba(6,14,38,0.04)',
                padding: '1.25rem',
              }}
            >
              <NewIdeaForm
                userId={user.id}
                companyId={profile.company_id}
                isAdmin={profile.role === 'admin'}
                customPrompt={company?.custom_idea_prompt ?? null}
                roundActive={isRoundActive}
                roundName={roundData?.idea_round_name ?? null}
                defaultOpen={totalIdeas === 0}
                roundIsDraft={effectiveStatus === 'draft'}
              />
            </div>

            {/* ── Idea list with filters ── */}
            <IdeaList
              ideas={ideasWithLikeStatus}
              currentUserId={user.id}
              companyId={profile.company_id}
              isAdmin={profile.role === 'admin'}
            />
          </div>
        </PageContainer>
      </main>
    </div>
  )
}
