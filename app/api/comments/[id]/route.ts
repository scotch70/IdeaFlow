import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_LENGTH = 500

type CommentRow = {
  id: string
  idea_id: string
  user_id: string
  company_id: string
  content: string
  created_at: string
  updated_at: string | null
}

type ProfileRow = {
  company_id: string
  role: string
}

// ── PATCH /api/comments/[id] ─────────────────────────────────────────────────
// Owner only: update comment content.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = (await request.json()) as { content: unknown }

    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }
    if (content.trim().length > MAX_LENGTH) {
      return NextResponse.json(
        { error: `Comment must be ${MAX_LENGTH} characters or fewer` },
        { status: 400 }
      )
    }

    // Fetch the comment
    const { data: comment, error: fetchError } = (await supabase
      .from('comments')
      .select('id, user_id, company_id, content, created_at, updated_at')
      .eq('id', id)
      .single()) as unknown as { data: CommentRow | null; error: { message: string } | null }

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Only owner can edit
    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: updated, error: updateError } = (await supabase
      .from('comments')
      .update({ content: content.trim(), updated_at: new Date().toISOString() } as never)
      .eq('id', id)
      .select('id, idea_id, user_id, company_id, content, created_at, updated_at')
      .single()) as unknown as { data: CommentRow | null; error: { message: string } | null }

    if (updateError) {
      console.error('[api/comments PATCH]', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[api/comments PATCH]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// ── DELETE /api/comments/[id] ────────────────────────────────────────────────
// Owner or admin can delete.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the comment
    const { data: comment, error: fetchError } = (await supabase
      .from('comments')
      .select('id, user_id, company_id')
      .eq('id', id)
      .single()) as unknown as { data: Pick<CommentRow, 'id' | 'user_id' | 'company_id'> | null; error: { message: string } | null }

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Fetch profile to check role
    const { data: profile } = (await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()) as unknown as { data: ProfileRow | null }

    const isOwner = comment.user_id === user.id
    const isAdmin = profile?.role === 'admin' && profile?.company_id === comment.company_id

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[api/comments DELETE]', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/comments DELETE]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
