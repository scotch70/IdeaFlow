import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_PROMPT_LENGTH = 80

type ProfileResult = {
  company_id: string
  role: string
}

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

    const { companyId, prompt } = (await request.json()) as {
      companyId: unknown
      prompt: unknown
    }

    if (typeof companyId !== 'string' || !companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 })
    }

    if (typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt) {
      return NextResponse.json({ error: 'Prompt cannot be empty' }, { status: 400 })
    }

    if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer` },
        { status: 400 }
      )
    }

    const { data: profile, error: profileError } = (await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()) as unknown as {
      data: ProfileResult | null
      error: { message: string } | null
    }

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.company_id !== companyId || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: updateError } = await (supabase as any)
      .from('companies')
      .update({ custom_idea_prompt: trimmedPrompt })
      .eq('id', companyId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/company/update-prompt POST]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}