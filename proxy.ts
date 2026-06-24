import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieEntry = {
  name: string
  value: string
  options?: object
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieEntry[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          supabaseResponse = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  const isDashboard = path.startsWith('/dashboard')

  // /auth/callback must always remain reachable so recovery and magic-link
  // flows can complete even when a user already has a session.
  const isAuthPage =
    path.startsWith('/auth') &&
    path !== '/auth/callback'

  if (!user && isDashboard) {
    const loginUrl = new URL('/auth', request.url)

    loginUrl.searchParams.set('mode', 'login')

    const destination =
      request.nextUrl.pathname +
      (request.nextUrl.search || '')

    if (destination && destination !== '/dashboard') {
      loginUrl.searchParams.set('next', destination)
    } else {
      loginUrl.searchParams.set('next', '/dashboard')
    }

    return NextResponse.redirect(loginUrl)
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(
      new URL('/dashboard', request.url)
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/auth',
  ],
}