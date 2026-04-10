import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log('likes route user:', user?.id)
    console.log('likes route userError:', userError)

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ideaId, liked } = await request.json()
    console.log('likes route payload:', { ideaId, liked })

    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 })
    }

    if (liked) {
      const { data, error } = await (supabase as any)
        .from('likes')
        .insert({
          user_id: user.id,
          idea_id: ideaId,
        })
        .select()

      console.log('likes insert data:', data)
      console.log('likes insert error:', error)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      const { data, error } = await (supabase as any)
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('idea_id', ideaId)
        .select()

      console.log('likes delete data:', data)
      console.log('likes delete error:', error)

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