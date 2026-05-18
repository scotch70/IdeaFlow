import Link from 'next/link'
import { IdeaFlowMark } from '@/components/Logo'

/**
 * SiteFooter
 *
 * Reusable dark-background footer for all public / marketing pages.
 * Contains:
 *   1. CTA section — headline, subtitle, primary button
 *   2. Footer bottom — logo, brand description, Product & Legal nav, copyright
 *
 * Usage:
 *   <SiteFooter />                   — shows "Get started free →" (guest)
 *   <SiteFooter isLoggedIn={true} /> — shows "Open dashboard →"
 */

interface SiteFooterProps {
  /** When true, CTA button reads "Open dashboard →" instead of "Get started free →" */
  isLoggedIn?: boolean
}

const DARK = '#13162a'

export default function SiteFooter({ isLoggedIn = false }: SiteFooterProps) {
  return (
    <footer style={{ background: DARK, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── CTA section ─────────────────────────────────────────────────────── */}
      <div
        className="cta-dark"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: 'clamp(4rem,8vw,7rem) 0',
        }}
      >
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '0 clamp(1.25rem, 5vw, 2.5rem)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ maxWidth: '36rem' }}>
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(1.875rem, 4vw, 2.875rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                color: 'rgba(255,255,255,0.95)',
                marginBottom: '1rem',
              }}
            >
              The best idea in your company is waiting to be heard.
            </h2>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.38)',
                marginBottom: '2.25rem',
              }}
            >
              Set up in under 10 minutes. Invite your team. See what they&apos;re actually thinking.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: '2.75rem', padding: '0 1.5rem',
                    borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
                    background: '#ffffff', color: '#1f2330', textDecoration: 'none',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Open dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth?mode=signup"
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      height: '2.75rem', padding: '0 1.5rem',
                      borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
                      background: '#ffffff', color: '#1f2330', textDecoration: 'none',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Get started free →
                  </Link>
                  <Link
                    href="/auth?mode=login"
                    style={{
                      display: 'inline-flex', alignItems: 'center',
                      height: '2.75rem', padding: '0 1rem',
                      fontSize: '0.9rem', fontWeight: 500,
                      color: 'rgba(255,255,255,0.38)', textDecoration: 'none',
                    }}
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer bottom ────────────────────────────────────────────────────── */}
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
                AI-powered employee insight platform.<br />
                Made for modern teams that want to improve.
              </p>
              <a
                href="mailto:hello@useideaflow.com"
                style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textDecoration: 'none', marginTop: '0.5rem', display: 'inline-block' }}
              >
                hello@useideaflow.com
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
