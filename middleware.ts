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
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/auth'],
}
