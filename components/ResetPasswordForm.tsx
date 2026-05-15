'use client'

import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

// ── Style tokens (mirrors AuthForm.tsx) ───────────────────────────────────────
const CARD: React.CSSProperties = {
  borderRadius: '1rem',
  padding: '2rem',
  background: '#ffffff',
  border: '1px solid #e7e2d8',
  boxShadow: '0 8px 40px rgba(31,35,48,0.08), 0 1px 4px rgba(31,35,48,0.05)',
}

const BACK_LINK: React.CSSProperties = {
  fontSize: '0.825rem',
  fontWeight: 600,
  color: '#1f2330',
  textDecoration: 'underline',
  textDecorationColor: 'rgba(31,35,48,0.25)',
  textUnderlineOffset: '2px',
  display: 'inline-block',
}

type PageStatus = 'loading' | 'ready' | 'expired'

export default function ResetPasswordForm() {
  return (
    <Suspense>
      <ResetPasswordFormInner />
    </Suspense>
  )
}

function ResetPasswordFormInner() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const [status, setStatus] = useState<PageStatus>(() => {
    // If the callback already told us the link is expired, show that immediately
    // (avoids a flash of the loading spinner)
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('error') === 'expired') return 'expired'
    }
    return 'loading'
  })

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    // If the error=expired param was already picked up in useState initialiser,
    // skip session detection entirely.
    if (params.get('error') === 'expired') {
      setStatus('expired')
      return
    }

    // Three arrival paths:
    //
    //  PATH A — via /auth/callback (normal forgot-password flow):
    //    No ?code in URL, no hash, but a session cookie was set server-side.
    //    Read the session from cookies.
    //
    //  PATH B — direct PKCE link (Supabase dashboard fallback / older setup):
    //    ?code=XXXX in URL. Exchange it client-side.
    //
    //  PATH C — legacy implicit hash flow:
    //    #access_token=...&type=recovery in URL hash.
    //    Supabase JS processes this automatically; listen for PASSWORD_RECOVERY.

    let resolved = false
    function resolve(next: PageStatus) {
      if (resolved) return
      resolved = true
      setStatus(next)
    }

    const searchCode = new URLSearchParams(window.location.search).get('code')
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const hashType   = hashParams.get('type')

    // PATH A: no code in URL, no recovery hash — session already in cookies
    if (!searchCode && hashType !== 'recovery') {
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => resolve(session ? 'ready' : 'expired'))
        .catch(() => resolve('expired'))
      return
    }

    // PATH B: PKCE code in URL — exchange client-side
    if (searchCode) {
      supabase.auth
        .exchangeCodeForSession(searchCode)
        .then(({ error }) => resolve(error ? 'expired' : 'ready'))
        .catch(() => resolve('expired'))
      return
    }

    // PATH C: legacy implicit hash — wait for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        resolve('ready')
      } else if (event === 'INITIAL_SESSION') {
        if (hashType !== 'recovery') resolve('expired')
      }
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (password !== confirm) {
      setFormError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      // Small delay so the user sees the success state, then send to sign-in
      setTimeout(() => {
        router.push('/auth?mode=login&reset=success')
      }, 1800)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div style={{ width: '100%', maxWidth: '22rem' }}>
        <div style={CARD}>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#8b96a8', padding: '1rem 0' }}>
            Verifying reset link…
          </p>
        </div>
      </div>
    )
  }

  // ── Expired / invalid ────────────────────────────────────────────────────────
  if (status === 'expired') {
    return (
      <div style={{ width: '100%', maxWidth: '22rem' }}>
        <div style={CARD}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem', height: '3rem', borderRadius: '0.75rem',
              background: 'rgba(220,38,38,0.05)',
              border: '1px solid rgba(220,38,38,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>

            <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8c0ce', marginBottom: '0.4rem' }}>
              Link expired
            </p>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1f2330', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              Reset link expired
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#5d667a', lineHeight: 1.6 }}>
              This password reset link is no longer valid. Request a new link and try again.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '1.5rem' }}>
              <Link href="/forgot-password" className="btn-dark" style={{ textAlign: 'center' }}>
                Request a new link
              </Link>
              <div style={{ textAlign: 'center', paddingTop: '0.25rem' }}>
                <Link href="/auth?mode=login" style={BACK_LINK}>
                  ← Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ width: '100%', maxWidth: '22rem' }}>
        <div style={CARD}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem', height: '3rem', borderRadius: '0.75rem',
              background: 'rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5d667a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8c0ce', marginBottom: '0.4rem' }}>
              All done
            </p>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1f2330', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
              Password updated
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#5d667a', lineHeight: 1.6 }}>
              Your password has been changed. Redirecting you to sign in…
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Set new password form ─────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', maxWidth: '22rem' }}>
      <div style={CARD}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8c0ce', marginBottom: '0.4rem' }}>
            Account recovery
          </p>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1f2330', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
            Set a new password
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#5d667a', lineHeight: 1.6 }}>
            Choose a new password for your IdeaFlow account.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            className="input"
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoFocus
            minLength={8}
          />
          <input
            className="input"
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={8}
          />

          {formError && (
            <p style={{
              borderRadius: '0.625rem',
              border: '1px solid rgba(220,38,38,0.18)',
              background: 'rgba(220,38,38,0.06)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.825rem',
              color: '#dc2626',
            }}>
              {formError}
            </p>
          )}

          <button
            type="submit"
            className="btn-dark"
            style={{ width: '100%', marginTop: '0.25rem' }}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Update password'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '1.125rem', borderTop: '1px solid #e7e2d8', fontSize: '0.8rem', color: '#5d667a', textAlign: 'center' }}>
          <Link href="/auth?mode=login" style={BACK_LINK}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
