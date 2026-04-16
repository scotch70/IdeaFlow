import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/invites/preview?code=XXX
 *
 * No authentication required. Returns only the email and invitee name
 * associated with a given invite code so the join page can detect an
 * account mismatch before the user submits anything.
 *
 * Invite codes are already secrets — returning the recipient email to
 * whoever holds the code is intentional and safe.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code?.trim()) {
    return NextResponse.json({ error: 'Code required' }, { status: 400 })
  }

  const supabase = createClient()

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
