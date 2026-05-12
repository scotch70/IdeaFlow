/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session for the Pro yearly plan (€49/year).
 *
 * - Requires the caller to be authenticated and belong to a company.
 * - Returns early if the company is already on Pro.
 * - Reuses an existing Stripe customer ID if the company already has one,
 *   preventing duplicate customer records in Stripe.
 * - On success, returns { url } — the client should redirect to that URL.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY        — Stripe secret key (sk_live_… or sk_test_…)
 *   STRIPE_PRICE_ID          — Price ID of the yearly Pro product (price_…)
 *   NEXT_PUBLIC_APP_URL      — Canonical app URL for redirect after checkout
 */

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST() {
  // ── Env guards ───────────────────────────────────────────────────────────────
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 })
  }
  if (!process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: 'Missing STRIPE_PRICE_ID' }, { status: 500 })
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: 'Missing NEXT_PUBLIC_APP_URL' }, { status: 500 })
  }

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

    // Already on Pro — don't create a duplicate session
    if (company?.plan === 'pro') {
      return NextResponse.json({ error: 'Already on Pro plan' }, { status: 400 })
    }

    // ── Build session params ──────────────────────────────────────────────────
    // Reuse existing Stripe customer so the customer isn't duplicated in the
    // Stripe Dashboard every time a company restarts checkout.
    const session = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price:    process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      metadata: {
        company_id: profile.company_id,
      },
      // customer or customer_email — mutually exclusive
      ...(company?.stripe_customer_id
        ? { customer: company.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[stripe/checkout]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Something went wrong' },
      { status: 500 },
    )
  }
}
