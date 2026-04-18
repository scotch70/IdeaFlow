import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/PageContainer'

export const metadata = {
  title: 'Features — IdeaFlow',
  description:
    'Explore every IdeaFlow feature: idea capture, voting, status tracking, manager accountability, outcomes, and more.',
}

// ── Tiny shared primitives — same tokens as the rest of the site ──────────

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em',
      textTransform: 'uppercase', color: '#f97316', marginBottom: '0.5rem',
    }}>
      {children}
    </p>
  )
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
      fontSize: '0.855rem', color: '#2c4a6e', lineHeight: 1.55,
    }}>
      <svg width="14" height="14" viewBox="0 0 15 15" fill="none"
        style={{ flexShrink: 0, marginTop: '0.2rem', color: '#f97316' }}>
        <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.7"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </div>
  )
}

const DIVIDER = { borderTop: '1px solid rgba(0,0,0,0.06)' } as const

// ── Page ──────────────────────────────────────────────────────────────────

export default async function FeaturesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8f9fb', minHeight: '100vh' }}>

      {/* ── HEADER + FEATURE GRID ────────────────────────────────────────── */}
      <section style={{ background: '#f8f9fb', padding: 'clamp(5rem,9vw,7rem) 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <PageContainer>

          {/* Header row: heading left, CTA right */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3.5rem' }}>
            <div>
              <Overline>Features</Overline>
              <h1 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.875rem, 3.2vw, 2.625rem)',
                letterSpacing: '-0.02em', color: '#0d1f35',
                lineHeight: 1.15, maxWidth: '28rem',
              }}>
                Everything your team needs to make ideas count
              </h1>
            </div>
            {user ? (
              <Link href="/dashboard" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#f97316', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Open dashboard →
              </Link>
            ) : (
              <Link href="/auth" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#f97316', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Start free →
              </Link>
            )}
          </div>

          {/* Feature card grid */}
          <div className="stagger-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                body: 'Anyone on the team can post an idea in seconds — no forms, no friction, no separate tool.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
                title: 'Democratic voting',
                body: 'Colleagues vote for the ideas they genuinely support. The most popular surface automatically.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                title: 'Status tracking',
                body: 'Six clear statuses move every idea from open to outcome. Nothing falls through the cracks.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                title: 'Manager accountability',
                body: 'A review inbox flags stale ideas and keeps admins honest. No idea quietly ignored.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
                title: 'Outcomes & impact',
                body: 'Implemented ideas log real results — revenue, efficiency, culture. Proof that ideas matter.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
                title: 'Live priority ranking',
                body: 'Ideas sort themselves by votes. Leadership always sees what the team cares about most.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                title: 'Email notifications',
                body: 'Authors are notified automatically when their idea moves forward. No log-in required to stay informed.',
              },
              {
                icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                title: 'Role-based access',
                body: 'Admins manage the workspace and members. Employees focus on sharing and voting. Just right.',
              },
            ].map((f, i) => (
              <div key={i} className="feature-cell" style={{
                padding: '2rem',
                background: '#ffffff',
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
              }}>
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem',
                  background: 'rgba(249,115,22,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f97316', marginBottom: '0.625rem',
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


      {/* ── DEEP SECTIONS ────────────────────────────────────────────────── */}

      {/* 1. CAPTURE & DISCUSSION */}
      <section style={{ background: '#ffffff', padding: '3rem 0', ...DIVIDER }}>
        <PageContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '3rem', alignItems: 'start' }}>

            <div>
              <Overline>Idea capture</Overline>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
                letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.25, marginBottom: '0.75rem',
              }}>
                Zero friction from thought to post
              </h2>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#7a9ab8', marginBottom: '1.25rem' }}>
                Anyone on the team can share an idea in seconds — no forms, no approval needed.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Check>Title and optional description field keeps ideas clear</Check>
                <Check>Admins can customise the submission heading per workspace</Check>
                <Check>Ideas are immediately visible to the entire team</Check>
                <Check>No length requirements — short ideas are just as valid</Check>
              </div>
            </div>

            <div>
              <Overline>Voting &amp; discussion</Overline>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
                letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.25, marginBottom: '0.75rem',
              }}>
                The best ideas rise automatically
              </h2>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#7a9ab8', marginBottom: '1.25rem' }}>
                Every team member votes for the ideas they genuinely support. The ranking updates in real time.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Check>One-click upvote — no accounts, no friction</Check>
                <Check>Live ranked list always shows the most-supported ideas first</Check>
                <Check>Comments let teammates add context and build on ideas</Check>
                <Check>Vote counts are visible to everyone — fully transparent</Check>
              </div>
            </div>

          </div>
        </PageContainer>
      </section>


      {/* 2. STATUS TRACKING */}
      <section style={{ padding: '3rem 0', ...DIVIDER }}>
        <PageContainer>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '3rem', alignItems: 'start' }}>

            <div>
              <Overline>Status tracking</Overline>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
                letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.25, marginBottom: '0.75rem',
              }}>
                Every idea has a place to go next
              </h2>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#7a9ab8', marginBottom: '1.25rem' }}>
                Six clear statuses move an idea from submission to outcome. Nothing falls through the cracks.
              </p>
              {/* Status chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Open',         bg: 'rgba(26,107,191,0.08)',  color: '#1a6bbf' },
                  { label: 'Under review', bg: 'rgba(245,158,11,0.10)',  color: '#b45309' },
                  { label: 'Planned',      bg: 'rgba(139,92,246,0.09)',  color: '#6d28d9' },
                  { label: 'In progress',  bg: 'rgba(249,115,22,0.10)',  color: '#c2410c' },
                  { label: 'Implemented',  bg: 'rgba(16,185,129,0.09)',  color: '#065f46' },
                  { label: 'Declined',     bg: 'rgba(239,68,68,0.08)',   color: '#991b1b' },
                ].map((s) => (
                  <span key={s.label} style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    padding: '0.2rem 0.65rem', borderRadius: '999px',
                    background: s.bg, color: s.color,
                  }}>
                    {s.label}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Check>Admins add a context note on every status change</Check>
                <Check>Authors notified by email at each step — no chasing</Check>
                <Check>Status and latest note always visible on the idea card</Check>
              </div>
            </div>

            <div>
              <Overline>Manager accountability</Overline>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
                letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.25, marginBottom: '0.75rem',
              }}>
                No idea quietly ignored
              </h2>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#7a9ab8', marginBottom: '1.25rem' }}>
                A dedicated review inbox surfaces ideas that need attention before the team notices they&apos;ve been forgotten.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Check>Stale alerts flag open ideas older than 7 days</Check>
                <Check>Manager queue shows a &ldquo;needs attention&rdquo; count at a glance</Check>
                <Check>One-click status update directly from the review inbox</Check>
                <Check>Dedicated <em>/review</em> page for focused triage sessions</Check>
              </div>
            </div>

          </div>
        </PageContainer>
      </section>


      {/* 3. OUTCOMES & ADMIN */}
      <section style={{ background: '#ffffff', padding: '3rem 0', ...DIVIDER }}>
        <PageContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '3rem', alignItems: 'start' }}>

            <div>
              <Overline>Outcomes &amp; impact</Overline>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
                letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.25, marginBottom: '0.75rem',
              }}>
                Show what the team actually built
              </h2>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#7a9ab8', marginBottom: '1.25rem' }}>
                Implemented ideas live on as a record of real change. Log the outcome, not just the decision.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Check>Dedicated &ldquo;Recently implemented&rdquo; section in the dashboard</Check>
                <Check>Impact summary captures what actually changed</Check>
                <Check>Impact type tags: revenue, cost saving, productivity, culture</Check>
                <Check>Optional link to evidence — doc, PR, or announcement</Check>
              </div>
            </div>

            <div>
              <Overline>Admin tools</Overline>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
                letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.25, marginBottom: '0.75rem',
              }}>
                Full control, zero overhead
              </h2>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#7a9ab8', marginBottom: '1.25rem' }}>
                Admins manage the workspace without it becoming a second job.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Check>Personal invite links per teammate — roles set before they join</Check>
                <Check>Two clean roles: Admin manages, Member contributes</Check>
                <Check>Customise the idea submission heading per workspace</Check>
                <Check>Built-in analytics: volume, contributors, weekly trends</Check>
                <Check>Workspace isolation — no data bleeds between tenants</Check>
              </div>
            </div>

          </div>
        </PageContainer>
      </section>


      {/* 4. NOTIFICATIONS */}
      <section style={{ padding: '3rem 0', ...DIVIDER }}>
        <PageContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '3rem', alignItems: 'start' }}>

            <div>
              <Overline>Email notifications</Overline>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
                letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.25, marginBottom: '0.75rem',
              }}>
                Everyone knows where their idea stands
              </h2>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#7a9ab8', marginBottom: '1.25rem' }}>
                Contributors don&apos;t need to log in and check — they&apos;re notified automatically when anything changes.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Check>Triggered automatically on every status change</Check>
                <Check>Includes new status and the admin&apos;s context note</Check>
                <Check>Sent directly to the idea author — no noisy group emails</Check>
                <Check>Keeps contributors engaged without creating inbox noise</Check>
              </div>
            </div>

            {/* Compact feature summary — replacing the oversized email mockup */}
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(26,107,191,0.10)',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 1px 8px rgba(6,14,38,0.05)',
            }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '1rem' }}>
                At a glance
              </p>
              {[
                { label: 'Statuses', value: '6 stages from open to implemented' },
                { label: 'Notifications', value: 'Automatic email on every status change' },
                { label: 'Invite model', value: 'Personal links, role assigned at invite' },
                { label: 'Analytics', value: 'Volume, contributors, trends — built in' },
                { label: 'Impact types', value: 'Revenue · Cost saving · Productivity · Culture' },
                { label: 'Workspace', value: 'Fully isolated per company' },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'baseline', gap: '1rem',
                  padding: '0.6rem 0',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(26,107,191,0.07)' : 'none',
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#5a7fa8', flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: '0.8rem', color: '#0d1f35', textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

          </div>
        </PageContainer>
      </section>


      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="cta-dark" style={{ padding: 'clamp(4rem,7vw,6rem) 0', ...DIVIDER }}>
        <PageContainer style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '32rem' }}>
            <p style={{
              fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: 'rgba(249,115,22,0.85)',
              marginBottom: '1rem',
            }}>
              Get started today
            </p>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
              fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)',
              lineHeight: 1.1, letterSpacing: '-0.025em',
              color: 'rgba(255,255,255,0.96)',
              marginBottom: '1rem',
            }}>
              Ready to give every idea a fair chance?
            </h2>
            <p style={{
              fontSize: '0.9375rem', lineHeight: 1.75,
              color: 'rgba(168,216,240,0.65)',
              marginBottom: '2rem',
            }}>
              Set up your workspace in minutes. Free to start, no credit card required.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {user ? (
                <Link href="/dashboard" className="btn-primary"
                  style={{ fontSize: '0.9rem', padding: '0.65rem 1.5rem', textDecoration: 'none' }}>
                  Open dashboard →
                </Link>
              ) : (
                <Link href="/auth" className="btn-primary"
                  style={{ fontSize: '0.9rem', padding: '0.65rem 1.5rem', textDecoration: 'none' }}>
                  Get started free →
                </Link>
              )}
              <Link href="/contact" className="btn-ghost"
                style={{ fontSize: '0.9rem', padding: '0.65rem 1.5rem', textDecoration: 'none' }}>
                Talk to us
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

    </main>
  )
}
