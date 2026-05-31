// ─────────────────────────────────────────────────────────────────────────────
// Sessions analytics — thin helper over window.posthog.
//
// AnalyticsProvider already loads PostHog via its CDN snippet when
// NEXT_PUBLIC_POSTHOG_KEY is set; it exposes the typed `window.posthog`
// global. This helper just gives the rest of the app a small, typed entry
// point so call sites read as `trackSessionEvent('created', { … })` instead
// of poking `window.posthog?.capture(...)` directly.
//
// All events:
//   • are noop on the server (window guard)
//   • are noop in dev when PostHog isn't configured (the global is undefined)
//   • carry the framework type so completion / abandonment rates are
//     derivable per-framework in PostHog with no extra wiring
//
// Event names follow the existing convention used elsewhere (snake_case
// "thing_verb" — e.g. `pricing_clicked` / `upgrade_started`).
// ─────────────────────────────────────────────────────────────────────────────

import type { TemplateType } from '@/types/sessions'

/**
 * The set of session lifecycle moments we care about. Adding a new event?
 * Add it here so call sites stay strongly typed.
 *
 *   created   — User pressed a framework card → row inserted in `sessions`
 *   started   — User opened the workspace and the canvas measured at least once
 *   completed — User clicked "Mark finished" in the summary modal
 *   abandoned — Reserved for future use (idle timeout / explicit close-without-finish)
 */
export type SessionEvent =
  | 'session_created'
  | 'session_started'
  | 'session_completed'
  | 'session_abandoned'

interface BaseProps {
  sessionId:    string
  templateType: TemplateType | string
}

interface CompletedProps extends BaseProps {
  /** Number of cards on the canvas when the user finished. */
  cardCount?:        number
  /** Number of connections drawn. */
  connectionCount?:  number
  /** Step keys the user marked complete (out of 5). */
  stepsCompleted?:   number
  /** Was any priority card starred? Quick proxy for "user actually engaged". */
  hasPriority?:      boolean
}

/**
 * Send a session lifecycle event to analytics.
 *
 * Safe to call from any client component or effect — silently no-ops in
 * environments where window.posthog isn't loaded (SSR, dev without a key,
 * users with ad-blockers).
 */
export function trackSessionEvent(
  event: SessionEvent,
  props: BaseProps | CompletedProps,
): void {
  if (typeof window === 'undefined') return
  try {
    window.posthog?.capture(event, props as unknown as Record<string, unknown>)
  } catch {
    // Never let an analytics failure break the UI flow.
  }
}
