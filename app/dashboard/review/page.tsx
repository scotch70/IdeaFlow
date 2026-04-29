import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database, Idea } from '@/types/database'
import ReviewClient from '@/components/ReviewClient'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'

// Supabase v2.44 inference workaround
type IdeaJoinResult = Database['public']['Tables']['ideas']['Row'] & {
  profiles: { full_name: string | null } | null
}

type RoundDataResult = Pick<
  Database['public']['Tables']['companies']['Row'],
  'idea_round_status' | 'idea_round_starts_at' | 'idea_round_ends_at' | 'idea_round_manual_override' | 'current_idea_round_id'
>

export const dynamic = 'force-dynamic'

export default async function ReviewPage() {
  const supabase = await createClient()

  // ── Auth ──────────────────────────────────────────────────────────────────
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) redirect('/auth')

  // ── Profile + role check ──────────────────────────────────────────────────
  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id, role, full_name')
    .eq('id', user.id)
    .single()) as unknown as {
    data: { company_id: string | null; role: string; full_name: string | null } | null
  }

  if (!profile?.company_id) redirect('/dashboard')
  // Non-admins cannot access this page
  if (profile.role !== 'admin') redirect('/dashboard')

  // ── Round data (fetched before ideas to scope the query) ──────────────────
  const { data: roundData } = (await supabase
    .from('companies')
    .select('idea_round_status, idea_round_starts_at, idea_round_ends_at, idea_round_manual_override, current_idea_round_id')
    .eq('id', profile.company_id)
    .single()) as unknown as { data: RoundDataResult | null }

  const effectiveStatus = getEffectiveRoundStatus({
    raw_status:      roundData?.idea_round_status          ?? null,
    manual_override: roundData?.idea_round_manual_override ?? null,
    opens_at:        roundData?.idea_round_starts_at       ?? null,
    closes_at:       roundData?.idea_round_ends_at         ?? null,
  })

  const currentRoundId = roundData?.current_idea_round_id ?? null

  // ── Fetch ideas — always scoped to current round ──────────────────────────
  // Never show ideas from old/closed rounds. If there is no current round,
  // return an empty list rather than spilling unrelated submissions.
  // Excludes terminal statuses (implemented / declined) to keep inbox clean.
  let rawIdeas: IdeaJoinResult[] | null = null

  if (currentRoundId) {
    const { data } = (await (supabase as any)
      .from('ideas')
      .select('*, profiles(full_name)')
      .eq('company_id', profile.company_id)
      .eq('idea_round_id', currentRoundId)
      .in('status', ['open', 'under_review', 'planned', 'in_progress'])
      .order('created_at', { ascending: true })) as unknown as {
      data: IdeaJoinResult[] | null
    }
    rawIdeas = data
  }

  const ideas: Idea[] = (rawIdeas ?? []).map((idea) => ({
    ...idea,
    profiles: idea.profiles ?? undefined,
  }))

  return <ReviewClient ideas={ideas} />
}
