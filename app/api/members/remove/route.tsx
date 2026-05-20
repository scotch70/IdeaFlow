/**
 * POST /api/members/remove
 *
 * Removes a workspace member.
 * The user's auth account is NOT deleted — we only sever the workspace link
 * by nulling profiles.company_id. Their existing round_members rows are
 * cascaded by the DB (FK on profiles → no cascade on company_id, but the
 * user is detached from the workspace, so the Members page hides them).
 *
 * Admin only. Admins cannot remove themselves or other admins.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireWorkspaceAdmin } from '@/lib/auth/guards'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireWorkspaceAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { userId: adminUserId, profile: adminProfile } = auth.value

    const { memberId } = await request.json()
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    if (memberId === adminUserId) {
      return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 })
    }

    // ── Verify target member exists and belongs to the same company ───────────
    // Use admin client: `profiles` RLS restricts cross-user reads otherwise.
    const adminClient = createAdminClient()

    const { data: memberProfile, error: memberError } = await (adminClient as any)
      .from('profiles')
      .select('id, role, company_id')
      .eq('id', memberId)
      .single() as { data: { id: string; role: string; company_id: string | null } | null; error: unknown }

    if (memberError || !memberProfile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (memberProfile.company_id !== adminProfile.company_id) {
      return NextResponse.json({ error: 'Member is not in your company' }, { status: 403 })
    }

    if (memberProfile.role === 'admin') {
      return NextResponse.json({ error: 'You cannot remove another admin' }, { status: 400 })
    }

    // ── Detach from workspace ─────────────────────────────────────────────────
    // The SSR client's UPDATE is blocked by profiles RLS (owner-only). The
    // admin (service-role) client bypasses RLS. We also clean up the user's
    // round_members rows so the Members overview doesn't show ghost flow
    // associations for someone who is no longer in the workspace.
    const { error: updateError } = await (adminClient as any)
      .from('profiles')
      .update({ company_id: null, role: 'member' })
      .eq('id', memberId)
      .eq('company_id', adminProfile.company_id)

    if (updateError) {
      console.error('[remove member] update failed', updateError.message)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await (adminClient as any)
      .from('round_members')
      .delete()
      .eq('company_id', adminProfile.company_id)
      .eq('user_id', memberId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[remove member] crash', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 },
    )
  }
}
