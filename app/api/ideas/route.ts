import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Only title, description, action, and ideaId are read from the body.
    // companyId, userId, and idea_round_id are intentionally excluded —
    // all three are derived server-side from the authenticated session.
    const { action, ideaId, title, description } = body

    // ──────────────────────────────────────────────────────────────────────────
    // CREATE IDEA
    // ──────────────────────────────────────────────────────────────────────────
    if (!action) {
      if (!title?.trim()) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 })
      }

      // ── 1. Resolve company_id from the authenticated session ──────────────
      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile?.company_id) {
        console.error('[api ideas] profile missing or no company_id', profileError?.message)
        return NextResponse.json(
          { error: 'Could not verify your workspace' },
          { status: 403 },
        )
      }

      // ── 2. Fetch company row ───────────────────────────────────────────────
      const { data: company, error: companyError } = await (supabase as any)
        .from('companies')
        .select(
          'current_idea_round_id, idea_round_status, ' +
          'idea_round_starts_at, idea_round_ends_at, idea_round_manual_override',
        )
        .eq('id', profile.company_id)
        .single()

      if (companyError) {
        console.error('[api ideas] company fetch failed', companyError)
      }

      // ── 3. Read round pointer from company — this is the ID we will insert ─
      // We store it now before any async calls so we never accidentally use
      // currentRound.id (which may be undefined if the query returns null).
      const activeRoundId: string | null = company?.current_idea_round_id ?? null

      if (!activeRoundId) {
        return NextResponse.json(
          { error: 'IdeaFlow is not open for submissions.' },
          { status: 403 },
        )
      }

      // ── 4. Fetch the round row via admin client to validate it is active ───
      // `idea_rounds` has no RLS and no GRANT for the `authenticated` role.
      // The SSR client silently returns null — the admin (service role) client
      // bypasses all grants and is the only reliable way to read this table.
      const adminClient = createAdminClient()
      const { data: currentRound, error: currentRoundError } = await (adminClient as any)
        .from('idea_rounds')
        .select('id, status, company_id')
        .eq('id', activeRoundId)
        .eq('company_id', profile.company_id)
        .single()

      if (!currentRound) {
        return NextResponse.json(
          { error: 'IdeaFlow is not open for submissions.' },
          { status: 403 },
        )
      }

      // ── 5. Validate round row status ──────────────────────────────────────
      if (currentRound.status !== 'active') {
        return NextResponse.json(
          { error: 'IdeaFlow is not open for submissions.' },
          { status: 403 },
        )
      }

      // ── 6. Compute effective status from company-level fields ─────────────
      const effectiveStatus = getEffectiveRoundStatus({
        raw_status:      company?.idea_round_status          ?? null,
        manual_override: company?.idea_round_manual_override ?? null,
        opens_at:        company?.idea_round_starts_at       ?? null,
        closes_at:       company?.idea_round_ends_at         ?? null,
      })

      if (effectiveStatus !== 'active') {
        return NextResponse.json(
          { error: 'IdeaFlow is not open for submissions.' },
          { status: 403 },
        )
      }

      // ── 7. Build insert payload ───────────────────────────────────────────
      // idea_round_id comes from activeRoundId (company.current_idea_round_id),
      // NOT from currentRound.id — the round query is for validation only.
      const insertPayload = {
        title:         title.trim(),
        description:   description?.trim() || null,
        company_id:    profile.company_id,   // from session, never from body
        user_id:       user.id,              // from session, never from body
        idea_round_id: activeRoundId,        // from company row, never from body
      }

      // ── 8. Insert ─────────────────────────────────────────────────────────
      const { data, error } = await (supabase as any)
        .from('ideas')
        .insert(insertPayload)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // RLS can silently block inserts (data:null, error:null). Treat as failure.
      if (!data) {
        return NextResponse.json(
          { error: 'Could not save your idea — please try again' },
          { status: 500 },
        )
      }

      return NextResponse.json(data)
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DELETE IDEA
    // ──────────────────────────────────────────────────────────────────────────
    if (action === 'delete') {
      const { data: deleteProfile, error: deleteProfileError } = await (supabase as any)
        .from('profiles')
        .select('company_id, role')
        .eq('id', user.id)
        .single()

      if (deleteProfileError || !deleteProfile?.company_id) {
        return NextResponse.json(
          { error: 'Could not verify your workspace' },
          { status: 403 },
        )
      }

      // Admins can delete any idea in their company; members only their own.
      const deleteQuery = (supabase as any)
        .from('ideas')
        .delete()
        .eq('id', ideaId)
        .eq('company_id', deleteProfile.company_id)

      if (deleteProfile.role !== 'admin') {
        deleteQuery.eq('user_id', user.id)
      }

      const { error } = await deleteQuery

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // ──────────────────────────────────────────────────────────────────────────
    // UPDATE IDEA
    // ──────────────────────────────────────────────────────────────────────────
    if (action === 'update') {
      if (!title?.trim()) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 })
      }

      const { data: updateProfile, error: updateProfileError } = await (supabase as any)
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (updateProfileError || !updateProfile?.company_id) {
        return NextResponse.json(
          { error: 'Could not verify your workspace' },
          { status: 403 },
        )
      }

      const { data, error } = await (supabase as any)
        .from('ideas')
        .update({
          title:       title.trim(),
          description: description?.trim() || null,
        })
        .eq('id', ideaId)
        .eq('user_id', user.id)
        .eq('company_id', updateProfile.company_id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('ideas route crash:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Something went wrong',
      },
      { status: 500 },
    )
  }
}
