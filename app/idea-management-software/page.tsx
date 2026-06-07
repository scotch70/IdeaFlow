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
}

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
                Idea management software
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
                Idea management software your team will actually use
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
                Most idea management software gets opened once, then quietly
                abandoned. IdeaFlow is built around the only two things that
                keep a team using a tool every week — posting that feels as
                fast as Slack, and a ranking that surfaces the best ideas
                without another meeting.
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
                  Watch the demo
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── COLLECT ────────────────────────────────────────────────── */}
        <section style={{ background: P.bg, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Step 1
              </p>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}
              >
                Collect every idea — in seconds, not forms
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate }}>
                A team idea management tool only works if posting feels easier
                than typing in Slack. IdeaFlow strips the form down to a title
                and a sentence. Anyone on the team can drop an idea in under
                ten seconds, from desktop or phone. No tags, no required
                category, no spreadsheet attached to the bottom of the message
                that never gets read.
              </p>
            </div>
            <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7, maxWidth: '38rem' }}>
              Ideas land in a single live feed everyone in the workspace can
              see. Status badges track what&apos;s been considered, what&apos;s
              in progress, and what shipped — so the team learns that posting
              actually leads somewhere. That single loop is the difference
              between an idea board that fills up in week one and one that&apos;s
              still in use six months later.
            </p>
          </PageContainer>
        </section>

        {/* ── RANK ────────────────────────────────────────────────────── */}
        <section style={{ background: P.surface, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Step 2
              </p>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}
              >
                Rank by vote, not by volume
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate }}>
                Most idea management software just sorts by date, which means
                the loudest voice in the room dominates whatever conversation
                follows. IdeaFlow ranks by vote in real time. Quiet
                contributors get heard. Managers see what the team actually
                thinks, not what the three most confident people happen to
                repeat in standup.
              </p>
            </div>
            <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7, maxWidth: '38rem' }}>
              You can run separate IdeaFlows per topic — one for engineering,
              one for HR, one for the next quarter&apos;s roadmap. Each
              maintains its own ranking, so a great HR idea doesn&apos;t get
              buried under a deluge of feature requests, and an engineering
              decision doesn&apos;t accidentally pull in feedback from the
              marketing team about something else entirely.
            </p>
          </PageContainer>
        </section>

        {/* ── DECIDE ──────────────────────────────────────────────────── */}
        <section style={{ background: P.bg, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Step 3
              </p>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                  marginBottom: '0.85rem',
                }}
              >
                Turn the top-ranked ideas into written decisions
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: P.slate }}>
                Once an idea hits the top of the ranking, open a Brainstorm
                Session on it. Brainstorm Circle gathers perspectives from
                every team member around one central question. Starbursting
                interrogates the idea from six angles — who, what, when,
                where, why, how. Every session ends with a PDF summary, so the
                decision lives outside someone&apos;s notebook and the next
                conversation doesn&apos;t start from scratch.
              </p>
            </div>
            <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.7, maxWidth: '38rem' }}>
              The full feature list — flows, voting, sessions, analytics — is
              on the{' '}
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
          </PageContainer>
        </section>

        {/* ── COMMON QUESTIONS ──────────────────────────────────────── */}
        <section style={{ background: P.surface, padding: 'clamp(4rem,8vw,6rem) 0', borderBottom: `1px solid ${P.border}` }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Common questions
              </p>
              <h2
                style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                  letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
                }}
              >
                What teams ask before they switch
              </h2>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', maxWidth: '60rem' }}>
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
                  Free up to 10 people. €49/year up to 50.
                </h2>
                <p style={{ fontSize: '0.95rem', color: P.slate, lineHeight: 1.6 }}>
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
