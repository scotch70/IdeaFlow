/**
 * ProLockScreen — shown to Free / Standard users when they hit any /dashboard/sessions route.
 *
 * Server component (no client state). Renders the upgrade card matching the
 * spec exactly: title, subtitle, "Upgrade to Pro" CTA, plus a short bullet
 * list of what they get so the upgrade has real weight.
 */

import Link from 'next/link'

const FEATURE_BULLETS = [
  'Guided brainstorming with structured steps',
  '7 templates — startup idea, product feature, decision making, and more',
  'Visual canvas with draggable cards and connections',
  'AI helpers — suggest angles, summarize, generate next steps',
  'Export a clean session summary when you finish',
]

export default function ProLockScreen() {
  return (
    <div style={{ padding: '2rem 1.25rem 4rem', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          maxWidth: '38rem',
          width: '100%',
          background: '#fff',
          border: '1px solid rgba(26,107,191,0.10)',
          borderRadius: '1.25rem',
          padding: '2.25rem 2rem',
          boxShadow: '0 6px 32px rgba(6,14,38,0.06)',
          textAlign: 'center',
        }}
      >
        {/* Pro chip */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#c2540a',
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.22)',
              borderRadius: '999px',
              padding: '0.3rem 0.7rem',
            }}
          >
            <span>✦</span> Pro feature
          </span>
        </div>

        <h1
          style={{
            fontSize: '1.6rem', fontWeight: 800,
            color: '#0d1f35', letterSpacing: '-0.02em',
            lineHeight: 1.15, marginBottom: '0.6rem',
          }}
        >
          Unlock IdeaFlow Sessions
        </h1>

        <p
          style={{
            fontSize: '0.95rem', color: '#5d667a',
            lineHeight: 1.55, maxWidth: '26rem', margin: '0 auto 1.75rem',
          }}
        >
          Run guided brainstorming sessions that turn rough ideas into clear next steps.
        </p>

        {/* Bullets */}
        <ul
          style={{
            listStyle: 'none', padding: 0, margin: '0 auto 2rem',
            maxWidth: '24rem',
            display: 'flex', flexDirection: 'column', gap: '0.55rem',
            textAlign: 'left',
          }}
        >
          {FEATURE_BULLETS.map(b => (
            <li
              key={b}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.55rem',
                fontSize: '0.875rem', color: '#3d4758', lineHeight: 1.5,
              }}
            >
              <span
                aria-hidden
                style={{
                  flexShrink: 0, marginTop: '0.15rem',
                  width: '1.05rem', height: '1.05rem', borderRadius: '999px',
                  background: 'rgba(16,185,129,0.10)',
                  color: '#059669',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 800,
                }}
              >✓</span>
              {b}
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/settings#billing"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: '#0d1f35', color: '#fff',
              fontSize: '0.875rem', fontWeight: 700,
              padding: '0.7rem 1.2rem', borderRadius: '0.625rem',
              textDecoration: 'none',
              boxShadow: '0 4px 18px rgba(13,31,53,0.18)',
            }}
          >
            Upgrade to Pro
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: '0.825rem', fontWeight: 600,
              color: '#5d667a',
              padding: '0.7rem 1rem', borderRadius: '0.625rem',
              textDecoration: 'none',
            }}
          >
            Maybe later
          </Link>
        </div>

        <p style={{ fontSize: '0.7rem', color: '#9faab8', marginTop: '1.5rem' }}>
          €99 / year · cancel anytime
        </p>
      </div>
    </div>
  )
}
