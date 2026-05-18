/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Billing Portal session so paid customers can manage
 * their subscription, update payment methods, or cancel.
 *
 * - Requires the caller to be authenticated and belong to a company.
 * - Company must have a stripe_customer_id (i.e. have completed checkout before).
 * - On success returns { url } — the client should redirect to that URL.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY       — Stripe secret key
 *   NEXT_PUBLIC_APP_URL     — Canonical app URL (return_url after portal)
 */

import { NextResponse }       from 'next/server'
import Stripe                  from 'stripe'
import { createClient }        from '@/lib/supabase/server'
import { createAdminClient }   from '@/lib/supabase/admin'
import { logEvent, logError }  from '@/lib/monitoring/events'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 })
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_APP_URL' }, { status: 500 })
  }

  try {
    // ── Auth ───────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Profile / company lookup ───────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single() as unknown as { data: { company_id: string | null; role: string } | null }

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'No company found' }, { status: 400 })
    }

    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can manage billing' }, { status: 403 })
    }

    // Use admin client to read billing fields
    const admin = createAdminClient()
    const { data: company } = await (admin as any)
      .from('companies')
      .select('stripe_customer_id, plan')
      .eq('id', profile.company_id)
      .single() as { data: { stripe_customer_id: string | null; plan: string } | null }

    if (!company?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer record found. Please complete checkout first.' },
        { status: 400 },
      )
    }

    // ── Create billing portal session ──────────────────────────────────────────
    const session = await stripe.billingPortal.sessions.create({
      customer:   company.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    logEvent('billing_portal_opened', { userId: user.id, companyId: profile.company_id })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    logError('stripe/portal', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 },
    )
  }
}
