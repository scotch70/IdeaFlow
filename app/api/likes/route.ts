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

    const { ideaId, liked } = await request.json()

    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 })
    }

    // ── Resolve the caller's company ──────────────────────────────────────────
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.company_id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // ── Cross-company guard ───────────────────────────────────────────────────
    // Verify the target idea belongs to the same company before touching likes.
    // Without this check a user could like/unlike ideas in any workspace they
    // know the ID of, including after being removed from their own company.
    const { data: idea, error: ideaError } = await (supabase as any)
      .from('ideas')
      .select('company_id')
      .eq('id', ideaId)
      .single()

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    if (idea.company_id !== profile.company_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (liked) {
      const { error } = await (supabase as any)
        .from('likes')
        .insert({ user_id: user.id, idea_id: ideaId })
        .select()

      if (error) {
        // 23505 = unique_violation: the user already liked this idea (e.g. two
        // tabs open, or a double-submit). The DB state is correct — treat it as
        // success rather than surfacing a confusing 500 to the client.
        if (error.code === '23505') return NextResponse.json({ success: true })
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      const { error } = await (supabase as any)
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('idea_id', ideaId)
        .select()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('likes route crash:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Something went wrong',
      },
      { status: 500 }
    )
  }
}