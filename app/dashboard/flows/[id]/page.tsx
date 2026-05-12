/**
 * /dashboard/flows/[id]
 *
 * Per-flow detail page. Shows the flow icon + name, status badge, the
 * idea submission form (for active flows), the scoped idea list, and —
 * for admins — the FlowAdminPanel for editing / managing the flow.
 */

import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PageContainer     from '@/components/PageContainer'
import NewIdeaForm       from '@/components/NewIdeaForm'
import IdeaList          from '@/components/IdeaList'
import FlowAdminPanel    from '@/components/FlowAdminPanel'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'
import type { Database, Idea } from '@/types/database'
import type { SlimProfile } from '@/types/database'

export const dynamic = 'force-dynamic'

type IdeaJoinResult = Database['public']['Tables']['ideas']['Row'] & {
  profiles: { full_name: string | null } | null
}

type LikeResult = Pick<Database['public']['Tables']['likes']['Row'], 'idea_id'>

export default async function FlowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: roundId } = await params
  const supabase = await createClient()

  // ── Auth ────────────────────────────────────────────────────────────────────
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id, role, full_name')
    .eq('id', user.id)
    .single()) as unknown as { data: { company_id: string | null; role: string; full_name: string | null } | null }

  if (!profile?.company_id) redirect('/dashboard')

  const isAdmin = profile.role === 'admin'
  const admin   = createAdminClient()

  // ── Fetch the round ─────────────────────────────────────────────────────────
  const { data: round, error: roundError } = await (admin as any)
    .from('idea_rounds')
    .select('*')
    .eq('id', roundId)
    .eq('company_id', profile.company_id)
    .single()

  if (roundError || !round) redirect('/dashboard/flows')

  // ── Access check for non-admins ─────────────────────────────────────────────
  if (!isAdmin) {
    const { data: members } = await (admin as any)
      .from('round_members')
      .select('user_id')
      .eq('round_id', roundId)

    const memberList: { user_id: string }[] = members ?? []
    if (memberList.length > 0 && !memberList.some(m => m.user_id === user.id)) {
      redirect('/dashboard/flows')
    }
  }

  // ── Effective status ────────────────────────────────────────────────────────
  const effectiveStatus = getEffectiveRoundStatus({
    raw_status:      round.status      ?? null,
    manual_override: round.manual_override ?? null,
    opens_at:        round.starts_at   ?? null,
    closes_at:       round.ends_at     ?? null,
  })

  // ── Ideas (scoped to this round) ────────────────────────────────────────────
  let ideas: IdeaJoinResult[] = []
  if (effectiveStatus === 'active') {
    const { data: roundIdeas } = await (supabase as any)
      .from('ideas')
      .select('*, profiles(full_name)')
      .eq('company_id', profile.company_id)
      .eq('idea_round_id', roundId)
      .order('likes_count', { ascending: false })
      .order('created_at', { ascending: false })

    ideas = roundIdeas ?? []
  }

  // ── Likes ───────────────────────────────────────────────────────────────────
  let likedIds = new Set<string>()
  if (ideas.length > 0) {
    const { data: userLikes } = (await supabase
      .from('likes')
      .select('idea_id')
      .eq('user_id', user.id)) as unknown as { data: LikeResult[] | null }
    likedIds = new Set((userLikes ?? []).map(l => l.idea_id))
  }

  const ideasWithLikeStatus: Idea[] = ideas.map(idea => ({
    ...idea,
    profiles: idea.profiles ?? undefined,
    liked_by_user: likedIds.has(idea.id),
  }))

  // ── Admin data (company members + assigned member IDs) ──────────────────────
  let companyMembers: SlimProfile[] = []
  let assignedUserIds: string[]     = []

  if (isAdmin) {
    const [membersResult, assignedResult] = await Promise.all([
      (admin as any)
        .from('profiles')
        .select('id, full_name, role')
        .eq('company_id', profile.company_id)
        .order('full_name', { ascending: true }),
      (admin as any)
        .from('round_members')
        .select('user_id')
        .eq('round_id', roundId),
    ])
    companyMembers  = membersResult.data  ?? []
    assignedUserIds = (assignedResult.data ?? []).map((r: { user_id: string }) => r.user_id)
  }

  // ── Visual tokens ────────────────────────────────────────────────────────────
  const flowIcon  = round.icon  ?? '💡'
  const flowColor = round.color ?? '#f97316'
  const accentBg     = `${flowColor}14`   // ~8% tint
  const accentBorder = `${flowColor}38`   // ~22% tint

  const STATUS_META: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
    active: { label: 'Active',  bg: 'rgba(16,185,129,0.07)',   color: '#065f46', border: 'rgba(16,185,129,0.22)', dot: '#10b981' },
    draft:  { label: 'Draft',   bg: 'rgba(249,115,22,0.06)',   color: '#92400e', border: 'rgba(249,115,22,0.18)', dot: '#f97316' },
    closed: { label: 'Closed',  bg: 'rgba(0,0,0,0.04)',        color: '#475569', border: 'rgba(0,0,0,0.10)',      dot: '#94a3b8' },
  }
  const sm = STATUS_META[effectiveStatus] ?? STATUS_META.closed

  return (
    <div>
      {/* ── Sticky header ── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(26,107,191,0.09)',
        position: 'sticky', top: 0, zIndex: 9,
      }}>
        <PageContainer style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Flow icon */}
              <div style={{
                width: '2.5rem', height: '2.5rem', flexShrink: 0,
                borderRadius: '0.65rem',
                background: accentBg,
                border: `1px solid ${accentBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', lineHeight: 1,
              }}>
                {flowIcon}
              </div>

              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.15rem' }}>
                  IdeaFlows
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
                    {round.name || 'Unnamed IdeaFlow'}
                  </h1>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.65rem', fontWeight: 700,
                    background: sm.bg, color: sm.color,
                    border: `1px solid ${sm.border}`,
                    borderRadius: '999px',
                    padding: '0.18rem 0.55rem',
                    flexShrink: 0,
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sm.dot }} />
                    {sm.label}
                  </span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#9ab0c8', fontWeight: 500 }}>
              {ideasWithLikeStatus.length} idea{ideasWithLikeStatus.length !== 1 ? 's' : ''}
            </p>
          </div>
        </PageContainer>
      </div>

      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

          {/* ── Prompt banner ── */}
          {round.prompt && (
            <div style={{
              borderRadius: '0.875rem',
              border: `1px solid ${accentBorder}`,
              background: accentBg,
              padding: '0.875rem 1.125rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: flowColor, marginBottom: '0.2rem', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>
                Question
              </p>
              <p style={{ fontSize: '0.925rem', fontWeight: 600, color: '#0d1f35', lineHeight: 1.5 }}>
                {round.prompt}
              </p>
            </div>
          )}

          {/* ── Idea submission / browse area ── */}
          {effectiveStatus === 'active' ? (
            <>
              {ideasWithLikeStatus.length === 0 && (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid rgba(26,107,191,0.10)',
                  borderRadius: '1.25rem',
                  padding: '2.5rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 12px rgba(6,14,38,0.05)',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{
                    width: '3rem', height: '3rem', borderRadius: '0.875rem',
                    background: accentBg, border: `1px solid ${accentBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.25rem', fontSize: '1.35rem',
                  }}>
                    {flowIcon}
                  </div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                    No ideas yet
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#9ab0c8', lineHeight: 1.6, maxWidth: '22rem', margin: '0 auto' }}>
                    Be the first to share an idea for this IdeaFlow.
                  </p>
                </div>
              )}

              <div style={{
                borderRadius: '1.25rem',
                border: '1px solid rgba(26,107,191,0.11)',
                background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,255,1) 100%)',
                boxShadow: '0 6px 24px rgba(6,14,38,0.04)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}>
                <NewIdeaForm
                  userId={user.id}
                  companyId={profile.company_id}
                  isAdmin={isAdmin}
                  roundPrompt={round.prompt ?? null}
                  roundActive={true}
                  roundName={round.name ?? null}
                  defaultOpen={ideasWithLikeStatus.length === 0}
                  roundIsDraft={false}
                  roundId={roundId}
                />
              </div>

              <IdeaList
                ideas={ideasWithLikeStatus}
                currentUserId={user.id}
                companyId={profile.company_id}
                isAdmin={isAdmin}
              />
            </>
          ) : (
            /* ── Gate state ── */
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
                width: '3rem', height: '3rem', borderRadius: '0.875rem',
                background: accentBg, border: `1px solid ${accentBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem', fontSize: '1.35rem',
              }}>
                {flowIcon}
              </div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
                {effectiveStatus === 'draft' ? 'Coming soon' : 'IdeaFlow closed'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#9ab0c8', lineHeight: 1.6, maxWidth: '22rem', margin: '0 auto' }}>
                {effectiveStatus === 'draft'
                  ? 'This IdeaFlow is not yet open for submissions.'
                  : 'This IdeaFlow is no longer accepting ideas.'}
              </p>
            </div>
          )}

          {/* ── Admin panel ── */}
          {isAdmin && (
            <div style={{ marginTop: '2.5rem' }}>
              <FlowAdminPanel
                roundId={roundId}
                initialName={round.name ?? ''}
                initialPrompt={round.prompt ?? null}
                initialStatus={round.status ?? 'draft'}
                initialStartsAt={round.starts_at ?? null}
                initialEndsAt={round.ends_at ?? null}
                initialManualOverride={round.manual_override ?? null}
                effectiveStatus={effectiveStatus}
                companyMembers={companyMembers}
                assignedUserIds={assignedUserIds}
                initialIcon={round.icon ?? null}
                initialColor={round.color ?? null}
              />
            </div>
          )}

        </PageContainer>
      </main>
    </div>
  )
}
