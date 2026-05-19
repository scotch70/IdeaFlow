/**
 * /dashboard/flows/[id]
 *
 * Per-flow detail page. Two-column layout for admins:
 *   left  (~60%): ideas content
 *   right (~40%): sticky admin panel
 *
 * Members see a single-column layout with the idea list only.
 */

import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PageContainer     from '@/components/PageContainer'
import NewIdeaForm       from '@/components/NewIdeaForm'
import IdeaList          from '@/components/IdeaList'
import FlowAdminPanel    from '@/components/FlowAdminPanel'
import type { FlowInvite } from '@/components/FlowAdminPanel'
import FlowWorkspaceClient from '@/components/FlowWorkspaceClient'
import type { AccessibleFlow } from '@/components/FlowWorkspaceClient'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'
import type { Database, Idea } from '@/types/database'
import type { SlimProfile } from '@/types/database'
import Link from 'next/link'

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

  // ── Auth ─────────────────────────────────────────────────────────────────
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

  // ── Fetch round ──────────────────────────────────────────────────────────
  const { data: round, error: roundError } = await (admin as any)
    .from('idea_rounds')
    .select('*')
    .eq('id', roundId)
    .eq('company_id', profile.company_id)
    .single()

  if (roundError || !round) redirect('/dashboard/flows')

  // ── Access check for non-admins ──────────────────────────────────────────
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

  // ── Effective status ─────────────────────────────────────────────────────
  const effectiveStatus = getEffectiveRoundStatus({
    raw_status:      round.status      ?? null,
    manual_override: round.manual_override ?? null,
    opens_at:        round.starts_at   ?? null,
    closes_at:       round.ends_at     ?? null,
  })

  // ── Ideas ─────────────────────────────────────────────────────────────────
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

  // ── Likes ─────────────────────────────────────────────────────────────────
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

  // ── Admin data ────────────────────────────────────────────────────────────
  let companyMembers: SlimProfile[] = []
  let assignedUserIds: string[]     = []
  let flowInvites: FlowInvite[]     = []

  if (isAdmin) {
    const [membersResult, assignedResult, invitesResult] = await Promise.all([
      (admin as any)
        .from('profiles')
        .select('id, full_name, role')
        .eq('company_id', profile.company_id)
        .order('full_name', { ascending: true }),
      (admin as any)
        .from('round_members')
        .select('user_id')
        .eq('round_id', roundId),
      (admin as any)
        .from('invites')
        .select('id, name, email, invite_code, used_at, expires_at, created_at, profiles!invites_joined_user_id_fkey(full_name)')
        .eq('company_id', profile.company_id)
        .eq('idea_round_id', roundId)
        .order('created_at', { ascending: false }),
    ])
    companyMembers  = membersResult.data  ?? []
    assignedUserIds = (assignedResult.data ?? []).map((r: { user_id: string }) => r.user_id)
    flowInvites     = invitesResult.data  ?? []
  }

  // ── Accessible flows (for member workspace nav) ───────────────────────────
  // Fetch all active/draft rounds for this company to populate the left nav.
  // Members who click a restricted round they can't access will be redirected
  // by that page's own access check — safe to show all here.
  let accessibleFlows: AccessibleFlow[] = []
  if (!isAdmin) {
    const { data: allRounds } = await (admin as any)
      .from('idea_rounds')
      .select('id, name, status, manual_override, starts_at, ends_at')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })

    const rounds: Array<{
      id: string; name: string | null;
      status: string | null; manual_override: string | null;
      starts_at: string | null; ends_at: string | null;
    }> = allRounds ?? []

    accessibleFlows = rounds
      .map(r => {
        const eff = getEffectiveRoundStatus({
          raw_status:      (r.status      ?? null) as 'draft' | 'active' | 'closed' | null,
          manual_override: (r.manual_override ?? null) as 'open' | 'closed' | null,
          opens_at:        r.starts_at   ?? null,
          closes_at:       r.ends_at     ?? null,
        })
        return { id: r.id, name: r.name ?? 'Unnamed IdeaFlow', status: eff }
      })
      .filter(r => r.status !== 'closed')
  }

  // ── Status badge ──────────────────────────────────────────────────────────
  const STATUS_META: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
    active: { label: 'Active',  bg: 'rgba(16,185,129,0.07)',   color: '#065f46', border: 'rgba(16,185,129,0.22)', dot: '#10b981' },
    draft:  { label: 'Draft',   bg: 'rgba(249,115,22,0.06)',   color: '#92400e', border: 'rgba(249,115,22,0.18)', dot: '#f97316' },
    closed: { label: 'Closed',  bg: 'rgba(0,0,0,0.04)',        color: '#475569', border: 'rgba(0,0,0,0.10)',      dot: '#94a3b8' },
  }
  const sm = STATUS_META[effectiveStatus] ?? STATUS_META.closed

  // ── New idea form (reused in both views) ─────────────────────────────────
  const newIdeaForm = (
    <NewIdeaForm
      userId={user.id}
      companyId={profile.company_id}
      isAdmin={isAdmin}
      roundPrompt={round.prompt ?? null}
      roundActive={effectiveStatus === 'active'}
      roundName={round.name ?? null}
      defaultOpen={ideasWithLikeStatus.length === 0}
      roundIsDraft={effectiveStatus === 'draft'}
      roundId={roundId}
    />
  )

  return (
    <div className="page-content-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* ── Sticky header ───────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(26,107,191,0.09)',
        flexShrink: 0,
      }}>
        <PageContainer style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.3rem' }}>
            <Link
              href="/dashboard/flows"
              style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8', textDecoration: 'none' }}
            >
              IdeaFlows
            </Link>
            <span style={{ fontSize: '0.75rem', color: '#c8d6e5' }}>/</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
              {round.name || 'Unnamed IdeaFlow'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Title + badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.025em', lineHeight: 1 }}>
                {round.name || 'Unnamed IdeaFlow'}
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.28rem',
                fontSize: '0.65rem', fontWeight: 700,
                background: sm.bg, color: sm.color,
                border: `1px solid ${sm.border}`,
                borderRadius: '999px',
                padding: '0.2rem 0.55rem',
                flexShrink: 0,
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sm.dot }} />
                {sm.label}
              </span>
            </div>

            {/* Metadata */}
            <p style={{ fontSize: '0.775rem', color: '#94a3b8', fontWeight: 500 }}>
              {ideasWithLikeStatus.length} idea{ideasWithLikeStatus.length !== 1 ? 's' : ''}
              {round.ends_at && effectiveStatus !== 'closed' && (
                <> · closes {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(round.ends_at))}</>
              )}
            </p>
          </div>
        </PageContainer>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      {isAdmin ? (
        /* ── Admin: two-column layout ─────────────────────────────────── */
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <PageContainer style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 380px',
              gap: '3rem',
              alignItems: 'start',
            }}>

              {/* Left: content */}
              <div>
                {/* Prompt banner */}
                {round.prompt && (
                  <div style={{
                    borderRadius: '0.875rem',
                    border: '1px solid rgba(26,107,191,0.12)',
                    background: 'rgba(240,245,255,0.6)',
                    padding: '0.875rem 1.125rem',
                    marginBottom: '1.5rem',
                  }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9ab0c8', marginBottom: '0.2rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Question
                    </p>
                    <p style={{ fontSize: '0.925rem', fontWeight: 600, color: '#0d1f35', lineHeight: 1.5 }}>
                      {round.prompt}
                    </p>
                  </div>
                )}

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
                      background: 'linear-gradient(180deg, #ffffff 0%, rgba(248,250,255,1) 100%)',
                      boxShadow: '0 6px 24px rgba(6,14,38,0.04)',
                      padding: '1.25rem',
                      marginBottom: '1.5rem',
                    }}>
                      {newIdeaForm}
                    </div>

                    <IdeaList
                      ideas={ideasWithLikeStatus}
                      currentUserId={user.id}
                      companyId={profile.company_id}
                      isAdmin={isAdmin}
                    />
                  </>
                ) : (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid rgba(26,107,191,0.10)',
                    borderRadius: '1.25rem',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 2px 12px rgba(6,14,38,0.05)',
                    maxWidth: '32rem',
                  }}>
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
              </div>

              {/* Right: admin panel (sticky) */}
              <div style={{ position: 'sticky', top: 'calc(4rem + 1px)' }}>
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
                  flowInvites={flowInvites}
                />
              </div>

            </div>
          </PageContainer>
        </main>
      ) : (
        /* ── Member: three-column workspace ───────────────────────────── */
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <FlowWorkspaceClient
            ideas={ideasWithLikeStatus}
            accessibleFlows={accessibleFlows}
            currentFlowId={roundId}
            userId={user.id}
            companyId={profile.company_id}
            isAdmin={false}
            prompt={round.prompt ?? null}
            effectiveStatus={effectiveStatus}
            newIdeaForm={newIdeaForm}
          />
        </div>
      )}
    </div>
  )
}
