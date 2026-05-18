/**
 * sendWeeklyDigest.ts
 *
 * Orchestrator: given a companyId and an admin recipient, fetches digest
 * metrics, generates AI insights, builds the email, and sends via Resend.
 *
 * Designed to be called once per admin per company from the cron handler.
 */

import { aggregateDigestMetrics }  from './aggregateDigestMetrics'
import { generateDigestInsights }  from './generateDigestInsights'
import { buildDigestEmail }        from './buildDigestEmail'
import { resend }                  from '@/lib/supabase/resend'

export interface DigestRecipient {
  userId: string
  email:  string
  name:   string
}

export interface SendDigestResult {
  companyId:   string
  companyName: string
  plan:        string
  recipients:  string[]
  status:      'sent' | 'skipped' | 'error'
  reason?:     string
}

export async function sendWeeklyDigest(
  companyId:  string,
  admins:     DigestRecipient[],
  appUrl:     string,
  dryRun     = false,
): Promise<SendDigestResult> {
  // ── Fetch metrics ────────────────────────────────────────────────────────
  let metrics
  try {
    metrics = await aggregateDigestMetrics(companyId)
  } catch (err) {
    console.error(`[weekly-digest] aggregateDigestMetrics failed for ${companyId}:`, err)
    return {
      companyId,
      companyName: companyId,
      plan:        'unknown',
      recipients:  [],
      status:      'error',
      reason:      'metrics aggregation failed',
    }
  }

  // ── Skip free plans (should already be filtered at cron level, but double-guard) ──
  if (metrics.plan === 'free') {
    return {
      companyId,
      companyName: metrics.companyName,
      plan:        metrics.plan,
      recipients:  [],
      status:      'skipped',
      reason:      'free plan',
    }
  }

  // ── Generate insights ────────────────────────────────────────────────────
  const allTitles = metrics.topIdeas.map(i => i.title)
  const insights  = generateDigestInsights(metrics, allTitles)

  // ── Build email ──────────────────────────────────────────────────────────
  // Build once per admin (personalised greeting) — same content otherwise
  const sentEmails: string[] = []

  for (const admin of admins) {
    const { subject, html } = buildDigestEmail({
      adminName:      admin.name,
      metrics,
      insights,
      appUrl,
      unsubscribeUrl: `${appUrl}/settings`,
    })

    if (dryRun) {
      console.log(
        `[weekly-digest][DRY RUN] Would send "${subject}" to ${admin.email} ` +
        `(${metrics.companyName} / ${metrics.plan})`,
      )
      sentEmails.push(admin.email)
      continue
    }

    try {
      await resend.emails.send({
        from:    process.env.RESEND_FROM_EMAIL!,
        to:      [admin.email],
        subject,
        html,
      })
      sentEmails.push(admin.email)
      console.log(
        `[weekly-digest] Sent to ${admin.email} (${metrics.companyName})`,
      )
    } catch (emailErr) {
      console.error(
        `[weekly-digest] Email failed for ${admin.email} (${companyId}):`,
        emailErr,
      )
    }
  }

  return {
    companyId,
    companyName: metrics.companyName,
    plan:        metrics.plan,
    recipients:  sentEmails,
    status:      sentEmails.length > 0 ? 'sent' : 'error',
    reason:      sentEmails.length === 0 ? 'all email sends failed' : undefined,
  }
}
