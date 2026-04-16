import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

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
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    if (invite.used_at) {
      return NextResponse.json(
        { error: 'This invite has already been used' },
        { status: 400 }
      )
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite has expired' },
        { status: 400 }
      )
    }

    // Always use the role from the invite — never inherit any pre-existing role.
    // A profile may have been auto-created with role:'admin' by a Supabase trigger,
    // but that should never bleed through to an invited member.
    const nextRole = (invite.role as string) || 'member'

    // Use upsert so this works whether or not a profile row already exists.
    const { error: upsertProfileError } = await (supabase as any)
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

    if (upsertProfileError) {
      return NextResponse.json(
        { error: upsertProfileError.message },
        { status: 500 }
      )
    }

    const { error: markInviteError } = await (supabase as any)
  .from('invites')
  .update({
    used_at: new Date().toISOString(),
    joined_user_id: user.id,
  })
  .eq('id', invite.id)

    if (markInviteError) {
      return NextResponse.json(
        { error: markInviteError.message },
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