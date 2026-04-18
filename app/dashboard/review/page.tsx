import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database, Idea } from '@/types/database'
import ReviewClient from '@/components/ReviewClient'

// Supabase v2.44 inference workaround
type IdeaJoinResult = Database['public']['Tables']['ideas']['Row'] & {
  profiles: { full_name: string | null } | null
}

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

  // ── Fetch active ideas (exclude terminal statuses) sorted oldest first ────
  // This gives the review page a natural "inbox" feel — oldest unhandled
  // ideas rise to the top, newest at the bottom.
  const { data: rawIdeas } = (await supabase
    .from('ideas')
    .select('*, profiles(full_name)')
    .eq('company_id', profile.company_id)
    .in('status', ['open', 'under_review', 'planned', 'in_progress'])
    .order('created_at', { ascending: true })) as unknown as {
    data: IdeaJoinResult[] | null
  }

  const ideas: Idea[] = (rawIdeas ?? []).map((idea) => ({
    ...idea,
    profiles: idea.profiles ?? undefined,
  }))

  return <ReviewClient ideas={ideas} />
}
