/**
 * GET    /api/rounds/[id]/members   — list members assigned to this round
 * POST   /api/rounds/[id]/members   — assign a member  { userId }
 * DELETE /api/rounds/[id]/members   — remove a member  { userId }
 *
 * Admin only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string }> }

async function authorize(supabase: Awaited<ReturnType<typeof createClient>>, roundId: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized', status: 401, user: null, profile: null }

  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()) as unknown as { data: { company_id: string | null; role: string } | null }

  if (!profile?.company_id) return { error: 'No workspace', status: 403, user: null, profile: null }
  if (profile.role !== 'admin') return { error: 'Admins only', status: 403, user: null, profile: null }

  const admin = createAdminClient()
  const { data: round } = await (admin as any)
    .from('idea_rounds')
    .select('id, company_id')
    .eq('id', roundId)
    .eq('company_id', profile.company_id)
    .single()

  if (!round) return { error: 'Round not found', status: 404, user: null, profile: null }

  return { error: null, status: 200, user, profile }
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await authorize(supabase, id)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const admin = createAdminClient()
    const { data: rows, error } = await (admin as any)
      .from('round_members')
      .select('id, user_id, added_by, created_at, profiles(full_name, role)')
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
    const supabase = await createClient()
    const auth = await authorize(supabase, id)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { userId } = (await request.json()) as { userId: unknown }
    if (typeof userId !== 'string' || !userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify the target user is in the same company
    const { data: targetProfile } = await (admin as any)
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single()

    if (!targetProfile || targetProfile.company_id !== auth.profile!.company_id) {
      return NextResponse.json({ error: 'User not in this workspace' }, { status: 403 })
    }

    const { data: row, error: insertError } = await (admin as any)
      .from('round_members')
      .insert({
        round_id:   id,
        user_id:    userId,
        company_id: auth.profile!.company_id,
        added_by:   auth.user!.id,
      })
      .select('id, user_id, added_by, created_at')
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
    const supabase = await createClient()
    const auth = await authorize(supabase, id)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { userId } = (await request.json()) as { userId: unknown }
    if (typeof userId !== 'string' || !userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { error: delError } = await (admin as any)
      .from('round_members')
      .delete()
      .eq('round_id', id)
      .eq('user_id', userId)

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
