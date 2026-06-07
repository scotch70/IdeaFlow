import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/PageContainer'
import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Idea management software your team will actually use',
  description:
    'IdeaFlow is idea management software for teams that want every voice heard. Collect ideas, rank by vote, and run brainstorming sessions that end with a written decision. Free up to 10 members.',
}

// Warm-ivory palette — same tokens as the homepage so this landing page
// inherits the brand voice without introducing a new design system.
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
  green:   '#16a34a',
  greenBg: 'rgba(22,163,74,0.07)',
}

// ── Local mockup shell ──────────────────────────────────────────────────
// Mirrors the MockupShell pattern used inline on the homepage so the
// landing-page screenshots feel like the same product.

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

// ── Inline product mockups ──────────────────────────────────────────────

function IdeaFeedMock() {
  const items = [
    { title: 'Replace weekly all-hands with async updates', votes: 23, status: 'Planned', sColor: P.green, sBg: P.greenBg },
    { title: 'Flexible start times — 8 to 10 am window',     votes: 17, status: 'Open',    sColor: P.faint, sBg: 'transparent' },
    { title: 'Dedicated learning time — 2 hrs per week',     votes: 11, status: 'Open',    sColor: P.faint, sBg: 'transparent' },
  ]
  return (
    <MockupShell url="app.useideaflow.com/flows/q1-retro">
      <div style={{ background: P.bg, padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: P.ink }}>Q1 Retrospective</p>
            <p style={{ fontSize: '0.6rem', color: P.faint }}>Sorted by team votes</p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.22rem',
            fontSize: '0.58rem', fontWeight: 700, color: P.green,
            background: P.greenBg, border: '1px solid rgba(22,163,74,0.16)',
            borderRadius: '999px', padding: '0.18rem 0.5rem',
          }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: P.green, display: 'inline-block' }} />
            Active
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
              padding: '0.625rem 0.75rem', borderRadius: '7px',
              background: i === 0 ? 'rgba(201,139,95,0.05)' : P.surface,
              border: `1px solid ${i === 0 ? 'rgba(201,139,95,0.20)' : P.border}`,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem', minWidth: '1.5rem' }}>
                <div style={{
                  width: '1.4rem', height: '1.4rem', borderRadius: '5px',
                  background: i === 0 ? P.ink : P.raised,
                  border: `1px solid ${i === 0 ? 'transparent' : P.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M4 0.5L7.5 5.5H0.5L4 0.5Z" fill={i === 0 ? '#fff' : P.faint} />
                  </svg>
                </div>
                <span style={{ fontSize: '0.57rem', fontWeight: 700, color: i === 0 ? P.ink : P.faint }}>{it.votes}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: P.ink, lineHeight: 1.4, marginBottom: '0.2rem' }}>{it.title}</p>
                <span style={{ fontSize: '0.56rem', fontWeight: 600, color: it.sColor, background: it.sBg, borderRadius: '999px', padding: it.sBg !== 'transparent' ? '0.1rem 0.4rem' : '0' }}>{it.status}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.58rem', color: P.faint, marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: `1px solid ${P.border}` }}>
          3 of 14 ideas · 18 team members voted
        </p>
      </div>
    </MockupShell>
  )
}

function StatusFlowMock() {
  const steps = [
    { label: 'Open',        color: P.faint,  bg: 'transparent' },
    { label: 'Considered',  color: '#a16207', bg: 'rgba(202,138,4,0.07)' },
    { label: 'In progress', color: '#0369a1', bg: 'rgba(3,105,161,0.07)' },
    { label: 'Shipped',     color: P.green,  bg: P.greenBg },
  ]
  return (
    <MockupShell url="app.useideaflow.com/idea/9f3a">
      <div style={{ background: P.bg, padding: '1rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: P.ink, marginBottom: '0.85rem' }}>
          Idea status — visible to everyone
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                fontSize: '0.62rem', fontWeight: 700, color: s.color,
                background: s.bg, padding: '0.2rem 0.55rem',
                border: `1px solid ${s.bg === 'transparent' ? P.border : 'transparent'}`,
                borderRadius: '999px',
              }}>{s.label}</span>
              {i < steps.length - 1 && (
                <span style={{ color: P.faint, fontSize: '0.62rem' }}>→</span>
              )}
            </span>
          ))}
        </div>
        <p style={{ fontSize: '0.6rem', color: P.slate, marginTop: '0.9rem', lineHeight: 1.5 }}>
          Members see when their idea is read, considered, or shipped — the loop that keeps them posting next month.
        </p>
      </div>
    </MockupShell>
  )
}

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
            { k: 'Key decision', v: 'Launch with Standard at €49 first; introduce Pro after 30 paying teams.' },
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

// ── Feature card ────────────────────────────────────────────────────────

function FeatureCard({
  step, title, body, icon,
}: {
  step: string
  title: string
  body: string
  icon: React.ReactNode
}) {
  return (
    <div
      style={{
        background: P.surface,
        border: `1px solid ${P.border}`,
        borderRadius: '0.9rem',
        padding: '1.5rem 1.4rem 1.6rem',
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
        boxShadow: '0 1px 3px rgba(6,14,38,0.03)',
      }}
    >
      <div
        style={{
          width: '2.25rem', height: '2.25rem', borderRadius: '0.55rem',
          background: 'rgba(201,139,95,0.10)',
          color: P.accent,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint }}>
        {step}
      </p>
      <p style={{ fontSize: '1.05rem', fontWeight: 800, color: P.ink, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
        {title}
      </p>
      <p style={{ fontSize: '0.875rem', color: P.slate, lineHeight: 1.6 }}>{body}</p>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────

export default async function IdeaManagementSoftwarePage() {
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
                  Idea management software
                </p>
                <h1 style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(2rem, 4.5vw, 3rem)',
                  letterSpacing: '-0.025em', lineHeight: 1.1,
                  color: P.ink, marginBottom: '1.25rem',
                }}>
                  Idea management software your team will actually use
                </h1>
                <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: P.slate, marginBottom: '1.5rem', maxWidth: '32rem' }}>
                  Most idea management software gets opened once, then quietly
                  abandoned. IdeaFlow is built around the only two things that
                  keep a team using a tool every week — posting that feels as
                  fast as Slack, and a ranking that surfaces the best ideas
                  without another meeting.
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
                    Watch the demo
                  </Link>
                </div>
                <p style={{ fontSize: '0.78rem', color: P.faint }}>
                  Free up to 10 members · No credit card · Cancel anytime
                </p>
              </div>

              {/* Hero visual */}
              <div style={{ width: '100%', maxWidth: '32rem', justifySelf: 'end' }}>
                <IdeaFeedMock />
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── FEATURE CARDS ───────────────────────────────────────────── */}
        <section style={{ background: P.bg, padding: 'clamp(3.5rem,7vw,5rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                The whole loop, in one tool
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
              }}>
                Collect, rank, decide — without three different tools
              </h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <FeatureCard
                step="Step 1"
                title="Collect every idea"
                body="A title and a sentence. Anyone on the team can post in under ten seconds — desktop, phone, anywhere."
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                }
              />
              <FeatureCard
                step="Step 2"
                title="Rank by vote"
                body="Real-time vote ranking surfaces what the team actually thinks — not just what the loudest voice repeats."
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18h4V8H3zM10 18h4V4h-4zM17 18h4v-6h-4z" />
                  </svg>
                }
              />
              <FeatureCard
                step="Step 3"
                title="Turn ideas into decisions"
                body="Open a Brainstorm Session on the top idea. Finish with a PDF summary your team can share."
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                }
              />
            </div>
          </PageContainer>
        </section>

        {/* ── STEP 1 DETAIL ──────────────────────────────────────────── */}
        <section style={{ background: P.surface, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3.5rem', alignItems: 'center',
            }}>
              <div style={{ maxWidth: '34rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                  Step 1
                </p>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}>
                  Collect every idea — in seconds, not forms
                </h2>
                <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate, marginBottom: '1.1rem' }}>
                  A team idea management tool only works if posting feels
                  easier than typing in Slack. IdeaFlow strips the form down
                  to a title and a sentence. Anyone on the team can drop an
                  idea in under ten seconds, from desktop or phone. No tags,
                  no required category, no spreadsheet attached to the bottom
                  of the message that never gets read.
                </p>
                <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7 }}>
                  Ideas land in a single live feed everyone in the workspace
                  can see. Status badges track what&apos;s been considered,
                  what&apos;s in progress, and what shipped — so the team
                  learns that posting actually leads somewhere. That single
                  loop is the difference between an idea board that fills up
                  in week one and one that&apos;s still in use six months
                  later.
                </p>
              </div>
              <div style={{ width: '100%', maxWidth: '28rem', justifySelf: 'end' }}>
                <StatusFlowMock />
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── STEP 2 DETAIL ──────────────────────────────────────────── */}
        <section style={{ background: P.bg, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3.5rem', alignItems: 'center',
            }}>
              <div style={{ width: '100%', maxWidth: '28rem' }}>
                <IdeaFeedMock />
              </div>
              <div style={{ maxWidth: '34rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                  Step 2
                </p>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}>
                  Rank by vote, not by volume
                </h2>
                <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate, marginBottom: '1.1rem' }}>
                  Most idea management software just sorts by date, which
                  means the loudest voice in the room dominates whatever
                  conversation follows. IdeaFlow ranks by vote in real time.
                  Quiet contributors get heard. Managers see what the team
                  actually thinks, not what the three most confident people
                  happen to repeat in standup.
                </p>
                <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7 }}>
                  You can run separate IdeaFlows per topic — one for
                  engineering, one for HR, one for the next quarter&apos;s
                  roadmap. Each maintains its own ranking, so a great HR idea
                  doesn&apos;t get buried under a deluge of feature requests,
                  and an engineering decision doesn&apos;t accidentally pull
                  in feedback from the marketing team about something else
                  entirely.
                </p>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── STEP 3 DETAIL ──────────────────────────────────────────── */}
        <section style={{ background: P.surface, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3.5rem', alignItems: 'center',
            }}>
              <div style={{ maxWidth: '34rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                  Step 3
                </p>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}>
                  Turn the top-ranked ideas into written decisions
                </h2>
                <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate, marginBottom: '1.1rem' }}>
                  Once an idea hits the top of the ranking, open a Brainstorm
                  Session on it. Brainstorm Circle gathers perspectives from
                  every team member around one central question.
                  Starbursting interrogates the idea from six angles — who,
                  what, when, where, why, how. Every session ends with a PDF
                  summary, so the decision lives outside someone&apos;s
                  notebook and the next conversation doesn&apos;t start from
                  scratch.
                </p>
                <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7 }}>
                  The full feature list — flows, voting, sessions, analytics
                  — is on the{' '}
                  <Link
                    href="/features"
                    style={{ color: P.ink, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                  >
                    features page
                  </Link>
                  . Or jump straight to the{' '}
                  <Link
                    href="/demo"
                    style={{ color: P.ink, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                  >
                    live demo
                  </Link>{' '}
                  to see what idea management looks like inside an actual
                  workspace.
                </p>
              </div>
              <div style={{ width: '100%', maxWidth: '26rem', justifySelf: 'end' }}>
                <PdfSummaryMock />
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── COMPARISON ──────────────────────────────────────────────── */}
        <section style={{ background: P.bg, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '2.25rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Vs. the usual stack
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
              }}>
                Why teams switch from Notion, Slack, and spreadsheets
              </h2>
            </div>

            <div
              style={{
                background: P.surface,
                border: `1px solid ${P.border}`,
                borderRadius: '0.9rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 1.5fr) repeat(4, minmax(110px, 1fr))',
                  gap: 0,
                  fontSize: '0.78rem',
                  borderBottom: `1px solid ${P.border}`,
                  background: P.raised,
                }}
              >
                {['Feature', 'IdeaFlow', 'Notion', 'Slack', 'Spreadsheet'].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.85rem 0.9rem',
                      fontWeight: 800,
                      color: i === 1 ? P.accent : P.ink,
                      borderRight: i < 4 ? `1px solid ${P.border}` : 'none',
                    }}
                  >
                    {h}
                  </div>
                ))}
              </div>
              {([
                ['Ideas ranked by vote, in real time',          true,  false, false, false],
                ['Posting takes under 10 seconds',              true,  false, true,  false],
                ['Status badges everyone can see',              true,  true,  false, false],
                ['Structured brainstorming sessions',           true,  false, false, false],
                ['PDF export per session / per flow',            true,  false, false, false],
                ['Search what the team already suggested',      true,  true,  false, true],
              ] as Array<[string, boolean, boolean, boolean, boolean]>).map(([feature, a, b, c, d], rowIdx) => (
                <div
                  key={rowIdx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(180px, 1.5fr) repeat(4, minmax(110px, 1fr))',
                    gap: 0,
                    fontSize: '0.8rem',
                    borderBottom: rowIdx < 5 ? `1px solid ${P.border}` : 'none',
                  }}
                >
                  <div style={{ padding: '0.7rem 0.9rem', color: P.ink, fontWeight: 500, borderRight: `1px solid ${P.border}` }}>
                    {feature}
                  </div>
                  {[a, b, c, d].map((val, j) => (
                    <div
                      key={j}
                      style={{
                        padding: '0.7rem 0.9rem',
                        color: val ? (j === 0 ? P.green : P.slate) : P.faint,
                        borderRight: j < 3 ? `1px solid ${P.border}` : 'none',
                        fontSize: '0.85rem',
                      }}
                    >
                      {val ? '✓' : '—'}
                    </div>
                  ))}
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
                  See it inside an actual workspace.
                </p>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.4rem' }}>
                  The live demo runs without sign-up — click around the dashboard, vote on ideas, open a Brainstorm Circle.
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

        {/* ── COMMON QUESTIONS ──────────────────────────────────────── */}
        <section style={{ background: P.surface, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Common questions
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
              }}>
                What teams ask before they switch
              </h2>
            </div>

            <div
              style={{
                display: 'grid', gap: '1.25rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                maxWidth: '60rem',
              }}
            >
              {[
                {
                  q: 'How is this different from a Notion database?',
                  a: 'Notion is a writing tool — it can hold a list of ideas but won’t rank them or surface what the team actually thinks. IdeaFlow is built around voting and structured sessions, so the highest-impact ideas rise on their own without manager curation.',
                },
                {
                  q: 'Do we need everyone on the team to use it daily?',
                  a: 'No. The teams that get the most value use IdeaFlow for two cadences — a constant open feed where ideas land whenever they’re fresh, and a monthly or quarterly session where the top-ranked items get decided on. Both work without daily logins.',
                },
                {
                  q: 'What happens to ideas that don’t make the cut?',
                  a: 'They stay in the feed with a clear status — considered, parked, or shipped. Members can see that their idea was read, which is the single biggest reason teams keep contributing month after month instead of going quiet by week two.',
                },
                {
                  q: 'Is this just for product teams?',
                  a: 'No. The most active workspaces run separate IdeaFlows for engineering, product, HR, and operations side by side. The voting model works for any team where decisions affect more than one person.',
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
                  <p style={{ fontSize: '0.85rem', color: P.slate, lineHeight: 1.6 }}>{a}</p>
                </div>
              ))}
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
                Free up to 10 people. €49/year up to 50.
              </h2>
              <p style={{ fontSize: '1rem', color: P.slate, lineHeight: 1.65 }}>
                No per-seat pricing, no credit card to start. The whole team
                is included on every paid plan. See{' '}
                <Link
                  href="/#pricing"
                  style={{ color: P.ink, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                >
                  full pricing
                </Link>
                .
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
