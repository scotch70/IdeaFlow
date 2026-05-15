import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * /auth/callback
 *
 * Handles PKCE code exchange for three distinct flows:
 *   1. Password recovery  — type=recovery, always routes to /reset-password
 *   2. Invite / sign-up   — next=/join/... or next=/dashboard (default)
 *   3. Email confirmation — next=/dashboard (default)
 *
 * Never redirects recovery flows to /dashboard or /.
 * Never redirects recovery failures silently to /.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'recovery' | null

  // Sanitise `next` — allow only root-relative paths, block protocol-relative
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : '/dashboard'

  // Recovery flows always end on /reset-password regardless of `next`
  const destination = type === 'recovery' ? '/reset-password' : next

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(destination, origin))
    }
  }

  // Recovery with no code, or failed code exchange for recovery
  // → send to reset-password with ?error=expired so it shows "link expired"
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/reset-password?error=expired', origin))
  }

  // All other failures (broken signup link, etc.)
  return NextResponse.redirect(
    new URL('/auth?error=auth_callback_failed', origin)
  )
}
