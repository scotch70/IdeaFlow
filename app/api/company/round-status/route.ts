/**
 * PATCH /api/company/round-status
 *
 * Sets or clears the manual_override on the current user's company's idea round.
 *
 * Body: { "action": "open" | "close" | "clear" }
 *   open  → idea_round_manual_override = 'open'   (always active, ignores dates)
 *           Creates a new idea_rounds row and sets current_idea_round_id if none exists.
 *   close → idea_round_manual_override = 'closed' (always closed, ignores dates)
 *           Marks the current round as closed, clears current_idea_round_id.
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

    const adminClient = createAdminClient()

    // ── 4. Fetch current company state ─────────────────────────────────────────
    const { data: company, error: companyError } = await (adminClient as any)
      .from('companies')
      .select('idea_round_name, idea_round_status, current_idea_round_id')
      .eq('id', profile.company_id)
      .single()

    if (companyError) {
      console.error('[round-status PATCH] company fetch:', companyError)
      return NextResponse.json({ error: companyError.message }, { status: 500 })
    }

    // ── 5. Handle each action ──────────────────────────────────────────────────

    if (action === 'open') {
      // Ensure there is an active idea_rounds row. If the company already has a
      // current_idea_round_id, just flip the override and status — the round ID
      // stays the same (no new round is created for a force-open).
      let roundId: string = company?.current_idea_round_id

      if (!roundId) {
        // No active round — create one now so ideas have somewhere to attach.
        const roundName = company?.idea_round_name ?? 'IdeaFlow'
        const { data: newRound, error: insertError } = await (adminClient as any)
          .from('idea_rounds')
          .insert({ company_id: profile.company_id, name: roundName, status: 'active' })
          .select('id')
          .single()

        if (insertError) {
          console.error('[round-status PATCH] idea_rounds insert:', insertError)
          return NextResponse.json({ error: insertError.message }, { status: 500 })
        }
        roundId = newRound.id
      } else {
        // Existing round — make sure its status is 'active'.
        await (adminClient as any)
          .from('idea_rounds')
          .update({ status: 'active', closed_at: null })
          .eq('id', roundId)
      }

      const { data: updated, error: updateError } = await (adminClient as any)
        .from('companies')
        .update({
          idea_round_manual_override: 'open',
          idea_round_status:          'active',
          current_idea_round_id:      roundId,
        })
        .eq('id', profile.company_id)
        .select('id, idea_round_name, idea_round_status, idea_round_starts_at, idea_round_ends_at, idea_round_manual_override, current_idea_round_id')
        .single()

      if (updateError) {
        console.error('[round-status PATCH] companies update (open):', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true, round: updated })
    }

    if (action === 'close') {
      // Mark the current round as closed, then clear the pointer so the dashboard
      // treats the workspace as having no active round.
      if (company?.current_idea_round_id) {
        await (adminClient as any)
          .from('idea_rounds')
          .update({ status: 'closed', closed_at: new Date().toISOString() })
          .eq('id', company.current_idea_round_id)
      }

      const { data: updated, error: updateError } = await (adminClient as any)
        .from('companies')
        .update({
          idea_round_manual_override: 'closed',
          current_idea_round_id:      null,
        })
        .eq('id', profile.company_id)
        .select('id, idea_round_name, idea_round_status, idea_round_starts_at, idea_round_ends_at, idea_round_manual_override, current_idea_round_id')
        .single()

      if (updateError) {
        console.error('[round-status PATCH] companies update (close):', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true, round: updated })
    }

    // action === 'clear' — remove manual override, let schedule/status drive state
    const { data: updated, error: updateError } = await (adminClient as any)
      .from('companies')
      .update({ idea_round_manual_override: null })
      .eq('id', profile.company_id)
      .select('id, idea_round_name, idea_round_status, idea_round_starts_at, idea_round_ends_at, idea_round_manual_override, current_idea_round_id')
      .single()

    if (updateError) {
      console.error('[round-status PATCH] companies update (clear):', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, round: updated })

  } catch (err) {
    console.error('[api/company/round-status]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
