import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ExistingProfileResult = {
  company_id: string | null
}

/**
 * GET /api/onboard
 *
 * Fallback onboarding endpoint for when the database trigger that creates a
 * company + admin profile did not fire (e.g. latency, missing migration, or a
 * trigger that was disabled).
 *
 * Safe to call multiple times — idempotent by design:
 *   • If the profile already has a company_id   → redirect /dashboard
 *   • If everything needs creating              → insert company + upsert profile
 *
 * On any unrecoverable error, the user is signed out and redirected to /auth.
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

  const { data: existingProfile, error: existingProfileError } = (await adminClient
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .maybeSingle()) as unknown as {
    data: ExistingProfileResult | null
    error: { message: string } | null
  }

  if (existingProfileError) {
    // Transient DB read failure — the user's session is still valid.
    // Signing them out here would force a full re-signup for a temporary blip.
    // Redirect with a recoverable error code so the auth page can show a
    // "something went wrong, please try again" message without losing the session.
    console.error('[api/onboard] existing profile lookup failed:', existingProfileError.message)
    return NextResponse.redirect(
      new URL('/auth?error=temporary_error', request.url)
    )
  }

  if (existingProfile?.company_id) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── Resolve metadata ───────────────────────────────────────────────────────
  const fullName = (user.user_metadata?.full_name as string | undefined)?.trim() ?? ''
  const companyName = (user.user_metadata?.company_name as string | undefined)?.trim() ?? ''

  if (!companyName) {
    await supabase.auth.signOut()
    return NextResponse.redirect(
      new URL('/auth?error=onboarding_failed', request.url)
    )
  }

  // ── Create company ─────────────────────────────────────────────────────────
  const { data: company, error: companyError } = await (adminClient as any)
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
    // Transient DB write failure — no company row was created, so no
    // partial state exists.  Preserve the session so the user can retry
    // without re-entering their email and password.
    console.error('[api/onboard] company insert failed:', companyError?.message)
    return NextResponse.redirect(
      new URL('/auth?error=temporary_error', request.url)
    )
  }

  // ── Upsert profile ─────────────────────────────────────────────────────────
  const { data: upsertedProfile, error: profileError } = await (adminClient as any)
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