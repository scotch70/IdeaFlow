import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/PageContainer'
import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Brainstorming software for teams that need to make decisions',
  description:
    'IdeaFlow is brainstorming software built around two structured session formats — Brainstorm Circle and Starbursting — so every brainstorm ends with a written decision, not another Slack thread.',
}

// Same warm-ivory palette as the homepage. Reused inline to stay
// consistent without introducing a new design system or component.
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

export default async function BrainstormingSoftwarePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ctaHref  = user ? '/dashboard' : '/auth?mode=signup'
  const ctaLabel = user ? 'Open dashboard →' : 'Get started free →'

  return (
    <>
      <SiteHeader />
      <main style={{ background: P.bg, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── HERO ────────────────────────────────────────────────────── */}
        <section
          style={{
            background: P.bg,
            padding: 'clamp(4rem, 8vw, 6rem) 0 clamp(3rem, 6vw, 4.5rem)',
            borderBottom: `1px solid ${P.border}`,
          }}
        >
          <PageContainer>
            <div style={{ maxWidth: '40rem' }}>
              <p
                style={{
                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem',
                }}
              >
                Brainstorming software
              </p>
              <h1
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  color: P.ink,
                  marginBottom: '1.25rem',
                }}
              >
                Brainstorming software for teams that need to make decisions
              </h1>
              <p
                style={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.75,
                  color: P.slate,
                  marginBottom: '2rem',
                  maxWidth: '32rem',
                }}
              >
                Most brainstorming software hands you an infinite canvas and
                wishes you luck. IdeaFlow is built around two structured
                session formats — Brainstorm Circle and Starbursting — so
                every brainstorm ends with a written decision instead of a
                screenshot nobody reads.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link
                  href={ctaHref}
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
                  {ctaLabel}
                </Link>
                <Link
                  href="/demo"
                  style={{
                    fontSize: '0.875rem', fontWeight: 500,
                    color: P.slate, textDecoration: 'none',
                    padding: '0 0.25rem',
                  }}
                >
                  Try the demo
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── THE INFINITE-CANVAS TRAP ────────────────────────────── */}
        <section style={{ background: P.bg, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Why structured
              </p>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}
              >
                Infinite canvases are great for ideas, bad for decisions
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate }}>
                Open-canvas brainstorming software is built for the divergent
                phase — generate as many sticky notes as you can. Two hours
                later you&apos;ve got a wall of colour and nobody knows what
                was decided. IdeaFlow runs the divergent phase too, but it
                also runs the convergent one: every Brainstorm Session has a
                structure that forces the group to land somewhere.
              </p>
            </div>
            <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7, maxWidth: '38rem' }}>
              That structure is the whole point. Without it, a brainstorming
              tool is just shared whiteboard. With it, you get a repeatable
              process — open the session, pick a template, run it, finish.
              The next meeting starts from the previous decision, not from
              the previous board.
            </p>
          </PageContainer>
        </section>

        {/* ── BRAINSTORM CIRCLE ──────────────────────────────────────── */}
        <section style={{ background: P.surface, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Format 1
              </p>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}
              >
                Brainstorm Circle: one question, eight perspectives
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate }}>
                The Brainstorm Circle template places one central question in
                the middle of the canvas and arranges eight team perspectives
                around it. Each member writes one card and hearts the others
                that resonate. After fifteen minutes the loudest voice in the
                room hasn&apos;t dominated — every perspective is on the
                canvas, and the popular ones are obvious.
              </p>
            </div>
            <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7, maxWidth: '38rem' }}>
              Use it for retros, hiring debriefs, product decisions, planning
              kickoffs — anywhere you want everyone&apos;s view in one place
              without the meeting going an hour over.
            </p>
          </PageContainer>
        </section>

        {/* ── STARBURSTING ────────────────────────────────────────── */}
        <section style={{ background: P.bg, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Format 2
              </p>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}
              >
                Starbursting: interrogate the idea from every angle
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate }}>
                Starbursting is the inverse of free ideation. Instead of
                generating answers, you generate questions — six spokes for
                Who, What, When, Where, Why, How. The team works each spoke
                until the idea has been examined from every angle. It&apos;s
                the fastest way to pressure-test a proposal before committing
                to it.
              </p>
            </div>
            <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7, maxWidth: '38rem' }}>
              Use it before a launch, before a hire, before any decision big
              enough that you&apos;d regret missing a question. The structure
              guarantees the obvious blind spot doesn&apos;t get skipped.
            </p>
          </PageContainer>
        </section>

        {/* ── EVERY SESSION ENDS WITH A PDF ────────────────────────── */}
        <section style={{ background: P.surface, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                The outcome
              </p>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}
              >
                Every session ends with a written decision
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate }}>
                When you finish a session, IdeaFlow generates a clean PDF
                summary — the central question, the top-voted perspectives,
                the agreed next step. Drop it in a Notion page, attach it to
                a ticket, send it to the team that wasn&apos;t in the room.
                The output is the artifact, not the canvas itself.
              </p>
            </div>
            <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7, maxWidth: '38rem' }}>
              See it for yourself — the{' '}
              <Link
                href="/demo"
                style={{ color: P.ink, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
              >
                live demo
              </Link>{' '}
              walks through a Brainstorm Circle without sign-up, or read the
              full{' '}
              <Link
                href="/features"
                style={{ color: P.ink, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
              >
                features page
              </Link>{' '}
              for the rest of the product.
            </p>
          </PageContainer>
        </section>

        {/* ── COMPARISON ────────────────────────────────────────────── */}
        <section style={{ background: P.bg, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                When to use what
              </p>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                }}
              >
                How IdeaFlow fits next to the tools you already have
              </h2>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', maxWidth: '60rem' }}>
              {[
                {
                  q: 'Miro / FigJam',
                  a: 'Use Miro when you want an open canvas for visual mapping, system diagrams, or user journey work. Use IdeaFlow when you want a brainstorm that ends with a written decision instead of a screenshot.',
                },
                {
                  q: 'Notion',
                  a: 'Notion holds the long-form artefact — specs, retros, decision docs. IdeaFlow runs the conversation that produces them. The PDF export drops cleanly into a Notion page when the session is done.',
                },
                {
                  q: 'Slack',
                  a: 'Slack is where ideas surface in the moment. IdeaFlow is where they get captured, voted on, and turned into structured sessions so they don’t scroll off into the threads nobody finds again.',
                },
                {
                  q: 'A whiteboard',
                  a: 'A whiteboard works perfectly for an in-person brainstorm — until you need to share the result with people who weren’t in the room. IdeaFlow gives you the same structure, plus the PDF.',
                },
              ].map(({ q, a }) => (
                <div
                  key={q}
                  style={{
                    borderRadius: '0.9rem',
                    border: `1px solid ${P.border}`,
                    background: P.surface,
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

        {/* ── PRICING TEASER + CTA ───────────────────────────────────── */}
        <section style={{ background: P.raised, padding: 'clamp(4rem,8vw,5.5rem) 0' }}>
          <PageContainer>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ maxWidth: '32rem' }}>
                <h2
                  style={{
                    fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                    fontSize: 'clamp(1.5rem, 2.6vw, 2rem)',
                    letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.2,
                    marginBottom: '0.5rem',
                  }}
                >
                  Brainstorm Sessions are on the Pro plan.
                </h2>
                <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.6 }}>
                  €99/year, whole team included, no per-seat pricing. See{' '}
                  <Link
                    href="/#pricing"
                    style={{ color: P.ink, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                  >
                    full pricing
                  </Link>
                  . Start free first if you just want to try the idea
                  voting side of the product.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <Link
                  href={ctaHref}
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: P.dark, color: '#fff',
                    fontSize: '0.9rem', fontWeight: 700,
                    padding: '0.7rem 1.2rem', borderRadius: '0.625rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 18px rgba(13,22,42,0.18)',
                  }}
                >
                  {ctaLabel}
                </Link>
                <Link
                  href="/demo"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: P.surface, border: `1px solid ${P.border}`,
                    color: P.ink, fontSize: '0.9rem', fontWeight: 600,
                    padding: '0.7rem 1.1rem', borderRadius: '0.625rem',
                    textDecoration: 'none',
                  }}
                >
                  Try the demo
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>
    </>
  )
}
