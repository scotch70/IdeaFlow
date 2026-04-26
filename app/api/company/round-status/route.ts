/**
 * PATCH /api/company/round-status
 *
 * Sets or clears the manual_override on the current user's company's idea round.
 *
 * Body: { "action": "open" | "close" | "clear" }
 *   open  → idea_round_manual_override = 'open'   (always active, ignores dates)
 *   close → idea_round_manual_override = 'closed' (always closed, ignores dates)
 *   clear → idea_round_manual_override = null      (schedule / dates take control)
 *
 * Auth: required. Role: admin only.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Action = 'open' | 'close' | 'clear'

export async function PATCH(request: NextRequest) {
  try {
    // ── 1. Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 2. Parse body ──────────────────────────────────────────────────────────
    const { action } = (await request.json()) as { action: unknown }

    const VALID_ACTIONS: Action[] = ['open', 'close', 'clear']
    if (typeof action !== 'string' || !VALID_ACTIONS.includes(action as Action)) {
      return NextResponse.json(
        { error: 'action must be "open", "close", or "clear"' },
        { status: 400 }
      )
    }

    // ── 3. Authorise — admin only ──────────────────────────────────────────────
    const { data: profile } = (await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()) as unknown as {
      data: { company_id: string | null; role: string } | null
    }

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admins only' }, { status: 403 })
    }

    // ── 4. Map action → DB value ───────────────────────────────────────────────
    const overrideValue: 'open' | 'closed' | null =
      action === 'open'  ? 'open'  :
      action === 'close' ? 'closed' :
      null   // 'clear'

    // ── 5. Persist via admin client ────────────────────────────────────────────
    const adminClient = createAdminClient()
    const { data: updated, error: updateError } = await (adminClient as any)
      .from('companies')
      .update({ idea_round_manual_override: overrideValue })
      .eq('id', profile.company_id)
      .select('id, idea_round_name, idea_round_status, idea_round_starts_at, idea_round_ends_at, idea_round_manual_override')
      .single()

    if (updateError) {
      console.error('[round-status PATCH]', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, round: updated })
  } catch (err) {
    console.error('[api/company/round-status]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
