'use client'

/**
 * RememberMeWatcher
 *
 * Mounted once globally from app/layout.tsx. Enforces the "Remember me
 * unchecked" path of the login form by signing the user out when they
 * close the tab.
 *
 * How it actually works (and why this isn't just `signOut()`):
 *
 *   1. AuthForm writes `ideaflow:no-persist=1` to sessionStorage when
 *      the user signs in with the box unchecked. sessionStorage is
 *      tab-scoped so the flag survives in-tab navigations but dies
 *      with the tab.
 *
 *   2. On every page we check the flag. If set, we register a
 *      `pagehide` listener.
 *
 *   3. When the tab is closing, the listener uses
 *      `navigator.sendBeacon('/api/auth/signout')`. Beacon is the ONE
 *      mechanism browsers guarantee will deliver a request during
 *      unload — `fetch(..., { keepalive: true })` is close but
 *      unreliable; plain async `supabase.auth.signOut()` is routinely
 *      aborted mid-flight.
 *
 *   4. The /api/auth/signout server route runs `supabase.auth.signOut()`
 *      with the @supabase/ssr server client, which writes the
 *      `Set-Cookie: …; Max-Age=0` headers that actually clear the
 *      HTTP-only auth cookies. Without this server round-trip the
 *      session lingers because client JS can't touch HTTP-only cookies.
 *
 * Renders nothing.
 */

import { useEffect } from 'react'

export default function RememberMeWatcher() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let armed = false
    try {
      armed = window.sessionStorage.getItem('ideaflow:no-persist') === '1'
    } catch {
      /* private mode or storage disabled — treat as persistent */
    }
    if (!armed) return

    function onPageHide() {
      // sendBeacon returns false if the browser refuses the call (size
      // limit, no body type recognised, etc.) — in that case fall back
      // to a keepalive fetch as a best-effort. Both target the same
      // server endpoint that clears cookies via Set-Cookie headers.
      const ok = navigator.sendBeacon?.(
        '/api/auth/signout',
        new Blob([JSON.stringify({})], { type: 'application/json' }),
      )
      if (!ok) {
        try {
          fetch('/api/auth/signout', {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json' },
            body: '{}',
          }).catch(() => { /* ignore — best effort */ })
        } catch { /* navigator gone, page is dying */ }
      }
    }

    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [])

  return null
}
