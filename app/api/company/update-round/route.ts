import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RoundStatus = 'draft' | 'active' | 'closed'

type ProfileResult = { company_id: string; role: string }

export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth — SSR client verifies the session ─────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 2. Parse body ────────────────────────────────────────────────────────
    const body = (await request.json()) as {
      companyId: unknown
      name?: unknown
      status?: unknown
      startsAt?: unknown
      endsAt?: unknown
      newRound?: unknown
      prompt?: unknown
    }
    const { companyId, name, status, startsAt, endsAt, newRound, prompt } = body

    if (typeof companyId !== 'string' || !companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    // ── 3. Validate optional fields ──────────────────────────────────────────
    if (name !== undefined && name !== null && typeof name !== 'string') {
      return NextResponse.json({ error: 'name must be a string' }, { status: 400 })
    }

    // Validate prompt if provided
    let parsedPrompt: string | null | undefined = undefined
    if (prompt !== undefined) {
      if (prompt === null || prompt === '') {
        parsedPrompt = null
      } else if (typeof prompt !== 'string') {
        return NextResponse.json({ error: 'prompt must be a string' }, { status: 400 })
      } else {
        const trimmed = prompt.trim()
        if (trimmed.length < 5) {
          return NextResponse.json({ error: 'Question must be at least 5 characters' }, { status: 400 })
        }
        if (trimmed.length > 120) {
          return NextResponse.json({ error: 'Question must be 120 characters or fewer' }, { status: 400 })
        }
        parsedPrompt = trimmed
      }
    }

    // null is allowed — it clears the status (archive / reset)
    const VALID_STATUSES: RoundStatus[] = ['draft', 'active', 'closed']
    if (status !== undefined && status !== null && !VALID_STATUSES.includes(status as RoundStatus)) {
      return NextResponse.json({ error: 'status must be draft, active, closed, or null' }, { status: 400 })
    }

    // null clears the field; undefined means the caller didn't include it (skip)
    const toDate = (v: unknown): string | null | undefined => {
      if (v === null || v === '') return null
      if (v === undefined) return undefined
      if (typeof v !== 'string') return undefined
      const d = new Date(v)
      return isNaN(d.getTime()) ? undefined : d.toISOString()
    }
    const parsedStartsAt = toDate(startsAt)
    const parsedEndsAt   = toDate(endsAt)

    // ── 4. Authorise — caller must be admin of this company ───────────────────
    const { data: profile, error: profileError } = (await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()) as unknown as { data: ProfileResult | null; error: unknown }

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }
    if (profile.company_id !== companyId || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    // ── 5. Handle special status transitions ─────────────────────────────────

    // Activating a new round — create an idea_rounds row so ideas have a real FK
    // target. current_idea_round_id will point to this row.
    if (status === 'active' && newRound === true) {
      const roundName = (typeof name === 'string' && name.trim()) ? name.trim() : 'IdeaFlow'

      const { data: newRoundRow, error: insertError } = await (adminClient as any)
        .from('idea_rounds')
        .insert({
          company_id: profile.company_id,
          name: roundName,
          status: 'active',
          ...(parsedPrompt !== undefined ? { prompt: parsedPrompt } : {}),
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('[update-round] idea_rounds insert:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      // Build the companies patch — includes round config + the new round pointer.
      const activatePatch: Record<string, unknown> = {
        idea_round_status:     'active',
        current_idea_round_id: newRoundRow.id,
      }
      if (name !== undefined)          activatePatch.idea_round_name     = (typeof name === 'string' ? name.trim() : null) || null
      if (parsedStartsAt !== undefined) activatePatch.idea_round_starts_at = parsedStartsAt
      if (parsedEndsAt   !== undefined) activatePatch.idea_round_ends_at   = parsedEndsAt

      const { error: updateError } = await (adminClient as any)
        .from('companies')
        .update(activatePatch)
        .eq('id', profile.company_id)

      if (updateError) {
        console.error('[update-round] companies activate:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true })
    }

    // Archiving — close the current round row and wipe the pointer.
    if (status === null) {
      // Fetch current round id so we can close it.
      const { data: currentCompany } = await (adminClient as any)
        .from('companies')
        .select('current_idea_round_id')
        .eq('id', profile.company_id)
        .single()

      if (currentCompany?.current_idea_round_id) {
        await (adminClient as any)
          .from('idea_rounds')
          .update({ status: 'closed', closed_at: new Date().toISOString() })
          .eq('id', currentCompany.current_idea_round_id)
      }

      const { error: updateError } = await (adminClient as any)
        .from('companies')
        .update({
          idea_round_name:           null,
          idea_round_status:         null,
          idea_round_starts_at:      null,
          idea_round_ends_at:        null,
          idea_round_manual_override: null,
          current_idea_round_id:     null,
        })
        .eq('id', profile.company_id)

      if (updateError) {
        console.error('[update-round] companies archive:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true })
    }

    // ── 6. Standard update (draft / close / field edits) ─────────────────────
    const patch: Record<string, unknown> = {}

    if (name !== undefined) {
      patch.idea_round_name = (typeof name === 'string' ? name.trim() : null) || null
    }
    if (status !== undefined) {
      patch.idea_round_status = status as RoundStatus | null

      // When explicitly closing via status (not archive), mark the round row
      // and wipe every field that could cause the round to appear active again.
      if (status === 'closed') {
        const { data: currentCompany } = await (adminClient as any)
          .from('companies')
          .select('current_idea_round_id')
          .eq('id', profile.company_id)
          .single()

        if (currentCompany?.current_idea_round_id) {
          await (adminClient as any)
            .from('idea_rounds')
            .update({ status: 'closed', closed_at: new Date().toISOString() })
            .eq('id', currentCompany.current_idea_round_id)
        }

        // Clear the pointer AND the manual override so effective status is
        // never 'active' after a close, regardless of manual_override state.
        patch.current_idea_round_id      = null
        patch.idea_round_manual_override = null
      }
    }
    if (parsedStartsAt !== undefined) {
      patch.idea_round_starts_at = parsedStartsAt
    }
    if (parsedEndsAt !== undefined) {
      patch.idea_round_ends_at = parsedEndsAt
    }

    // Update prompt on the idea_rounds row if provided
    if (parsedPrompt !== undefined) {
      const { data: currentCompany } = await (adminClient as any)
        .from('companies')
        .select('current_idea_round_id')
        .eq('id', profile.company_id)
        .single()

      if (currentCompany?.current_idea_round_id) {
        await (adminClient as any)
          .from('idea_rounds')
          .update({ prompt: parsedPrompt })
          .eq('id', currentCompany.current_idea_round_id)
      }
    }

    // If only prompt was updated (no company-level patch), return early.
    if (Object.keys(patch).length === 0) {
      if (parsedPrompt !== undefined) return NextResponse.json({ ok: true })
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await (adminClient as any)
      .from('companies')
      .update(patch)
      .eq('id', profile.company_id)
      .select('id')

    if (updateError) {
      console.error('[update-round] DB error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (!Array.isArray(updated) || updated.length === 0) {
      console.error('[update-round] Update matched 0 rows for companyId:', companyId)
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/company/update-round]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
