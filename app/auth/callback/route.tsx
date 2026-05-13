import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  const rawNext = requestUrl.searchParams.get('next') ?? '/dashboard'
  // Allow only root-relative paths ("/foo").
  // Block protocol-relative URLs ("//attacker.com"): new URL('//attacker.com',
  // origin) inherits the scheme and replaces the host, escaping the app.
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : '/dashboard'

  // Safety guard: the auth callback must NEVER route a code exchange directly
  // to /reset-password. Password reset emails from forgot-password use
  //   redirectTo: `${APP_URL}/auth/callback?next=/reset-password`
  // which means a recovery code can legitimately arrive here with next=/reset-password.
  //
  // However, if any other flow accidentally sets next=/reset-password (e.g., a
  // misconfigured Supabase Site URL), exchanging a signup confirmation code
  // server-side and redirecting to /reset-password would show the wrong UI.
  //
  // We intentionally allow next=/reset-password here because the server-side
  // exchange below creates the session in the cookie, and /reset-password
  // detects the absence of a ?code= param and falls back to session-based
  // detection. The PKCE path in /reset-password now distinguishes
  // PASSWORD_RECOVERY from SIGNED_IN events so non-recovery sessions are
  // redirected to /dashboard automatically.
  //
  // What we DO block: /reset-password appearing in the `next` when there is
  // no `code` at all (open-redirect protection already handled by the
  // startsWith('/') check above).

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  return NextResponse.redirect(
    new URL('/auth?error=auth_callback_failed', requestUrl.origin)
  )
}