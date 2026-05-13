import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend } from '../../../lib/supabase/resend'
import { canAddMembers } from '@/lib/billing'
import { checkRateLimit, getClientIp } from '@/lib/ratelimit'

function generateInviteCode(companyName: string) {
  const prefix = companyName
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8)

  // 8 hex bytes = 64 bits of cryptographically secure randomness.
  // Replaces Math.random() which was ~29 bits and not a CSPRNG.
  const random = randomBytes(8).toString('hex').toUpperCase()
  return `${prefix}-${random}`
}

export async function POST(request: NextRequest) {
  // ── Rate limit — checked before any auth or DB work ───────────────────────
  // 10 requests per IP per 60 s. Admin-only, but still capped to prevent
  // credential-stuffing that escalates into bulk invite generation.
  const ip = getClientIp(request)
  const allowed = await checkRateLimit(`invites:${ip}`, 60, 10)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many invite requests. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, idea_round_id } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('id, role, company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create invites' },
        { status: 403 }
      )
    }

    if (!profile.company_id) {
      return NextResponse.json({ error: 'No company found' }, { status: 400 })
    }

    const { data: company, error: companyError } = await (supabase as any)
  .from('companies')
  .select('id, name, plan, trial_ends_at')
  .eq('id', profile.company_id)
  .single()

if (companyError || !company) {
  return NextResponse.json({ error: 'Company not found' }, { status: 404 })
}

const { count: memberCount, error: countError } = await supabase
  .from('profiles')
  .select('*', { count: 'exact', head: true })
  .eq('company_id', profile.company_id)

if (countError) {
  return NextResponse.json({ error: countError.message }, { status: 500 })
}

if (!canAddMembers({ plan: company.plan, memberCount: memberCount || 0 })) {
  return NextResponse.json(
    {
      error:
        company.plan === 'pro'
          ? 'Pro plan workspace limit reached (50 members).'
          : 'Free plan is limited to 10 members. Upgrade to Pro to invite more.',
    },
    { status: 403 },
  )
}

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Validate idea_round_id belongs to this company (if provided)
    let validatedRoundId: string | null = null
    if (idea_round_id) {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const admin = createAdminClient()
      const { data: round } = await (admin as any)
        .from('idea_rounds')
        .select('id, name')
        .eq('id', idea_round_id)
        .eq('company_id', profile.company_id)
        .single()
      if (!round) {
        return NextResponse.json({ error: 'IdeaFlow not found' }, { status: 404 })
      }
      validatedRoundId = idea_round_id
    }

    const inviteCode = generateInviteCode(company.name || 'COMPANY')

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: invite, error: inviteError } = await (supabase as any)
      .from('invites')
      .insert({
        company_id:    profile.company_id,
        created_by:    user.id,
        invite_code:   inviteCode,
        role:          'member',
        name:          name.trim(),
        email:         email?.trim() || null,
        expires_at:    expiresAt,
        idea_round_id: validatedRoundId,
      })
      .select()
      .single()

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    // Always use the canonical production domain.
    // Never fall back to request.nextUrl.origin — that would produce a Vercel
    // preview URL on non-production deployments.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://useideaflow.com'
    const joinUrl = `${appUrl}/join?code=${inviteCode}`

    // Email is best-effort — a delivery failure must never hide the invite URL.
    // The invite row is already in the database at this point; returning a 500
    // here would burn the invite (URL lost, no way to resend without a new row).
    let emailSent = false
    let emailWarning: string | null = null

    if (email?.trim()) {
      const isFlowInvite = !!validatedRoundId
      const emailSubject = isFlowInvite
        ? `You've been invited to an IdeaFlow at ${company.name}`
        : `You are invited to join ${company.name} on IdeaFlow`
      const btnLabel = isFlowInvite ? 'Join IdeaFlow' : 'Join workspace'
      const bodyLine = isFlowInvite
        ? `You've been invited to share your ideas in an IdeaFlow at <strong>${company.name}</strong>.`
        : `You have been invited to join your company workspace on IdeaFlow.`

      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: [email.trim()],
        subject: emailSubject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>${emailSubject}</h2>
            <p>Hello ${name.trim()},</p>
            <p>${bodyLine}</p>
            <p>
              <a href="${joinUrl}" style="display:inline-block;padding:10px 16px;background:#f97316;color:#ffffff;text-decoration:none;border-radius:8px;">
                ${btnLabel}
              </a>
            </p>
            <p>If the button does not work, use this link:</p>
            <p>${joinUrl}</p>
            <p>Your invite link expires on <strong>${new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }).format(new Date(expiresAt))}</strong>.</p>
          </div>
        `,
      })

      if (emailError) {
        // Log for ops visibility but do not surface the raw Resend message to
        // the client — it leaks internal configuration details.
        console.error('[api/invites] email delivery failed:', emailError.message)
        emailWarning = 'Invite created, but the email could not be delivered. Share the link below manually.'
      } else {
        emailSent = true
      }
    }

    return NextResponse.json({
      success: true,
      invite,
      joinUrl,
      emailSent,
      emailWarning,   // non-null signals a delivery problem; invite is still valid
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Something went wrong',
      },
      { status: 500 }
    )
  }
}