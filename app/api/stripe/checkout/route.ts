/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for Standard (€49/year) or Pro (€99/year).
 *
 * Body: { plan: 'standard' | 'pro' }
 *
 * - Requires the caller to be authenticated and belong to a company.
 * - Returns early if the company is already on the requested plan.
 * - Reuses an existing Stripe customer ID if the company already has one,
 *   preventing duplicate customer records in Stripe.
 * - On success, returns { url } — the client should redirect to that URL.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY           — Stripe secret key (sk_live_… or sk_test_…)
 *   STRIPE_STANDARD_PRICE_ID    — Price ID of the yearly Standard product (price_…)
 *   STRIPE_PRO_PRICE_ID         — Price ID of the yearly Pro product (price_…)
 *   NEXT_PUBLIC_APP_URL         — Canonical app URL for redirect after checkout
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logEvent, logError } from '@/lib/monitoring/events'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: Request) {
  // ── Env guards ───────────────────────────────────────────────────────────────
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 })
  }
  if (!process.env.STRIPE_STANDARD_PRICE_ID) {
    return NextResponse.json({ error: 'Missing STRIPE_STANDARD_PRICE_ID' }, { status: 500 })
  }
  if (!process.env.STRIPE_PRO_PRICE_ID) {
    return NextResponse.json({ error: 'Missing STRIPE_PRO_PRICE_ID' }, { status: 500 })
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_APP_URL' }, { status: 500 })
  }

  // ── Parse & validate body ─────────────────────────────────────────────────
  let plan: 'standard' | 'pro'
  try {
    const body = await req.json()
    if (body.plan !== 'standard' && body.plan !== 'pro') {
      return NextResponse.json({ error: 'Invalid plan. Must be "standard" or "pro".' }, { status: 400 })
    }
    plan = body.plan
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const priceId =
    plan === 'pro'
      ? process.env.STRIPE_PRO_PRICE_ID!
      : process.env.STRIPE_STANDARD_PRICE_ID!

  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Profile / company lookup ──────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single() as unknown as { data: { company_id: string | null } | null }

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'No company found' }, { status: 400 })
    }

    // Use admin client to read billing fields (RLS-safe, no cookie needed)
    const admin = createAdminClient()
    const { data: company } = await (admin as any)
      .from('companies')
      .select('plan, stripe_customer_id')
      .eq('id', profile.company_id)
      .single() as { data: { plan: string; stripe_customer_id: string | null } | null }

    // Already on the requested plan — don't create a duplicate session
    if (company?.plan === plan) {
      return NextResponse.json({ error: `Already on ${plan} plan` }, { status: 400 })
    }

    // ── Build session params ──────────────────────────────────────────────────
    // Reuse existing Stripe customer so the customer isn't duplicated in the
    // Stripe Dashboard every time a company restarts checkout.
    const session = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price:    priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      metadata: {
        company_id: profile.company_id,
        plan,
      },
      // customer or customer_email — mutually exclusive
      ...(company?.stripe_customer_id
        ? { customer: company.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
    })

    logEvent('checkout_started', { userId: user.id, companyId: profile.company_id, plan })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    logError('stripe/checkout', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 },
    )
  }
}
