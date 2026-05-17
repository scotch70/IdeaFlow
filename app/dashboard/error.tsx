'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface DashboardErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error('[IdeaFlow dashboard] Error:', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--page-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '24rem' }}>

        {/* Icon */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '3rem', height: '3rem', borderRadius: '0.875rem',
          background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.14)',
          marginBottom: '1.25rem',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c2540a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <p style={{
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#c2540a', marginBottom: '0.4rem',
        }}>
          Dashboard error
        </p>

        <h1 style={{
          fontSize: '1.25rem', fontWeight: 700,
          color: '#0d1f35', letterSpacing: '-0.02em',
          lineHeight: 1.3, marginBottom: '0.75rem',
        }}>
          Something went wrong
        </h1>

        <p style={{
          fontSize: '0.875rem', lineHeight: 1.7,
          color: '#5a7fa8', marginBottom: '1.75rem',
        }}>
          We couldn&apos;t load this part of the dashboard. Your data is safe.
          Try reloading or{' '}
          <Link href="/contact" style={{ color: '#c2540a', textDecoration: 'none', fontWeight: 500 }}>
            contact support
          </Link>{' '}
          if this persists.
        </p>

        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            className="btn-primary"
            style={{ fontSize: '0.8125rem', cursor: 'pointer' }}
          >
            Reload
          </button>
          <Link href="/dashboard" className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
            Back to dashboard
          </Link>
        </div>

        {error.digest && (
          <p style={{ marginTop: '1.5rem', fontSize: '0.68rem', color: '#b8c0ce', fontFamily: 'monospace' }}>
            ref: {error.digest}
          </p>
        )}

      </div>
    </div>
  )
}
