/**
 * DELETE /api/account
 *
 * Deletes the authenticated user's own account.
 *
 * What happens to their data:
 *   - Auth user is deleted via the admin client (service role).
 *   - Profile row is deleted (cascade from auth.users via FK, or we do it explicitly).
 *   - Ideas and comments authored by the user are kept — they belong to the
 *     company's workspace. Their profiles.full_name is already gone so they
 *     display as "Deleted user" via the UI null-check.
 *   - Likes authored by the user are kept (likes_count stays accurate).
 *
 * Safety guards:
 *   - Admins cannot delete themselves if they are the only admin in the workspace.
 *     This prevents orphaning a company with no admin.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(_request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('id, role, company_id')
      .eq('id', user.id)
      .single()

    // Guard: last admin cannot self-delete — company would become unmanageable.
    if (profile?.role === 'admin' && profile?.company_id) {
      const { count: adminCount } = await (supabase as any)
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .eq('role', 'admin')

      if ((adminCount ?? 0) <= 1) {
        return NextResponse.json(
          {
            error:
              'You are the only admin. Promote another member to admin before deleting your account.',
            errorCode: 'LAST_ADMIN',
          },
          { status: 400 }
        )
      }
    }

    // Use the admin client to delete the auth user.
    // This also triggers any ON DELETE CASCADE FK rules in the database.
    const admin = createAdminClient()
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('[api/account DELETE] auth.admin.deleteUser failed:', deleteError.message)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/account DELETE]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Something went wrong' },
      { status: 500 }
    )
  }
}
