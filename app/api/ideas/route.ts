import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      // Isolated select so a missing migration (columns not yet added) degrades
      // gracefully: company is null → roundStatus is null → submission allowed.
      const { data: company } = await (supabase as any)
        .from('companies')
        .select('idea_round_status, idea_round_ends_at')
        .eq('id', profile.company_id)
        .single()

      // ── 3. Enforce round state — mirrors the dashboard logic exactly ──────
      // null status  = feature not configured → always open (backward-compat)
      // 'draft'      = not yet launched; no submissions
      // 'active'     = open unless the end date has already passed
      // 'closed'     = explicitly shut by admin
      const roundStatus  = company?.idea_round_status  ?? null
      const roundEndsAt  = company?.idea_round_ends_at ?? null
      const roundExpired =
        roundStatus === 'active' &&
        roundEndsAt !== null &&
        new Date(roundEndsAt) < new Date()
      const isRoundActive =
        roundStatus === null || (roundStatus === 'active' && !roundExpired)

      if (!isRoundActive) {
        const reason =
          roundStatus === 'draft'  ? 'Idea submission is not open yet.' :
          roundStatus === 'closed' ? 'Idea submission is currently closed.' :
          roundExpired             ? 'The submission window has ended.' :
                                     'Idea submission is not available right now.'
        return NextResponse.json({ error: reason }, { status: 403 })
      }

      // ── 4. Insert using the server-verified company_id ────────────────────
      const { data, error } = await (supabase as any)
        .from('ideas')
        .insert({
          title: title.trim(),
          description: description?.trim() || null,
          user_id: user.id,
          company_id: profile.company_id,   // server-side value, never from body
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    // DELETE IDEA
    if (action === 'delete') {
      const { error } = await (supabase as any)
        .from('ideas')
        .delete()
        .eq('id', ideaId)
        .eq('user_id', user.id)

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

      const { data, error } = await (supabase as any)
        .from('ideas')
        .update({
          title: title.trim(),
          description: description?.trim() || null,
        })
        .eq('id', ideaId)
        .eq('user_id', user.id)
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