'use client'

/**
 * AnalyticsProvider
 *
 * Loads PostHog via their official CDN snippet — no npm package required.
 * The snippet creates window.posthog as a stub immediately (synchronous),
 * then loads PostHog's real library async from their CDN. Calls made before
 * the library loads are queued and flushed automatically.
 *
 * Env vars (both optional):
 *   NEXT_PUBLIC_POSTHOG_KEY   — PostHog project API key (e.g. phc_xxx…)
 *   NEXT_PUBLIC_POSTHOG_HOST  — PostHog ingestion host
 *                               defaults to https://us.i.posthog.com
 *
 * When NEXT_PUBLIC_POSTHOG_KEY is not set:
 *   - Component renders null
 *   - No script is injected
 *   - Zero bundle impact
 *   - Build succeeds unconditionally
 *
 * To enable analytics: set NEXT_PUBLIC_POSTHOG_KEY in .env.local or Vercel.
 * To track custom events anywhere in the app:
 *   window.posthog?.capture('upgrade_clicked', { plan: 'pro' })
 *
 * WHY CDN SNIPPET instead of import('posthog-js'):
 *   Next.js/webpack processes all import() calls at build time to create
 *   code-split bundles. A missing module = build failure — even with .catch().
 *   The CDN snippet is a plain <script> tag: webpack never sees it.
 */

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

const POSTHOG_KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

// ── Minimal window.posthog type ────────────────────────────────────────────────
// We don't need the full posthog-js types. This covers everything we call.
// The stub created by the CDN snippet satisfies this interface.

type PostHogCapture = {
  capture: (event: string, props?: Record<string, unknown>) => void
}

declare global {
  interface Window {
    posthog?: PostHogCapture
  }
}

// ── PostHog CDN snippet (minified) ─────────────────────────────────────────────
// Source: https://posthog.com/docs/libraries/js#without-package-manager
// Creates window.posthog stub immediately; loads real library async from CDN.
// The stub queues all calls; they are flushed once array.js finishes loading.
function buildSnippet(key: string, host: string): string {
  return `
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="capture identify alias people.set people.set_once set unset remove union opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init(${JSON.stringify(key)},{api_host:${JSON.stringify(host)},capture_pageview:false,capture_pageleave:true,persistence:"localStorage"});
`.trim()
}

// ── Inner component (needs Suspense for useSearchParams) ───────────────────────

function AnalyticsInner() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  // Track page views manually on every route change.
  // window.posthog is the stub (or real library once loaded) — safe to call
  // immediately because the stub queues calls until the CDN library arrives.
  useEffect(() => {
    if (!POSTHOG_KEY) return
    const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
    window.posthog?.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  // Inject the CDN snippet once. strategy="afterInteractive" means it runs
  // after hydration — correct for analytics that must not block rendering.
  return (
    <Script
      id="posthog-snippet"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: buildSnippet(POSTHOG_KEY!, POSTHOG_HOST) }}
    />
  )
}

// ── Public export ──────────────────────────────────────────────────────────────

/**
 * Drop this once inside <body> in app/layout.tsx.
 * Renders null and injects nothing when NEXT_PUBLIC_POSTHOG_KEY is not set.
 */
export default function AnalyticsProvider() {
  // Guard at module level — no key means no script, no overhead, no errors.
  if (!POSTHOG_KEY) return null
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  )
}
