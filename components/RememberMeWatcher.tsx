'use client'

/**
 * RememberMeWatcher
 *
 * Mounted once globally from app/layout.tsx. Reads the
 * `ideaflow:no-persist` flag that AuthForm sets when a user signs in
 * with "Remember me" unchecked. If the flag is set, registers a
 * `pagehide` handler that calls `supabase.auth.signOut()` so the
 * session cookies are cleared when the user closes the tab — the
 * effective "session-only" behaviour a Remember-me toggle is expected
 * to provide.
 *
 * Renders nothing.
 *
 * Notes:
 *   • sessionStorage is tab-scoped, so the flag dies naturally when the
 *     tab does. The pagehide listener is the belt; clearing the flag is
 *     the suspenders.
 *   • `pagehide` is fired more reliably than `beforeunload` for the
 *     "tab is closing" case on modern browsers. We use pagehide.
 *   • signOut() is fire-and-forget. Cookie deletion is fast enough that
 *     it typically completes before the browser tears the tab down. The
 *     worst case is the session lingers for one more visit, then the
 *     user signs in again — still correct, not catastrophic.
 *   • Wrapped in try/catch because private-mode browsers may throw on
 *     sessionStorage access.
 */

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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

    const supabase = createClient()
    function onPageHide() {
      // Fire-and-forget; we cannot await inside pagehide reliably.
      supabase.auth.signOut().catch(() => { /* ignore */ })
    }

    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [])

  return null
}
