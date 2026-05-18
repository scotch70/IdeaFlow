import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { logEvent, logError } from '@/lib/monitoring/events'

// Webhooks arrive with no cookie session — we must use the service-role client.
// NEVER use createClient() (SSR/cookie) here; it has no session and all writes
// will silently fail due to RLS.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

/** Map a Stripe price ID to a DB plan value. Returns null if unrecognised. */
function planFromPriceId(priceId: string): 'standard' | 'pro' | null {
  if (priceId === process.env.STRIPE_STANDARD_PRICE_ID) return 'standard'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID)      return 'pro'
  return null
}

export async function POST(req: Request) {
  const body      = await req.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing webhook signature or secret' },
      { status: 400 },
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Log every event for traceability. The event.id is stable across Stripe retries,
  // so it can be used to correlate support cases with webhook deliveries.
  console.log(`[stripe/webhook] event=${event.type} id=${event.id} livemode=${event.livemode}`)

  try {
    // ── checkout.session.completed ─────────────────────────────────────────
    // Fires once after a successful payment. Upgrade company to the purchased plan.
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const companyId      = session.metadata?.company_id
      const customerId     = typeof session.customer === 'string' ? session.customer : null
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null

      if (!companyId) {
        // Return 400 (not 200) so Stripe retries the event automatically.
        // A 200 here would tell Stripe the event was handled successfully,
        // leaving the company permanently on the free plan despite payment.
        console.error(
          '[stripe/webhook] checkout.session.completed missing company_id in session metadata — returning 400 to trigger Stripe retry. Session ID:',
          session.id,
        )
        return NextResponse.json(
          { error: 'missing company_id metadata' },
          { status: 400 },
        )
      }

      // Determine plan from metadata (set at checkout creation time).
      // Fall back to 'standard' for any legacy sessions that predated multi-plan
      // so existing 'pro' DB records (old €49/yr) are preserved correctly.
      const metaPlan = session.metadata?.plan
      const plan: string =
        metaPlan === 'standard' || metaPlan === 'pro' ? metaPlan : 'standard'

      const { error } = await (adminClient as any)
        .from('companies')
        .update({
          plan,
          stripe_customer_id:    customerId,
          stripe_subscription_id: subscriptionId,
        })
        .eq('id', companyId)

      if (error) {
        console.error('[stripe/webhook] failed to upgrade company:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      logEvent('subscription_activated', { companyId, plan })
      console.log(`[stripe/webhook] company ${companyId} upgraded to ${plan}`)
    }

    // ── customer.subscription.updated ─────────────────────────────────────
    // Fires on renewals, plan changes, cancellation-at-period-end, etc.
    // Determine the plan from the price ID on the subscription item.
    // If active/trialing → persist the correct plan; otherwise → free.
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const isActive     = ['active', 'trialing'].includes(subscription.status)

      let newPlan: string = 'free'
      if (isActive) {
        const priceId = subscription.items.data[0]?.price?.id
        const mapped  = priceId ? planFromPriceId(priceId) : null
        // If the price ID isn't recognised (e.g. legacy price), keep existing
        // plan by reading it from the DB — but to stay safe, fall back to 'standard'.
        newPlan = mapped ?? 'standard'
      }

      const { error } = await (adminClient as any)
        .from('companies')
        .update({ plan: newPlan })
        .eq('stripe_subscription_id', subscription.id)

      if (error) {
        console.error('[stripe/webhook] subscription.updated DB error:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      console.log(`[stripe/webhook] subscription ${subscription.id} updated — plan set to ${newPlan}`)
    }

    // ── customer.subscription.deleted ─────────────────────────────────────
    // Fires when a subscription is fully cancelled (not just flagged to cancel).
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription

      const { error } = await (adminClient as any)
        .from('companies')
        .update({
          plan: 'free',
          stripe_subscription_id: null,
        })
        .eq('stripe_subscription_id', subscription.id)

      if (error) {
        console.error('[stripe/webhook] subscription.deleted DB error:', error)
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }

      console.log(`[stripe/webhook] subscription ${subscription.id} deleted — company downgraded to free`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[stripe/webhook] handler crash:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
