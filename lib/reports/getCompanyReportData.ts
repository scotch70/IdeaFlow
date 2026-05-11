/**
 * getCompanyReportData
 *
 * Shared server-side helper that fetches all data needed for:
 *   - The Pro PDF / print report  (/api/reports/summary)
 *   - Future weekly admin digest emails
 *
 * Must be called from a server context (API route, Server Component).
 * Uses the service-role admin client so RLS never blocks the aggregation.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export interface TopIdea {
  title: string
  description: string | null
  status: string
  likes_count: number
  author: string
}

export interface CompanyReportData {
  companyName: string
  plan: string
  reportDate: string          // ISO date string, formatted by caller
  totalIdeas: number
  totalMembers: number
  totalLikes: number
  ideasThisWeek: number
  activeMembers: number       // members who have posted ≥1 idea
  topIdeas: TopIdea[]         // top 3 by likes_count
  avgLikesPerIdea: string     // formatted "1.4"
}

export async function getCompanyReportData(companyId: string): Promise<CompanyReportData> {
  const admin = createAdminClient()

  // ── Company ──────────────────────────────────────────────────────────────
  // Also fetch current_idea_round_id so ideas can be scoped to the active round,
  // matching exactly what the dashboard renders (no orphaned / old-round rows).
  const { data: company } = await (admin as any)
    .from('companies')
    .select('name, plan, current_idea_round_id')
    .eq('id', companyId)
    .single()

  const currentRoundId: string | null = company?.current_idea_round_id ?? null

  // ── Members ───────────────────────────────────────────────────────────────
  const { count: totalMembers } = await (admin as any)
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  // ── Ideas + author names ───────────────────────────────────────────────────
  // Scope to the current round only — same logic as the dashboard.
  // If there is no active round the report shows no ideas (not old/orphaned rows).
  let ideasQuery = (admin as any)
    .from('ideas')
    .select('id, title, description, status, likes_count, created_at, user_id, profiles(full_name)')
    .eq('company_id', companyId)
    .order('likes_count', { ascending: false })
    .order('created_at', { ascending: false })

  if (currentRoundId) {
    ideasQuery = ideasQuery.eq('idea_round_id', currentRoundId)
  } else {
    // No round configured — exclude everything so stale rows never appear.
    ideasQuery = ideasQuery.eq('idea_round_id', 'no-round-configured')
  }

  const { data: ideas } = await ideasQuery

  console.log('[report ideas]', (ideas ?? []).map((i: { id: string; title: string; idea_round_id: string | null }) => ({
    id: i.id,
    title: i.title,
    round: i.idea_round_id,
  })))

  const ideasArr: Array<{
    id: string
    title: string
    description: string | null
    status: string
    likes_count: number
    created_at: string
    user_id: string
    profiles: { full_name: string | null } | null
  }> = ideas ?? []

  const totalLikes = ideasArr.reduce((sum, i) => sum + (i.likes_count ?? 0), 0)

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const ideasThisWeek = ideasArr.filter(i => new Date(i.created_at) >= oneWeekAgo).length

  const uniquePosters = new Set(ideasArr.map(i => i.user_id))
  const activeMembers = uniquePosters.size

  const topIdeas: TopIdea[] = ideasArr.slice(0, 3).map(idea => ({
    title: idea.title,
    description: idea.description,
    status: idea.status,
    likes_count: idea.likes_count ?? 0,
    author: idea.profiles?.full_name || 'Unknown',
  }))

  const avgLikesPerIdea =
    ideasArr.length > 0 ? (totalLikes / ideasArr.length).toFixed(1) : '0'

  return {
    companyName: company?.name ?? 'Your Company',
    plan: company?.plan ?? 'free',
    reportDate: new Date().toISOString(),
    totalIdeas: ideasArr.length,
    totalMembers: totalMembers ?? 0,
    totalLikes,
    ideasThisWeek,
    activeMembers,
    topIdeas,
    avgLikesPerIdea,
  }
}
