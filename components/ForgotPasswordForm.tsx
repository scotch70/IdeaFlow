'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

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

export default function ForgotPasswordForm() {
  return (
    <Suspense>
      <ForgotPasswordFormInner />
    </Suspense>
  )
}

function ForgotPasswordFormInner() {
  const params = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setLoading(true)
    try {
      const redirectTo =
        `${window.location.origin}/auth/callback` +
        `?next=/reset-password&type=recovery`

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      )
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '22rem' }}>
      <div style={CARD}>

        {sent ? (
          // ── Success state ─────────────────────────────────────────────────
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem', height: '3rem', borderRadius: '0.75rem',
              background: 'rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5d667a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>

            <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8c0ce', marginBottom: '0.4rem' }}>
              Check your inbox
            </p>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1f2330', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              Reset link sent
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#5d667a', lineHeight: 1.6 }}>
              We sent a password reset link to{' '}
              <strong style={{ color: '#1f2330' }}>{email}</strong>.
              Check your inbox and click the link to set a new password.
            </p>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e7e2d8', fontSize: '0.8rem', color: '#5d667a', textAlign: 'center' }}>
              <Link href="/auth?mode=login" style={BACK_LINK}>
                ← Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          // ── Email form ────────────────────────────────────────────────────
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8c0ce', marginBottom: '0.4rem' }}>
                Account recovery
              </p>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1f2330', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                Reset your password
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#5d667a', lineHeight: 1.6 }}>
                Enter your email and we&apos;ll send you a secure reset link.
              </p>
            </div>

            {/* URL-level error (e.g. ?error=expired redirected back here) */}
            {params.get('error') === 'expired' && (
              <div style={{
                borderRadius: '0.625rem',
                border: '1px solid rgba(220,38,38,0.15)',
                background: 'rgba(220,38,38,0.05)',
                padding: '0.625rem 0.75rem',
                fontSize: '0.825rem',
                color: '#dc2626',
                marginBottom: '1rem',
                lineHeight: 1.5,
              }}>
                That reset link has expired. Enter your email to request a new one.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                className="input"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
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
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', paddingTop: '1.125rem', borderTop: '1px solid #e7e2d8', fontSize: '0.8rem', color: '#5d667a', textAlign: 'center' }}>
              Remember your password?{' '}
              <Link href="/auth?mode=login" style={BACK_LINK}>
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
