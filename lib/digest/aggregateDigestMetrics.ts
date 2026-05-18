/**
 * aggregateDigestMetrics.ts
 *
 * Fetches all data needed for the weekly digest email for one company.
 * Extends getCompanyReportData with:
 *   - Prior-week comparison for trend deltas
 *   - Comment counts per idea
 *   - Participation rate calculation
 *   - Per-idea engagement detail for top ideas
 */

import { createAdminClient } from '@/lib/supabase/admin'

export interface DigestTopIdea {
  title:       string
  description: string | null
  author:      string
  likes:       number
  comments:    number
}

export interface DigestMetrics {
  // Company meta
  companyName: string
  plan:        string
  weekLabel:   string   // e.g. "12–18 May 2025"

  // This week vs last week
  ideasThisWeek:  number
  ideasLastWeek:  number
  ideaDelta:      number   // ideasThisWeek - ideasLastWeek

  likesThisWeek:  number
  likesLastWeek:  number
  likesDelta:     number

  // Totals (current round)
  totalIdeas:    number
  totalMembers:  number
  totalLikes:    number
  activeMembers: number   // posted ≥1 idea in current round
  participationRate: number  // activeMembers / totalMembers * 100 (0-100)
  avgLikesPerIdea:   string  // "1.4"

  // Top ideas (up to 3, ranked by likes)
  topIdeas: DigestTopIdea[]

  // Round context
  currentRoundName: string | null
  currentRoundId:   string | null
}

// ── Date window helpers ────────────────────────────────────────────────────────

function weekLabel(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(d)
  return `${fmt(start)}–${fmt(end)}`
}

// ── Main export ────────────────────────────────────────────────────────────────

export async function aggregateDigestMetrics(
  companyId: string,
): Promise<DigestMetrics> {
  const admin = createAdminClient()

  // ── Company ────────────────────────────────────────────────────────────────
  const { data: company } = await (admin as any)
    .from('companies')
    .select('name, plan, current_idea_round_id')
    .eq('id', companyId)
    .single()

  const currentRoundId: string | null = company?.current_idea_round_id ?? null

  // ── Round name ─────────────────────────────────────────────────────────────
  let currentRoundName: string | null = null
  if (currentRoundId) {
    const { data: round } = await (admin as any)
      .from('idea_rounds')
      .select('name')
      .eq('id', currentRoundId)
      .single()
    currentRoundName = round?.name ?? null
  }

  // ── Members ────────────────────────────────────────────────────────────────
  const { count: totalMembers } = await (admin as any)
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  // ── Ideas (current round) ──────────────────────────────────────────────────
  let ideasQuery = (admin as any)
    .from('ideas')
    .select('id, title, description, status, likes_count, created_at, user_id, profiles(full_name)')
    .eq('company_id', companyId)
    .order('likes_count', { ascending: false })
    .order('created_at', { ascending: false })

  if (currentRoundId) {
    ideasQuery = ideasQuery.eq('idea_round_id', currentRoundId)
  } else {
    ideasQuery = ideasQuery.eq('idea_round_id', 'no-round-configured')
  }

  const { data: ideasRaw } = await ideasQuery

  type IdeaRow = {
    id:          string
    title:       string
    description: string | null
    status:      string
    likes_count: number
    created_at:  string
    user_id:     string
    profiles:    { full_name: string | null } | null
  }

  const ideas: IdeaRow[] = ideasRaw ?? []

  // ── Time windows ──────────────────────────────────────────────────────────
  const now          = new Date()
  const thisWeekStart = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000)
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // ── Per-week idea counts ──────────────────────────────────────────────────
  const ideasThisWeek = ideas.filter(
    i => new Date(i.created_at) >= thisWeekStart,
  ).length

  const ideasLastWeek = ideas.filter(
    i => new Date(i.created_at) >= lastWeekStart && new Date(i.created_at) < thisWeekStart,
  ).length

  // ── Likes this week (from ideas created this week) ────────────────────────
  // Approximation: we don't track per-like timestamps yet; sum likes on
  // ideas *created* in each window. Good enough for trend signalling.
  const likesThisWeek = ideas
    .filter(i => new Date(i.created_at) >= thisWeekStart)
    .reduce((s, i) => s + (i.likes_count ?? 0), 0)

  const likesLastWeek = ideas
    .filter(
      i => new Date(i.created_at) >= lastWeekStart && new Date(i.created_at) < thisWeekStart,
    )
    .reduce((s, i) => s + (i.likes_count ?? 0), 0)

  // ── Comment counts per idea ───────────────────────────────────────────────
  // Fetch all comments for ideas in this round in one query
  const ideaIds = ideas.map(i => i.id)

  type CommentRow = { idea_id: string }
  let commentsByIdea: Map<string, number> = new Map()

  if (ideaIds.length > 0) {
    const { data: comments } = await (admin as any)
      .from('comments')
      .select('idea_id')
      .in('idea_id', ideaIds)

    for (const c of (comments ?? []) as CommentRow[]) {
      commentsByIdea.set(c.idea_id, (commentsByIdea.get(c.idea_id) ?? 0) + 1)
    }
  }

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalLikes   = ideas.reduce((s, i) => s + (i.likes_count ?? 0), 0)
  const activeMembers = new Set(ideas.map(i => i.user_id)).size
  const participationRate =
    (totalMembers ?? 0) > 0
      ? Math.round((activeMembers / (totalMembers ?? 1)) * 100)
      : 0
  const avgLikesPerIdea =
    ideas.length > 0 ? (totalLikes / ideas.length).toFixed(1) : '0'

  // ── Top ideas ─────────────────────────────────────────────────────────────
  const topIdeas: DigestTopIdea[] = ideas.slice(0, 3).map(idea => ({
    title:       idea.title,
    description: idea.description,
    author:      idea.profiles?.full_name || 'Unknown',
    likes:       idea.likes_count ?? 0,
    comments:    commentsByIdea.get(idea.id) ?? 0,
  }))

  return {
    companyName: company?.name ?? 'Your Company',
    plan:        company?.plan  ?? 'free',
    weekLabel:   weekLabel(thisWeekStart, now),

    ideasThisWeek,
    ideasLastWeek,
    ideaDelta:    ideasThisWeek - ideasLastWeek,

    likesThisWeek,
    likesLastWeek,
    likesDelta:   likesThisWeek - likesLastWeek,

    totalIdeas:        ideas.length,
    totalMembers:      totalMembers ?? 0,
    totalLikes,
    activeMembers,
    participationRate,
    avgLikesPerIdea,

    topIdeas,
    currentRoundName,
    currentRoundId,
  }
}
