import { NextRequest, NextResponse } from 'next/server'
import { createServerClient }        from '@supabase/ssr'

/**
 * /auth/callback — PKCE code exchange for signup confirmation and invite flows.
 *
 * Password recovery no longer goes through here.
 * The Supabase "Reset Password" email template links directly to:
 *   /reset-password?token_hash={{ .TokenHash }}&type=recovery
 * and ResetPasswordForm calls verifyOtp({ token_hash, type: 'recovery' })
 * client-side — no PKCE verifier required, works cross-device.
 *
 * Why we build the redirect response before calling exchangeCodeForSession:
 *   next/headers cookies().set() does NOT propagate Set-Cookie headers to a
 *   NextResponse.redirect() — they are on separate response objects.
 *   By passing the redirect response into the Supabase client's setAll handler
 *   we ensure the session cookies ride along in the same response the browser
 *   actually receives.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')

  // Sanitise `next` — root-relative paths only, block protocol-relative
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : '/dashboard'

  if (code) {
    // Create the redirect response first so the Supabase client can attach
    // session cookies directly onto it via setAll.
    const redirectResponse = NextResponse.redirect(new URL(next, origin))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            for (const { name, value, options } of cookiesToSet) {
              redirectResponse.cookies.set(name, value, options as Record<string, unknown>)
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return redirectResponse
  }

  return NextResponse.redirect(
    new URL('/auth?error=auth_callback_failed', origin)
  )
}
