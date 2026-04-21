import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canAddMembers } from '@/lib/billing'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const { inviteCode, fullName } = await request.json()

    if (!inviteCode?.trim()) {
      return NextResponse.json({ error: 'Invite code required' }, { status: 400 })
    }

    if (!fullName?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data: invite, error: inviteError } = await (supabase as any)
      .from('invites')
      .select('*')
      .eq('invite_code', inviteCode.trim())
      .single()

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid invite code', errorCode: 'INVITE_INVALID' },
        { status: 404 }
      )
    }

    if (invite.used_at) {
      return NextResponse.json(
        { error: 'This invite has already been used', errorCode: 'INVITE_USED' },
        { status: 400 }
      )
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite has expired', errorCode: 'INVITE_EXPIRED' },
        { status: 400 }
      )
    }

    // Guard: a corrupt invite row with no company_id would put the user
    // in a workspace-less state — catch it explicitly before writing anything.
    if (!invite.company_id) {
      return NextResponse.json(
        { error: 'Invalid invite — no workspace attached', errorCode: 'INVITE_INVALID' },
        { status: 400 }
      )
    }

    // ── Fetch the user's existing profile ──────────────────────────────────
    // maybeSingle() returns null cleanly when no row exists yet (new user).
    // We need this to enforce two invariants before touching anything:
    //   1. Users cannot silently switch workspaces.
    //   2. Admins cannot demote themselves by consuming a member invite.
    const { data: existingProfile } = await (supabase as any)
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .maybeSingle()

    const existingCompanyId = existingProfile?.company_id ?? null
    const existingRole      = existingProfile?.role       ?? null

    // ── Cross-company guard ─────────────────────────────────────────────────
    // If the user already belongs to a different company, reject immediately.
    // Neither the profile nor the invite are touched — the invite remains
    // reusable by its intended recipient.
    if (existingCompanyId && existingCompanyId !== invite.company_id) {
      return NextResponse.json(
        {
          error: 'You already belong to a different workspace. Contact your admin if you need to switch.',
          errorCode: 'ALREADY_IN_COMPANY',
        },
        { status: 403 },
      )
    }

    // ── Resolve role ────────────────────────────────────────────────────────
    // Preserve 'admin' if the user is already an admin of this same company.
    // All generated invites have role:'member', so without this an admin
    // consuming their own invite would silently lose admin access.
    const isSameCompany = existingCompanyId === invite.company_id
    const nextRole = (isSameCompany && existingRole === 'admin')
      ? 'admin'
      : ((invite.role as string) || 'member')

    // ── Seat-limit check ───────────────────────────────────────────────────
    // Checked at join time (not just at invite-creation time) so that stale
    // invites and parallel invite-creation races cannot push a workspace over
    // its member cap.
    const { data: joinCompany, error: joinCompanyError } = await (supabase as any)
      .from('companies')
      .select('plan, trial_ends_at')
      .eq('id', invite.company_id)
      .single()

    if (joinCompanyError || !joinCompany) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const { count: currentMemberCount, error: countError } = await (supabase as any)
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', invite.company_id)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // Only enforce for users who aren't already in this company — re-joining
    // members (e.g. an admin consuming their own invite) don't add a new seat.
    const isNewMember = !isSameCompany
    if (isNewMember && !canAddMembers({
      plan: joinCompany.plan,
      trialEndsAt: joinCompany.trial_ends_at,
      memberCount: currentMemberCount ?? 0,
    })) {
      return NextResponse.json(
        { error: 'This workspace has reached its member limit. Ask your admin to upgrade.' },
        { status: 403 },
      )
    }

    // ── Atomic invite claim ─────────────────────────────────────────────────
    // Replace the two-step read-then-mark with a single conditional UPDATE.
    // PostgreSQL acquires a row lock for the duration of the UPDATE, so two
    // concurrent requests are serialised: exactly one will get a row back.
    // The .is('used_at', null) predicate means a second concurrent request
    // that passes the earlier used_at check above still loses here — it finds
    // used_at already set and returns null, triggering INVITE_USED.
    const { data: claimedInvite, error: claimError } = await (supabase as any)
      .from('invites')
      .update({
        used_at: new Date().toISOString(),
        joined_user_id: user.id,
      })
      .eq('id', invite.id)
      .is('used_at', null)
      .select('id')
      .maybeSingle()

    if (claimError) {
      return NextResponse.json({ error: claimError.message }, { status: 500 })
    }

    if (!claimedInvite) {
      // Another request claimed the invite between our initial read and now.
      return NextResponse.json(
        { error: 'This invite has already been used', errorCode: 'INVITE_USED' },
        { status: 400 },
      )
    }

    // ── Upsert profile ──────────────────────────────────────────────────────
    // Invite is already marked used above. If this write fails the invite is
    // consumed but the profile isn't updated — log the error so it's visible
    // for manual recovery. We use .select('id').single() to catch silent
    // RLS-blocked writes (error:null, data:null) the same as explicit errors.
    const { data: upsertedProfile, error: upsertProfileError } = await (supabase as any)
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: fullName.trim(),
          company_id: invite.company_id,
          role: nextRole,
        },
        { onConflict: 'id' }
      )
      .select('id')
      .single()

    if (upsertProfileError || !upsertedProfile) {
      console.error('[api/join] profile upsert failed after invite claimed:', upsertProfileError?.message)
      return NextResponse.json(
        { error: upsertProfileError?.message ?? 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Something went wrong',
      },
      { status: 500 }
    )
  }
}