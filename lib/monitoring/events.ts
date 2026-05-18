/**
 * lib/monitoring/events.ts
 *
 * Lightweight structured event logging for IdeaFlow.
 *
 * Server-side usage (API routes, cron jobs, onboarding):
 *   import { logEvent } from '@/lib/monitoring/events'
 *   logEvent('signup', { companyId, plan: 'free' })
 *
 * In development → structured console.log
 * In production  → structured console.log (piped to Vercel logs / log drains)
 *
 * To connect PostHog, Plausible, or a log drain in the future,
 * add a provider in the `send()` function below without changing call sites.
 */

export type EventName =
  // Auth & onboarding
  | 'signup'
  | 'signup_confirmed'
  | 'onboarding_complete'
  | 'workspace_created'
  | 'member_joined'
  // IdeaFlows
  | 'flow_launched'
  | 'flow_closed'
  | 'idea_submitted'
  | 'idea_voted'
  // Billing
  | 'upgrade_clicked'
  | 'checkout_started'
  | 'subscription_activated'
  | 'subscription_cancelled'
  // Retention
  | 'digest_sent'
  | 'digest_skipped'
  | 'reminder_sent'
  | 'pdf_exported'
  // Errors
  | 'auth_error'
  | 'onboarding_error'
  | 'webhook_error'
  | 'cron_error'
  | 'checkout_error'
  | 'billing_portal_opened'

export interface EventPayload {
  companyId?:  string
  userId?:     string
  plan?:       string
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Log a structured event.
 * Safe to call from any server context (API routes, server actions, cron).
 */
export function logEvent(name: EventName, payload: EventPayload = {}): void {
  const entry = {
    event:   name,
    ts:      new Date().toISOString(),
    env:     process.env.NODE_ENV,
    ...payload,
  }

  // Structured single-line JSON — easily parsed by Vercel log drains,
  // Datadog, Logtail, or any log aggregator.
  console.log(`[event] ${JSON.stringify(entry)}`)
}

/**
 * Log an error with context.
 * Use instead of bare console.error so errors have consistent shape.
 */
export function logError(
  context: string,
  error:   unknown,
  payload: EventPayload = {},
): void {
  const message = error instanceof Error ? error.message : String(error)
  const stack   = error instanceof Error ? error.stack   : undefined

  console.error(`[error] ${JSON.stringify({
    context,
    message,
    stack:  stack?.split('\n').slice(0, 4).join(' | '),
    ts:     new Date().toISOString(),
    env:    process.env.NODE_ENV,
    ...payload,
  })}`)
}
