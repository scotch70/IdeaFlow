import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireWorkspaceAdmin } from '@/lib/auth/guards'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const auth = await requireWorkspaceAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { profile } = auth.value

    // Use the SSR client so RLS still applies — the workspace_admin check
    // above guarantees company scope, and the DB-side .eq('company_id') is a
    // belt-and-braces guard against URL tampering.
    const supabase = await createClient()
    const { error: deleteError } = await (supabase as any)
      .from('invites')
      .delete()
      .eq('id', id)
      .eq('company_id', profile.company_id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
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
