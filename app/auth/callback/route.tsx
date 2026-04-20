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