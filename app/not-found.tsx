import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Page not found',
  description: "The page you're looking for doesn't exist or may have been moved.",
}

// Warm-ivory palette — same tokens as the homepage and the SEO landing
// pages so the 404 reads as part of the same marketing site, not an
// app-shell error screen.
const P = {
  bg:      '#fbfaf7',
  surface: '#ffffff',
  ink:     '#1f2330',
  slate:   '#5d667a',
  faint:   '#b8c0ce',
  border:  '#e7e2d8',
  accent:  '#c98b5f',
}

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        style={{
          background: P.bg,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <section style={{ padding: 'clamp(5rem, 12vw, 9rem) 0 clamp(4rem, 10vw, 7.5rem)' }}>
          <PageContainer>
            <div style={{ maxWidth: '34rem', margin: '0 auto', textAlign: 'center' }}>
              {/* "404" badge — same pill pattern as the "Pro feature" chip
                  on the homepage #sessions section, so the page sits inside
                  the same visual language. */}
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: P.accent,
                  background: 'rgba(201,139,95,0.10)',
                  border: '1px solid rgba(201,139,95,0.22)',
                  borderRadius: '999px',
                  padding: '0.32rem 0.85rem',
                  marginBottom: '2rem',
                }}
              >
                404
              </span>

              {/* Headline — same Instrument Serif italic the homepage and
                  landing pages use, scaled slightly tighter for a single
                  short phrase. */}
              <h1
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(2.5rem, 5.5vw, 3.75rem)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.05,
                  color: P.ink,
                  marginBottom: '1.25rem',
                }}
              >
                Page not found
              </h1>

              {/* Subhead — DM Sans body, slate ink, matched line height. */}
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: P.slate,
                  maxWidth: '28rem',
                  margin: '0 auto 2.5rem',
                }}
              >
                The page you&apos;re looking for doesn&apos;t exist or may
                have been moved.
              </p>

              {/* CTAs — identical button shapes/colours to the homepage hero
                  and the SEO landing-page heroes. Primary dark, secondary
                  surface with border. */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link
                  href="/"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: '2.625rem', padding: '0 1.375rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem', fontWeight: 600,
                    background: P.ink, color: '#ffffff',
                    textDecoration: 'none',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Back to home →
                </Link>
                <Link
                  href="/demo"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: '2.625rem', padding: '0 1.1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem', fontWeight: 600,
                    background: P.surface, color: P.ink,
                    border: `1px solid ${P.border}`,
                    textDecoration: 'none',
                  }}
                >
                  Try the demo
                </Link>
              </div>

              {/* Quiet helper line — three secondary marketing links so the
                  visitor has somewhere obvious to go besides home. Matches
                  the SiteFooter's product-link styling. */}
              <p
                style={{
                  fontSize: '0.8rem',
                  color: P.faint,
                  marginTop: '2.75rem',
                  lineHeight: 1.7,
                }}
              >
                Or visit{' '}
                <Link href="/features" style={{ color: P.slate, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  Features
                </Link>
                {' · '}
                <Link href="/#pricing" style={{ color: P.slate, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  Pricing
                </Link>
                {' · '}
                <Link href="/contact" style={{ color: P.slate, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  Contact
                </Link>
              </p>
            </div>
          </PageContainer>
        </section>
      </main>
    </>
  )
}
