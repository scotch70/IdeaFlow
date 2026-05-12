/**
 * /flow-invite/[code]
 *
 * Flow-scoped invite redemption. Server component — no form, no JS needed
 * for the happy path. All logic resolves to either a redirect or an error card.
 *
 * Paths:
 *  1. Not logged in          → redirect to /auth?next=/flow-invite/[code]
 *  2. Logged in, same company → add to round_members (idempotent), redirect to flow
 *  3. Logged in, no company  → redirect to /join?code=[code] (workspace join handles
 *                              round_members addition too, via /api/join)
 *  4. Logged in, wrong company → show error (user must contact admin)
 *  5. Invalid / expired invite → show error
 */

import { redirect }      from 'next/navigation'
import Link              from 'next/link'
import { createClient }  from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import LogoMark          from '@/components/LogoMark'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Join IdeaFlow — IdeaFlow' }

// ── Page shell (re-uses the same visual style as /join) ───────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(160deg, #060e26 0%, #0a1f50 35%, #0e3278 60%, #1a5a9a 85%, #2e7abf 100%)',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 55% at 30% 60%, rgba(249,115,22,0.09) 0%, transparent 65%)',
      }} />
      <div style={{ width: '100%', maxWidth: '22rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{ filter: 'drop-shadow(0 3px 12px rgba(240,104,0,0.40))' }}>
            <LogoMark size={30} />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>
            Idea<span style={{ color: '#ffb733' }}>Flow</span>
          </span>
        </div>
        <div style={{
          borderRadius: '1.5rem', padding: '2rem',
          background: 'rgba(255,255,255,0.97)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)',
          border: '1px solid rgba(255,255,255,0.20)',
        }}>
          {children}
        </div>
      </div>
    </main>
  )
}

function ErrorCard({ icon, heading, body }: { icon: string; heading: string; body: string }) {
  return (
    <PageShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{
          width: '2.75rem', height: '2.75rem', borderRadius: '50%',
          background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
        }}>
          {icon}
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.4rem' }}>
            {heading}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>{body}</p>
        </div>
        <Link href="/" style={{
          display: 'block', textAlign: 'center', padding: '0.625rem 1rem',
          borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.12)',
          fontSize: '0.875rem', fontWeight: 600, color: '#475569', textDecoration: 'none',
        }}>
          Back to home
        </Link>
      </div>
    </PageShell>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default async function FlowInvitePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const upperCode = code.toUpperCase()

  const supabase = await createClient()

  // ── 1. Auth check ─────────────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const next = encodeURIComponent(`/flow-invite/${upperCode}`)
    redirect(`/auth?next=${next}`)
  }

  const admin = createAdminClient()

  // ── 2. Look up the invite ─────────────────────────────────────────────────
  const { data: invite } = await (admin as any)
    .from('invites')
    .select('id, company_id, idea_round_id, expires_at, idea_rounds(name)')
    .eq('invite_code', upperCode)
    .maybeSingle()

  if (!invite) {
    return (
      <ErrorCard
        icon="✕"
        heading="Invite not found"
        body="We couldn't find that invite link. Double-check the URL or ask your admin for a new one."
      />
    )
  }

  if (!invite.idea_round_id) {
    // This is a workspace invite, not a flow invite — send to the normal join page
    redirect(`/join?code=${upperCode}`)
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return (
      <ErrorCard
        icon="⏱"
        heading="Invite has expired"
        body="This invite link is no longer valid. Ask your admin to generate a new one."
      />
    )
  }

  // ── 3. Check workspace membership ────────────────────────────────────────
  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .maybeSingle()) as unknown as { data: { company_id: string | null } | null }

  if (!profile?.company_id) {
    // Not in any workspace yet — redirect to the join page.
    // /api/join will also add them to round_members after workspace join.
    redirect(`/join?code=${upperCode}`)
  }

  if (profile.company_id !== invite.company_id) {
    return (
      <ErrorCard
        icon="🔒"
        heading="Wrong workspace"
        body="This IdeaFlow belongs to a different workspace. Contact the admin who sent you this link."
      />
    )
  }

  // ── 4. Add user to round_members (idempotent) ─────────────────────────────
  // Conflict on (round_id, user_id) = already assigned → no-op, still succeed.
  const { error: upsertError } = await (admin as any)
    .from('round_members')
    .upsert(
      {
        round_id:   invite.idea_round_id,
        user_id:    user.id,
        company_id: invite.company_id,
        // added_by left null — joined via invite link, not manually assigned
      },
      { onConflict: 'round_id,user_id', ignoreDuplicates: true },
    )

  if (upsertError) {
    console.error('[flow-invite] round_members upsert failed:', upsertError)
    return (
      <ErrorCard
        icon="⚠"
        heading="Something went wrong"
        body="We couldn't add you to this IdeaFlow. Please try the link again or contact your admin."
      />
    )
  }

  // ── 5. Success — redirect into the flow ───────────────────────────────────
  redirect(`/dashboard/flows/${invite.idea_round_id}`)
}
