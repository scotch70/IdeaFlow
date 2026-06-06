'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'

/**
 * Mode is derived entirely from the URL search param — never from useState.
 * This means:
 *   /auth              → 'choose'
 *   /auth?mode=login   → 'signin'
 *   /auth?mode=signup  → 'signup'
 *
 * The only local state used for mode is `showConfirm`, which is a transient
 * post-signup screen that cannot be expressed in the URL cleanly.
 */
type Mode = 'choose' | 'signup' | 'signin' | 'confirm'

export default function AuthForm() {
  return (
    <Suspense>
      <AuthFormInner />
    </Suspense>
  )
}

/**
 * Only accept root-relative internal paths so the `?next=` param can't be
 * weaponised into an open redirect to an external origin.
 */
function safeInternalPath(raw: string | null | undefined): string {
  if (!raw) return '/dashboard'
  // Must start with a single slash, must NOT start with `//` (protocol-relative)
  // and must NOT contain a scheme. Reject anything else.
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/dashboard'
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(raw)) return '/dashboard'
  return raw
}

function AuthFormInner() {
  const router = useRouter()
  const params = useSearchParams()
  const nextUrl = safeInternalPath(params.get('next'))
  const supabase = createClient()

  const ERROR_PARAM_MESSAGES: Record<string, string> = {
    temporary_error:      'Something went wrong on our end — please try signing in again.',
    onboarding_failed:    'We could not set up your workspace. Please contact support if this keeps happening.',
    auth_callback_failed: 'That confirmation link has expired. Please sign in or request a new link.',
  }
  const pageError = (() => {
    const e = params.get('error')
    return e ? (ERROR_PARAM_MESSAGES[e] ?? 'An unexpected error occurred.') : null
  })()

  // Shown after a successful password reset
  const resetSuccess = params.get('reset') === 'success'

  // ── Mode: URL is the single source of truth ────────────────────────────────
  // showConfirm is the only local-state exception — it's a transient post-signup
  // screen that has no URL representation and disappears on refresh intentionally.
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')

  const comingFromInvite = nextUrl.includes('/join')
  const modeParam        = params.get('mode')

  const mode: Mode = showConfirm
    ? 'confirm'
    : comingFromInvite
    ? 'signin'
    : modeParam === 'login'
    ? 'signin'
    : modeParam === 'signup'
    ? 'signup'
    : 'choose'

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [fullName, setFullName]     = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  // Remember me — sign-in only. Checked by default so the existing
  // "stay signed in" behaviour is unchanged for users who never touch
  // the box. When unchecked we set a sessionStorage flag that
  // RememberMeWatcher reads to sign the user out on tab close.
  const [rememberMe, setRememberMe] = useState(true)

  /**
   * Navigate to a different auth mode by updating the URL.
   * Using router.push() keeps the browser history intact so Back/Forward work.
   * The `next` param is preserved across mode switches.
   */
  function goTo(target: 'signin' | 'signup' | 'choose') {
    const sp = new URLSearchParams()
    if (target === 'signin')  sp.set('mode', 'login')
    if (target === 'signup')  sp.set('mode', 'signup')
    if (nextUrl !== '/dashboard') sp.set('next', nextUrl)
    const qs = sp.toString()
    router.push(`/auth${qs ? '?' + qs : ''}`)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
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
          // Email confirmation required — show the inbox prompt and stop.
          setConfirmEmail(email)
          setShowConfirm(true)
          setLoading(false)
          return
        }
      } else {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        // Defensive: signInWithPassword should always return a session on success,
        // but if it doesn't (e.g. unexpected provider state) we should not silently
        // claim success and redirect.
        if (!signInData?.session) {
          throw new Error('Sign-in did not return a session. Please try again.')
        }
        // Remember-me flag — stored in sessionStorage so it dies with the
        // tab. RememberMeWatcher (mounted globally) reads it and registers
        // a pagehide handler that signs the user out when they close the
        // tab. Default (checked) clears the flag so future sessions are
        // persistent again.
        try {
          if (rememberMe) {
            window.sessionStorage.removeItem('ideaflow:no-persist')
          } else {
            window.sessionStorage.setItem('ideaflow:no-persist', '1')
          }
        } catch { /* private-mode etc. — fall through to default persist */ }
      }
      // ── Critical: full document navigation, NOT router.push ──────────────────
      // signInWithPassword on @supabase/ssr writes the session into document.cookie
      // (chunked across multiple cookies). A soft router.push fires the next RSC
      // fetch before those cookie writes are reliably committed, which causes the
      // server to see no session and the middleware to bounce the user back to
      // /auth — the exact redirect loop we are fixing.
      //
      // window.location.assign forces a real document navigation, which flushes
      // pending cookies before the server receives the request.
      window.location.assign(nextUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
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
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>

            <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8c0ce', marginBottom: '0.4rem' }}>
              Almost there
            </p>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1f2330', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              Confirm your email
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#5d667a', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              We sent a confirmation link to
            </p>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2330', marginBottom: '1rem', wordBreak: 'break-all' }}>
              {confirmEmail || email}
            </p>
            <p style={{ fontSize: '0.825rem', color: '#5d667a', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Click the link to activate your workspace and sign in.
            </p>
            <p style={{
              fontSize: '0.775rem', color: '#b8c0ce', lineHeight: 1.5,
              padding: '0.5rem 0.75rem',
              background: 'rgba(0,0,0,0.025)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(0,0,0,0.05)',
            }}>
              Don&apos;t see it? Check your spam or promotions folder.
            </p>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e7e2d8', fontSize: '0.8rem', color: '#5d667a' }}>
              Wrong email?{' '}
              <button type="button" onClick={() => { setShowConfirm(false); setError('') }} style={FOOTER_LINK}>
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
            <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8c0ce', marginBottom: '0.35rem' }}>
              Welcome
            </p>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1f2330', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.4rem' }}>
              How do you want to start?
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#5d667a', lineHeight: 1.6 }}>
              Set up your team&apos;s insight workspace, or join one you&apos;ve been invited to.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => goTo('signup')}
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
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2330', lineHeight: 1.3 }}>Start a new workspace</p>
                <p style={{ fontSize: '0.8rem', color: '#8b96a8', marginTop: '0.2rem', lineHeight: 1.5 }}>Collect insights from your team — free to start</p>
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
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f2330', lineHeight: 1.3 }}>Join an existing workspace</p>
                <p style={{ fontSize: '0.8rem', color: '#8b96a8', marginTop: '0.2rem', lineHeight: 1.5 }}>Enter an invite code from your team admin</p>
              </div>
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.825rem', color: '#5d667a' }}>
            Already have an account?{' '}
            <button type="button" onClick={() => goTo('signin')} style={FOOTER_LINK}>Sign in</button>
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

        {resetSuccess && (
          <div style={{
            marginBottom: '1rem',
            borderRadius: '0.625rem',
            border: '1px solid rgba(16,185,129,0.20)',
            background: 'rgba(16,185,129,0.06)',
            padding: '0.625rem 0.875rem',
            fontSize: '0.825rem',
            color: '#065f46',
            lineHeight: 1.5,
          }}>
            Password updated — sign in with your new password.
          </div>
        )}

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
            <p style={{ fontSize: '0.75rem', color: '#b8c0ce', marginTop: '-0.25rem', lineHeight: 1.4 }}>
              Minimum 8 characters
            </p>
          )}

          {mode === 'signin' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginTop: '-0.125rem',
              }}
            >
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8rem',
                  color: '#5d667a',
                  fontWeight: 500,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{
                    width: '0.95rem',
                    height: '0.95rem',
                    accentColor: '#f97316',
                    cursor: 'pointer',
                    margin: 0,
                  }}
                />
                Remember me
              </label>
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
              ? mode === 'signin' ? 'Signing in…' : 'Creating workspace…'
              : mode === 'signin' ? 'Sign in' : comingFromInvite ? 'Create account' : 'Create free workspace'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.825rem', color: '#5d667a' }}>
          {mode === 'signin' ? (
            <>
              New to IdeaFlow?{' '}
              <button type="button" onClick={() => goTo(comingFromInvite ? 'signup' : 'choose')} style={FOOTER_LINK}>
                Get started
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => goTo('signin')} style={FOOTER_LINK}>
                Sign in
              </button>
              {!comingFromInvite && (
                <>
                  {' · '}
                  <button type="button" onClick={() => goTo('choose')} style={FOOTER_LINK}>
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
