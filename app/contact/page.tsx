import Link from 'next/link'
import LogoMark from '@/components/LogoMark'
import SiteHeader from '@/components/SiteHeader'

const NAV_CONTAINER = 'mx-auto w-full max-w-7xl px-6 lg:px-10'

export const metadata = {
  title: 'Contact — IdeaFlow',
  description: 'Get in touch to see how IdeaFlow can work for your team.',
}

export default function ContactPage() {
  return (
    <>
    <SiteHeader />
    <main style={{ minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Hero ── */}
      <section
        style={{
          background: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          padding: '5rem 0 4rem',
          borderBottom: '1px solid rgba(26,107,191,0.08)',
        }}
      >
        {/* Subtle ambient blobs */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 55% 60% at 10% 90%, rgba(249,115,22,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 85% 10%, rgba(26,107,191,0.05) 0%, transparent 55%)',
        }} />

        <div className={NAV_CONTAINER} style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)',
            borderRadius: '2rem', padding: '0.3rem 0.85rem',
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#ea580c', marginBottom: '1.4rem',
          }}>
            Get in touch
          </span>

          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            color: '#0d1f35',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            Let&apos;s talk about<br />
            <span style={{
              background: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>your team&apos;s ideas</span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            lineHeight: 1.7,
            color: '#5a7fa8',
            maxWidth: '30rem',
          }}>
            Interested in seeing how IdeaFlow could work for your organisation?
            Reach out and I&apos;ll get back to you within one business day.
          </p>
        </div>
      </section>

      {/* ── Two-column contact + info ── */}
      <section style={{ padding: '4rem 0' }}>
        <div className={NAV_CONTAINER}>
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>

            {/* Contact card */}
            <div style={{
              borderRadius: '1.25rem',
              border: '1px solid rgba(26,107,191,0.11)',
              background: '#fff',
              boxShadow: '0 4px 24px rgba(6,14,38,0.07)',
              padding: '2rem',
            }}>
              <div style={{
                width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem',
                background: 'rgba(249,115,22,0.09)', border: '1px solid rgba(249,115,22,0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f06800" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
                Send me an email
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#5a7fa8', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                I personally read every message. No sales team, no auto-responders — just a direct line.
              </p>

              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d1f35', marginBottom: '1.25rem' }}>
                lars_neeft@live.nl
              </p>

              <a
                href="mailto:lars_neeft@live.nl?subject=IdeaFlow%20Demo%20Request&body=Hi%20Lars%2C%0A%0AI'm%20interested%20in%20IdeaFlow%20for%20my%20company.%0A%0ACompany%20name%3A%0ATeam%20size%3A%0AWhat%20we%20want%20to%20improve%3A%0A"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#fff', fontWeight: 700, fontSize: '0.875rem',
                  borderRadius: '0.625rem', padding: '0.625rem 1.25rem',
                  textDecoration: 'none', letterSpacing: '-0.01em',
                }}
              >
                Open email
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            {/* What to include card */}
            <div style={{
              borderRadius: '1.25rem',
              border: '1px solid rgba(26,107,191,0.11)',
              background: '#fff',
              boxShadow: '0 4px 24px rgba(6,14,38,0.07)',
              padding: '2rem',
            }}>
              <div style={{
                width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem',
                background: 'rgba(26,107,191,0.08)', border: '1px solid rgba(26,107,191,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1a6bbf" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>

              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
                What to include
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#5a7fa8', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                A little context helps me give you a useful reply right away.
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {[
                  { icon: '🏢', label: 'Company name & industry' },
                  { icon: '👥', label: 'Team size (rough estimate)' },
                  { icon: '💡', label: 'What you want to improve' },
                  { icon: '📅', label: 'Your preferred timeline' },
                ].map(({ icon, label }) => (
                  <li key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#0d1f35' }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ paddingBottom: '5rem' }}>
        <div className={NAV_CONTAINER}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: '#1a6bbf', marginBottom: '0.6rem',
          }}>
            Common questions
          </p>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: '#0d1f35', letterSpacing: '-0.02em', marginBottom: '2.5rem',
          }}>
            Answers before you ask
          </h2>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {[
              {
                q: 'How long does it take to get started?',
                a: 'Most teams are up and running within a day. You create your workspace, invite your team with a code, and you\'re live.',
              },
              {
                q: 'Do you offer a free trial?',
                a: 'Yes — IdeaFlow is free to try with your first team. No credit card needed until you\'re ready to scale.',
              },
              {
                q: 'How big does my team need to be?',
                a: 'IdeaFlow works great for teams as small as 5 and organisations with thousands of employees alike.',
              },
              {
                q: 'Is my company\'s data kept private?',
                a: 'Absolutely. Each workspace is fully isolated. Your ideas never leave your organisation\'s account.',
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                style={{
                  borderRadius: '1rem',
                  border: '1px solid rgba(26,107,191,0.11)',
                  background: '#f4f8fc',
                  padding: '1.5rem',
                }}
              >
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.5rem', lineHeight: 1.4 }}>{q}</p>
                <p style={{ fontSize: '0.875rem', color: '#5a7fa8', lineHeight: 1.65 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA strip ── */}
      <section
        style={{
          background: '#f8faff',
          padding: '4rem 0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid rgba(26,107,191,0.08)',
        }}
      >
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 50% 80% at 50% 50%, rgba(249,115,22,0.06) 0%, transparent 65%)',
        }} />
        <div className={NAV_CONTAINER} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{ filter: 'drop-shadow(0 4px 16px rgba(240,104,0,0.28))' }}>
              <LogoMark size={44} />
            </div>
          </div>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: '#0d1f35', letterSpacing: '-0.02em', marginBottom: '0.75rem',
          }}>
            Ready to surface your team&apos;s best ideas?
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#5a7fa8', marginBottom: '2rem' }}>
            Get started in minutes — no credit card required.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/join"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#fff', fontWeight: 700, fontSize: '0.925rem',
                borderRadius: '0.625rem', padding: '0.75rem 1.5rem',
                textDecoration: 'none', letterSpacing: '-0.01em',
              }}
            >
              Start for free →
            </Link>
            <Link
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center',
                background: '#ffffff', border: '1px solid rgba(26,107,191,0.20)',
                color: '#2c4a6e', fontWeight: 600, fontSize: '0.925rem',
                borderRadius: '0.625rem', padding: '0.75rem 1.5rem',
                textDecoration: 'none',
              }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </section>

    </main>
    </>
  )
}
