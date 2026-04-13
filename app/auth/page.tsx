'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import LogoMark from '@/components/LogoMark'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const params = useSearchParams()
  const nextUrl = params.get('next') || '/dashboard'
  const supabase = createClient()

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
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 55% at 30% 60%, rgba(249,115,22,0.06) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 70% 30%, rgba(26,107,191,0.07) 0%, transparent 60%)',
      }} />

      <div style={{ width: '100%', maxWidth: '22rem', position: 'relative', zIndex: 1 }}>
        {/* Logo mark */}
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
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
              {mode === 'signin' ? 'Welcome back' : 'Create your workspace'}
            </p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {mode === 'signin' ? 'Sign in' : 'Register'}
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
              {loading
                ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
                : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.825rem', color: 'var(--ink-light)' }}>
            {mode === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError('') }}
                  style={{ fontWeight: 600, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError('') }}
                  style={{ fontWeight: 600, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
