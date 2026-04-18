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

    const { memberId } = await request.json()

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    const { data: adminProfile, error: adminError } = await (supabase as any)
      .from('profiles')
      .select('id, role, company_id')
      .eq('id', user.id)
      .single()

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: 'Admin profile not found' }, { status: 404 })
    }

    if (adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 })
    }

    if (memberId === user.id) {
      return NextResponse.json({ error: 'You cannot remove yourself' }, { status: 400 })
    }

    const { data: memberProfile, error: memberError } = await (supabase as any)
      .from('profiles')
      .select('id, role, company_id')
      .eq('id', memberId)
      .single()

    if (memberError || !memberProfile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (memberProfile.company_id !== adminProfile.company_id) {
      return NextResponse.json({ error: 'Member is not in your company' }, { status: 403 })
    }

    if (memberProfile.role === 'admin') {
      return NextResponse.json({ error: 'You cannot remove another admin' }, { status: 400 })
    }

    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update({
        company_id: null,
        role: 'member',
      })
      .eq('id', memberId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Something went wrong',
      },
      { status: 500 }
    )
  }
}