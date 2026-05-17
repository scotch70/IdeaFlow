'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to console in development; swap for your error tracking service
    // (e.g. Sentry) in production.
    console.error('[IdeaFlow] Unhandled error:', error)
  }, [error])

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--page-bg, #fbfaf7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background bloom */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '50vw', height: '50vw', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.04) 0%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '28rem' }}>

        {/* Icon */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '1rem',
            background: 'rgba(249,115,22,0.07)',
            border: '1px solid rgba(249,115,22,0.15)',
            marginBottom: '1.5rem',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c2540a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <p
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#c2540a',
            marginBottom: '0.5rem',
          }}
        >
          Something went wrong
        </p>

        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            letterSpacing: '-0.025em',
            color: '#0d1f35',
            lineHeight: 1.25,
            marginBottom: '0.875rem',
          }}
        >
          We hit an unexpected error
        </h1>

        <p
          style={{
            fontSize: '0.9rem',
            lineHeight: 1.75,
            color: '#5a7fa8',
            marginBottom: '2rem',
          }}
        >
          Don&apos;t worry — your data is safe. Try reloading the page, or
          head back to the dashboard. If this keeps happening,{' '}
          <Link href="/contact" style={{ color: '#c2540a', textDecoration: 'none', fontWeight: 500 }}>
            let us know
          </Link>
          .
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            className="btn-primary"
            style={{ fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Try again
          </button>
          <Link href="/dashboard" className="btn-ghost-dark" style={{ fontSize: '0.875rem' }}>
            Go to dashboard
          </Link>
        </div>

        {/* Error digest for support reference */}
        {error.digest && (
          <p style={{ marginTop: '2rem', fontSize: '0.7rem', color: '#b8c0ce', fontFamily: 'monospace' }}>
            Error ref: {error.digest}
          </p>
        )}

      </div>
    </main>
  )
}
