/**
 * POST /api/auth/signout
 *
 * Server endpoint dedicated to the Remember-me-off path. When the
 * RememberMeWatcher detects the no-persist flag during pagehide it
 * fires `navigator.sendBeacon('/api/auth/signout')`, which is the only
 * mechanism browsers actually guarantee will deliver a request during
 * tab teardown.
 *
 * We use the @supabase/ssr server client so that the cookie writes
 * (Supabase's `signOut()` clears the session cookies via Set-Cookie)
 * propagate back to the browser response — that's what actually logs
 * the user out across pages, not the client-side localStorage clear.
 *
 * Always returns 204. We don't care if the user was already signed out
 * or never had a session — the desired end state is "no session", which
 * we get for free.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  // Fire-and-forget; result doesn't change the response.
  await supabase.auth.signOut().catch(() => { /* swallow — endpoint is idempotent */ })
  return new NextResponse(null, { status: 204 })
}

// Also accept GET so a fallback link can hit it from the browser bar in
// rare debugging scenarios; sendBeacon uses POST so this is belt + braces.
export async function GET() {
  return POST()
}
