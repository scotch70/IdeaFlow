import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'
import { checkRateLimit, getClientIp } from '@/lib/ratelimit'

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

    // Rate-limit idea submissions: 10 per minute per user.
    // Key by user ID so the limit is per-account, not per-IP.
    const allowed = await checkRateLimit(`ideas:${user.id}`, 60, 10)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests — please slow down.' },
        { status: 429 },
      )
    }

    const body = await request.json()

    // Only title, description, action, ideaId, and the optional roundId are
    // read from the body.  companyId and userId are always derived server-side.
    // roundId may be provided by multi-flow pages (bypasses current_idea_round_id
    // company lookup).  Legacy pages omit it and use the existing path.
    const { action, ideaId, title, description, roundId: bodyRoundId } = body

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

      const adminClient = createAdminClient()
      let activeRoundId: string | null = null

      if (typeof bodyRoundId === 'string' && bodyRoundId) {
        // ── Multi-flow path: caller provided explicit roundId ─────────────────
        // Validate the round exists, belongs to this company, and is active.
        const { data: explicitRound } = await (adminClient as any)
          .from('idea_rounds')
          .select('id, status, company_id, manual_override, starts_at, ends_at')
          .eq('id', bodyRoundId)
          .eq('company_id', profile.company_id)
          .single()

        if (!explicitRound) {
          return NextResponse.json(
            { error: 'IdeaFlow not found.' },
            { status: 404 },
          )
        }

        const roundEffective = getEffectiveRoundStatus({
          raw_status:      explicitRound.status,
          manual_override: explicitRound.manual_override ?? null,
          opens_at:        explicitRound.starts_at       ?? null,
          closes_at:       explicitRound.ends_at         ?? null,
        })

        if (roundEffective !== 'active') {
          return NextResponse.json(
            { error: 'IdeaFlow is not open for submissions.' },
            { status: 403 },
          )
        }

        // Check member access: if round has assigned members, user must be one
        const { data: memberRows } = await (adminClient as any)
          .from('round_members')
          .select('user_id')
          .eq('round_id', bodyRoundId)

        const assigned: string[] = (memberRows ?? []).map((r: { user_id: string }) => r.user_id)
        if (assigned.length > 0 && !assigned.includes(user.id)) {
          return NextResponse.json(
            { error: 'You are not assigned to this IdeaFlow.' },
            { status: 403 },
          )
        }

        activeRoundId = bodyRoundId

      } else {
        // ── Legacy path: use company's current_idea_round_id ──────────────────
        // ── 2. Fetch company row ─────────────────────────────────────────────
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

        // ── 3. Read round pointer from company ───────────────────────────────
        activeRoundId = company?.current_idea_round_id ?? null

        if (!activeRoundId) {
          return NextResponse.json(
            { error: 'IdeaFlow is not open for submissions.' },
            { status: 403 },
          )
        }

        // ── 4. Fetch the round row to validate it is active ──────────────────
        const { data: currentRound } = await (adminClient as any)
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

        if (currentRound.status !== 'active') {
          return NextResponse.json(
            { error: 'IdeaFlow is not open for submissions.' },
            { status: 403 },
          )
        }

        // ── 5. Compute effective status from company-level fields ─────────────
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
      }

      // ── Build insert payload ────────────────────────────────────────────────
      // activeRoundId was resolved above — either from an explicit bodyRoundId
      // (multi-flow path) or from company.current_idea_round_id (legacy path).
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
