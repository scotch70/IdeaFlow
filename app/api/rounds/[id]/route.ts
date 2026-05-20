/**
 * GET    /api/rounds/[id]  — fetch a single round (with members)
 * PATCH  /api/rounds/[id]  — update name, prompt, dates, status, manual_override
 * DELETE /api/rounds/[id]  — delete round + cascade (ideas, comments, likes)
 *
 * Admin only for PATCH / DELETE.
 * GET: admin always; member if assigned (or round has no member restriction).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'
import { canCreateFlow } from '@/lib/billing'
import { requireSignedIn, requireWorkspaceAdmin, canAccessRound } from '@/lib/auth/guards'

type Params = { params: Promise<{ id: string }> }

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const caller = await requireSignedIn()
    if (!caller.ok) return NextResponse.json({ error: caller.error }, { status: caller.status })
    const { userId, profile } = caller.value

    const admin = createAdminClient()

    const { data: round, error: roundError } = await (admin as any)
      .from('idea_rounds')
      .select('*')
      .eq('id', id)
      .eq('company_id', profile.company_id)
      .single()

    if (roundError || !round) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Access check — handles audience_mode + legacy fallback in one place.
    const allowed = await canAccessRound({
      userId,
      isAdmin: profile.role === 'admin',
      round,
    })
    if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Fetch assigned members (for admin view)
    const { data: memberRows } = await (admin as any)
      .from('round_members')
      .select('user_id, added_by, created_at, role, last_active_at, profiles(full_name)')
      .eq('round_id', id)

    const effectiveStatus = getEffectiveRoundStatus({
      raw_status:      round.status,
      manual_override: round.manual_override ?? null,
      opens_at:        round.starts_at ?? null,
      closes_at:       round.ends_at   ?? null,
    })

    return NextResponse.json({
      ...round,
      effectiveStatus,
      members: memberRows ?? [],
    })
  } catch (err) {
    console.error('[GET /api/rounds/[id]]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// ── PATCH ──────────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const auth = await requireWorkspaceAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { profile } = auth.value

    const admin = createAdminClient()

    // Verify round belongs to this company
    const { data: existing } = await (admin as any)
      .from('idea_rounds')
      .select('id, status, audience_mode')
      .eq('id', id)
      .eq('company_id', profile.company_id)
      .single() as { data: { id: string; status: string | null; audience_mode: 'workspace' | 'restricted' | null } | null }

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = (await request.json()) as Record<string, unknown>

    const VALID_STATUSES   = ['draft', 'active', 'closed']
    const VALID_OVERRIDES  = ['open', 'closed', null]

    const patch: Record<string, unknown> = {}

    if (body.name !== undefined) {
      patch.name = (typeof body.name === 'string' && body.name.trim()) ? body.name.trim() : 'IdeaFlow'
    }
    if (body.prompt !== undefined) {
      patch.prompt = (typeof body.prompt === 'string' && body.prompt.trim()) ? body.prompt.trim() : null
    }
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status as string)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      patch.status = body.status
      // When explicitly closing, record the timestamp
      if (body.status === 'closed' && existing.status !== 'closed') {
        patch.closed_at = new Date().toISOString()
        // Clear manual override so it can't stay 'open' after close
        patch.manual_override = null
      }
      // Plan gate: activating a draft counts as creating an active flow
      if (body.status === 'active' && existing.status !== 'active') {
        const { data: companyRow } = await (admin as any)
          .from('companies')
          .select('plan')
          .eq('id', profile.company_id)
          .single() as { data: { plan: string } | null }

        const { count: activeCount } = await (admin as any)
          .from('idea_rounds')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', profile.company_id)
          .eq('status', 'active')

        if (!canCreateFlow({ plan: companyRow?.plan ?? 'free', activeFlowCount: activeCount ?? 0 })) {
          return NextResponse.json(
            { error: 'Free plan allows up to 2 active IdeaFlows. Upgrade to Pro to activate more.' },
            { status: 403 },
          )
        }
      }
    }
    if ('manual_override' in body) {
      if (!VALID_OVERRIDES.includes(body.manual_override as any)) {
        return NextResponse.json({ error: 'Invalid manual_override' }, { status: 400 })
      }
      patch.manual_override = body.manual_override ?? null
    }

    // ── Audience mode ────────────────────────────────────────────────────────
    // workspace  → everyone in the workspace can access
    // restricted → only round_members rows can access
    if (body.audience_mode !== undefined) {
      const next = body.audience_mode
      if (next !== 'workspace' && next !== 'restricted') {
        return NextResponse.json({ error: 'Invalid audience_mode' }, { status: 400 })
      }
      // Flipping workspace → restricted with zero members would lock everyone
      // (except workspace admins) out immediately. Reject with a clear error so
      // the UI can prompt the admin to add at least one member first.
      if (next === 'restricted' && existing.audience_mode !== 'restricted') {
        const { count } = await (admin as any)
          .from('round_members')
          .select('*', { count: 'exact', head: true })
          .eq('round_id', id)
        if ((count ?? 0) === 0) {
          return NextResponse.json(
            { error: 'Add at least one member before switching to restricted access.' },
            { status: 400 },
          )
        }
      }
      patch.audience_mode = next
    }

    const toDate = (v: unknown): string | null | undefined => {
      if (v === null || v === '') return null
      if (v === undefined) return undefined
      if (typeof v !== 'string') return undefined
      const d = new Date(v)
      return isNaN(d.getTime()) ? undefined : d.toISOString()
    }

    const parsedStarts = toDate(body.starts_at)
    const parsedEnds   = toDate(body.ends_at)
    if (parsedStarts !== undefined) patch.starts_at = parsedStarts
    if (parsedEnds   !== undefined) patch.ends_at   = parsedEnds

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await (admin as any)
      .from('idea_rounds')
      .update(patch)
      .eq('id', id)
      .eq('company_id', profile.company_id)
      .select('*')
      .single()

    if (updateError) {
      console.error('[PATCH /api/rounds/[id]]', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const effectiveStatus = getEffectiveRoundStatus({
      raw_status:      updated.status,
      manual_override: updated.manual_override ?? null,
      opens_at:        updated.starts_at ?? null,
      closes_at:       updated.ends_at   ?? null,
    })

    return NextResponse.json({ ...updated, effectiveStatus })
  } catch (err) {
    console.error('[PATCH /api/rounds/[id]]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// ── DELETE ─────────────────────────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const auth = await requireWorkspaceAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { profile } = auth.value

    const admin = createAdminClient()

    // Verify ownership
    const { data: existing } = await (admin as any)
      .from('idea_rounds')
      .select('id')
      .eq('id', id)
      .eq('company_id', profile.company_id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // ── Cascade delete: comments → likes → ideas → round_members → round ──────
    const { data: roundIdeas } = await (admin as any)
      .from('ideas')
      .select('id')
      .eq('idea_round_id', id) as { data: { id: string }[] | null }

    const ideaIds = (roundIdeas ?? []).map((r: { id: string }) => r.id)

    if (ideaIds.length > 0) {
      await (admin as any).from('comments').delete().in('idea_id', ideaIds)
      await (admin as any).from('likes').delete().in('idea_id', ideaIds)
      await (admin as any).from('ideas').delete().in('id', ideaIds)
    }

    await (admin as any).from('round_members').delete().eq('round_id', id)

    // Delete flow-scoped invites so orphaned invite codes can't be used after deletion
    await (admin as any).from('invites').delete().eq('idea_round_id', id)

    const { error: delError } = await (admin as any)
      .from('idea_rounds')
      .delete()
      .eq('id', id)
      .eq('company_id', profile.company_id)

    if (delError) {
      console.error('[DELETE /api/rounds/[id]]', delError)
      return NextResponse.json({ error: delError.message }, { status: 500 })
    }

    // If this was the company's current_idea_round_id, clear the pointer
    await (admin as any)
      .from('companies')
      .update({
        current_idea_round_id:      null,
        idea_round_status:          null,
        idea_round_name:            null,
        idea_round_manual_override: null,
      })
      .eq('id', profile.company_id)
      .eq('current_idea_round_id', id)  // only clear if it was pointing here

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/rounds/[id]]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
