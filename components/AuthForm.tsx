'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'

// 'choose'  — first-time visitor selects their path
// 'signup'  — creating a new workspace
// 'signin'  — returning user
// 'confirm' — signup succeeded but email confirmation is required
type Mode = 'choose' | 'signup' | 'signin' | 'confirm'

export default function AuthForm() {
  return (
    <Suspense>
      <AuthFormInner />
    </Suspense>
  )
}

function AuthFormInner() {
  const router = useRouter()
  const params = useSearchParams()
  const nextUrl = params.get('next') || '/dashboard'
  const supabase = createClient()

  const ERROR_PARAM_MESSAGES: Record<string, string> = {
    temporary_error:   'Something went wrong on our end — please try signing in again.',
    onboarding_failed: 'We could not set up your workspace. Please contact support if this keeps happening.',
  }
  const pageError = (() => {
    const e = params.get('error')
    return e ? (ERROR_PARAM_MESSAGES[e] ?? 'An unexpected error occurred.') : null
  })()

  const comingFromInvite = nextUrl.includes('/join')
  const modeParam = params.get('mode')
  const initialMode: Mode = comingFromInvite
    ? 'signin'
    : modeParam === 'login'
    ? 'signin'
    : modeParam === 'signup'
    ? 'signup'
    : 'choose'

  const [mode, setMode] = useState<Mode>(initialMode)
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
        if (!comingFromInvite && !companyName.trim()) throw new Error('Company name is required')
        const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, company_name: companyName },
            emailRedirectTo,
          },
        })
        if (signUpError) throw signUpError
        if (!signUpData.session) {
          setMode('confirm')
          return
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      }
      router.push(nextUrl)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Shared style constants ─────────────────────────────────────────────────
  const CARD_SHELL: React.CSSProperties = {
    borderRadius: '1rem',
    padding: '2rem',
    background: '#ffffff',
    border: '1px solid #e7e2d8',
    boxShadow: '0 8px 40px rgba(31,35,48,0.08), 0 1px 4px rgba(31,35,48,0.05)',
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
    color: '#1f2330',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontSize: 'inherit',
    textDecoration: 'underline',
    textDecorationColor: 'rgba(31,35,48,0.25)',
    textUnderlineOffset: '2px',
  }

  // ── Confirm email ──────────────────────────────────────────────────────────
  if (mode === 'confirm') {
    return (
      <div style={{ width: '100%', maxWidth: '22rem' }}>
        <div style={CARD_SHELL}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '3rem', height: '3rem',
              borderRadius: '0.75rem',
              background: 'rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5d667a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>

            <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8c0ce', marginBottom: '0.4rem' }}>
              One more step
            </p>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1f2330', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              Check your inbox
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#5d667a', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              We&apos;ve sent a confirmation link to
            </p>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2330', marginBottom: '1.25rem', wordBreak: 'break-all' }}>
              {email}
            </p>
            <p style={{ fontSize: '0.825rem', color: '#5d667a', lineHeight: 1.6 }}>
              Click the link in the email to activate your account and log in.
            </p>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e7e2d8', fontSize: '0.8rem', color: '#5d667a' }}>
              Wrong email?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError('') }} style={FOOTER_LINK}>
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Choose path ────────────────────────────────────────────────────────────
  if (mode === 'choose') {
    return (
      <div style={{ width: '100%', maxWidth: '22rem' }}>
        <div style={CARD_SHELL}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1f2330', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.4rem' }}>
              Get started with IdeaFlow
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#5d667a', lineHeight: 1.6 }}>
              Create a workspace for your team, or join one you&apos;ve been invited to.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => switchMode('signup')}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                textAlign: 'left', width: '100%', cursor: 'pointer',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid #e7e2d8',
                background: '#fbfaf7',
                transition: 'border-color 0.12s, background 0.12s',
              }}
            >
              <div style={{
                flexShrink: 0, width: '2rem', height: '2rem', borderRadius: '0.5rem',
                background: 'rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '0.05rem', color: '#5d667a',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2330', lineHeight: 1.3 }}>Create workspace</p>
                <p style={{ fontSize: '0.8rem', color: '#8b96a8', marginTop: '0.2rem', lineHeight: 1.5 }}>Set up IdeaFlow for your team</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/join')}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                textAlign: 'left', width: '100%', cursor: 'pointer',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid #e7e2d8',
                background: '#fbfaf7',
                transition: 'border-color 0.12s, background 0.12s',
              }}
            >
              <div style={{
                flexShrink: 0, width: '2rem', height: '2rem', borderRadius: '0.5rem',
                background: 'rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '0.05rem', color: '#5d667a',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2330', lineHeight: 1.3 }}>Join with invite</p>
                <p style={{ fontSize: '0.8rem', color: '#8b96a8', marginTop: '0.2rem', lineHeight: 1.5 }}>You have an invite code from your admin</p>
              </div>
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.825rem', color: '#5d667a' }}>
            Already have an account?{' '}
            <button type="button" onClick={() => switchMode('signin')} style={FOOTER_LINK}>Sign in</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Invite context banner ──────────────────────────────────────────────────
  const INVITE_BANNER = comingFromInvite ? (
    <div style={{
      marginBottom: '1rem',
      borderRadius: '0.625rem',
      padding: '0.625rem 0.875rem',
      background: 'rgba(0,0,0,0.04)',
      border: '1px solid #e7e2d8',
      fontSize: '0.8rem',
      color: '#5d667a',
      lineHeight: 1.55,
    }}>
      You&apos;ve been invited to a workspace — sign in or create an account to join.
    </div>
  ) : null

  // ── Sign in / Create account ───────────────────────────────────────────────
  return (
    <div style={{ width: '100%', maxWidth: '22rem' }}>
      <div style={CARD_SHELL}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8c0ce', marginBottom: '0.35rem' }}>
            {mode === 'signin' ? 'Welcome back' : comingFromInvite ? 'Join workspace' : 'New workspace'}
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2330', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            {mode === 'signin' ? 'Sign in' : comingFromInvite ? 'Create your account' : 'Create your workspace'}
          </h1>
        </div>

        {INVITE_BANNER}

        {pageError && (
          <div style={{
            marginBottom: '1rem',
            borderRadius: '0.625rem',
            border: '1px solid rgba(220,38,38,0.18)',
            background: 'rgba(220,38,38,0.05)',
            padding: '0.625rem 0.875rem',
            fontSize: '0.825rem',
            color: '#dc2626',
            lineHeight: 1.5,
          }}>
            {pageError}
          </div>
        )}

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
              {!comingFromInvite && (
                <input
                  className="input"
                  type="text"
                  placeholder="Company name"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  required
                />
              )}
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
          {mode === 'signup' && (
            <p style={{ fontSize: '0.75rem', color: '#b8c0ce', marginTop: '-0.25rem' }}>
              At least 8 characters
            </p>
          )}

          {mode === 'signin' && (
            <div style={{ textAlign: 'right', marginTop: '-0.125rem' }}>
              <Link
                href="/forgot-password"
                style={{ fontSize: '0.8rem', color: '#8b96a8', fontWeight: 500, textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && <p style={ERROR_STYLE}>{error}</p>}

          <button
            type="submit"
            className="btn-dark"
            style={{ width: '100%', marginTop: '0.25rem' }}
            disabled={loading}
          >
            {loading
              ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
              : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.825rem', color: '#5d667a' }}>
          {mode === 'signin' ? (
            <>
              New to IdeaFlow?{' '}
              <button type="button" onClick={() => switchMode(comingFromInvite ? 'signup' : 'choose')} style={FOOTER_LINK}>
                Get started
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => switchMode('signin')} style={FOOTER_LINK}>
                Sign in
              </button>
              {!comingFromInvite && (
                <>
                  {' · '}
                  <button type="button" onClick={() => switchMode('choose')} style={FOOTER_LINK}>
                    Back
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
