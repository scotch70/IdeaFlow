import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_LENGTH = 200

type ProfileResult = { company_id: string }

type CommentResult = {
  id: string
  idea_id: string
  user_id: string
  company_id: string
  content: string
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ideaId = request.nextUrl.searchParams.get('ideaId')
    if (!ideaId) {
      return NextResponse.json({ error: 'ideaId is required' }, { status: 400 })
    }

    const { data: profile, error: profileError } = (await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()) as unknown as {
      data: ProfileResult | null
      error: { message: string } | null
    }

    if (profileError || !profile?.company_id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: comments, error } = (await supabase
      .from('comments')
      .select('id, idea_id, user_id, company_id, content, created_at')
      .eq('idea_id', ideaId)
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: true })) as unknown as {
      data: CommentResult[] | null
      error: { message: string } | null
    }

    if (error) {
      console.error('[api/comments GET] supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(comments ?? [])
  } catch (err) {
    console.error('[api/comments GET]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ideaId, content } = (await request.json()) as {
      ideaId: unknown
      content: unknown
    }

    if (typeof ideaId !== 'string' || !ideaId) {
      return NextResponse.json({ error: 'ideaId is required' }, { status: 400 })
    }

    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    if (content.trim().length > MAX_LENGTH) {
      return NextResponse.json(
        { error: `Comment must be ${MAX_LENGTH} characters or fewer` },
        { status: 400 }
      )
    }

    const { data: profile, error: profileError } = (await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()) as unknown as {
      data: ProfileResult | null
      error: { message: string } | null
    }

    if (profileError || !profile?.company_id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: idea, error: ideaError } = (await supabase
      .from('ideas')
      .select('company_id')
      .eq('id', ideaId)
      .single()) as unknown as {
      data: { company_id: string } | null
      error: { message: string } | null
    }

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    if (idea.company_id !== profile.company_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: comment, error: insertError } = (await supabase
      .from('comments')
      .insert({
        idea_id: ideaId,
        user_id: user.id,
        company_id: profile.company_id,
        content: content.trim(),
      } as any)
      .select('id, idea_id, user_id, company_id, content, created_at')
      .single()) as unknown as {
      data: CommentResult | null
      error: { message: string } | null
    }

    if (insertError) {
      console.error('[api/comments POST] supabase error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(comment)
  } catch (err) {
    console.error('[api/comments POST]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}