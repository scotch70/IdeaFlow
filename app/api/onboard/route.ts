import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/onboard
 *
 * Fallback onboarding endpoint for when the database trigger that creates a
 * company + admin profile did not fire (e.g. latency, missing migration, or a
 * trigger that was disabled).
 *
 * Safe to call multiple times — idempotent by design:
 *   • If the profile already has a company_id   → redirect /dashboard
 *   • If the company already exists (same name)  → reuse it, upsert profile
 *   • If everything needs creating               → insert company + upsert profile
 *
 * On any unrecoverable error, the user is signed out (to clear the session that
 * would otherwise cause middleware to loop them back here) and redirected to
 * /auth with an error query param.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // ── Auth check ─────────────────────────────────────────────────────────────
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // ── Idempotency check ──────────────────────────────────────────────────────
  // Use the admin client so RLS cannot hide an existing profile row.
  const adminClient = createAdminClient()

  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .maybeSingle()

  if (existingProfile?.company_id) {
    // Already onboarded — nothing to do.
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── Resolve metadata ───────────────────────────────────────────────────────
  const fullName    = (user.user_metadata?.full_name    as string | undefined)?.trim() ?? ''
  const companyName = (user.user_metadata?.company_name as string | undefined)?.trim() ?? ''

  if (!companyName) {
    // We cannot create a workspace without a name. Sign the user out so they
    // can try again rather than looping between /dashboard and here forever.
    await supabase.auth.signOut()
    return NextResponse.redirect(
      new URL('/auth?error=onboarding_failed', request.url)
    )
  }

  // ── Create company ─────────────────────────────────────────────────────────
  // insert() is intentional: each signup should get its own workspace.
  // If somehow a row with this owner already exists the insert will fail, which
  // we catch below rather than silently reusing the wrong company.
  const { data: company, error: companyError } = await adminClient
    .from('companies')
    .insert({
      name: companyName,
      plan: 'free',
      trial_ends_at: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toISOString(),
    })
    .select('id')
    .single()

  if (companyError || !company) {
    console.error('[api/onboard] company insert failed:', companyError?.message)
    await supabase.auth.signOut()
    return NextResponse.redirect(
      new URL('/auth?error=onboarding_failed', request.url)
    )
  }

  // ── Upsert profile ─────────────────────────────────────────────────────────
  // Use upsert so that a partial profile row left by the trigger (no company_id)
  // is repaired rather than causing a unique-key conflict on insert.
  const { data: upsertedProfile, error: profileError } = await adminClient
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: fullName || user.email?.split('@')[0] || 'Admin',
        company_id: company.id,
        role: 'admin',
      },
      { onConflict: 'id' }
    )
    .select('id')
    .single()

  if (profileError || !upsertedProfile) {
    console.error('[api/onboard] profile upsert failed:', profileError?.message)
    await supabase.auth.signOut()
    return NextResponse.redirect(
      new URL('/auth?error=onboarding_failed', request.url)
    )
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
