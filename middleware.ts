import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieEntry = { name: string; value: string; options?: object }

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: CookieEntry[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path        = request.nextUrl.pathname
  const isDashboard = path.startsWith('/dashboard')

  // /auth/callback is a utility Route Handler, not a "login page".
  // It must be reachable even for already-authenticated users (e.g. when a
  // logged-in user clicks a password-reset email — the callback needs to
  // exchange the recovery code and establish the recovery session before
  // redirecting to /reset-password).
  const isAuthPage  = path.startsWith('/auth') && path !== '/auth/callback'

  if (!user && isDashboard) {
    // Preserve the user's intended destination so AuthForm can send them back
    // there after a successful sign-in. Land directly on the login view
    // (mode=login) rather than the choose-path screen.
    const loginUrl = new URL('/auth', request.url)
    loginUrl.searchParams.set('mode', 'login')
    const dest = request.nextUrl.pathname + (request.nextUrl.search || '')
    if (dest && dest !== '/dashboard') loginUrl.searchParams.set('next', dest)
    else                                loginUrl.searchParams.set('next', '/dashboard')
    return NextResponse.redirect(loginUrl)
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/auth'],
}
