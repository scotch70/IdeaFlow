import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/PageContainer'
import SiteHeader from '@/components/SiteHeader'
import UpgradeButton from '@/components/UpgradeButton'

// ─────────────────────────────────────────────────────────────────────────────
// Product mockups — neutral palette, no orange
// ─────────────────────────────────────────────────────────────────────────────

function MockupShell({ children, url = 'app.useideaflow.com' }: { children: React.ReactNode; url?: string }) {
  return (
    <div style={{
      borderRadius: '10px',
      overflow: 'hidden',
      background: '#ffffff',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)',
    }}>
      {/* Browser chrome */}
      <div style={{
        background: '#f4f4f2',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        padding: '0.5rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
          {(['#e0e0e0','#d4d4d4','#c8c8c8'] as const).map((c, i) => (
            <div key={i} style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{
          flex: 1, height: '1.1rem', borderRadius: '4px',
          background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '0.52rem', color: '#9a9a9a', letterSpacing: '0.01em' }}>{url}</span>
        </div>
        <div style={{ width: '2rem' }} />
      </div>
      {children}
    </div>
  )
}

function IdeaFeedMockup() {
  const ideas = [
    { title: 'Replace weekly all-hands with async video updates', likes: 23, status: 'Planned', statusColor: '#16a34a', statusBg: 'rgba(22,163,74,0.07)' },
    { title: 'Flexible start times — 8 to 10am window', likes: 17, status: 'Open', statusColor: '#6b6b6b', statusBg: 'rgba(0,0,0,0.05)' },
    { title: 'Dedicated learning time — 2 hours per week', likes: 11, status: 'Open', statusColor: '#6b6b6b', statusBg: 'rgba(0,0,0,0.05)' },
    { title: 'Better onboarding docs for new hires', likes: 8, status: 'Open', statusColor: '#6b6b6b', statusBg: 'rgba(0,0,0,0.05)' },
  ]
  return (
    <MockupShell url="app.useideaflow.com/flows/q1-retro">
      <div style={{ background: '#f9f9f8', padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111' }}>Q1 Retrospective</p>
            <p style={{ fontSize: '0.6rem', color: '#9a9a9a' }}>Sorted by team votes</p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.22rem',
            fontSize: '0.58rem', fontWeight: 700,
            color: '#15803d', background: 'rgba(22,163,74,0.08)',
            border: '1px solid rgba(22,163,74,0.16)', borderRadius: '999px', padding: '0.18rem 0.5rem',
          }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            Active
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {ideas.map((idea, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
              padding: '0.625rem 0.75rem', borderRadius: '7px',
              background: i === 0 ? '#ffffff' : '#ffffff',
              border: `1px solid ${i === 0 ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.06)'}`,
              boxShadow: i === 0 ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
            }}>
              {/* Vote button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem', minWidth: '1.5rem', paddingTop: '0.05rem' }}>
                <div style={{
                  width: '1.4rem', height: '1.4rem', borderRadius: '5px',
                  background: i === 0 ? '#111' : '#f4f4f2',
                  border: `1px solid ${i === 0 ? 'transparent' : 'rgba(0,0,0,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill={i === 0 ? '#fff' : 'none'} stroke={i === 0 ? '#fff' : '#9a9a9a'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <span style={{ fontSize: '0.57rem', fontWeight: 700, color: i === 0 ? '#111' : '#9a9a9a', fontVariantNumeric: 'tabular-nums' }}>{idea.likes}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '0.2rem' }}>{idea.title}</p>
                <span style={{ fontSize: '0.56rem', fontWeight: 600, color: idea.statusColor, background: idea.statusBg, borderRadius: '999px', padding: '0.1rem 0.45rem' }}>{idea.status}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.58rem', color: '#b0b0b0', marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          4 ideas · 18 team members voted
        </p>
      </div>
    </MockupShell>
  )
}

function ReviewQueueMockup() {
  const items = [
    { title: 'Monthly team lunch budget — self-organised by team', author: 'Priya N.', likes: 14, days: '3 days ago' },
    { title: 'Remote work policy update — flexibility for travel weeks', author: 'James R.', likes: 9, days: '5 days ago' },
    { title: 'Quarterly skip-level 1:1s with senior leadership', author: 'Alex T.', likes: 7, days: '6 days ago' },
  ]
  return (
    <MockupShell url="app.useideaflow.com/dashboard/review">
      <div style={{ background: '#f9f9f8', padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111' }}>Needs attention</p>
            <p style={{ fontSize: '0.6rem', color: '#9a9a9a' }}>Ideas waiting on a manager response</p>
          </div>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, color: '#3d3d3d',
            background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.09)',
            borderRadius: '999px', padding: '0.2rem 0.5rem',
          }}>
            {items.length} pending
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '7px', padding: '0.625rem 0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#111', lineHeight: 1.4, marginBottom: '0.2rem' }}>{item.title}</p>
                  <p style={{ fontSize: '0.58rem', color: '#9a9a9a' }}>{item.author} · {item.likes} likes · {item.days}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, marginTop: '0.1rem' }}>
                  <span style={{ fontSize: '0.56rem', fontWeight: 600, color: '#15803d', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.18)', borderRadius: '4px', padding: '0.15rem 0.4rem', cursor: 'default' }}>Plan it</span>
                  <span style={{ fontSize: '0.56rem', fontWeight: 600, color: '#9a9a9a', background: '#f4f4f2', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '4px', padding: '0.15rem 0.4rem', cursor: 'default' }}>Dismiss</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.58rem', color: '#b0b0b0', marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          Ideas marked &lsquo;Planned&rsquo; notify the author automatically.
        </p>
      </div>
    </MockupShell>
  )
}

function FlowSelectorMockup() {
  const flows = [
    { name: 'Q1 Retrospective', status: 'Active', ideas: 12, members: 'All members' },
    { name: 'Engineering Process', status: 'Active', ideas: 5, members: '4 members' },
    { name: 'Team Culture', status: 'Draft', ideas: 0, members: 'All members' },
  ]
  return (
    <MockupShell url="app.useideaflow.com/dashboard/flows">
      <div style={{ background: '#f9f9f8', padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111' }}>IdeaFlows</p>
            <p style={{ fontSize: '0.6rem', color: '#9a9a9a' }}>Your active collection rounds</p>
          </div>
          <span style={{ fontSize: '0.58rem', fontWeight: 600, color: '#3d3d3d', background: '#fff', border: '1px solid rgba(0,0,0,0.10)', borderRadius: '5px', padding: '0.2rem 0.5rem', cursor: 'default' }}>+ New flow</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {flows.map((flow, i) => {
            const isActive = flow.status === 'Active'
            return (
              <div key={i} style={{
                background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '7px',
                padding: '0.625rem 0.75rem', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '0.75rem',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#111', marginBottom: '0.15rem' }}>{flow.name}</p>
                  <p style={{ fontSize: '0.58rem', color: '#9a9a9a' }}>{flow.ideas} ideas · {flow.members}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '0.56rem', fontWeight: 600,
                    color: isActive ? '#15803d' : '#9a9a9a',
                    background: isActive ? 'rgba(22,163,74,0.07)' : 'rgba(0,0,0,0.05)',
                    borderRadius: '999px', padding: '0.15rem 0.45rem',
                  }}>{flow.status}</span>
                  {isActive && (
                    <span style={{ fontSize: '0.58rem', fontWeight: 600, color: '#3d3d3d', cursor: 'default' }}>Open →</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </MockupShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let companyPlan: string = 'free'
  if (user) {
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single() as unknown as { data: { company_id: string | null } | null }
    if (profileRow?.company_id) {
      const { data: companyRow } = await supabase
        .from('companies')
        .select('plan')
        .eq('id', profileRow.company_id)
        .single() as unknown as { data: { plan: string } | null }
      companyPlan = companyRow?.plan ?? 'free'
    }
  }

  return (
    <>
      <SiteHeader />
      <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#ffffff' }}>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HERO — clean, light, confident
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{
          background: '#ffffff',
          padding: 'clamp(5rem, 10vw, 8rem) 0 clamp(4rem, 8vw, 6rem)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}>

              {/* Copy */}
              <div style={{ maxWidth: '36rem' }}>
                <h1
                  className="fade-up"
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: 'italic',
                    fontSize: 'clamp(2.75rem, 5vw, 4.25rem)',
                    lineHeight: 1.06,
                    letterSpacing: '-0.025em',
                    color: '#111111',
                    marginBottom: '1.5rem',
                  }}
                >
                  Your team has better ideas than you&apos;re currently hearing.
                </h1>

                <p
                  className="fade-up fade-up-1"
                  style={{
                    fontSize: '1.0625rem',
                    lineHeight: 1.75,
                    color: '#6b6b6b',
                    marginBottom: '2.5rem',
                    maxWidth: '28rem',
                  }}
                >
                  IdeaFlow gives every team member a structured place to share ideas and vote on priorities — so the best thinking rises to the top.
                </p>

                <div
                  className="fade-up fade-up-2"
                  style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
                >
                  {!user ? (
                    <>
                      <Link
                        href="/auth?mode=signup"
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          height: '2.625rem', padding: '0 1.375rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.9rem', fontWeight: 600,
                          background: '#111111', color: '#ffffff',
                          textDecoration: 'none',
                          transition: 'background 0.12s',
                        }}
                      >
                        Get started free →
                      </Link>
                      <Link
                        href="/auth?mode=login"
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#6b6b6b',
                          textDecoration: 'none',
                          padding: '0 0.25rem',
                        }}
                      >
                        Sign in
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/dashboard"
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        height: '2.625rem', padding: '0 1.375rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem', fontWeight: 600,
                        background: '#111111', color: '#ffffff',
                        textDecoration: 'none',
                      }}
                    >
                      Open dashboard →
                    </Link>
                  )}
                </div>

                {/* Micro-trust */}
                <p
                  className="fade-up fade-up-3"
                  style={{
                    marginTop: '1.75rem',
                    fontSize: '0.8rem',
                    color: '#b0b0b0',
                    letterSpacing: '0.01em',
                  }}
                >
                  Free to start · No credit card · 10 min setup
                </p>
              </div>

              {/* Product visual */}
              <div className="fade-up fade-up-2">
                <IdeaFeedMockup />
              </div>

            </div>
          </div>
        </section>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PRODUCT SHOWCASE — feature 1: idea feed
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ background: '#f9f9f8', padding: 'clamp(5rem,9vw,7rem) 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <PageContainer>

            <div style={{ maxWidth: '28rem', marginBottom: '3.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9a9a', marginBottom: '0.75rem' }}>
                The product
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                letterSpacing: '-0.02em',
                color: '#111111',
                lineHeight: 1.15,
              }}>
                Structured input. Clear priorities. Less noise.
              </h2>
            </div>

            {/* Feature 1: Idea feed */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
              marginBottom: '5rem',
            }}>
              <div style={{ maxWidth: '26rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#b0b0b0', marginBottom: '0.75rem' }}>
                  Idea feed
                </p>
                <h3 style={{
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
                  fontWeight: 700,
                  color: '#111111',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                  marginBottom: '0.875rem',
                }}>
                  The most-supported ideas rise to the top — automatically
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#6b6b6b', marginBottom: '1.5rem' }}>
                  Team members post ideas and vote on each other&apos;s. No committees. No interpretation. The ranking is just the data.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    'Ranked by real team votes in real time',
                    'Status badges track what\'s moved forward',
                    'Open to the full workspace or specific teams',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: '#4a4a4a' }}>
                      <span style={{ marginTop: '0.15rem', flexShrink: 0, color: '#b0b0b0', fontSize: '0.75rem' }}>—</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <IdeaFeedMockup />
            </div>

            {/* Feature 2: Review queue */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}>
              <ReviewQueueMockup />
              <div style={{ maxWidth: '26rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#b0b0b0', marginBottom: '0.75rem' }}>
                  Manager review
                </p>
                <h3 style={{
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
                  fontWeight: 700,
                  color: '#111111',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                  marginBottom: '0.875rem',
                }}>
                  Nothing gets quietly ignored
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#6b6b6b', marginBottom: '1.5rem' }}>
                  A dedicated review inbox flags ideas waiting on a response. Your team can see progress. Ideas don&apos;t disappear.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    'Review inbox surfaces what needs your attention',
                    'Authors notified automatically when status changes',
                    'No idea is ever silently dropped',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: '#4a4a4a' }}>
                      <span style={{ marginTop: '0.15rem', flexShrink: 0, color: '#b0b0b0', fontSize: '0.75rem' }}>—</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </PageContainer>
        </section>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FEATURE 3 — IdeaFlows (rounds)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ background: '#ffffff', padding: 'clamp(5rem,9vw,7rem) 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <PageContainer>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}>
              <div style={{ maxWidth: '26rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#b0b0b0', marginBottom: '0.75rem' }}>
                  IdeaFlows
                </p>
                <h3 style={{
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
                  fontWeight: 700,
                  color: '#111111',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                  marginBottom: '0.875rem',
                }}>
                  Focused rounds for different questions
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#6b6b6b', marginBottom: '1.5rem' }}>
                  Run separate IdeaFlows for different teams, departments, or topics. Time-bound rounds keep input fresh and focused.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    'Keep engineering feedback separate from culture input',
                    'Open and close rounds on a schedule',
                    'Invite specific people to specific flows',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: '#4a4a4a' }}>
                      <span style={{ marginTop: '0.15rem', flexShrink: 0, color: '#b0b0b0', fontSize: '0.75rem' }}>—</span>
                      {item}
                    </div>
                  ))}
                </div>
                {!user && (
                  <Link href="/features" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    marginTop: '1.5rem', fontSize: '0.875rem', fontWeight: 600,
                    color: '#111111', textDecoration: 'none',
                  }}>
                    See all features →
                  </Link>
                )}
              </div>
              <FlowSelectorMockup />
            </div>
          </PageContainer>
        </section>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PRICING
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="pricing" style={{ background: '#f9f9f8', borderTop: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(5rem,9vw,7rem) 0' }}>
          <PageContainer>

            <div style={{ maxWidth: '28rem', marginBottom: '3.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9a9a', marginBottom: '0.75rem' }}>
                Pricing
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                letterSpacing: '-0.02em',
                color: '#111111',
                lineHeight: 1.15,
                marginBottom: '0.75rem',
              }}>
                Simple, honest pricing.
              </h2>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: '#6b6b6b' }}>
                Start free, no credit card required. Upgrade when you&apos;re ready.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', maxWidth: '52rem' }}>

              {/* Free */}
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.09)',
                borderRadius: '1rem',
                padding: '2rem',
                display: 'flex', flexDirection: 'column',
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#9a9a9a', marginBottom: '1rem' }}>
                  Free
                </p>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111111', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.375rem' }}>€0</p>
                <p style={{ fontSize: '0.825rem', color: '#9a9a9a', marginBottom: '1.75rem' }}>No credit card required</p>

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {[
                    'Up to 10 workspace members',
                    'Up to 2 active IdeaFlows',
                    'Idea submission and voting',
                    'Comments on ideas',
                    'Basic analytics',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: '#3d3d3d' }}>
                      <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '0.15rem', color: '#b0b0b0' }}>
                        <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>

                {!user ? (
                  <Link href="/auth?mode=signup" style={{
                    display: 'block', textAlign: 'center', padding: '0.7rem 1rem',
                    borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '0.875rem', fontWeight: 600, color: '#3d3d3d',
                    textDecoration: 'none', transition: 'background 0.12s',
                  }}>
                    Start free →
                  </Link>
                ) : (
                  <Link href="/dashboard" style={{
                    display: 'block', textAlign: 'center', padding: '0.7rem 1rem',
                    borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.12)',
                    fontSize: '0.875rem', fontWeight: 600, color: '#3d3d3d',
                    textDecoration: 'none',
                  }}>
                    Open dashboard →
                  </Link>
                )}
              </div>

              {/* Pro */}
              <div style={{
                background: '#111111',
                borderRadius: '1rem',
                padding: '2rem',
                display: 'flex', flexDirection: 'column',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)' }}>Pro</p>
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: '#fff', background: 'rgba(255,255,255,0.12)',
                      borderRadius: '999px', padding: '0.15rem 0.5rem',
                    }}>
                      Most popular
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.25rem' }}>
                    <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.04em', lineHeight: 1 }}>€99</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.40)' }}>/year</p>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.35)' }}>or €12/month — cancel any time</p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {[
                    'Everything in Free',
                    'Up to 50 workspace members',
                    'Unlimited IdeaFlows',
                    'Full analytics dashboard',
                    'PDF report export',
                    'Admin controls and roles',
                    'Priority support',
                  ].map((item, i) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: i === 0 ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.78)', fontStyle: i === 0 ? 'italic' : 'normal' }}>
                      <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '0.15rem', color: 'rgba(255,255,255,0.38)' }}>
                        <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>

                {!user ? (
                  <Link href="/auth?mode=signup" style={{
                    display: 'block', textAlign: 'center', padding: '0.7rem 1rem',
                    borderRadius: '0.5rem',
                    background: '#ffffff', color: '#111111',
                    fontSize: '0.875rem', fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'opacity 0.12s',
                  }}>
                    Start free →
                  </Link>
                ) : companyPlan === 'pro' ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.7rem 1rem', borderRadius: '0.5rem',
                    background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.70)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.70)' }}>You&apos;re on Pro</span>
                  </div>
                ) : (
                  <UpgradeButton
                    style={{
                      display: 'block', width: '100%', textAlign: 'center',
                      padding: '0.7rem 1rem', fontSize: '0.875rem', borderRadius: '0.5rem',
                      background: '#ffffff', color: '#111111', fontWeight: 600,
                    }}
                    label="Upgrade to Pro →"
                  />
                )}
              </div>

            </div>

            <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#b0b0b0' }}>
              Questions?{' '}
              <Link href="/contact" style={{ color: '#6b6b6b', textDecoration: 'none', fontWeight: 500 }}>
                Get in touch →
              </Link>
            </p>

          </PageContainer>
        </section>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FINAL CTA
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="cta-dark" style={{ padding: 'clamp(5rem,10vw,8rem) 0' }}>
          <PageContainer style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '36rem' }}>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                color: 'rgba(255,255,255,0.94)',
                marginBottom: '1.25rem',
              }}>
                The best idea in your company is waiting to be heard.
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.45)', marginBottom: '2.5rem' }}>
                Set up in under 10 minutes. Invite your team. See what they&apos;re actually thinking.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {!user ? (
                  <>
                    <Link href="/auth?mode=signup" style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      height: '2.75rem', padding: '0 1.5rem',
                      borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
                      background: '#ffffff', color: '#111111', textDecoration: 'none',
                    }}>
                      Get started free →
                    </Link>
                    <Link href="/auth?mode=login" style={{
                      display: 'inline-flex', alignItems: 'center',
                      height: '2.75rem', padding: '0 1.5rem',
                      fontSize: '0.9rem', fontWeight: 500,
                      color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
                    }}>
                      Sign in
                    </Link>
                  </>
                ) : (
                  <Link href="/dashboard" style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: '2.75rem', padding: '0 1.5rem',
                    borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
                    background: '#ffffff', color: '#111111', textDecoration: 'none',
                  }}>
                    Open dashboard →
                  </Link>
                )}
              </div>
            </div>
          </PageContainer>
        </section>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FOOTER
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <footer style={{ background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 0' }}>
          <PageContainer style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif" }}>
              IdeaFlow
            </span>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.18)' }}>
              © {new Date().getFullYear()} IdeaFlow. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '1.75rem' }}>
              {([['Features', '/features'], ['Pricing', '/#pricing'], ['Contact', '/contact']] as [string, string][]).map(([label, href]) => (
                <a key={label} href={href} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.30)', textDecoration: 'none', fontWeight: 500 }}>
                  {label}
                </a>
              ))}
            </div>
          </PageContainer>
        </footer>

      </main>
    </>
  )
}
