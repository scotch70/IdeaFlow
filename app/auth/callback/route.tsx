import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@supabase/ssr'

/**
 * /auth/callback — PKCE code exchange
 *
 * Why this doesn't use lib/supabase/server.ts:
 *   createClient() writes session cookies via next/headers cookies().set().
 *   Those writes are tracked on the current response, but NextResponse.redirect()
 *   creates a *new* response object — so the Set-Cookie headers never reach the
 *   browser.  The session is established on the server, silently discarded, and
 *   /reset-password finds no session → "expired" screen.
 *
 *   The correct Route Handler pattern is to build the redirect response first,
 *   then hand it to the Supabase client so setAll() writes directly onto it.
 *
 * Flows handled:
 *   type=recovery  → always /reset-password (never /, never /dashboard)
 *   signup/confirm → next param (default /dashboard)
 *   invite/join    → next=/join/... (preserved)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const type = searchParams.get('type')   // 'recovery' | null

  // Sanitise `next` — root-relative paths only, block protocol-relative
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : '/dashboard'

  // Recovery always lands on /reset-password regardless of `next`
  const destination = type === 'recovery' ? '/reset-password' : next

  if (code) {
    // ── Build the redirect response FIRST so cookies land in the same response ─
    const redirectResponse = NextResponse.redirect(new URL(destination, origin))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Read from the incoming request cookies
          getAll: () => request.cookies.getAll(),
          // Write directly onto the redirect response — NOT via cookies() from
          // next/headers, which would be dropped when NextResponse.redirect is returned
          setAll: (cookiesToSet) => {
            for (const { name, value, options } of cookiesToSet) {
              redirectResponse.cookies.set(name, value, options as Record<string, unknown>)
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // redirectResponse carries the Set-Cookie headers for the new session
      return redirectResponse
    }

    // Code exchange failed — for recovery that means an expired/used link
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/reset-password?error=expired', origin))
    }

    // Other flows (signup confirmation, etc.) — send to auth with error
    return NextResponse.redirect(
      new URL('/auth?error=auth_callback_failed', origin)
    )
  }

  // No code at all — recovery: send to expired state, other: generic error
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/reset-password?error=expired', origin))
  }

  return NextResponse.redirect(
    new URL('/auth?error=auth_callback_failed', origin)
  )
}
