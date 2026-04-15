import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RoundStatus = 'draft' | 'active' | 'closed'

type ProfileResult = { company_id: string; role: string }

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // ── 1. Auth ──────────────────────────────────────────────────────────────
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
    }

    const { companyId, name, status, startsAt, endsAt } = body

    if (typeof companyId !== 'string' || !companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    // ── 3. Validate optional fields ──────────────────────────────────────────
    if (name !== undefined && name !== null && typeof name !== 'string') {
      return NextResponse.json({ error: 'name must be a string' }, { status: 400 })
    }
    if (status !== undefined && !['draft', 'active', 'closed'].includes(status as string)) {
      return NextResponse.json({ error: 'status must be draft, active, or closed' }, { status: 400 })
    }
    // Validate ISO date strings when provided
    const toDate = (v: unknown): string | null | undefined => {
      if (v === null || v === '') return null      // explicit clear
      if (v === undefined) return undefined        // not in request, skip
      if (typeof v !== 'string') return undefined
      const d = new Date(v)
      if (isNaN(d.getTime())) return undefined
      return d.toISOString()
    }
    const parsedStartsAt = toDate(startsAt)
    const parsedEndsAt   = toDate(endsAt)

    // ── 4. Authorise — must be admin of this company ─────────────────────────
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

    // ── 5. Build update payload (only include provided fields) ───────────────
    const patch: Record<string, unknown> = {}

    if (name !== undefined) {
      patch.idea_round_name = typeof name === 'string' ? name.trim() || null : null
    }
    if (status !== undefined) {
      patch.idea_round_status = status as RoundStatus
    }
    if (parsedStartsAt !== undefined) {
      patch.idea_round_starts_at = parsedStartsAt
    }
    if (parsedEndsAt !== undefined) {
      patch.idea_round_ends_at = parsedEndsAt
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // ── 6. Persist ───────────────────────────────────────────────────────────
    const { error: updateError } = await (supabase as any)
      .from('companies')
      .update(patch)
      .eq('id', companyId)

    if (updateError) {
      console.error('[update-round]', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/company/update-round]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
