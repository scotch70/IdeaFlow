import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // SSR client — used only for auth + validation reads (subject to RLS)
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { memberId } = await request.json()

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // ── Verify caller is an admin ─────────────────────────────────────────────
    const { data: adminProfile, error: adminError } = await (supabase as any)
      .from('profiles')
      .select('id, role, company_id')
      .eq('id', user.id)
      .single()

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: 'Admin profile not found' }, { status: 404 })
    }

    if (adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 })
    }

    if (memberId === user.id) {
      return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 })
    }

    // ── Verify target member exists and belongs to the same company ───────────
    // Use admin client here: `profiles` RLS may restrict cross-user SELECT
    // depending on policy; the admin client (service role) always bypasses RLS.
    const adminClient = createAdminClient()

    const { data: memberProfile, error: memberError } = await (adminClient as any)
      .from('profiles')
      .select('id, role, company_id')
      .eq('id', memberId)
      .single()

    console.log('[remove member]', {
      adminUserId:    user.id,
      targetUserId:   memberId,
      adminCompanyId: adminProfile?.company_id,
      memberProfile,
      memberError:    memberError?.message ?? null,
    })

    if (memberError || !memberProfile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (memberProfile.company_id !== adminProfile.company_id) {
      return NextResponse.json({ error: 'Member is not in your company' }, { status: 403 })
    }

    if (memberProfile.role === 'admin') {
      return NextResponse.json({ error: 'You cannot remove another admin' }, { status: 400 })
    }

    // ── Nullify company_id via admin client (bypasses RLS) ───────────────────
    // The SSR client's UPDATE is blocked by RLS on profiles:
    //   the policy only allows a row's owner (auth.uid() = id) to UPDATE it.
    // Using the service-role admin client bypasses this restriction entirely.
    const { error: updateError } = await (adminClient as any)
      .from('profiles')
      .update({ company_id: null, role: 'member' })
      .eq('id', memberId)
      .eq('company_id', adminProfile.company_id) // extra safety: only affect own-company rows

    if (updateError) {
      console.error('[remove member] update failed', updateError.message)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[remove member] crash', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 },
    )
  }
}