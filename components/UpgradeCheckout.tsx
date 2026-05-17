'use client'

/**
 * UpgradeCheckout — client component
 *
 * The free-plan banner's upgrade buttons MUST live in a client component
 * because they call fetch() and redirect on click. dashboard/page.tsx is a
 * Server Component, so onClick handlers placed there are silently dropped.
 *
 * Usage:
 *   <UpgradeCheckout memberCount={memberCount} />
 */

import { useState } from 'react'

interface UpgradeCheckoutProps {
  memberCount: number
}

export default function UpgradeCheckout({ memberCount }: UpgradeCheckoutProps) {
  const [loading, setLoading] = useState<'standard' | 'pro' | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  async function startCheckout(plan: 'standard' | 'pro') {
    setLoading(plan)
    setError(null)
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Could not start checkout')
      if (!data?.url) throw new Error('No checkout URL returned')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="free-plan-banner__right">

      {/* Standard button */}
      <button
        onClick={() => startCheckout('standard')}
        disabled={loading !== null}
        aria-label="Upgrade to Standard plan"
        style={{
          width:        '100%',
          padding:      '0.625rem 1rem',
          borderRadius: '0.625rem',
          background:   'rgba(249,115,22,0.07)',
          border:       '1px solid rgba(249,115,22,0.18)',
          cursor:       loading !== null ? 'default' : 'pointer',
          textAlign:    'left',
          opacity:      loading !== null && loading !== 'standard' ? 0.5 : 1,
          transition:   'opacity 0.15s',
        }}
      >
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c2540a', marginBottom: '0.1rem' }}>
          {loading === 'standard' ? 'Redirecting…' : 'Standard'}
        </p>
        <p style={{ fontSize: '0.7rem', color: '#8b96a8' }}>€49/yr · 50 members · Full analytics</p>
      </button>

      {/* Pro AI button */}
      <button
        onClick={() => startCheckout('pro')}
        disabled={loading !== null}
        aria-label="Upgrade to Pro AI plan"
        style={{
          width:        '100%',
          padding:      '0.625rem 1rem',
          borderRadius: '0.625rem',
          background:   'linear-gradient(135deg, #1a2035 0%, #0f1726 100%)',
          border:       '1px solid rgba(99,179,237,0.18)',
          cursor:       loading !== null ? 'default' : 'pointer',
          textAlign:    'left',
          boxShadow:    '0 4px 20px rgba(9,13,30,0.2)',
          position:     'relative',
          overflow:     'hidden',
          opacity:      loading !== null && loading !== 'pro' ? 0.5 : 1,
          transition:   'opacity 0.15s',
        }}
      >
        {/* Glow overlay */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '50%', height: '100%',
          background: 'radial-gradient(ellipse at top right, rgba(99,179,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.1rem', position: 'relative' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
            {loading === 'pro' ? 'Redirecting…' : 'Pro AI'}
          </p>
          <span style={{
            fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'rgba(249,115,22,0.9)', background: 'rgba(249,115,22,0.14)',
            borderRadius: '999px', padding: '0.1rem 0.45rem',
            border: '1px solid rgba(249,115,22,0.22)',
          }}>
            Most popular
          </span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', position: 'relative' }}>
          €99/yr · 100 members · AI insights
        </p>
      </button>

      {/* Inline error (replaces alert()) */}
      {error && (
        <p style={{
          fontSize:   '0.75rem',
          color:      '#dc2626',
          background: 'rgba(220,38,38,0.06)',
          border:     '1px solid rgba(220,38,38,0.15)',
          borderRadius: '0.5rem',
          padding:    '0.4rem 0.625rem',
          lineHeight: 1.5,
          marginTop:  '0.25rem',
        }}>
          {error}
        </p>
      )}

      {/* Free plan member count */}
      <p style={{ fontSize: '0.68rem', color: '#b0bac8', textAlign: 'center', marginTop: '0.25rem' }}>
        {memberCount} / 10 members on free plan
      </p>
    </div>
  )
}
