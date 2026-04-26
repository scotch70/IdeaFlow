import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resend } from '@/lib/supabase/resend'
import { buildStatusEmail, type EmailStatus } from '@/lib/email/ideaStatusEmail'

const VALID_STATUSES = [
  'open',
  'under_review',
  'planned',
  'in_progress',
  'implemented',
  'declined',
] as const

type IdeaStatus = (typeof VALID_STATUSES)[number]

/** Statuses that trigger an email notification to the idea author. */
const EMAIL_STATUSES: IdeaStatus[] = [
  'under_review',
  'planned',
  'in_progress',
  'implemented',
  'declined',
]

/** These statuses require a non-trivial note before saving. */
const NOTE_REQUIRED: IdeaStatus[] = ['declined', 'implemented']
const MIN_NOTE_LENGTH = 30

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'IdeaFlow <notifications@ideaflow.app>'

export async function POST(request: NextRequest) {
  try {
    // SSR client — used only for auth + profile (needs cookie session)
    const supabase = await createClient()
    // Admin client — bypasses RLS for idea reads/writes
    const adminClient = createAdminClient()

    // ── Auth ──────────────────────────────────────────────────────────────────
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Role check — admin only ───────────────────────────────────────────────
    const { data: profile } = (await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()) as unknown as {
      data: { role: string; company_id: string } | null
    }

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admins only' }, { status: 403 })
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    const body = await request.json()
    const { ideaId, status, note, impactSummary, impactType, impactLink } = body as {
      ideaId: unknown
      status: unknown
      note: unknown
      impactSummary: unknown
      impactType: unknown
      impactLink: unknown
    }

    if (typeof ideaId !== 'string' || !ideaId) {
      return NextResponse.json({ error: 'ideaId is required' }, { status: 400 })
    }

    if (typeof status !== 'string' || !VALID_STATUSES.includes(status as IdeaStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 },
      )
    }

    const noteStr           = typeof note          === 'string' ? note.trim()          : ''
    const impactSummaryStr  = typeof impactSummary === 'string' ? impactSummary.trim() : ''
    const impactTypeStr     = typeof impactType    === 'string' ? impactType.trim()    : ''
    const impactLinkStr     = typeof impactLink    === 'string' ? impactLink.trim()    : ''

    // ── Note validation ───────────────────────────────────────────────────────
    if (NOTE_REQUIRED.includes(status as IdeaStatus) && noteStr.length < MIN_NOTE_LENGTH) {
      const action = status === 'declined' ? 'declining' : 'implementing'
      return NextResponse.json(
        {
          error: `A note of at least ${MIN_NOTE_LENGTH} characters is required when ${action} an idea.`,
        },
        { status: 400 },
      )
    }

    // ── Impact link must be a valid https:// URL if provided ─────────────────
    if (impactLinkStr) {
      try {
        const parsed = new URL(impactLinkStr)
        if (parsed.protocol !== 'https:') throw new Error()
      } catch {
        return NextResponse.json(
          { error: 'Impact link must be a valid https:// URL.' },
          { status: 400 },
        )
      }
    }

    // ── Impact summary required when marking implemented ─────────────────────
    if (status === 'implemented' && impactSummaryStr.length < 10) {
      return NextResponse.json(
        { error: 'An impact summary (at least 10 characters) is required when marking an idea as implemented.' },
        { status: 400 },
      )
    }

    // ── Fetch idea via admin client (bypasses RLS) ────────────────────────────
    const { data: idea, error: ideaError } = (await adminClient
      .from('ideas')
      .select('id, company_id, user_id, title, status')
      .eq('id', ideaId)
      .single()) as unknown as {
      data: {
        id: string
        company_id: string
        user_id: string
        title: string
        status: string
      } | null
      error: { message: string; code: string } | null
    }

    if (ideaError || !idea) {
      console.error('[api/ideas/status] idea fetch failed:', ideaError, '| ideaId:', ideaId)
      return NextResponse.json(
        { error: ideaError?.message ?? 'Idea not found', code: ideaError?.code },
        { status: 404 },
      )
    }

    // ── Same-company guard ────────────────────────────────────────────────────
    if (idea.company_id !== profile.company_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ── Optimistic-lock update via admin client (bypasses RLS) ──────────────
    // .eq('status', idea.status) is the concurrency guard: the UPDATE only
    // matches the row if its status in the DB still equals what we read above.
    // If another admin updated the same idea between our read and this write,
    // their change will have altered the stored status and this predicate will
    // match nothing — Supabase returns an empty array rather than a row.
    // We use .select() (array) instead of .single() so a no-match returns []
    // rather than a PostgREST 406 error, letting us distinguish "conflict" from
    // "DB error" cleanly.
    const { data: updatedRows, error: updateError } = (await (adminClient as any)
  .from('ideas')
  .update({
    status,
    status_note:       noteStr || null,
    status_changed_at: new Date().toISOString(),
    status_changed_by: user.id,
    impact_summary: status === 'implemented' ? impactSummaryStr : null,
    impact_type:    status === 'implemented' ? (impactTypeStr || null) : null,
    impact_link:    status === 'implemented' ? (impactLinkStr || null) : null,
  })
  .eq('id', ideaId)
  .eq('status', idea.status)   // ← optimistic lock: only update if status unchanged
  .select()) as unknown as { data: unknown[]; error: { message: string } | null }

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Empty array means the predicate matched nothing — another request already
    // changed the status. Return 409 so the client can prompt the admin to reload.
    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      return NextResponse.json(
        { error: 'This idea was updated by someone else. Reload the page and try again.' },
        { status: 409 },
      )
    }

    const updated = updatedRows[0]

    // ── Send notification email (fire-and-forget) ─────────────────────────────
    // statusChanged is now derived after the guarded write succeeds, so emails
    // are only sent when this request actually owned the transition — not when
    // the status was read as different but the update was then lost to a race.
    const statusChanged = idea.status !== status
    if (statusChanged && EMAIL_STATUSES.includes(status as IdeaStatus)) {
      sendStatusEmail({
        authorId: idea.user_id,
        ideaTitle: idea.title,
        status: status as EmailStatus,
        note: noteStr || null,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin,
      }).catch((err) => {
        // Never let email failure break the main flow
        console.error('[api/ideas/status] email send failed:', err)
      })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[api/ideas/status] crash:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Something went wrong' },
      { status: 500 },
    )
  }
}

// ── Email helper (async, isolated) ────────────────────────────────────────────

async function sendStatusEmail({
  authorId,
  ideaTitle,
  status,
  note,
  appUrl,
}: {
  authorId: string
  ideaTitle: string
  status: EmailStatus
  note: string | null
  appUrl: string
}) {
  const adminClient = createAdminClient()

  // Get author email via service role (auth.users is not accessible via anon key)
  const {
    data: { user: authorUser },
    error: userFetchError,
  } = await adminClient.auth.admin.getUserById(authorId)

  if (userFetchError || !authorUser?.email) {
    console.warn('[sendStatusEmail] could not fetch author email:', userFetchError?.message)
    return
  }

  // Get author display name from profiles
  const { data: authorProfile } = (await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', authorId)
    .single()) as unknown as {
    data: { full_name: string | null } | null
  }

  const authorName =
    authorProfile?.full_name?.trim() || authorUser.email.split('@')[0]

  const { subject, html } = buildStatusEmail({
    authorName,
    ideaTitle,
    status,
    note,
    appUrl,
  })

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [authorUser.email],
    subject,
    html,
  })
}
