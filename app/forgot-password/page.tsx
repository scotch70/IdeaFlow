'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LogoMark from '@/components/LogoMark'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://useideaflow.com'

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${APP_URL}/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'var(--page-bg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 55% at 30% 60%, rgba(249,115,22,0.06) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 70% 30%, rgba(26,107,191,0.07) 0%, transparent 60%)',
      }} />

      <div style={{ width: '100%', maxWidth: '22rem', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{ filter: 'drop-shadow(0 3px 12px rgba(240,104,0,0.40))' }}>
            <LogoMark size={30} />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>
            Idea<span style={{ color: '#f97316' }}>Flow</span>
          </span>
        </div>

        {/* Card */}
        <div style={{
          borderRadius: '1.5rem',
          padding: '2rem',
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(255,255,255,0.20)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)',
        }}>
          {sent ? (
            // ── Success state ───────────────────────────────────────────────
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                width: '2.75rem', height: '2.75rem', borderRadius: '50%',
                background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
              }}>
                ✓
              </div>
              <div>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
                  Check your inbox
                </p>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                  Reset link sent
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', lineHeight: 1.6 }}>
                  We sent a password reset link to <strong style={{ color: 'var(--ink)' }}>{email}</strong>. Check your inbox and click the link to set a new password.
                </p>
              </div>
              <Link
                href="/auth"
                style={{ fontSize: '0.825rem', color: 'var(--orange)', fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            // ── Email form ──────────────────────────────────────────────────
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
                  Password reset
                </p>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.4rem' }}>
                  Forgot your password?
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', lineHeight: 1.6 }}>
                  Enter your email address and we will send you a link to reset your password.
                </p>
              </div>

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

                {error && (
                  <p style={{
                    borderRadius: '0.625rem',
                    border: '1px solid rgba(220,38,38,0.18)',
                    background: 'rgba(220,38,38,0.06)',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.825rem',
                    color: '#dc2626',
                  }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '0.25rem' }}
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.825rem', color: 'var(--ink-light)' }}>
                Remember your password?{' '}
                <Link
                  href="/auth"
                  style={{ fontWeight: 600, color: 'var(--orange)', textDecoration: 'none' }}
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
