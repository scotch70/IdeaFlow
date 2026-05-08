import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_STATUSES = ['open', 'planned'] as const
type AllowedStatus = (typeof ALLOWED_STATUSES)[number]

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // ── Auth ──────────────────────────────────────────────────────────────────
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Role check — admin only ───────────────────────────────────────────────
    const { data: profile } = (await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()) as unknown as {
      data: { role: string; company_id: string } | null
    }

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admins only' }, { status: 403 })
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    const body = await request.json()
    const { ideaId, status } = body as { ideaId: unknown; status: unknown }

    if (typeof ideaId !== 'string' || !ideaId) {
      return NextResponse.json({ error: 'ideaId is required' }, { status: 400 })
    }

    if (typeof status !== 'string' || !ALLOWED_STATUSES.includes(status as AllowedStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 },
      )
    }

    // ── Fetch idea via admin client (bypasses RLS) ────────────────────────────
    const { data: idea, error: ideaError } = (await adminClient
      .from('ideas')
      .select('id, company_id, status')
      .eq('id', ideaId)
      .single()) as unknown as {
      data: { id: string; company_id: string; status: string } | null
      error: { message: string; code: string } | null
    }

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: ideaError?.message ?? 'Idea not found' },
        { status: 404 },
      )
    }

    // ── Same-company guard ────────────────────────────────────────────────────
    if (idea.company_id !== profile.company_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ── Update status ─────────────────────────────────────────────────────────
    const { data: updatedRows, error: updateError } = (await (adminClient as any)
      .from('ideas')
      .update({
        status,
        status_changed_at: new Date().toISOString(),
        status_changed_by: user.id,
      })
      .eq('id', ideaId)
      .eq('status', idea.status)   // optimistic lock
      .select()) as unknown as { data: unknown[]; error: { message: string } | null }

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      return NextResponse.json(
        { error: 'This idea was updated by someone else. Reload the page and try again.' },
        { status: 409 },
      )
    }

    return NextResponse.json(updatedRows[0])
  } catch (err) {
    console.error('[api/ideas/status] crash:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Something went wrong' },
      { status: 500 },
    )
  }
}
