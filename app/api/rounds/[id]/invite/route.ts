/**
 * POST /api/rounds/[id]/invite
 *
 * Generates a reusable flow-scoped invite link for this IdeaFlow.
 * Admin only. Rate-limited.
 *
 * Unlike workspace invites, flow invites:
 *  - are NOT single-use (used_at is never set on redemption)
 *  - add the redeemer to round_members only
 *  - do NOT change the user's workspace or profile
 *
 * Returns { code: string } — the caller constructs the full URL.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit }    from '@/lib/ratelimit'
import { requireRoundAdmin } from '@/lib/auth/guards'

type Params = { params: Promise<{ id: string }> }

// Unambiguous charset: no 0/O, 1/I confusion
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode(length = 8): string {
  return Array.from(
    { length },
    () => CHARSET[Math.floor(Math.random() * CHARSET.length)],
  ).join('')
}

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id: roundId } = await params

    const auth = await requireRoundAdmin(roundId)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { userId, profile } = auth.value

    // Rate limit: 10 flow invite generations per admin per minute
    const allowed = await checkRateLimit(`flow-invite:${userId}`, 60, 10)
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const admin = createAdminClient()

    // Generate a unique code (retry on collision — astronomically rare but safe)
    let code = generateCode()
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: existing } = await (admin as any)
        .from('invites')
        .select('id')
        .eq('invite_code', code)
        .maybeSingle()
      if (!existing) break
      code = generateCode()
    }

    const { data: invite, error: insertError } = await (admin as any)
      .from('invites')
      .insert({
        company_id:    profile.company_id,
        created_by:    userId,
        invite_code:   code,
        role:          'member',      // workspace role if used as workspace invite
        idea_round_id: roundId,
      })
      .select('invite_code')
      .single()

    if (insertError || !invite) {
      console.error('[POST /api/rounds/[id]/invite]', insertError)
      return NextResponse.json({ error: insertError?.message ?? 'Failed to create invite' }, { status: 500 })
    }

    return NextResponse.json({ code: invite.invite_code }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/rounds/[id]/invite]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
