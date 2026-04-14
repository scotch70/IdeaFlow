import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/PageContainer'

export const metadata = {
  title: 'Features — IdeaFlow',
  description:
    'Everything your team needs to capture ideas, build accountability, and show real outcomes. Explore all IdeaFlow features.',
}

// ── Shared primitives ──────────────────────────────────────────────────────

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em',
      textTransform: 'uppercase', color: '#f97316', marginBottom: '0.875rem',
    }}>
      {children}
    </p>
  )
}

function SectionH2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
      fontSize: 'clamp(1.625rem, 3vw, 2.25rem)', letterSpacing: '-0.02em',
      color: '#0d1f35', lineHeight: 1.2, marginBottom: '1rem',
      ...style,
    }}>
      {children}
    </h2>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#7a9ab8', marginBottom: '1.75rem' }}>
      {children}
    </p>
  )
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.875rem', color: '#2c4a6e', fontWeight: 500, lineHeight: 1.55 }}>
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '0.2rem', color: '#f97316' }}>
        <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </div>
  )
}

function FeatureCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(26,107,191,0.09)',
      borderRadius: '1.25rem',
      padding: '1.75rem',
      boxShadow: '0 2px 16px rgba(6,14,38,0.06)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Status badge component ─────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  open:         { bg: 'rgba(26,107,191,0.08)',   color: '#1a6bbf', label: 'Open' },
  under_review: { bg: 'rgba(245,158,11,0.10)',   color: '#b45309', label: 'Under review' },
  planned:      { bg: 'rgba(139,92,246,0.09)',   color: '#6d28d9', label: 'Planned' },
  in_progress:  { bg: 'rgba(249,115,22,0.10)',   color: '#c2410c', label: 'In progress' },
  implemented:  { bg: 'rgba(16,185,129,0.09)',   color: '#065f46', label: 'Implemented' },
  declined:     { bg: 'rgba(239,68,68,0.08)',    color: '#991b1b', label: 'Declined' },
}

