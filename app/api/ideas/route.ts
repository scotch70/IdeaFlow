import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    // companyId is intentionally excluded — the client cannot be trusted to
    // supply it. We derive it server-side from the authenticated user's profile.
    const { action, ideaId, title, description } = body

    // CREATE IDEA
    if (!action) {
      if (!title?.trim()) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 })
      }

      // ── 1. Resolve real company_id from the authenticated user's profile ──
      // Never read company_id from the request body — a forged value would let
      // any user insert ideas into an arbitrary workspace.
      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (profileError || !profile?.company_id) {
        return NextResponse.json(
          { error: 'Could not verify your workspace' },
          { status: 403 },
        )
      }

      // ── 2. Fetch IdeaFlow round state for this company ────────────────────
      // Includes manual_override so admins can force-open or force-close
      // regardless of the scheduled dates.
      const { data: company } = await (supabase as any)
        .from('companies')
        .select('idea_round_status, idea_round_starts_at, idea_round_ends_at, idea_round_manual_override, current_idea_round_id')
        .eq('id', profile.company_id)
        .single()

      // ── 3. Enforce round state via shared helper ──────────────────────────
      // Default is 'draft' — brand-new workspaces are locked until an admin
      // opens IdeaFlow. manual_override always wins over scheduled dates.
      const effectiveStatus = getEffectiveRoundStatus({
        raw_status:      company?.idea_round_status          ?? null,
        manual_override: company?.idea_round_manual_override ?? null,
        opens_at:        company?.idea_round_starts_at       ?? null,
        closes_at:       company?.idea_round_ends_at         ?? null,
      })

      if (effectiveStatus !== 'active') {
        const reason =
          effectiveStatus === 'draft'  ? 'Idea submission is not open yet.' :
          effectiveStatus === 'closed' ? 'Idea submission is currently closed.' :
                                         'Idea submission is not available right now.'
        return NextResponse.json({ error: reason }, { status: 403 })
      }

      // Require a valid round ID — every idea must belong to a round.
      const currentRoundId = company?.current_idea_round_id ?? null
      if (!currentRoundId) {
        return NextResponse.json(
          { error: 'No active IdeaFlow round found. Please contact your admin.' },
          { status: 403 },
        )
      }

      // ── 4. Insert using the server-verified company_id ────────────────────
      const { data, error } = await (supabase as any)
        .from('ideas')
        .insert({
          title: title.trim(),
          description: description?.trim() || null,
          user_id: user.id,
          company_id: profile.company_id,  // server-side value, never from body
          idea_round_id: currentRoundId,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // RLS can silently block inserts — Supabase returns {data:null, error:null}
      // when a policy rejects the write.  Treat a null result as a hard failure
      // so the client shows an error rather than closing the form silently.
      if (!data) {
        return NextResponse.json(
          { error: 'Could not save your idea — please try again' },
          { status: 500 },
        )
      }

      return NextResponse.json(data)
    }

    // DELETE IDEA
    if (action === 'delete') {
      // Guard: if the user has been removed from the company their profile has
      // company_id: null. Without this check they could still delete old ideas
      // by ID even after losing membership.
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
        .eq('company_id', deleteProfile.company_id)  // scope to current membership

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // UPDATE IDEA
    if (action === 'update') {
      if (!title?.trim()) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 })
      }

      // Same membership guard as delete — prevent ex-members editing stale ideas.
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
          title: title.trim(),
          description: description?.trim() || null,
        })
        .eq('id', ideaId)
        .eq('user_id', user.id)
        .eq('company_id', updateProfile.company_id)  // scope to current membership
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
      { status: 500 }
    )
  }
}