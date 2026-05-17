'use client'

/**
 * AnalyticsProvider
 *
 * Lightweight client-side analytics provider.
 * Currently tracks page views via the Plausible/PostHog snippet if the
 * corresponding environment variable is set.
 *
 * Env vars:
 *   NEXT_PUBLIC_POSTHOG_KEY   — PostHog project API key (optional)
 *   NEXT_PUBLIC_POSTHOG_HOST  — PostHog host, defaults to https://app.posthog.com
 *
 * If neither is set, the component renders nothing (zero overhead).
 *
 * To track custom events from anywhere in the app:
 *   window.posthog?.capture('upgrade_clicked', { plan: 'pro' })
 */

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const POSTHOG_KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'

function AnalyticsInner() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  // ── Bootstrap PostHog once ─────────────────────────────────────────────────
  useEffect(() => {
    if (!POSTHOG_KEY) return

    // Dynamically import posthog-js only if a key is configured.
    // posthog-js is an optional peer dependency — the dynamic import + .catch()
    // ensures the app works without it installed.
    // @ts-expect-error — posthog-js is optional and may not be present in node_modules
    import('posthog-js').then(({ default: posthog }: { default: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!posthog.__loaded) {
        posthog.init(POSTHOG_KEY!, {
          api_host:          POSTHOG_HOST,
          capture_pageview:  false,  // manual below
          capture_pageleave: true,
          persistence:       'localStorage',
        })
      }
      // Expose on window for imperative tracking in onClick handlers
      ;(window as typeof window & { posthog?: typeof posthog }).posthog = posthog
    }).catch(() => {/* posthog-js not installed — analytics silently disabled */})
  }, [])

  // ── Track page views on route change ──────────────────────────────────────
  useEffect(() => {
    if (!POSTHOG_KEY) return
    const ph = (window as typeof window & { posthog?: { capture: (e: string, p?: object) => void } }).posthog
    if (!ph) return
    const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
    ph.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

/**
 * Wrap in Suspense because useSearchParams() requires it in Next.js 14.
 * The provider renders zero DOM — the null return is intentional.
 */
export default function AnalyticsProvider() {
  if (!POSTHOG_KEY) return null
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  )
}