function StatusChip({ status }: { status: string }) {
  const s = STATUS_STYLES[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: '0.72rem', fontWeight: 700,
      padding: '0.25rem 0.7rem', borderRadius: '999px',
      background: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default async function FeaturesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8f9fb', minHeight: '100vh' }}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: 'clamp(4rem,8vw,6.5rem) 0 clamp(3.5rem,7vw,6rem)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle background glow */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 60% 50% at 50% -10%, rgba(249,115,22,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 85% 80%, rgba(26,107,191,0.04) 0%, transparent 60%)
          `,
        }} />

        <PageContainer style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Overline>What&apos;s included</Overline>

          <h1 style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            letterSpacing: '-0.025em', color: '#0d1f35',
            lineHeight: 1.1, marginBottom: '1.25rem',
            maxWidth: '36rem', margin: '0 auto 1.25rem',
          }}>
            Built for the full lifecycle of an idea
          </h1>

          <p style={{
            fontSize: '1.05rem', lineHeight: 1.75, color: '#7a9ab8',
            maxWidth: '30rem', margin: '0 auto 2.25rem',
          }}>
            From first suggestion to proven outcome — IdeaFlow gives every team member a voice and every leader the context to act.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                Open dashboard →
              </Link>
            ) : (
              <Link href="/auth" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                Start for free →
              </Link>
            )}
            <Link href="/contact" style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: '0.9rem', fontWeight: 600, color: '#5a7fa8',
              textDecoration: 'none', padding: '0.6rem 1.25rem',
              border: '1px solid rgba(26,107,191,0.18)', borderRadius: '0.625rem',
            }}>
              Talk to us
            </Link>
          </div>
        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          OVERVIEW GRID — 6 tiles
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ padding: 'clamp(4rem,7vw,6rem) 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <PageContainer>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(272px, 1fr))',
            gap: '1px',
            background: 'rgba(0,0,0,0.07)',
            borderRadius: '1.25rem',
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.07)',
          }}>
            {[
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
                title: 'Idea capture',
                body: 'Anyone can submit in seconds. Titles, context, and structured fields keep ideas actionable.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
                title: 'Democratic voting',
                body: 'Team members vote on the ideas they back. Priority sorts itself — no committees needed.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                title: 'Status tracking',
                body: 'Six clear statuses move every idea from open to outcome. Nothing falls through the cracks.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                title: 'Manager accountability',
                body: 'Admins get a review inbox that flags stale ideas. No one can ignore a backlog quietly.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
                title: 'Outcomes & impact',
                body: 'Implemented ideas log real outcomes — revenue, efficiency, culture. Proof that ideas matter.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                title: 'Email notifications',
                body: 'Authors are notified when their idea moves forward. Keeps contributors engaged and informed.',
              },
            ].map((f, i) => (
              <div key={i} className="feature-cell" style={{
                padding: '1.875rem 2rem',
                background: '#ffffff',
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
              }}>
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
                  background: 'rgba(249,115,22,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f97316', marginBottom: '0.5rem', flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0d1f35', letterSpacing: '-0.01em' }}>{f.title}</p>
                <p style={{ fontSize: '0.855rem', lineHeight: 1.7, color: '#7a9ab8' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. IDEA CAPTURE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(4rem,7vw,6rem) 0' }}>
        <PageContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'center' }}>

          {/* Copy */}
          <div>
            <Overline>Idea capture</Overline>
            <SectionH2>Zero friction from thought to post</SectionH2>
            <Body>
              Anyone on the team — regardless of seniority or department — can share an idea in seconds. No forms to fill out, no approval to request, no separate tool to log into.
            </Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Check>Title + optional description keeps ideas clear and actionable</Check>
              <Check>Admins can customise the submission prompt per workspace</Check>
              <Check>Ideas are immediately visible to the entire team</Check>
              <Check>No character-count anxiety — short ideas are just as valid</Check>
            </div>
          </div>

          {/* Visual: idea input card mockup */}
          <FeatureCard>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.3rem' }}>
              Share your idea
            </p>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1f35', marginBottom: '1rem' }}>
              What should your team improve?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div style={{ borderRadius: '0.75rem', border: '1.5px solid rgba(26,107,191,0.15)', padding: '0.65rem 0.9rem', fontSize: '0.825rem', color: '#0d1f35', background: '#fff' }}>
                Better async standups — written updates instead of daily calls
              </div>
              <div style={{ borderRadius: '0.75rem', border: '1.5px dashed rgba(26,107,191,0.12)', padding: '0.65rem 0.9rem', fontSize: '0.825rem', color: '#9ab0c8', background: '#fafbfd' }}>
                Add more detail… (optional)
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1.1rem', borderRadius: '0.5rem', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>
                  Post idea
                </span>
              </div>
            </div>
          </FeatureCard>

        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          2. VOTING & COMMENTS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#f8f9fb', borderTop: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(4rem,7vw,6rem) 0' }}>
        <PageContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'center' }}>

          {/* Visual: vote list mockup — LEFT on wide screens */}
          <FeatureCard style={{ order: 0 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '1rem' }}>
              Top ideas this week
            </p>
            {[
              { title: 'Better async standups', likes: 14, mine: true },
              { title: '4-day week pilot in Q3', likes: 11, mine: false },
              { title: 'Internal mentorship pairs', likes: 8, mine: false },
              { title: 'Fix the onboarding docs', likes: 5, mine: false },
            ].map((idea, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderBottom: i < 3 ? '1px solid rgba(26,107,191,0.07)' : 'none',
                gap: '0.75rem',
              }}>
                <span style={{ fontSize: '0.825rem', color: '#0d1f35', fontWeight: 500, flex: 1, minWidth: 0 }}>
                  {idea.title}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  fontSize: '0.75rem', fontWeight: 700,
                  color: idea.mine ? '#f97316' : '#9ab0c8',
                  background: idea.mine ? 'rgba(249,115,22,0.08)' : 'rgba(0,0,0,0.04)',
                  padding: '0.2rem 0.55rem', borderRadius: '999px', flexShrink: 0,
                }}>
                  ↑ {idea.likes}
                </span>
              </div>
            ))}
          </FeatureCard>

          {/* Copy — RIGHT on wide screens */}
          <div>
            <Overline>Voting &amp; discussion</Overline>
            <SectionH2>The best ideas rise automatically</SectionH2>
            <Body>
              Every team member can vote for the ideas they genuinely support. The ranking updates in real time — no manual sorting, no subjective shortlisting, no politics.
            </Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Check>One-click voting — upvote ideas you want to see happen</Check>
              <Check>Live ranked list puts the most-supported ideas first</Check>
              <Check>Comments let teammates add context and build on each other</Check>
              <Check>Vote counts are visible to everyone — fully transparent</Check>
            </div>
          </div>

        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          3. STATUS TRACKING
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(4rem,7vw,6rem) 0' }}>
        <PageContainer>

          {/* Header — centred */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <Overline>Status tracking</Overline>
            <SectionH2 style={{ margin: '0 auto 1rem', maxWidth: '30rem' }}>
              Every idea has a place to go next
            </SectionH2>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: '#7a9ab8', maxWidth: '28rem', margin: '0 auto' }}>
              Six clear statuses move an idea from submission to outcome. Authors are notified at every step — nothing disappears into a black hole.
            </p>
          </div>

          {/* Status chips — visual flow */}
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            gap: '0.625rem', justifyContent: 'center',
            marginBottom: '3rem',
          }}>
            {Object.keys(STATUS_STYLES).map((s) => (
              <StatusChip key={s} status={s} />
            ))}
          </div>

          {/* Three feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              {
                title: 'Status notes',
                body: 'Admins add a context note whenever a status changes — so the author knows why, not just what.',
              },
              {
                title: 'Author notifications',
                body: 'Every status change triggers an email to the idea author. They never have to chase for an update.',
              },
              {
                title: 'Full history',
                body: 'The idea card always shows the current status and latest note — a clear, permanent record of progress.',
              },
            ].map((c) => (
              <FeatureCard key={c.title}>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.5rem' }}>{c.title}</p>
                <p style={{ fontSize: '0.845rem', lineHeight: 1.7, color: '#7a9ab8' }}>{c.body}</p>
              </FeatureCard>
            ))}
          </div>

        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          4. MANAGER ACCOUNTABILITY
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#f8f9fb', borderTop: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(4rem,7vw,6rem) 0' }}>
        <PageContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'center' }}>

          {/* Copy */}
          <div>
            <Overline>Manager accountability</Overline>
            <SectionH2>No idea quietly ignored</SectionH2>
            <Body>
              IdeaFlow gives managers a dedicated review inbox — not just a filtered list, but a focused queue that surfaces ideas that need attention before the team notices they&apos;ve been forgotten.
            </Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Check>Stale idea alerts flag open or under-review ideas older than 7 days</Check>
              <Check>Manager queue shows total active ideas with a clear &ldquo;needs attention&rdquo; count</Check>
              <Check>One-click status update directly from the review inbox</Check>
              <Check>Separate <em>/dashboard/review</em> page for focused triage sessions</Check>
            </div>
          </div>

          {/* Visual: manager queue card mockup */}
          <FeatureCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8' }}>
                Review inbox
              </p>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b91c1c', background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: '999px', padding: '0.2rem 0.6rem' }}>
                3 need attention
              </span>
            </div>
            {[
              { title: '4-day week pilot in Q3', days: 9, status: 'open' },
              { title: 'Fix the onboarding docs', days: 12, status: 'under_review' },
              { title: 'Internal mentorship pairs', days: 8, status: 'open' },
            ].map((idea, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.625rem 0.75rem', borderRadius: '0.625rem', marginBottom: '0.375rem',
                background: '#fffbf5',
                border: '1px solid rgba(245,158,11,0.18)',
                borderLeft: '3px solid #f59e0b',
                gap: '0.75rem',
              }}>
                <span style={{ fontSize: '0.8rem', color: '#0d1f35', fontWeight: 500, flex: 1, minWidth: 0 }}>
                  {idea.title}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#d97706', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {idea.days}d — no update
                </span>
              </div>
            ))}
          </FeatureCard>

        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          5. OUTCOMES & IMPACT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(4rem,7vw,6rem) 0' }}>
        <PageContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'center' }}>

          {/* Visual */}
          <FeatureCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1rem' }}>🎯</span>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8' }}>
                Implemented ideas
              </p>
            </div>
            {[
              { title: 'Better async standups', type: 'productivity', summary: 'Reduced daily meeting load by 40 min per person. Engineers report more focus time.' },
              { title: 'Internal mentorship pairs', type: 'culture', summary: '18 pairs matched in Q2. Retention in the mentee group improved measurably.' },
            ].map((idea, i) => (
              <div key={i} style={{
                padding: '0.875rem',
                borderRadius: '0.75rem',
                background: 'rgba(16,185,129,0.04)',
                border: '1px solid rgba(16,185,129,0.14)',
                borderLeft: '3px solid #10b981',
                marginBottom: i === 0 ? '0.625rem' : 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d1f35', flex: 1 }}>{idea.title}</p>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#065f46', background: 'rgba(16,185,129,0.09)', padding: '0.15rem 0.45rem', borderRadius: '999px', textTransform: 'capitalize', flexShrink: 0 }}>
                    {idea.type}
                  </span>
                </div>
                <p style={{ fontSize: '0.775rem', color: '#5a7fa8', lineHeight: 1.55 }}>{idea.summary}</p>
              </div>
            ))}
          </FeatureCard>

          {/* Copy */}
          <div>
            <Overline>Outcomes &amp; impact</Overline>
            <SectionH2>Show what the team actually built</SectionH2>
            <Body>
              When an idea gets implemented, it shouldn&apos;t disappear. IdeaFlow surfaces completed ideas with their real-world outcomes — turning your idea feed into a living record of what the team has achieved.
            </Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Check>Implemented ideas shown in a dedicated &ldquo;Recently implemented&rdquo; section</Check>
              <Check>Impact summary field captures what actually changed</Check>
              <Check>Impact type tags: revenue, cost saving, productivity, culture</Check>
              <Check>Optional link to evidence — doc, PR, dashboard, or announcement</Check>
            </div>
          </div>

        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          6. ADMIN TOOLS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#f8f9fb', borderTop: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(4rem,7vw,6rem) 0' }}>
        <PageContainer>

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Overline>Admin tools</Overline>
            <SectionH2 style={{ margin: '0 auto 1rem', maxWidth: '28rem' }}>
              Full control, zero overhead
            </SectionH2>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: '#7a9ab8', maxWidth: '26rem', margin: '0 auto' }}>
              Admins get the tools they need to run a healthy workspace without it becoming a second job.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                title: 'Invite management',
                body: 'Generate personal invite links per teammate. Set their role before they join. Revoke access any time.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                title: 'Role-based access',
                body: 'Two clean roles: Admin and Member. Admins manage the workspace. Members focus on ideas.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
                title: 'Custom idea prompt',
                body: 'Personalise the "Share your idea" heading per workspace. Make the product feel like yours.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
                title: 'Built-in analytics',
                body: 'Idea volume, active members, top contributors, weekly trends — always visible, never requested.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                title: 'Team member list',
                body: 'See who\'s in the workspace, what role they have, and when they joined — from the sidebar.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                title: 'Workspace isolation',
                body: 'Each company gets a fully isolated workspace. No data bleeds between tenants, ever.',
              },
            ].map((f) => (
              <FeatureCard key={f.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{
                  width: '2rem', height: '2rem', borderRadius: '0.5rem',
                  background: 'rgba(249,115,22,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f97316', marginBottom: '0.25rem',
                }}>
                  {f.icon}
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0d1f35', letterSpacing: '-0.01em' }}>{f.title}</p>
                <p style={{ fontSize: '0.845rem', lineHeight: 1.7, color: '#7a9ab8' }}>{f.body}</p>
              </FeatureCard>
            ))}
          </div>

        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          7. EMAIL NOTIFICATIONS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(4rem,7vw,6rem) 0' }}>
        <PageContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'center' }}>

          {/* Copy */}
          <div>
            <Overline>Email notifications</Overline>
            <SectionH2>Everyone knows where their idea stands</SectionH2>
            <Body>
              Contributors don&apos;t have to log in and check — IdeaFlow sends a clear, well-formatted email whenever their idea moves forward. Staying informed requires no effort.
            </Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Check>Triggered automatically on every status change</Check>
              <Check>Includes the new status and the admin&apos;s context note</Check>
              <Check>Sent to the idea author directly — no noisy group emails</Check>
              <Check>Keeps contributors engaged without creating distractions</Check>
            </div>
          </div>

          {/* Visual: email card mockup */}
          <FeatureCard style={{ padding: '0', overflow: 'hidden' }}>
            {/* Email "chrome" header */}
            <div style={{ background: '#f7f8fa', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>IF</span>
              </div>
              <div>
                <p style={{ fontSize: '0.775rem', fontWeight: 700, color: '#0d1f35' }}>IdeaFlow</p>
                <p style={{ fontSize: '0.7rem', color: '#9ab0c8' }}>Update on your idea</p>
              </div>
            </div>
            {/* Email body */}
            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.5rem' }}>
                Your idea is now <StatusChip status="planned" />
              </p>
              <p style={{ fontSize: '0.775rem', color: '#5a7fa8', lineHeight: 1.65, marginBottom: '0.875rem' }}>
                &ldquo;Better async standups&rdquo; has been moved to Planned. We&apos;re scoping a trial for Q3 — we&apos;ll update you as it progresses.
              </p>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.45rem 1rem', borderRadius: '0.45rem', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                View your idea →
              </span>
            </div>
          </FeatureCard>

        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CTA
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="cta-dark" style={{ padding: 'clamp(5rem,10vw,8rem) 0' }}>
        <PageContainer style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: 'rgba(249,115,22,0.85)',
            marginBottom: '1.25rem',
          }}>
            Get started today
          </p>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1.1, letterSpacing: '-0.025em',
            color: 'rgba(255,255,255,0.96)',
            marginBottom: '1.25rem', maxWidth: '28rem', margin: '0 auto 1.25rem',
          }}>
            Ready to give every idea a fair chance?
          </h2>
          <p style={{
            fontSize: '1rem', lineHeight: 1.75,
            color: 'rgba(168,216,240,0.68)',
            marginBottom: '2.75rem',
            maxWidth: '24rem', margin: '0 auto 2.75rem',
          }}>
            Set up your workspace in minutes. Free to start, no credit card required.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link href="/dashboard" className="btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem', textDecoration: 'none' }}>
                Open dashboard →
              </Link>
            ) : (
              <Link href="/auth" className="btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem', textDecoration: 'none' }}>
                Get started free →
              </Link>
            )}
            <Link href="/contact" className="btn-ghost" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem', textDecoration: 'none' }}>
              Talk to us
            </Link>
          </div>
        </PageContainer>
      </section>

    </main>
  )
}
