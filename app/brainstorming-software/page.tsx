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
  canvasBg:'#0e1320',
  canvasInk:'#161c2e',
}

// ── Mockup shell — mirrors the homepage pattern ─────────────────────────

function MockupShell({
  children,
  url = 'app.useideaflow.com',
}: {
  children: React.ReactNode
  url?: string
}) {
  return (
    <div
      style={{
        borderRadius: '10px',
        overflow: 'hidden',
        background: P.surface,
        boxShadow:
          '0 0 0 1px rgba(0,0,0,0.07), 0 8px 32px rgba(31,35,48,0.09), 0 2px 6px rgba(31,35,48,0.04)',
      }}
    >
      <div
        style={{
          background: P.raised,
          borderBottom: `1px solid ${P.border}`,
          padding: '0.5rem 0.75rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
          {['#dbd7d2', '#d0ccc7', '#c5c1bc'].map((c, i) => (
            <div key={i} style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div
          style={{
            flex: 1, height: '1.1rem', borderRadius: '4px',
            background: P.surface, border: `1px solid ${P.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '0.52rem', color: P.faint, letterSpacing: '0.01em' }}>
            {url}
          </span>
        </div>
        <div style={{ width: '2rem' }} />
      </div>
      {children}
    </div>
  )
}

// ── Brainstorm Circle mini visual ───────────────────────────────────────
// A compact 3×3 grid showing the admin question in the middle and eight
// member-perspective cards around it. The same layout the real product
// renders, scaled down for the landing page.

function BrainstormCircleMock() {
  const members = [
    { idx: 8, title: 'Best next step?',           hearts: 7  },
    { idx: 1, title: 'Biggest opportunity?',      hearts: 14, hot: true },
    { idx: 2, title: 'Biggest concern?',          hearts: 9  },
    { idx: 7, title: "What's missing?",           hearts: 11, hot: true },
    null, // admin slot
    { idx: 3, title: 'What would you improve?',   hearts: 12, hot: true },
    { idx: 6, title: 'What would the team say?',  hearts: 5  },
    { idx: 5, title: 'What would customers say?', hearts: 6  },
    { idx: 4, title: 'What should we avoid?',     hearts: 8  },
  ] as Array<{ idx: number; title: string; hearts: number; hot?: boolean } | null>

  return (
    <MockupShell url="app.useideaflow.com/sessions/abc">
      <div style={{ background: P.canvasBg, padding: '0.9rem', position: 'relative' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.45rem',
          }}
        >
          {members.map((m, i) => {
            if (m === null) {
              return (
                <div
                  key={i}
                  style={{
                    background: '#fbfaf7',
                    border: '1.5px solid #f97316',
                    borderRadius: '7px',
                    padding: '0.55rem 0.55rem 0.6rem',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    minHeight: '4rem',
                  }}
                >
                  <p style={{ fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c2540a', marginBottom: '0.25rem' }}>
                    Admin topic
                  </p>
                  <p style={{ fontSize: '0.68rem', fontWeight: 800, color: P.ink, lineHeight: 1.25 }}>
                    Should we launch IdeaFlow Pro?
                  </p>
                </div>
              )
            }
            return (
              <div
                key={i}
                style={{
                  background: P.canvasInk,
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '7px',
                  padding: '0.5rem 0.55rem 0.55rem',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  minHeight: '4rem',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.46rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(203,213,225,0.7)', marginBottom: '0.2rem' }}>
                    Member {m.idx}
                  </p>
                  <p style={{ fontSize: '0.6rem', fontWeight: 600, color: '#f4f7fb', lineHeight: 1.3 }}>
                    {m.title}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.3rem' }}>
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                      fontSize: '0.55rem', fontWeight: 700,
                      color: m.hot ? '#fdba74' : 'rgba(255,255,255,0.7)',
                      background: m.hot ? 'rgba(249,115,22,0.18)' : 'rgba(255,255,255,0.05)',
                      border: m.hot ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '999px', padding: '0.1rem 0.35rem',
                    }}
                  >
                    <svg width="7" height="7" viewBox="0 0 24 24" fill={m.hot ? '#f97316' : 'none'} stroke={m.hot ? '#f97316' : 'rgba(255,255,255,0.6)'} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {m.hearts}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </MockupShell>
  )
}

// ── Starbursting mini visual ────────────────────────────────────────────
// A central question with six spokes arranged around it (Who/What/When/
// Where/Why/How). Uses an SVG so the spokes scale cleanly.

function StarburstingMock() {
  const spokes = [
    { label: 'Who?',   answer: 'Mid-size teams',  angle: -90 },
    { label: 'What?',  answer: 'Pro session tier', angle: -30 },
    { label: 'When?',  answer: 'Q3 launch',        angle: 30  },
    { label: 'Where?', answer: 'EU first',         angle: 90  },
    { label: 'Why?',   answer: 'Margin uplift',    angle: 150 },
    { label: 'How?',   answer: 'Stripe + email',   angle: 210 },
  ]
  const R_LABEL = 110
  const cx = 200, cy = 130
  return (
    <MockupShell url="app.useideaflow.com/sessions/sb-1">
      <div style={{ background: P.canvasBg, padding: '0.6rem' }}>
        <svg viewBox="0 0 400 260" style={{ width: '100%', height: 'auto', display: 'block' }}>
          {spokes.map(({ angle }, i) => {
            const rad = (angle * Math.PI) / 180
            const x = cx + Math.cos(rad) * (R_LABEL - 18)
            const y = cy + Math.sin(rad) * (R_LABEL - 18)
            return (
              <line
                key={i}
                x1={cx} y1={cy} x2={x} y2={y}
                stroke="rgba(148,163,184,0.35)" strokeWidth={1}
              />
            )
          })}
          <g>
            <rect x={cx - 70} y={cy - 22} width={140} height={44} rx={7}
              fill="#fbfaf7" stroke="#f97316" strokeWidth={1.5} />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize={11} fontWeight={800} fill={P.ink}>
              Should we launch Pro?
            </text>
          </g>
          {spokes.map(({ label, answer, angle }, i) => {
            const rad = (angle * Math.PI) / 180
            const x = cx + Math.cos(rad) * R_LABEL
            const y = cy + Math.sin(rad) * R_LABEL
            return (
              <g key={i}>
                <rect x={x - 50} y={y - 14} width={100} height={28} rx={5}
                  fill={P.canvasInk} stroke="rgba(255,255,255,0.08)" />
                <text x={x} y={y - 2} textAnchor="middle" fontSize={8.5} fontWeight={800} fill="rgba(203,213,225,0.85)">
                  {label}
                </text>
                <text x={x} y={y + 8} textAnchor="middle" fontSize={7.5} fill="rgba(244,247,251,0.7)">
                  {answer}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </MockupShell>
  )
}

// ── PDF outcome mini visual ─────────────────────────────────────────────

function PdfSummaryMock() {
  return (
    <MockupShell url="app.useideaflow.com/sessions/abc/export">
      <div style={{ background: '#fff', padding: '1rem 1rem 1.1rem' }}>
        <p style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.accent, marginBottom: '0.45rem' }}>
          Session summary · PDF
        </p>
        <p style={{ fontSize: '0.85rem', fontWeight: 800, color: P.ink, lineHeight: 1.3, marginBottom: '0.6rem' }}>
          Should we launch the IdeaFlow Pro tier?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {[
            { k: 'Top insight',  v: 'Pricing is the bottleneck, not the product.' },
            { k: 'Key decision', v: 'Launch Standard first; introduce Pro after 30 paying teams.' },
            { k: 'Next action',  v: 'Maya owns the pricing experiment by 6 Jun.' },
          ].map(({ k, v }, i) => (
            <div key={i} style={{ borderTop: `1px solid ${P.border}`, paddingTop: '0.45rem' }}>
              <p style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.18rem' }}>
                {k}
              </p>
              <p style={{ fontSize: '0.7rem', color: P.slate, lineHeight: 1.4 }}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </MockupShell>
  )
}

// ── Format card ─────────────────────────────────────────────────────────

function FormatCard({
  badge, title, body, bullets,
}: {
  badge: string
  title: string
  body: string
  bullets: string[]
}) {
  return (
    <div
      style={{
        background: P.surface,
        border: `1px solid ${P.border}`,
        borderRadius: '0.9rem',
        padding: '1.5rem 1.4rem 1.6rem',
        display: 'flex', flexDirection: 'column', gap: '0.7rem',
        boxShadow: '0 1px 3px rgba(6,14,38,0.03)',
      }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
        fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: P.accent,
        background: 'rgba(201,139,95,0.10)',
        border: `1px solid rgba(201,139,95,0.22)`,
        borderRadius: '999px', padding: '0.18rem 0.55rem',
      }}>
        {badge}
      </span>
      <p style={{ fontSize: '1.15rem', fontWeight: 800, color: P.ink, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
        {title}
      </p>
      <p style={{ fontSize: '0.9rem', color: P.slate, lineHeight: 1.65 }}>{body}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0.3rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.83rem', color: P.slate }}>
            <span style={{ color: P.accent, marginTop: '0.18rem', fontWeight: 700, fontSize: '0.7rem' }}>—</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────

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
        <section style={{ background: P.bg, padding: 'clamp(4rem,8vw,6rem) 0 clamp(3rem,6vw,4.5rem)', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '3.5rem',
                alignItems: 'center',
              }}
            >
              <div style={{ maxWidth: '34rem' }}>
                <p style={{
                  fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem',
                }}>
                  Brainstorming software
                </p>
                <h1 style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.025em', lineHeight: 1.1,
                  color: P.ink, marginBottom: '1.25rem',
                }}>
                  Brainstorming software for teams that need to make decisions
                </h1>
                <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: P.slate, marginBottom: '1.5rem', maxWidth: '32rem' }}>
                  Most brainstorming software hands you an infinite canvas
                  and wishes you luck. IdeaFlow is built around two structured
                  session formats — Brainstorm Circle and Starbursting — so
                  every brainstorm ends with a written decision instead of a
                  screenshot nobody reads.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
                  <Link href={ctaHref} style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: '2.625rem', padding: '0 1.375rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem', fontWeight: 600,
                    background: P.ink, color: '#ffffff',
                    textDecoration: 'none', letterSpacing: '-0.01em',
                  }}>
                    {ctaLabel}
                  </Link>
                  <Link href="/demo" style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: '2.625rem', padding: '0 1.1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem', fontWeight: 600,
                    background: P.surface, color: P.ink,
                    border: `1px solid ${P.border}`,
                    textDecoration: 'none',
                  }}>
                    Try the demo
                  </Link>
                </div>
                <p style={{ fontSize: '0.78rem', color: P.faint }}>
                  Brainstorm Sessions are on the Pro plan · €99/year, whole team included
                </p>
              </div>

              {/* Hero visual */}
              <div style={{ width: '100%', maxWidth: '32rem', justifySelf: 'end' }}>
                <BrainstormCircleMock />
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── TWO FORMATS — CARD ROW ──────────────────────────────────── */}
        <section style={{ background: P.bg, padding: 'clamp(3.5rem,7vw,5rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Two formats, one purpose
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
              }}>
                Pick the session, run it, decide
              </h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <FormatCard
                badge="Format 1 — Circle"
                title="One central question. Eight perspectives. Hearts to surface the favourites."
                body="Brainstorm Circle places one question in the middle and arranges eight team perspectives around it. Members heart the cards that resonate. After fifteen minutes the popular ones are obvious."
                bullets={['Best for retros, planning kickoffs, hiring debriefs', 'Equal voice for every team member', 'Hearts surface consensus without a meeting']}
              />
              <FormatCard
                badge="Format 2 — Starburst"
                title="Six question lenses — Who, What, When, Where, Why, How."
                body="Starbursting interrogates the idea from every angle. The team works each spoke until the proposal has been pressure-tested. The structure guarantees the obvious blind spot doesn't get skipped."
                bullets={['Best for launches, hires, big decisions', 'Generates questions, not just answers', 'Catches the blind spot before commit']}
              />
            </div>
          </PageContainer>
        </section>

        {/* ── INFINITE-CANVAS TRAP ────────────────────────────────────── */}
        <section style={{ background: P.surface, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '40rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Why structured
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                marginBottom: '0.85rem',
              }}>
                Infinite canvases are great for ideas, bad for decisions
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate, marginBottom: '1.1rem' }}>
                Open-canvas brainstorming software is built for the divergent
                phase — generate as many sticky notes as you can. Two hours
                later you&apos;ve got a wall of colour and nobody knows what
                was decided. IdeaFlow runs the divergent phase too, but it
                also runs the convergent one: every Brainstorm Session has a
                structure that forces the group to land somewhere.
              </p>
              <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7 }}>
                That structure is the whole point. Without it, a brainstorming
                tool is just shared whiteboard. With it, you get a repeatable
                process — open the session, pick a template, run it, finish.
                The next meeting starts from the previous decision, not from
                the previous board.
              </p>
            </div>
          </PageContainer>
        </section>

        {/* ── FORMAT 1 DETAIL — BRAINSTORM CIRCLE ─────────────────── */}
        <section style={{ background: P.bg, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3.5rem', alignItems: 'center',
            }}>
              <div style={{ maxWidth: '34rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                  Format 1
                </p>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}>
                  Brainstorm Circle: one question, eight perspectives
                </h2>
                <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate, marginBottom: '1.1rem' }}>
                  The Brainstorm Circle template places one central question
                  in the middle of the canvas and arranges eight team
                  perspectives around it. Each member writes one card and
                  hearts the others that resonate. After fifteen minutes the
                  loudest voice in the room hasn&apos;t dominated — every
                  perspective is on the canvas, and the popular ones are
                  obvious.
                </p>
                <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7 }}>
                  Use it for retros, hiring debriefs, product decisions,
                  planning kickoffs — anywhere you want everyone&apos;s view
                  in one place without the meeting going an hour over.
                </p>
              </div>
              <div style={{ width: '100%', maxWidth: '32rem', justifySelf: 'end' }}>
                <BrainstormCircleMock />
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── FORMAT 2 DETAIL — STARBURSTING ──────────────────────── */}
        <section style={{ background: P.surface, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3.5rem', alignItems: 'center',
            }}>
              <div style={{ width: '100%', maxWidth: '32rem' }}>
                <StarburstingMock />
              </div>
              <div style={{ maxWidth: '34rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                  Format 2
                </p>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}>
                  Starbursting: interrogate the idea from every angle
                </h2>
                <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate, marginBottom: '1.1rem' }}>
                  Starbursting is the inverse of free ideation. Instead of
                  generating answers, you generate questions — six spokes for
                  Who, What, When, Where, Why, How. The team works each spoke
                  until the idea has been examined from every angle. It&apos;s
                  the fastest way to pressure-test a proposal before committing
                  to it.
                </p>
                <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7 }}>
                  Use it before a launch, before a hire, before any decision
                  big enough that you&apos;d regret missing a question. The
                  structure guarantees the obvious blind spot doesn&apos;t get
                  skipped.
                </p>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── PDF OUTCOME ─────────────────────────────────────────── */}
        <section style={{ background: P.bg, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3.5rem', alignItems: 'center',
            }}>
              <div style={{ maxWidth: '34rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                  The outcome
                </p>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}>
                  Every session ends with a written decision
                </h2>
                <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate, marginBottom: '1.1rem' }}>
                  When you finish a session, IdeaFlow generates a clean PDF
                  summary — the central question, the top-voted perspectives,
                  the agreed next step. Drop it in a Notion page, attach it
                  to a ticket, send it to the team that wasn&apos;t in the
                  room. The output is the artifact, not the canvas itself.
                </p>
                <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7 }}>
                  See it for yourself — the{' '}
                  <Link
                    href="/demo"
                    style={{ color: P.ink, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                  >
                    live demo
                  </Link>{' '}
                  walks through a Brainstorm Circle without sign-up, or read
                  the full{' '}
                  <Link
                    href="/features"
                    style={{ color: P.ink, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                  >
                    features page
                  </Link>{' '}
                  for the rest of the product.
                </p>
              </div>
              <div style={{ width: '100%', maxWidth: '26rem', justifySelf: 'end' }}>
                <PdfSummaryMock />
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── COMPARISON ──────────────────────────────────────────────── */}
        <section style={{ background: P.surface, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '40rem', marginBottom: '2.25rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                When to use what
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
              }}>
                How IdeaFlow fits next to the tools you already have
              </h2>
            </div>

            <div
              style={{
                background: P.bg,
                border: `1px solid ${P.border}`,
                borderRadius: '0.9rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(170px, 1.2fr) repeat(2, minmax(110px, 1fr))',
                  fontSize: '0.78rem',
                  borderBottom: `1px solid ${P.border}`,
                  background: P.raised,
                }}
              >
                {['Tool', 'Best for', 'Use IdeaFlow when'].map((h, i) => (
                  <div key={i} style={{
                    padding: '0.85rem 0.95rem',
                    fontWeight: 800,
                    color: P.ink,
                    borderRight: i < 2 ? `1px solid ${P.border}` : 'none',
                  }}>
                    {h}
                  </div>
                ))}
              </div>
              {([
                {
                  tool: 'Miro / FigJam',
                  best: 'Visual mapping, system diagrams, user journey work',
                  when: 'You want a brainstorm that ends with a written decision, not a screenshot',
                },
                {
                  tool: 'Notion',
                  best: 'Long-form artefacts — specs, retros, decision docs',
                  when: 'You need the structured conversation that produces them (drops in as a PDF)',
                },
                {
                  tool: 'Slack',
                  best: 'Ideas surfacing in the moment',
                  when: 'You need to capture, vote, and turn them into structured sessions',
                },
                {
                  tool: 'A whiteboard',
                  best: 'In-person brainstorm, single room',
                  when: 'You need to share the result with people who weren’t in the room',
                },
              ]).map((row, rowIdx, arr) => (
                <div
                  key={rowIdx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(170px, 1.2fr) repeat(2, minmax(110px, 1fr))',
                    fontSize: '0.83rem',
                    borderBottom: rowIdx < arr.length - 1 ? `1px solid ${P.border}` : 'none',
                  }}
                >
                  <div style={{ padding: '0.85rem 0.95rem', color: P.ink, fontWeight: 700, borderRight: `1px solid ${P.border}` }}>
                    {row.tool}
                  </div>
                  <div style={{ padding: '0.85rem 0.95rem', color: P.slate, lineHeight: 1.5, borderRight: `1px solid ${P.border}` }}>
                    {row.best}
                  </div>
                  <div style={{ padding: '0.85rem 0.95rem', color: P.slate, lineHeight: 1.5 }}>
                    {row.when}
                  </div>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* ── MID-PAGE CTA STRIP ──────────────────────────────────────── */}
        <section style={{ background: P.dark, padding: 'clamp(2.5rem,5vw,3.5rem) 0' }}>
          <PageContainer>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.25rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ maxWidth: '32rem' }}>
                <p style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.25rem, 2.4vw, 1.65rem)',
                  color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.25,
                }}>
                  Run your first Brainstorm Circle in the demo.
                </p>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.4rem' }}>
                  No sign-up. See the circle layout, vote on cards, watch the session reach a decision.
                </p>
              </div>
              <Link
                href="/demo"
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: '#fff', color: P.ink,
                  fontSize: '0.9rem', fontWeight: 700,
                  padding: '0.75rem 1.25rem', borderRadius: '0.625rem',
                  textDecoration: 'none',
                }}
              >
                Try the demo →
              </Link>
            </div>
          </PageContainer>
        </section>

        {/* ── PRICING + FINAL CTA ─────────────────────────────────────── */}
        <section style={{ background: P.raised, padding: 'clamp(4.5rem,9vw,6.5rem) 0' }}>
          <PageContainer>
            <div style={{ textAlign: 'center', maxWidth: '42rem', margin: '0 auto 2.25rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.6rem' }}>
                Get started
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.875rem, 3.5vw, 2.625rem)',
                letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                marginBottom: '0.6rem',
              }}>
                Brainstorm Sessions are on the Pro plan.
              </h2>
              <p style={{ fontSize: '1rem', color: P.slate, lineHeight: 1.65 }}>
                €99/year, whole team included, no per-seat pricing. See{' '}
                <Link
                  href="/#pricing"
                  style={{ color: P.ink, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                >
                  full pricing
                </Link>
                . Start free first if you just want to try the idea voting
                side of the product.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                href={ctaHref}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: P.dark, color: '#fff',
                  fontSize: '0.95rem', fontWeight: 700,
                  padding: '0.85rem 1.5rem', borderRadius: '0.625rem',
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
                  color: P.ink, fontSize: '0.95rem', fontWeight: 600,
                  padding: '0.85rem 1.35rem', borderRadius: '0.625rem',
                  textDecoration: 'none',
                }}
              >
                Try the demo
              </Link>
            </div>
          </PageContainer>
        </section>
      </main>
    </>
  )
}
