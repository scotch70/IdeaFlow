import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Suspense } from 'react'
import JoinWorkspaceClient from './JoinWorkspaceClient'

export const dynamic = 'force-dynamic'

/**
 * /join-workspace — landing page for authenticated users who have no company_id.
 *
 * SERVER-SIDE auto-attach:
 *   Before rendering the form, we check invites for a pending row matching
 *   the user's email. If one exists and is still valid, we attach the user
 *   to that workspace right here and redirect — the user never sees the form.
 *
 * CLIENT fallback:
 *   If no pending invite is found, we render JoinWorkspaceClient which offers:
 *     1. Join via invite code
 *     2. Create a new workspace (updates metadata + calls /api/onboard)
 *     3. Sign out
 *
 * This page is the permanent fix for the "signed in but stuck in a loop" bug.
 * Dashboard and /api/onboard both redirect here instead of /join when a user
 * has no company_id.
 */
export default async function JoinWorkspacePage() {
  const supabase    = await createClient()
  const adminClient = createAdminClient()

  // ── Auth guard ─────────────────────────────────────────────────────────────
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/auth')
  }

  // ── Already has a workspace ────────────────────────────────────────────────
  // Use admin client to bypass RLS — the user's own profile row may not be
  // readable under the default RLS policy before company_id is set.
  const { data: profile } = await (adminClient as any)
    .from('profiles')
    .select('company_id, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.company_id) {
    redirect('/dashboard')
  }

  // ── Auto-attach: check for a pending invite matching this email ────────────
  //
  // Case: the user was invited but joined via a direct signup instead of the
  // invite link. Their profile exists but company_id is null.
  // We can heal this silently by claiming the invite server-side.
  if (user.email) {
    const { data: pendingInvite } = await (adminClient as any)
      .from('invites')
      .select('id, company_id, role, idea_round_id')
      .filter('email', 'ilike', user.email)   // case-insensitive
      .is('used_at', null)
      .not('company_id', 'is', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (pendingInvite?.company_id) {
      // ── Atomically claim the invite ────────────────────────────────────────
      // Conditional UPDATE: only succeeds if used_at is still null.
      // If two tabs race, one will win and the other will get null back — safe.
      const { data: claimed } = await (adminClient as any)
        .from('invites')
        .update({
          used_at:        new Date().toISOString(),
          joined_user_id: user.id,
        })
        .eq('id', pendingInvite.id)
        .is('used_at', null)
        .select('id')
        .maybeSingle()

      // If another concurrent request claimed it first, skip and show the form.
      if (claimed) {
        // ── Attach user to workspace ─────────────────────────────────────────
        await (adminClient as any)
          .from('profiles')
          .upsert(
            {
              id:         user.id,
              company_id: pendingInvite.company_id,
              role:       (pendingInvite.role as string) || 'member',
            },
            { onConflict: 'id' }
          )

        // ── Flow-scoped invite: add to round_members ─────────────────────────
        if (pendingInvite.idea_round_id) {
          await (adminClient as any)
            .from('round_members')
            .upsert(
              {
                round_id:   pendingInvite.idea_round_id,
                user_id:    user.id,
                company_id: pendingInvite.company_id,
              },
              { onConflict: 'round_id,user_id', ignoreDuplicates: true }
            )
          redirect(`/dashboard/flows/${pendingInvite.idea_round_id}`)
        }

        redirect('/dashboard')
      }
    }
  }

  // ── No pending invite — show the manual form ───────────────────────────────
  const userFullName =
    (profile?.full_name as string | null) ??
    (user.user_metadata?.full_name as string | undefined) ??
    ''

  return (
    <Suspense>
      <JoinWorkspaceClient
        userEmail={user.email ?? ''}
        userFullName={userFullName}
      />
    </Suspense>
  )
}
