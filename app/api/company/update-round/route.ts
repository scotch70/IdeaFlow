import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RoundStatus = 'draft' | 'active' | 'closed'

type ProfileResult = { company_id: string; role: string }

export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth — SSR client verifies the session ─────────────────────────────
    const supabase = createClient()
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

    // ── 5. Build update payload ───────────────────────────────────────────────
    const patch: Record<string, unknown> = {}

    if (name !== undefined) {
      patch.idea_round_name = (typeof name === 'string' ? name.trim() : null) || null
    }
    if (status !== undefined) {
      patch.idea_round_status = status as RoundStatus | null
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

    // ── 6. Persist via service-role client (bypasses RLS) ─────────────────────
    // Auth and authorisation are already enforced above via the SSR client.
    // We use select() to get the updated row back so we can detect a no-match.
    const adminClient = createAdminClient()
    const { data: updated, error: updateError } = await (adminClient as any)
      .from('companies')
      .update(patch)
      .eq('id', companyId)
      .select('id')   // request the row back — Supabase returns [] if 0 rows matched

    if (updateError) {
      console.error('[update-round] DB error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // If the array is empty, the .eq() matched nothing — company row not found.
    // This should never happen after a successful auth check, but guard anyway.
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
