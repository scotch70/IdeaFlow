'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import LogoMark from '@/components/LogoMark'

// 'choose'  — first-time visitor selects their path
// 'signup'  — creating a new workspace
// 'signin'  — returning user
type Mode = 'choose' | 'signup' | 'signin'

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  )
}

function AuthPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const nextUrl = params.get('next') || '/dashboard'
  const supabase = createClient()

  // If the user arrived here from an invite link, they already have context —
  // skip the choose screen and go straight to sign-in / create account.
  const comingFromInvite = nextUrl.includes('/join')
  const [mode, setMode] = useState<Mode>(comingFromInvite ? 'signin' : 'choose')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Full name is required')
        if (!companyName.trim()) throw new Error('Company name is required')
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, company_name: companyName } },
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      router.push(nextUrl)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Shared layout ─────────────────────────────────────────────────────────
  const BG_GLOW = (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse 60% 55% at 30% 60%, rgba(249,115,22,0.06) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 70% 30%, rgba(26,107,191,0.07) 0%, transparent 60%)',
    }} />
  )

  const LOGO = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', justifyContent: 'center' }}>
      <div style={{ filter: 'drop-shadow(0 3px 12px rgba(240,104,0,0.40))' }}>
        <LogoMark size={30} />
      </div>
      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>
        Idea<span style={{ color: '#f97316' }}>Flow</span>
      </span>
    </div>
  )

  const CARD_SHELL: React.CSSProperties = {
    borderRadius: '1.5rem',
    padding: '2rem',
    background: 'rgba(255,255,255,0.97)',
    border: '1px solid rgba(255,255,255,0.20)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)',
  }

  const ERROR_STYLE: React.CSSProperties = {
    borderRadius: '0.625rem',
    border: '1px solid rgba(220,38,38,0.18)',
    background: 'rgba(220,38,38,0.06)',
    padding: '0.5rem 0.75rem',
    fontSize: '0.825rem',
    color: '#dc2626',
  }

  const FOOTER_LINK: React.CSSProperties = {
    fontWeight: 600,
    color: 'var(--orange)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontSize: 'inherit',
  }

  // ── Choose path ───────────────────────────────────────────────────────────
  if (mode === 'choose') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--page-bg)', position: 'relative', overflow: 'hidden' }}>
        {BG_GLOW}
        <div style={{ width: '100%', maxWidth: '22rem', position: 'relative', zIndex: 1 }}>
          {LOGO}
          <div style={CARD_SHELL}>
            {/* Heading */}
            <div style={{ marginBottom: '1.75rem' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
                Welcome
              </p>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.4rem' }}>
                Get started with IdeaFlow
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', lineHeight: 1.6 }}>
                Create a workspace for your team, or join one you've been invited to.
              </p>
            </div>

            {/* Path cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {/* Create workspace */}
              <button
                onClick={() => switchMode('signup')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                  textAlign: 'left', width: '100%', cursor: 'pointer',
                  padding: '1rem 1.125rem',
                  borderRadius: '0.875rem',
                  border: '1.5px solid var(--border, #e2e8f0)',
                  background: 'rgba(249,115,22,0.03)',
                }}
              >
                <div style={{
                  flexShrink: 0,
                  width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
                  background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '0.05rem',
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="6" width="14" height="9" rx="1.5" stroke="#f97316" strokeWidth="1.5"/>
                    <path d="M5 6V4.5C5 2.567 6.567 1 8.5 1V1C10.433 1 12 2.567 12 4.5V6" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M8.5 9.5V11.5M7.5 10.5H9.5" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>
                    Create workspace
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                    Set up IdeaFlow for your team
                  </p>
                </div>
              </button>

              {/* Join with invite */}
              <button
                onClick={() => router.push('/join')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                  textAlign: 'left', width: '100%', cursor: 'pointer',
                  padding: '1rem 1.125rem',
                  borderRadius: '0.875rem',
                  border: '1.5px solid var(--border, #e2e8f0)',
                  background: 'rgba(26,107,191,0.02)',
                }}
              >
                <div style={{
                  flexShrink: 0,
                  width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
                  background: 'rgba(26,107,191,0.08)', border: '1px solid rgba(26,107,191,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '0.05rem',
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 8C6 8 6.5 9 8 9C9.5 9 11 7.657 11 6C11 4.343 9.657 3 8 3C6.343 3 5 4.343 5 6" stroke="#1a6bbf" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M10 8C10 8 9.5 7 8 7C6.5 7 5 8.343 5 10C5 11.657 6.343 13 8 13C9.657 13 11 11.657 11 10" stroke="#1a6bbf" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3 }}>
                    Join with invite
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                    You have an invite code from your admin
                  </p>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.825rem', color: 'var(--ink-light)' }}>
              Already have an account?{' '}
              <button type="button" onClick={() => switchMode('signin')} style={FOOTER_LINK}>
                Sign in
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Sign in / Create account ───────────────────────────────────────────────
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'var(--page-bg)', position: 'relative', overflow: 'hidden' }}>
      {BG_GLOW}
      <div style={{ width: '100%', maxWidth: '22rem', position: 'relative', zIndex: 1 }}>
        {LOGO}
        <div style={CARD_SHELL}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
              {mode === 'signin' ? 'Welcome back' : 'New workspace'}
            </p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {mode === 'signin' ? 'Sign in' : 'Create your workspace'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mode === 'signup' && (
              <>
                <input
                  className="input"
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Company name"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  required
                />
              </>
            )}

            <input
              className="input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            {mode === 'signin' && (
              <div style={{ textAlign: 'right', marginTop: '-0.125rem' }}>
                <Link
                  href="/forgot-password"
                  style={{ fontSize: '0.8rem', color: 'var(--orange)', fontWeight: 500, textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {error && <p style={ERROR_STYLE}>{error}</p>}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.25rem' }}
              disabled={loading}
            >
              {loading
                ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
                : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.825rem', color: 'var(--ink-light)' }}>
            {mode === 'signin' ? (
              <>
                New to IdeaFlow?{' '}
                <button
                  type="button"
                  onClick={() => switchMode(comingFromInvite ? 'signup' : 'choose')}
                  style={FOOTER_LINK}
                >
                  Get started
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  style={FOOTER_LINK}
                >
                  Sign in
                </button>
                {!comingFromInvite && (
                  <>
                    {' · '}
                    <button
                      type="button"
                      onClick={() => switchMode('choose')}
                      style={FOOTER_LINK}
                    >
                      Back
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
