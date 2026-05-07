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
        console.error('[api ideas] profile fetch failed', profileError)
        return NextResponse.json(
          { error: 'Could not verify your workspace' },
          { status: 403 },
        )
      }

      // ── 2. Fetch company row — source of round pointer + override state ───
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

      // ── 3. Fail fast if no round pointer ─────────────────────────────────
      // Every idea must belong to a round. Never fall back, never create one.
      const currentRoundId: string | null = company?.current_idea_round_id ?? null

      if (!currentRoundId) {
        console.warn('[api ideas] no current_idea_round_id on company', {
          companyId: profile.company_id,
          company,
        })
        return NextResponse.json(
          { error: 'IdeaFlow is not open for submissions.' },
          { status: 403 },
        )
      }

      // ── 4. Fetch the round row via admin client ────────────────────────────
      // `idea_rounds` has no RLS and no GRANT for the authenticated role, so
      // the SSR client returns null. Use the admin client (service role) which
      // is exactly how the dashboard reads the round prompt.
      const adminClient = createAdminClient()
      const { data: currentRound, error: roundError } = await (adminClient as any)
        .from('idea_rounds')
        .select('id, status, company_id')
        .eq('id', currentRoundId)
        .eq('company_id', profile.company_id)
        .single()

      if (roundError) {
        console.error('[api ideas] idea_rounds fetch failed', roundError)
      }

      // ── 5. Compute effective status from company-level fields ─────────────
      const effectiveStatus = getEffectiveRoundStatus({
        raw_status:      company?.idea_round_status          ?? null,
        manual_override: company?.idea_round_manual_override ?? null,
        opens_at:        company?.idea_round_starts_at       ?? null,
        closes_at:       company?.idea_round_ends_at         ?? null,
      })

      // ── DEBUG: full state snapshot immediately before insert decision ─────
      console.log('[api ideas create debug]', {
        userId:               user.id,
        profileCompanyId:     profile?.company_id,
        profileRole:          profile?.role,
        companyCurrentRoundId: company?.current_idea_round_id,
        companyRoundStatus:   company?.idea_round_status,
        companyManualOverride: company?.idea_round_manual_override,
        currentRoundId,
        currentRound,
        effectiveStatus,
        title,
      })

      // ── 6. Gate: both company status and round row must be active ─────────
      if (!currentRound) {
        return NextResponse.json(
          { error: 'IdeaFlow is not open for submissions.' },
          { status: 403 },
        )
      }

      if (effectiveStatus !== 'active') {
        return NextResponse.json(
          { error: 'IdeaFlow is not open for submissions.' },
          { status: 403 },
        )
      }

      if (currentRound.status !== 'active') {
        return NextResponse.json(
          { error: 'IdeaFlow is not open for submissions.' },
          { status: 403 },
        )
      }

      // ── 7. Final safety check: idea_round_id must never be null ──────────
      // The DB trigger `require_idea_round_id_on_ideas` enforces this at the
      // DB level too, but we catch it here first with a clear error.
      const ideaRoundId: string = currentRound.id
      if (!ideaRoundId) {
        console.error('[api ideas] currentRound.id is falsy — aborting insert', currentRound)
        return NextResponse.json(
          { error: 'IdeaFlow is not open for submissions.' },
          { status: 403 },
        )
      }

      // ── 8. Insert — idea_round_id is always currentRound.id ──────────────
      const { data, error } = await (supabase as any)
        .from('ideas')
        .insert({
          title:         title.trim(),
          description:   description?.trim() || null,
          user_id:       user.id,
          company_id:    profile.company_id,  // from session, never body
          idea_round_id: ideaRoundId,          // from round row, never body
        })
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
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (deleteProfileError || !deleteProfile?.company_id) {
        return NextResponse.json(
          { error: 'Could not verify your workspace' },
          { status: 403 },
        )
      }

      const { error } = await (supabase as any)
        .from('ideas')
        .delete()
        .eq('id', ideaId)
        .eq('user_id', user.id)
        .eq('company_id', deleteProfile.company_id)

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
