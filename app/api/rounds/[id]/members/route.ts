/**
 * GET    /api/rounds/[id]/members   — list members assigned to this round
 * POST   /api/rounds/[id]/members   — assign a member  { userId, role? }
 * DELETE /api/rounds/[id]/members   — remove a member  { userId }
 *
 * Admin only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRoundAdmin } from '@/lib/auth/guards'
import type { FlowRole } from '@/types/database'

type Params = { params: Promise<{ id: string }> }

const VALID_ROLES: FlowRole[] = ['owner', 'admin', 'member', 'viewer']

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const auth = await requireRoundAdmin(id)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const admin = createAdminClient()
    // Note: we use select('*') so the query keeps working before the
    // members-redesign migration has been applied (role, last_active_at,
    // invited_by may not exist yet). After the migration they flow through
    // automatically.
    const { data: rows, error } = await (admin as any)
      .from('round_members')
      .select('*, profiles(full_name, role)')
      .eq('round_id', id)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(rows ?? [])
  } catch (err) {
    console.error('[GET /api/rounds/[id]/members]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const auth = await requireRoundAdmin(id)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = (await request.json()) as { userId?: unknown; role?: unknown }
    if (typeof body.userId !== 'string' || !body.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const role: FlowRole = (typeof body.role === 'string' && VALID_ROLES.includes(body.role as FlowRole))
      ? (body.role as FlowRole)
      : 'member'

    const admin = createAdminClient()

    // Verify the target user is in the same workspace
    const { data: targetProfile } = await (admin as any)
      .from('profiles')
      .select('company_id')
      .eq('id', body.userId)
      .single() as { data: { company_id: string | null } | null }

    if (!targetProfile || targetProfile.company_id !== auth.value.profile.company_id) {
      return NextResponse.json({ error: 'User not in this workspace' }, { status: 403 })
    }

    // Build the insert payload defensively: only include the new
    // members-redesign columns when they are non-default, so a pre-migration
    // DB (which doesn't have role/invited_by) accepts the write. The DB
    // default for role is 'member', so we only send it for non-defaults.
    const insertPayload: Record<string, unknown> = {
      round_id:   id,
      user_id:    body.userId,
      company_id: auth.value.profile.company_id,
      added_by:   auth.value.userId,
    }
    if (role !== 'member') insertPayload.role = role

    const { data: row, error: insertError } = await (admin as any)
      .from('round_members')
      .insert(insertPayload)
      .select('*')
      .single()

    if (insertError) {
      // 23505 = unique_violation: already assigned — treat as success
      if (insertError.code === '23505') return NextResponse.json({ ok: true, alreadyAssigned: true })
      console.error('[POST /api/rounds/[id]/members]', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(row, { status: 201 })
  } catch (err) {
    console.error('[POST /api/rounds/[id]/members]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// ── DELETE ─────────────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const auth = await requireRoundAdmin(id)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = (await request.json()) as { userId?: unknown }
    if (typeof body.userId !== 'string' || !body.userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { error: delError } = await (admin as any)
      .from('round_members')
      .delete()
      .eq('round_id', id)
      .eq('user_id', body.userId)

    if (delError) {
      console.error('[DELETE /api/rounds/[id]/members]', delError)
      return NextResponse.json({ error: delError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/rounds/[id]/members]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
