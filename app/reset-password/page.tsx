'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LogoMark from '@/components/LogoMark'

type PageStatus = 'loading' | 'ready' | 'invalid' | 'success'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()

  const [status, setStatus] = useState<PageStatus>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Supabase sends reset links in two formats depending on the project's auth flow:
    //
    //   PKCE (modern default): /reset-password?code=XXXX
    //     → must call exchangeCodeForSession() to establish the session
    //
    //   Implicit (legacy):     /reset-password#access_token=...&type=recovery
    //     → Supabase JS processes the hash automatically and fires PASSWORD_RECOVERY
    //
    // Only mark the link invalid when neither format is detected.

    let resolved = false
    function resolve(next: 'ready' | 'invalid') {
      if (resolved) return
      resolved = true
      setStatus(next)
    }

    const searchCode = new URLSearchParams(window.location.search).get('code')
    const hashType = new URLSearchParams(
      window.location.hash.replace(/^#/, '')
    ).get('type')

    // ── PKCE path ──────────────────────────────────────────────────────────
    if (searchCode) {
      supabase.auth
        .exchangeCodeForSession(searchCode)
        .then(({ error }) => resolve(error ? 'invalid' : 'ready'))
        .catch(() => resolve('invalid'))
      // No auth state subscription needed — the exchange result is definitive.
      return
    }

    // ── Legacy implicit path ───────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        resolve('ready')
      } else if (event === 'INITIAL_SESSION') {
        // PASSWORD_RECOVERY fires right after INITIAL_SESSION when the hash
        // contains a recovery token. Only give up if the hash has no token.
        if (hashType !== 'recovery') {
          resolve('invalid')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setStatus('success')
      // Give the user a moment to read the success message, then redirect
      setTimeout(() => router.push('/dashboard'), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Shared layout ─────────────────────────────────────────────────────────
  const shell = (children: React.ReactNode) => (
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{ filter: 'drop-shadow(0 3px 12px rgba(240,104,0,0.40))' }}>
            <LogoMark size={30} />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>
            Idea<span style={{ color: '#f97316' }}>Flow</span>
          </span>
        </div>
        <div style={{
          borderRadius: '1.5rem',
          padding: '2rem',
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(255,255,255,0.20)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)',
        }}>
          {children}
        </div>
      </div>
    </main>
  )

  // ── Loading ───────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return shell(
      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--ink-light)', padding: '1rem 0' }}>
        Verifying reset link…
      </p>
    )
  }

  // ── Invalid / expired link ────────────────────────────────────────────────
  if (status === 'invalid') {
    return shell(
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{
          width: '2.75rem', height: '2.75rem', borderRadius: '50%',
          background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
        }}>
          ✕
        </div>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
            Link invalid
          </p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.4rem' }}>
            Reset link expired
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', lineHeight: 1.6 }}>
            This password reset link is no longer valid. Links expire after 24 hours and can only be used once.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="btn-primary"
          style={{ textAlign: 'center' }}
        >
          Request a new link
        </Link>
        <Link
          href="/auth"
          style={{ fontSize: '0.825rem', color: 'var(--orange)', fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (status === 'success') {
    return shell(
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
            All done
          </p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.4rem' }}>
            Password updated
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', lineHeight: 1.6 }}>
            Your password has been changed. Redirecting you to your dashboard…
          </p>
        </div>
      </div>
    )
  }

  // ── Password form ─────────────────────────────────────────────────────────
  return shell(
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
          Choose a new password
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Reset password
        </h1>
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
          {loading ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </>
  )
}
