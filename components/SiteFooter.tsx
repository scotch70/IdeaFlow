import { IdeaFlowMark } from '@/components/Logo'

/**
 * SiteFooter
 *
 * Global site footer — rendered once in app/layout.tsx so it appears
 * on every route automatically. No props needed.
 *
 * Contains: logo + tagline + email, Product nav, Legal nav, copyright.
 * Marketing CTAs belong on individual pages, not here.
 */

const DARK = '#13162a'

export default function SiteFooter() {
  return (
    <footer style={{ background: DARK, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div style={{ padding: '2.5rem 0' }}>
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '0 clamp(1.25rem, 5vw, 2.5rem)',
          }}
        >
          {/* Top row: brand + navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '2rem',
              marginBottom: '2rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Brand block */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
                <IdeaFlowMark width={16} color="rgba(255,255,255,0.5)" />
                <span
                  style={{
                    fontSize: '0.9rem', fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '-0.02em',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  IdeaFlow
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', lineHeight: 1.6, maxWidth: '16rem' }}>
                Collect ideas, run sessions, decide together.<br />
                Made for modern teams that want to improve.
              </p>
              <a
                href="mailto:ideaflow@appstimize.nl"
                style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', marginTop: '0.5rem', display: 'inline-block' }}
              >
                ideaflow@appstimize.nl
              </a>
            </div>

            {/* Navigation columns */}
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              <div>
                <p
                  style={{
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Product
                </p>
                {(
                  [
                    ['Features',  '/features'],
                    ['Pricing',   '/#pricing'],
                    ['Demo',      '/demo'],
                    ['Contact',   '/contact'],
                  ] as [string, string][]
                ).map(([label, href]) => (
                  <div key={label} style={{ marginBottom: '0.4rem' }}>
                    <a href={href} className="footer-nav-link">
                      {label}
                    </a>
                  </div>
                ))}
              </div>

              <div>
                <p
                  style={{
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
                    marginBottom: '0.75rem',
                  }}
                >
                  Legal
                </p>
                {(
                  [
                    ['Privacy Policy',    '/privacy'],
                    ['Terms of Service',  '/terms'],
                    ['Cookie Policy',     '/cookies'],
                  ] as [string, string][]
                ).map(([label, href]) => (
                  <div key={label} style={{ marginBottom: '0.4rem' }}>
                    <a href={href} className="footer-nav-link">
                      {label}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.14)' }}>
            © {new Date().getFullYear()} IdeaFlow. All rights reserved.
          </p>
        </div>
      </div>

    </footer>
  )
}
