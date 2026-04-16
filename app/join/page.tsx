'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LogoMark from '@/components/LogoMark'

const INVITE_CODE_STORAGE_KEY = 'ideaflow_invite_code'

export default function JoinPage() {
  const params = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const codeFromUrl = params.get('code') || ''

  const [code, setCode] = useState(codeFromUrl)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState<'INVITE_INVALID' | 'INVITE_USED' | 'INVITE_EXPIRED' | ''>('')

  useEffect(() => {
    const savedCode = window.localStorage.getItem(INVITE_CODE_STORAGE_KEY)
    if (codeFromUrl) {
      setCode(codeFromUrl.toUpperCase())
      window.localStorage.setItem(INVITE_CODE_STORAGE_KEY, codeFromUrl.toUpperCase())
    } else if (savedCode) {
      setCode(savedCode)
    }
  }, [codeFromUrl])

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      if (user) {
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
        if (fullName) setName(fullName)
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [supabase])

  const trimmedCode = code.trim().toUpperCase()

  useEffect(() => {
    async function autoJoinIfReady() {
      if (!isLoggedIn || !trimmedCode || !name.trim() || loading) return
      if (params.get('autoJoin') !== '1') return
      setLoading(true)
      setError('')
      setErrorCode('')
      try {
        const res = await fetch('/api/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode: trimmedCode, fullName: name }),
        })
        const data = await res.json()
        if (!res.ok) {
          if (data?.errorCode) setErrorCode(data.errorCode)
          throw new Error(data.error || 'Failed to join')
        }
        window.localStorage.removeItem('ideaflow_invite_code')
        router.push('/dashboard')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    autoJoinIfReady()
  }, [isLoggedIn, trimmedCode, name, loading, params, router])

  useEffect(() => {
    if (trimmedCode) window.localStorage.setItem(INVITE_CODE_STORAGE_KEY, trimmedCode)
  }, [trimmedCode])

  const authRedirectUrl = useMemo(() => {
    const next = trimmedCode ? `/join?code=${encodeURIComponent(trimmedCode)}&autoJoin=1` : '/join'
    return `/auth?next=${encodeURIComponent(next)}`
  }, [trimmedCode])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setErrorCode('')
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: trimmedCode, fullName: name }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.errorCode) setErrorCode(data.errorCode)
        throw new Error(data.error || 'Failed to join')
      }
      window.localStorage.removeItem(INVITE_CODE_STORAGE_KEY)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const pageShell = (children: React.ReactNode) => (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(160deg, #060e26 0%, #0a1f50 35%, #0e3278 60%, #1a5a9a 85%, #2e7abf 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 55% at 30% 60%, rgba(249,115,22,0.09) 0%, transparent 65%)' }} />
      <div style={{ width: '100%', maxWidth: '22rem', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{ filter: 'drop-shadow(0 3px 12px rgba(240,104,0,0.40))' }}><LogoMark size={30} /></div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>Idea<span style={{ color: '#ffb733' }}>Flow</span></span>
        </div>
        {children}
      </div>
    </main>
  )

  const card = (children: React.ReactNode) => (
    <div style={{ borderRadius: '1.5rem', padding: '2rem', background: 'rgba(255,255,255,0.97)', boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
      {children}
    </div>
  )

  // ── Fatal invite error states ─────────────────────────────────────────────
  const FATAL_ERRORS = {
    INVITE_EXPIRED: {
      icon: '⏱',
      heading: 'Invite has expired',
      body: 'This invite link is no longer valid. Ask your admin to send you a new one.',
    },
    INVITE_USED: {
      icon: '🔒',
      heading: 'Invite already used',
      body: 'Each invite can only be accepted once. Contact your admin if you still need access.',
    },
    INVITE_INVALID: {
      icon: '✕',
      heading: 'Invite not found',
      body: "We couldn't find that invite code. Double-check the link or ask your admin for a new invite.",
    },
  } as const

  if (errorCode && errorCode in FATAL_ERRORS) {
    const { icon, heading, body } = FATAL_ERRORS[errorCode as keyof typeof FATAL_ERRORS]
    return pageShell(card(
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div
          style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '50%',
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
          }}
        >
          {icon}
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.4rem' }}>
            {heading}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)', lineHeight: 1.6 }}>
            {body}
          </p>
        </div>
        <Link href="/" className="btn-ghost-dark" style={{ textAlign: 'center' }}>
          Back to home
        </Link>
      </div>
    ))
  }

  if (checkingAuth) {
    return pageShell(card(
      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--ink-light)', padding: '1rem 0' }}>Checking access…</p>
    ))
  }

  if (!isLoggedIn) {
    return pageShell(card(
      <>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>You were invited</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Join your company</h1>
          <p style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--ink-light)', lineHeight: 1.6 }}>Enter your invite code, then create an account or log in to continue.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            className="input"
            placeholder="Invite code"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
          />
          <Link
            href={authRedirectUrl}
            className="btn-primary"
            style={{ textAlign: 'center', opacity: !trimmedCode ? 0.5 : 1, pointerEvents: !trimmedCode ? 'none' : 'auto' }}
          >
            Create account or log in →
          </Link>
          <Link href="/" className="btn-ghost-dark" style={{ textAlign: 'center' }}>
            Back to home
          </Link>
        </div>
      </>
    ))
  }

  return pageShell(card(
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>Almost there</p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Join your workspace</h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--ink-light)' }}>Confirm your details to get access.</p>
      </div>

      <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          className="input"
          placeholder="Invite code"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          required
        />
        <input
          className="input"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        {error && (
          <p style={{ borderRadius: '0.625rem', border: '1px solid rgba(220,38,38,0.15)', background: 'rgba(220,38,38,0.05)', padding: '0.5rem 0.75rem', fontSize: '0.825rem', color: '#dc2626' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: '0.25rem' }}
          disabled={loading || !trimmedCode || !name.trim()}
        >
          {loading ? 'Joining…' : 'Join workspace'}
        </button>
      </form>
    </>
  ))
}
