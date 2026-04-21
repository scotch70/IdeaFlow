import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/invites/preview?code=XXX
 *
 * Returns the email and invitee name associated with a given invite code so
 * the join page can detect an account mismatch before the user submits.
 *
 * Authentication is required: an unauthenticated endpoint acting as a
 * code-validity oracle makes invite codes enumerable even when they are
 * cryptographically strong.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code?.trim()) {
    return NextResponse.json({ error: 'Code required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Reject unauthenticated callers. The join page only calls this after the
  // user has a session, so legitimate flows are unaffected.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: invite, error } = await (supabase as any)
    .from('invites')
    .select('email, name')
    .eq('invite_code', code.trim().toUpperCase())
    .single()

  if (error || !invite) {
    // Return 404 but don't leak whether the code exists or not in the message
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    email: invite.email || null,
    inviteeName: invite.name || null,
  })
}
