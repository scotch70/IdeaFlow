/**
 * GET /api/cron/flow-reminders
 *
 * Daily cron job that sends reminder emails to IdeaFlow members before a
 * flow's end date.
 *
 * Reminder schedule (based on ends_at date in UTC):
 *   '7_days_before' — sent when ends_at falls on today + 7 calendar days
 *   '1_day_before'  — sent when ends_at falls on today + 1 calendar day
 *
 * Idempotency: the idea_flow_reminders table holds one row per
 * (idea_round_id, reminder_type). If a row already exists the reminder is
 * skipped, so duplicate cron runs are safe.
 *
 * Auth: requires  Authorization: Bearer <CRON_SECRET>
 *
 * Query params:
 *   ?dryRun=1   — list matching flows + recipients without sending any email
 *                 or writing any rows. Safe to call in production for debugging.
 */

import { NextRequest, NextResponse }    from 'next/server'
import { createAdminClient }            from '@/lib/supabase/admin'
import { resend }                       from '@/lib/supabase/resend'
import { buildFlowReminderEmail, ReminderType } from '@/lib/email/flowEndingReminderEmail'
import { getEffectiveRoundStatus }      from '@/lib/rounds/getEffectiveRoundStatus'

export const dynamic = 'force-dynamic'

// ── Auth guard (same pattern as weekly-summary) ───────────────────────────────

function authorised(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  const header = request.headers.get('authorization')
  const token  = header?.startsWith('Bearer ') ? header.slice(7) : null
  return token === cronSecret
}

// ── Date window helpers ───────────────────────────────────────────────────────
// We look for flows whose ends_at falls on the *calendar day* that is exactly
// N days from today (in UTC). Using a full-day window means a daily cron at
// any time of day will still catch a flow ending at e.g. 23:59 UTC that day.

function utcDayWindow(offsetDays: number): { start: Date; end: Date } {
  const now   = new Date()
  const start = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + offsetDays,
    0, 0, 0, 0,
  ))
  const end   = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + offsetDays,
    23, 59, 59, 999,
  ))
  return { start, end }
}

// ── Recipient resolution ──────────────────────────────────────────────────────

interface Recipient {
  userId: string
  email:  string
  name:   string
}

