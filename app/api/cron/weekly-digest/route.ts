/**
 * GET /api/cron/weekly-digest
 *
 * Weekly cron job (Monday 08:00 UTC) that sends the AI-powered workspace digest
 * to admins of all paid workspaces.
 *
 * Plan differentiation:
 *   free     — skipped entirely
 *   standard — metrics + top ideas + upgrade teaser
 *   pro      — + AI insights + recommendations
 *
 * Auth: requires  Authorization: Bearer <CRON_SECRET>
 *
 * Query params:
 *   ?dryRun=1          — lists recipients + subjects without sending any email
 *   ?companyId=<uuid>  — restrict to a single company (useful for testing)
 */

import { NextRequest, NextResponse }  from 'next/server'
import { createAdminClient }          from '@/lib/supabase/admin'
import { sendWeeklyDigest, DigestRecipient } from '@/lib/digest/sendWeeklyDigest'

export const dynamic = 'force-dynamic'

// ── Auth guard ─────────────────────────────────────────────────────────────────

function authorised(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  const header = request.headers.get('authorization')
  const token  = header?.startsWith('Bearer ') ? header.slice(7) : null
  return token === cronSecret
}

// ── Main handler ───────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!authorised(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params        = request.nextUrl.searchParams
  const dryRun        = params.get('dryRun') === '1'
  const filterCompany = params.get('companyId') ?? null
  const appUrl        = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.ideaflow.io'
  const admin         = createAdminClient()

  // ── Fetch all auth users for email resolution ──────────────────────────────
  const { data: authData } = await (admin as any).auth.admin.listUsers({
    page:    1,
    perPage: 1000,
  })
  const emailMap = new Map<string, string>()
  for (const u of (authData?.users ?? [])) {
    if (u.id && u.email) emailMap.set(u.id, u.email)
  }

  // ── Fetch paid companies ───────────────────────────────────────────────────
  let companiesQuery = (admin as any)
    .from('companies')
    .select('id, name, plan')
    .neq('plan', 'free')

  if (filterCompany) {
    companiesQuery = companiesQuery.eq('id', filterCompany)
  }

  const { data: companies, error: companiesError } = await companiesQuery

  if (companiesError) {
    console.error('[weekly-digest] Failed to fetch companies:', companiesError)
    return NextResponse.json({ error: 'DB error fetching companies' }, { status: 500 })
  }

  console.log(
    `[weekly-digest] Processing ${companies?.length ?? 0} paid companies` +
    (dryRun ? ' [DRY RUN]' : ''),
  )

  // ── Process each company ───────────────────────────────────────────────────
  const results = []

  for (const company of (companies ?? [])) {
    // ── Find admins ──────────────────────────────────────────────────────────
    const { data: adminProfiles } = await (admin as any)
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', company.id)
      .eq('role', 'admin')

    const admins: DigestRecipient[] = []

    for (const profile of (adminProfiles ?? [])) {
      const email = emailMap.get(profile.id)
      if (!email) continue

      admins.push({
        userId: profile.id,
        email,
        name: profile.full_name || 'Admin',
      })
    }

    if (admins.length === 0) {
      console.log(`[weekly-digest] No admins found for ${company.id} (${company.name}) — skipping`)
      results.push({
        companyId:   company.id,
        companyName: company.name,
        plan:        company.plan,
        status:      'skipped',
        reason:      'no admins found',
        recipients:  [],
      })
      continue
    }

    // ── Send digest ──────────────────────────────────────────────────────────
    try {
      const result = await sendWeeklyDigest(company.id, admins, appUrl, dryRun)
      results.push(result)
    } catch (err) {
      console.error(
        `[weekly-digest] Unhandled error for company ${company.id}:`,
        err,
      )
      results.push({
        companyId:   company.id,
        companyName: company.name,
        plan:        company.plan,
        status:      'error',
        reason:      err instanceof Error ? err.message : 'unknown error',
        recipients:  [],
      })
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const summary = {
    dryRun,
    processed: results.length,
    sent:      results.filter(r => r.status === 'sent').length,
    skipped:   results.filter(r => r.status === 'skipped').length,
    errors:    results.filter(r => r.status === 'error').length,
    details:   results,
  }

  console.log('[weekly-digest] Complete:', JSON.stringify({
    dryRun,
    processed: summary.processed,
    sent:      summary.sent,
    skipped:   summary.skipped,
    errors:    summary.errors,
  }))

  return NextResponse.json(summary)
}
