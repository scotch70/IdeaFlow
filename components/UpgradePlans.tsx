'use client'

import { useState } from 'react'

interface UpgradePlansProps {
  /** Compact mode: renders as two side-by-side buttons rather than full plan cards */
  compact?: boolean
  /** Current plan of the company, used to hide the upgrade button for plans already held */
  currentPlan?: string
}

export default function UpgradePlans({ compact = false, currentPlan }: UpgradePlansProps) {
  const [loadingPlan, setLoadingPlan] = useState<'standard' | 'pro' | null>(null)

  async function handleUpgrade(plan: 'standard' | 'pro') {
    try {
      setLoadingPlan(plan)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) throw new Error(data?.error || 'Failed to start checkout')
      if (!data?.url) throw new Error('No checkout URL returned')
      window.location.href = data.url
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoadingPlan(null)
    }
  }

  // ── Compact mode: two inline buttons ──────────────────────────────────────
  if (compact) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {currentPlan !== 'standard' && currentPlan !== 'pro' && (
          <button
            onClick={() => handleUpgrade('standard')}
            disabled={loadingPlan !== null}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              padding: '0.5rem 0.9rem',
              borderRadius: '0.6rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: loadingPlan !== null ? 'default' : 'pointer',
              border: 'none',
              opacity: loadingPlan !== null ? 0.7 : 1,
              letterSpacing: '0.01em',
              boxShadow: loadingPlan !== null ? 'none' : '0 2px 10px rgba(240,104,0,0.25)',
              transition: 'opacity 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {loadingPlan === 'standard' ? 'Redirecting…' : 'Standard — €49/yr'}
          </button>
        )}
        {currentPlan !== 'pro' && (
          <button
            onClick={() => handleUpgrade('pro')}
            disabled={loadingPlan !== null}
            style={{
              background: 'linear-gradient(135deg, #1a6bbf 0%, #1254a0 100%)',
              color: '#fff',
              padding: '0.5rem 0.9rem',
              borderRadius: '0.6rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: loadingPlan !== null ? 'default' : 'pointer',
              border: 'none',
              opacity: loadingPlan !== null ? 0.7 : 1,
              letterSpacing: '0.01em',
              boxShadow: loadingPlan !== null ? 'none' : '0 2px 10px rgba(26,107,191,0.3)',
              transition: 'opacity 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {loadingPlan === 'pro' ? 'Redirecting…' : 'Pro — €99/yr'}
          </button>
        )}
      </div>
    )
  }

  // ── Full card mode ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
      {/* Standard card */}
      <div
        style={{
          borderRadius: '1rem',
          border: '1px solid rgba(26,107,191,0.15)',
          background: currentPlan === 'standard' ? 'rgba(26,107,191,0.04)' : '#fff',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a6bbf', marginBottom: '0.25rem' }}>
            Standard
          </p>
          <p style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            €49<span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-light)' }}>/year</span>
          </p>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {['Up to 50 members', 'Unlimited IdeaFlows', 'PDF reports'].map(f => (
            <li key={f} style={{ fontSize: '0.8125rem', color: 'var(--ink-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#22c55e', fontSize: '0.75rem' }}>✓</span> {f}
            </li>
          ))}
        </ul>
        {currentPlan === 'standard' ? (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a6bbf', padding: '0.35rem 0.6rem', borderRadius: '0.4rem', background: 'rgba(26,107,191,0.08)', textAlign: 'center' }}>
            Current plan
          </span>
        ) : currentPlan === 'pro' ? (
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-light)', textAlign: 'center', padding: '0.35rem 0' }}>
            You're on a higher plan
          </span>
        ) : (
          <button
            onClick={() => handleUpgrade('standard')}
            disabled={loadingPlan !== null}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.6rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: loadingPlan !== null ? 'default' : 'pointer',
              border: 'none',
              opacity: loadingPlan !== null ? 0.7 : 1,
              boxShadow: loadingPlan !== null ? 'none' : '0 2px 8px rgba(240,104,0,0.25)',
              transition: 'opacity 0.15s',
            }}
          >
            {loadingPlan === 'standard' ? 'Redirecting…' : 'Upgrade →'}
          </button>
        )}
      </div>

      {/* Pro card */}
      <div
        style={{
          borderRadius: '1rem',
          border: currentPlan === 'pro' ? '1.5px solid rgba(26,107,191,0.3)' : '1px solid rgba(26,107,191,0.15)',
          background: currentPlan === 'pro' ? 'rgba(26,107,191,0.04)' : '#fff',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a6bbf', marginBottom: '0.25rem' }}>
            Pro
          </p>
          <p style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            €99<span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-light)' }}>/year</span>
          </p>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {['Up to 100 members', 'Unlimited IdeaFlows', 'PDF reports', 'Everything in Standard'].map(f => (
            <li key={f} style={{ fontSize: '0.8125rem', color: 'var(--ink-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#22c55e', fontSize: '0.75rem' }}>✓</span> {f}
            </li>
          ))}
        </ul>
        {currentPlan === 'pro' ? (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a6bbf', padding: '0.35rem 0.6rem', borderRadius: '0.4rem', background: 'rgba(26,107,191,0.08)', textAlign: 'center' }}>
            Current plan
          </span>
        ) : (
          <button
            onClick={() => handleUpgrade('pro')}
            disabled={loadingPlan !== null}
            style={{
              background: 'linear-gradient(135deg, #1a6bbf 0%, #1254a0 100%)',
              color: '#fff',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.6rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: loadingPlan !== null ? 'default' : 'pointer',
              border: 'none',
              opacity: loadingPlan !== null ? 0.7 : 1,
              boxShadow: loadingPlan !== null ? 'none' : '0 2px 8px rgba(26,107,191,0.3)',
              transition: 'opacity 0.15s',
            }}
          >
            {loadingPlan === 'pro' ? 'Redirecting…' : 'Upgrade →'}
          </button>
        )}
      </div>
    </div>
  )
}
