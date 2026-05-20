/**
 * GET /api/rounds/[id]/delete-preview
 *
 * Returns the counts of data that would be removed if the admin proceeds
 * with deleting this IdeaFlow. Used to populate the inline confirmation
 * card so admins know exactly what they are about to lose.
 *
 * User accounts (profiles / auth.users) are NEVER affected by flow deletion
 * and are NOT included in the preview.
 *
 * Admin only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRoundAdmin } from '@/lib/auth/guards'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const auth = await requireRoundAdmin(id)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const admin = createAdminClient()

    // Fetch ideas for this round so we can count their dependants (comments,
    // likes) without a server-side aggregation.
    const { data: ideaRows } = await (admin as any)
      .from('ideas')
      .select('id')
      .eq('idea_round_id', id) as { data: { id: string }[] | null }

    const ideaIds = (ideaRows ?? []).map(r => r.id)

    const [commentsResult, likesResult, invitesResult, membersResult] = await Promise.all([
      ideaIds.length > 0
        ? (admin as any).from('comments').select('*', { count: 'exact', head: true }).in('idea_id', ideaIds)
        : Promise.resolve({ count: 0 }),
      ideaIds.length > 0
        ? (admin as any).from('likes').select('*', { count: 'exact', head: true }).in('idea_id', ideaIds)
        : Promise.resolve({ count: 0 }),
      (admin as any).from('invites').select('*', { count: 'exact', head: true }).eq('idea_round_id', id),
      (admin as any).from('round_members').select('*', { count: 'exact', head: true }).eq('round_id', id),
    ]) as Array<{ count: number | null }>

    return NextResponse.json({
      ideas:    ideaIds.length,
      comments: commentsResult.count ?? 0,
      likes:    likesResult.count    ?? 0,
      invites:  invitesResult.count  ?? 0,
      members:  membersResult.count  ?? 0,
    })
  } catch (err) {
    console.error('[GET /api/rounds/[id]/delete-preview]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
