import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/PageContainer'
import SiteHeader from '@/components/SiteHeader'

export const metadata = {
  title: 'Features — IdeaFlow',
  description:
    'Explore every IdeaFlow feature: idea capture, voting, status tracking, manager accountability, and team analytics.',
}

// ── Tiny shared primitives ────────────────────────────────────────────────────

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: '#9a9a9a', marginBottom: '0.625rem',
    }}>
      {children}
    </p>
  )
}

const DIVIDER = { borderTop: '1px solid rgba(0,0,0,0.06)' } as const

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function FeaturesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
    <SiteHeader />
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9f9f8', minHeight: '100vh' }}>

      {/* ── HEADER + FEATURE GRID ────────────────────────────────────────────── */}
      <section style={{ background: '#f9f9f8', padding: 'clamp(5rem,9vw,7rem) 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <PageContainer>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3.5rem' }}>
            <div>
              <Overline>Features</Overline>
              <h1 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.875rem, 3.2vw, 2.625rem)',
                letterSpacing: '-0.02em', color: '#111111',
                lineHeight: 1.15, maxWidth: '28rem',
              }}>
                Everything your team needs to make ideas count
              </h1>
            </div>
            {user ? (
              <Link href="/dashboard" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#111111', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Open dashboard →
              </Link>
            ) : (
              <Link href="/auth?mode=signup" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#111111', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Start free →
              </Link>
            )}
          </div>

          {/* Feature card grid */}
          <div style={{
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
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
                title: 'Idea capture',
                body: 'Anyone on the team can post an idea in seconds — no forms, no friction, no separate tool.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
                title: 'Democratic voting',
                body: 'Colleagues vote for the ideas they genuinely support. The most popular surface automatically.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                title: 'Status tracking',
                body: 'Ideas move from Open to Planned when a manager commits. Nothing falls through the cracks.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                title: 'Manager accountability',
                body: 'A review inbox flags stale ideas and keeps admins honest. No idea quietly ignored.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
                title: 'Rounds & focus',
                body: 'Time-boxed IdeaFlow rounds keep feedback fresh. Open when ready, close when you have what you need.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
                title: 'Live priority ranking',
                body: 'Ideas sort themselves by votes. Leadership always sees what the team cares about most.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                title: 'Email notifications',
                body: 'Authors are notified automatically when their idea moves forward. No log-in required to stay informed.',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
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
                  width: '2rem', height: '2rem', borderRadius: '0.5rem',
                  background: 'rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#3d3d3d', marginBottom: '0.5rem',
                }}>
                  {f.icon}
                </div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111111', letterSpacing: '-0.01em' }}>{f.title}</p>
                <p style={{ fontSize: '0.855rem', lineHeight: 1.7, color: '#6b6b6b' }}>{f.body}</p>
              </div>
            ))}
          </div>

        </PageContainer>
      </section>


      {/* ── ANALYTICS SHOWCASE ──────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', padding: 'clamp(3rem,6vw,5rem) 0', ...DIVIDER }}>
        <PageContainer>

          {/* Section header */}
          <div style={{ maxWidth: '36rem', marginBottom: '2.75rem' }}>
            <Overline>Analytics</Overline>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
              fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
              letterSpacing: '-0.02em', color: '#111111', lineHeight: 1.2,
              marginBottom: '0.75rem',
            }}>
              See what your team cares about
            </h2>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: '#6b6b6b' }}>
              Track idea volume, top contributors, most-supported ideas, and weekly activity — without any extra reporting work.
            </p>
          </div>

          {/* Dashboard mockup */}
          <div style={{
            background: '#f9f9f8',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '1.5rem',
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.05)',
          }}>

            {/* Stat cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.75rem',
              marginBottom: '0.875rem',
            }}>
              {[
                {
                  value: '24', label: 'Total ideas',
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><path d="M9 21h6"/></svg>,
                },
                {
                  value: '87', label: 'Total likes', sub: '3.6 avg per idea',
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
                },
                {
                  value: '8', label: 'Ideas this week', sub: '8 ideas posted',
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                },
                {
                  value: '6', label: 'Active members', sub: '6 members posted',
                  icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                },
              ].map(card => (
                <div key={card.label} style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.07)',
                  borderRadius: '0.875rem',
                  padding: '1rem 1.125rem',
                  display: 'flex', flexDirection: 'column', gap: '0.5rem',
                }}>
                  <div style={{
                    width: '1.75rem', height: '1.75rem', borderRadius: '0.4rem',
                    background: 'rgba(0,0,0,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#3d3d3d',
                  }}>
                    {card.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '1.375rem', fontWeight: 800, color: '#111111', lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                      {card.value}
                    </p>
                    <p style={{ fontSize: '0.725rem', fontWeight: 500, color: '#6b6b6b', marginTop: '0.2rem' }}>
                      {card.label}
                    </p>
                    {card.sub && (
                      <p style={{ fontSize: '0.65rem', color: '#a8a8a8', marginTop: '0.1rem' }}>{card.sub}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.75rem',
            }}>

              {/* Weekly activity bar chart */}
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '0.875rem',
                padding: '1.125rem 1.25rem',
              }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111111', marginBottom: '0.15rem' }}>
                  Weekly activity
                </p>
                <p style={{ fontSize: '0.7rem', color: '#a8a8a8', marginBottom: '1.25rem' }}>
                  Ideas posted in the last 7 days
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.375rem', height: '4.5rem' }}>
                  {[
                    { label: 'Mo', h: 20, today: false },
                    { label: 'Tu', h: 55, today: false },
                    { label: 'We', h: 35, today: false },
                    { label: 'Th', h: 75, today: false },
                    { label: 'Fr', h: 60, today: false },
                    { label: 'Sa', h: 15, today: false },
                    { label: 'Su', h: 90, today: true  },
                  ].map((bar, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{
                        width: '100%',
                        height: bar.h === 0 ? '3px' : `${bar.h}%`,
                        background: bar.today ? '#111111' : 'rgba(0,0,0,0.15)',
                        borderRadius: '3px 3px 0 0',
                      }} />
                      <span style={{ fontSize: '0.58rem', fontWeight: bar.today ? 700 : 400, color: bar.today ? '#111111' : '#a8a8a8', lineHeight: 1 }}>
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top contributors */}
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '0.875rem',
                padding: '1.125rem 1.25rem',
              }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111111', marginBottom: '0.15rem' }}>
                  Most active members
                </p>
                <p style={{ fontSize: '0.7rem', color: '#a8a8a8', marginBottom: '1.25rem' }}>
                  Ranked by ideas submitted
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {[
                    { name: 'Alex T.',  count: 7, pct: 100 },
                    { name: 'Maria K.', count: 5, pct: 71  },
                    { name: 'James R.', count: 4, pct: 57  },
                    { name: 'Priya N.', count: 3, pct: 43  },
                  ].map((c, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.275rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 800, color: i === 0 ? '#111111' : '#d0d0d0', fontVariantNumeric: 'tabular-nums', minWidth: '1rem' }}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span style={{ fontWeight: 600, color: '#111111' }}>{c.name}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#6b6b6b', fontVariantNumeric: 'tabular-nums' }}>
                          {c.count} ideas
                        </span>
                      </div>
                      <div style={{ height: '3px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${c.pct}%`,
                          background: i === 0 ? '#111111' : i === 1 ? 'rgba(0,0,0,0.40)' : 'rgba(0,0,0,0.20)',
                          borderRadius: '999px',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top liked idea */}
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '0.875rem',
                padding: '1.125rem 1.25rem',
              }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111111', marginBottom: '0.15rem' }}>
                  Top liked idea
                </p>
                <p style={{ fontSize: '0.7rem', color: '#a8a8a8', marginBottom: '1.25rem' }}>
                  Most supported by the team
                </p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111111', lineHeight: 1.5, marginBottom: '0.875rem' }}>
                  Switch our standups to async — post a Loom before 9am
                </p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  borderRadius: '999px', padding: '0.25rem 0.625rem',
                  background: 'rgba(0,0,0,0.05)',
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#111111" stroke="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#111111', fontVariantNumeric: 'tabular-nums' }}>
                    14 likes
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Caption row */}
          <div style={{
            marginTop: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <p style={{ fontSize: '0.825rem', color: '#a8a8a8' }}>
              Built-in analytics — no setup, no integrations, always up to date.
            </p>
            {user ? (
              <Link href="/dashboard" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#111111', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Open dashboard →
              </Link>
            ) : (
              <Link href="/auth?mode=signup" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#111111', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Try it free →
              </Link>
            )}
          </div>

        </PageContainer>
      </section>


      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="cta-dark" style={{ padding: 'clamp(4rem,7vw,6rem) 0', ...DIVIDER }}>
        <PageContainer style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '32rem' }}>
            <p style={{
              fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
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
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '2rem',
            }}>
              Set up your workspace in minutes. Free to start, no credit card required.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {user ? (
                <Link href="/dashboard"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.65rem 1.5rem', borderRadius: '0.5rem',
                    fontSize: '0.9rem', fontWeight: 600,
                    background: '#ffffff', color: '#111111',
                    textDecoration: 'none', letterSpacing: '-0.005em',
                    transition: 'opacity 0.12s',
                  }}>
                  Open dashboard →
                </Link>
              ) : (
                <Link href="/auth?mode=signup"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.65rem 1.5rem', borderRadius: '0.5rem',
                    fontSize: '0.9rem', fontWeight: 600,
                    background: '#ffffff', color: '#111111',
                    textDecoration: 'none', letterSpacing: '-0.005em',
                    transition: 'opacity 0.12s',
                  }}>
                  Get started free →
                </Link>
              )}
            </div>
          </div>
        </PageContainer>
      </section>

    </main>
    </>
  )
}
