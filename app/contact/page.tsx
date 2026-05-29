import Link from 'next/link'
import PageContainer from '@/components/PageContainer'
import SiteHeader from '@/components/SiteHeader'
import ContactForm from './ContactForm'

export const metadata = {
  title: 'Contact — IdeaFlow',
  description: 'Get in touch about IdeaFlow, pricing, or Brainstorm Sessions.',
}

// Warm-ivory palette — kept inline so the page matches the landing page exactly.
const P = {
  bg:      '#fbfaf7',
  raised:  '#f0ede8',
  surface: '#ffffff',
  ink:     '#1f2330',
  slate:   '#5d667a',
  faint:   '#b8c0ce',
  border:  '#e7e2d8',
  accent:  '#c98b5f',
  dark:    '#13162a',
}

export default function ContactPage() {
  return (
    <>
      <SiteHeader />

      <main style={{ background: P.bg, minHeight: '100vh' }}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section
          style={{
            background: P.bg,
            padding: 'clamp(3.5rem, 7vw, 5.5rem) 0 clamp(2rem, 4vw, 3rem)',
          }}
        >
          <PageContainer>
            <div style={{ maxWidth: '34rem' }}>
              <p
                style={{
                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem',
                }}
              >
                Contact
              </p>
              <h1
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.02em',
                  color: P.ink,
                  lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}
              >
                Get in touch
              </h1>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate }}>
                Have a question about IdeaFlow, pricing, or Brainstorm Sessions?
                We&apos;d love to hear from you.
              </p>
            </div>
          </PageContainer>
        </section>

        {/* ── Form + side card ──────────────────────────────────────────── */}
        <section style={{ background: P.bg, padding: '0 0 clamp(4rem, 8vw, 6rem)' }}>
          <PageContainer>
            <div
              style={{
                display: 'grid',
                gap: '1.25rem',
                gridTemplateColumns: 'minmax(0, 1.6fr) minmax(260px, 1fr)',
                alignItems: 'start',
              }}
              className="contact-grid"
            >
              {/* Form card */}
              <div
                style={{
                  background: P.surface,
                  border: `1px solid ${P.border}`,
                  borderRadius: '1rem',
                  padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  boxShadow: '0 4px 24px rgba(6,14,38,0.04)',
                }}
              >
                <h2
                  style={{
                    fontSize: '1rem', fontWeight: 700, color: P.ink,
                    letterSpacing: '-0.01em', marginBottom: '0.3rem',
                  }}
                >
                  Send us a message
                </h2>
                <p
                  style={{
                    fontSize: '0.85rem', color: P.slate, lineHeight: 1.55,
                    marginBottom: '1.4rem',
                  }}
                >
                  We read every note. Replies usually land in your inbox within one business day.
                </p>
                <ContactForm />
              </div>

              {/* Side card */}
              <div
                style={{
                  background: P.surface,
                  border: `1px solid ${P.border}`,
                  borderRadius: '1rem',
                  padding: '1.6rem 1.5rem',
                  boxShadow: '0 4px 24px rgba(6,14,38,0.04)',
                }}
              >
                <p
                  style={{
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: P.faint, marginBottom: '0.6rem',
                  }}
                >
                  What we can help with
                </p>
                <h3
                  style={{
                    fontSize: '0.95rem', fontWeight: 700, color: P.ink,
                    letterSpacing: '-0.01em', lineHeight: 1.35, marginBottom: '1rem',
                  }}
                >
                  Anything about IdeaFlow.
                </h3>
                <ul
                  style={{
                    listStyle: 'none', padding: 0, margin: 0,
                    display: 'flex', flexDirection: 'column', gap: '0.7rem',
                  }}
                >
                  {[
                    { title: 'Product questions',   detail: 'How features work, what fits your team.' },
                    { title: 'Brainstorm Sessions', detail: 'The Pro guided brainstorming workspace.' },
                    { title: 'Pricing',             detail: 'Plans, billing, and what counts as members.' },
                    { title: 'Workspace setup',     detail: 'Onboarding, invites, and admin questions.' },
                  ].map(({ title, detail }) => (
                    <li
                      key={title}
                      style={{
                        display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
                        padding: '0.55rem 0',
                        borderTop: `1px solid ${P.border}`,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          flexShrink: 0, marginTop: '0.3rem',
                          width: '6px', height: '6px', borderRadius: '999px',
                          background: P.accent,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: P.ink, letterSpacing: '-0.01em' }}>
                          {title}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: P.slate, lineHeight: 1.5, marginTop: '0.1rem' }}>
                          {detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div
                  style={{
                    marginTop: '1.25rem', paddingTop: '1rem',
                    borderTop: `1px solid ${P.border}`,
                    fontSize: '0.78rem', color: P.slate, lineHeight: 1.5,
                  }}
                >
                  Prefer email?{' '}
                  <a
                    href="mailto:ideaflow@appstimize.nl"
                    style={{ color: P.ink, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                  >
                    ideaflow@appstimize.nl
                  </a>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section style={{ background: P.surface, borderTop: `1px solid ${P.border}`, padding: 'clamp(3.5rem, 7vw, 5.5rem) 0' }}>
          <PageContainer>
            <div style={{ maxWidth: '32rem', marginBottom: '2.25rem' }}>
              <p
                style={{
                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem',
                }}
              >
                Common questions
              </p>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                }}
              >
                Answers before you ask
              </h2>
            </div>

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {[
                {
                  q: 'How long does it take to get started?',
                  a: 'Most teams are up and running within a day. Create your workspace, invite the team with a code, and you’re live.',
                },
                {
                  q: 'Is IdeaFlow free to start?',
                  a: 'Yes — there’s a free plan with no time limit. No credit card needed to get started.',
                },
                {
                  q: 'What are Brainstorm Sessions?',
                  a: 'Sessions are the Pro guided brainstorming workspace — Define, Explore, Connect, Prioritize, Action. One session per topic.',
                },
                {
                  q: 'Is my company’s data kept private?',
                  a: 'Every workspace is fully isolated. Your sessions and ideas never leave your organisation’s account.',
                },
              ].map(({ q, a }) => (
                <div
                  key={q}
                  style={{
                    borderRadius: '0.9rem',
                    border: `1px solid ${P.border}`,
                    background: P.bg,
                    padding: '1.25rem 1.25rem 1.35rem',
                  }}
                >
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: P.ink, marginBottom: '0.45rem', lineHeight: 1.4 }}>
                    {q}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: P.slate, lineHeight: 1.6 }}>
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* ── Bottom CTA ────────────────────────────────────────────────── */}
        <section style={{ background: P.raised, borderTop: `1px solid ${P.border}`, padding: 'clamp(3.5rem, 7vw, 5rem) 0' }}>
          <PageContainer>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ maxWidth: '30rem' }}>
                <h2
                  style={{
                    fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                    fontSize: 'clamp(1.5rem, 2.6vw, 2rem)',
                    letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.2,
                    marginBottom: '0.5rem',
                  }}
                >
                  Ready to start brainstorming?
                </h2>
                <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.6 }}>
                  Free plan, no credit card. Upgrade to Pro for Brainstorm Sessions when you’re ready.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                <Link
                  href="/auth?mode=signup"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: P.dark, color: '#fff',
                    fontSize: '0.9rem', fontWeight: 700,
                    padding: '0.7rem 1.2rem', borderRadius: '0.625rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 18px rgba(13,22,42,0.18)',
                  }}
                >
                  Start free →
                </Link>
                <Link
                  href="/"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: P.surface, border: `1px solid ${P.border}`,
                    color: P.ink, fontSize: '0.9rem', fontWeight: 600,
                    padding: '0.7rem 1.1rem', borderRadius: '0.625rem',
                    textDecoration: 'none',
                  }}
                >
                  ← Back to home
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>

        <style>{`
          @media (max-width: 720px) {
            .contact-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </main>
    </>
  )
}
