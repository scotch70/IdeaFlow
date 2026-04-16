import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend } from '../../../lib/supabase/resend'
import { canAddMembers } from '@/lib/billing'

function generateInviteCode(companyName: string) {
  const prefix = companyName
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 8)

  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `${prefix}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email } = await request.json()

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

if (
  !canAddMembers({
    plan: company.plan,
    trialEndsAt: company.trial_ends_at,
    memberCount: memberCount || 0,
  })
) {
  return NextResponse.json(
    {
      error:
        company.plan === 'free'
          ? 'Free trial limit reached. Upgrade to Pro to invite more members.'
          : 'Unable to add more members.',
    },
    { status: 403 }
  )
}

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const inviteCode = generateInviteCode(company.name || 'COMPANY')

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { data: invite, error: inviteError } = await (supabase as any)
      .from('invites')
      .insert({
        company_id: profile.company_id,
        created_by: user.id,
        invite_code: inviteCode,
        role: 'member',
        name: name.trim(),
        email: email?.trim() || null,
        expires_at: expiresAt,
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

    if (email?.trim()) {
      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: [email.trim()],
        subject: `You are invited to join ${company.name} on IdeaFlow`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>You have been invited to join ${company.name}</h2>
            <p>Hello ${name.trim()},</p>
            <p>You have been invited to join your company workspace on IdeaFlow.</p>
            <p>
              <a href="${joinUrl}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;">
                Join workspace
              </a>
            </p>
            <p>If the button does not work, use this link:</p>
            <p>${joinUrl}</p>
            <p>Your invite code expires on <strong>${new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }).format(new Date(expiresAt))}</strong>.</p>
          </div>
        `,
      })

      if (emailError) {
        return NextResponse.json({ error: emailError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      invite,
      joinUrl,
      emailSent: Boolean(email?.trim()),
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