async function getRecipients(
  supabase:  ReturnType<typeof createAdminClient>,
  roundId:   string,
  companyId: string,
  audienceMode: 'workspace' | 'restricted' | null,
  emailMap:  Map<string, string>,  // userId → email
): Promise<Recipient[]> {
  // Resolve the recipient set based on audience_mode, falling back to the
  // legacy "empty round_members = workspace" convention so this cron stays
  // correct on rows that pre-date the migration.
  const { data: members } = await (supabase as any)
    .from('round_members')
    .select('user_id')
    .eq('round_id', roundId)

  const assigned: string[] = (members ?? []).map((m: { user_id: string }) => m.user_id)
  let userIds: string[]

  const effectiveMode = audienceMode
    ?? (assigned.length > 0 ? 'restricted' : 'workspace')

  if (effectiveMode === 'restricted') {
    userIds = assigned
  } else {
    const { data: profiles } = await (supabase as any)
      .from('profiles')
      .select('id')
      .eq('company_id', companyId)

    userIds = (profiles ?? []).map((p: { id: string }) => p.id)
  }

  const recipients: Recipient[] = []
  const seen = new Set<string>()

  for (const userId of userIds) {
    if (seen.has(userId)) continue
    seen.add(userId)

    const email = emailMap.get(userId)
    if (!email) continue   // no email — skip

    // Get display name from profiles
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('full_name, last_name')
      .eq('id', userId)
      .single()

    const name = [profile?.full_name, profile?.last_name].filter(Boolean).join(' ')
      || 'there'

    recipients.push({ userId, email, name })
  }

  return recipients
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  if (!authorised(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dryRun  = request.nextUrl.searchParams.get('dryRun') === '1'
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.ideaflow.io'
  const supabase = createAdminClient()

  // ── Build email lookup map from Supabase Auth ──────────────────────────────
  // Fetch all auth users once (up to 1000) so we don't call getUserById
  // in a tight per-recipient loop.
  const { data: authData } = await (supabase as any).auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  const emailMap = new Map<string, string>()
  for (const u of (authData?.users ?? [])) {
    if (u.id && u.email) emailMap.set(u.id, u.email)
  }

  // ── Identify the two reminder windows ─────────────────────────────────────
  const windows: Array<{ type: ReminderType; start: Date; end: Date }> = [
    { type: '7_days_before', ...utcDayWindow(7) },
    { type: '1_day_before',  ...utcDayWindow(1) },
  ]

  // ── Fetch active-or-pending flows with an ends_at ─────────────────────────
  // We pull all flows that are not yet forcibly closed. The effective-status
  // check below handles manual_override and date-window logic.
  const { data: candidates, error: fetchError } = await (supabase as any)
    .from('idea_rounds')
    .select('id, company_id, name, status, manual_override, starts_at, ends_at, audience_mode')
    .not('ends_at', 'is', null)
    .neq('status', 'closed')

  if (fetchError) {
    console.error('[flow-reminders] Failed to fetch candidate rounds:', fetchError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  console.log(`[flow-reminders] ${candidates?.length ?? 0} candidate rounds with ends_at`)

  // ── Already-sent lookup ───────────────────────────────────────────────────
  const { data: alreadySent } = await (supabase as any)
    .from('idea_flow_reminders')
    .select('idea_round_id, reminder_type')

  const sentSet = new Set<string>(
    (alreadySent ?? []).map(
      (r: { idea_round_id: string; reminder_type: string }) =>
        `${r.idea_round_id}::${r.reminder_type}`,
    ),
  )

  // ── Process each window ───────────────────────────────────────────────────
  const results: Array<{
    roundId:      string
    roundName:    string
    reminderType: ReminderType
    status:       'sent' | 'skipped' | 'no_recipients' | 'error'
    recipients?:  string[]
    reason?:      string
  }> = []

  for (const win of windows) {
    const matchingRounds = (candidates ?? []).filter((r: {
      id: string; ends_at: string; status: string;
      manual_override: string | null; starts_at: string | null;
    }) => {
      if (!r.ends_at) return false

      // Skip if already sent this reminder type for this round
      if (sentSet.has(`${r.id}::${win.type}`)) return false

      // Skip if the round is effectively closed (manual override or past end)
      const effective = getEffectiveRoundStatus({
        raw_status:      r.status      as 'draft' | 'active' | 'closed' | null,
        manual_override: r.manual_override as 'open' | 'closed' | null,
        opens_at:        r.starts_at,
        closes_at:       r.ends_at,
      })
      if (effective === 'closed') return false

      // Check that ends_at falls within the target calendar day
      const endsAt = new Date(r.ends_at)
      return endsAt >= win.start && endsAt <= win.end
    })

    console.log(
      `[flow-reminders] ${win.type}: ${matchingRounds.length} rounds to process`,
    )

    for (const round of matchingRounds) {
      const endsAt = new Date(round.ends_at)

      // Get recipients
      let recipients: Recipient[] = []
      try {
        recipients = await getRecipients(
          supabase,
          round.id,
          round.company_id,
          (round as { audience_mode?: 'workspace' | 'restricted' | null }).audience_mode ?? null,
          emailMap,
        )
      } catch (err) {
        console.error(`[flow-reminders] Failed to resolve recipients for ${round.id}:`, err)
        results.push({
          roundId:      round.id,
          roundName:    round.name,
          reminderType: win.type,
          status:       'error',
          reason:       'recipient resolution failed',
        })
        continue
      }

      if (recipients.length === 0) {
        console.log(`[flow-reminders] No recipients for round ${round.id} — skipping`)
        results.push({
          roundId:      round.id,
          roundName:    round.name,
          reminderType: win.type,
          status:       'no_recipients',
        })
        continue
      }

      if (dryRun) {
        console.log(
          `[flow-reminders][DRY RUN] Would send ${win.type} for "${round.name}" ` +
          `to ${recipients.length} recipients: ${recipients.map(r => r.email).join(', ')}`,
        )
        results.push({
          roundId:      round.id,
          roundName:    round.name,
          reminderType: win.type,
          status:       'skipped',
          reason:       'dry run',
          recipients:   recipients.map(r => r.email),
        })
        continue
      }

      // ── Send emails ──────────────────────────────────────────────────────
      let sentCount = 0

      for (const recipient of recipients) {
        const { subject, html } = buildFlowReminderEmail({
          recipientName: recipient.name,
          flowName:      round.name,
          flowId:        round.id,
          endsAt,
          reminderType:  win.type,
          appUrl,
        })

        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to:   [recipient.email],
            subject,
            html,
          })
          sentCount++
        } catch (emailErr) {
          // Partial failure: log and continue — we still record the reminder
          // so we don't retry for the recipients who received it.
          console.error(
            `[flow-reminders] Email failed for ${recipient.email} (round ${round.id}):`,
            emailErr,
          )
        }
      }

      // ── Record that we sent this reminder ───────────────────────────────
      // Insert with ON CONFLICT DO NOTHING so concurrent cron runs don't race.
      const { error: insertErr } = await (supabase as any)
        .from('idea_flow_reminders')
        .insert({ idea_round_id: round.id, reminder_type: win.type })
        .select()

      if (insertErr && insertErr.code !== '23505') {
        // 23505 = unique_violation — harmless here, means a concurrent run won
        console.error(
          `[flow-reminders] Failed to record reminder for round ${round.id}:`,
          insertErr,
        )
      }

      console.log(
        `[flow-reminders] ${win.type} for "${round.name}": ` +
        `${sentCount}/${recipients.length} emails sent`,
      )

      results.push({
        roundId:      round.id,
        roundName:    round.name,
        reminderType: win.type,
        status:       'sent',
        recipients:   recipients.map(r => r.email),
      })
    }
  }

  const summary = {
    dryRun,
    sent:          results.filter(r => r.status === 'sent').length,
    skipped:       results.filter(r => r.status === 'skipped').length,
    noRecipients:  results.filter(r => r.status === 'no_recipients').length,
    errors:        results.filter(r => r.status === 'error').length,
    details:       results,
  }

  console.log('[flow-reminders] Complete:', JSON.stringify({
    dryRun,
    sent:         summary.sent,
    skipped:      summary.skipped,
    noRecipients: summary.noRecipients,
    errors:       summary.errors,
  }))

  return NextResponse.json(summary)
}
