import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/PageContainer'
import SiteHeader from '@/components/SiteHeader'
import UpgradeButton from '@/components/UpgradeButton'
import { IdeaFlowMark } from '@/components/Logo'
import HeroAnimation from '@/components/HeroAnimation'

// ─────────────────────────────────────────────────────────────────────────────
// Palette constants (warm ivory system)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Shared mockup chrome wrapper
// ─────────────────────────────────────────────────────────────────────────────
function MockupShell({ children, url = 'app.useideaflow.com' }: { children: React.ReactNode; url?: string }) {
  return (
    <div style={{
      borderRadius: '10px',
      overflow: 'hidden',
      background: P.surface,
      boxShadow: `0 0 0 1px rgba(0,0,0,0.07), 0 8px 32px rgba(31,35,48,0.09), 0 2px 6px rgba(31,35,48,0.04)`,
    }}>
      <div style={{
        background: P.raised,
        borderBottom: `1px solid ${P.border}`,
        padding: '0.5rem 0.75rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
          {['#dbd7d2', '#d0ccc7', '#c5c1bc'].map((c, i) => (
            <div key={i} style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{
          flex: 1, height: '1.1rem', borderRadius: '4px',
          background: P.surface, border: `1px solid ${P.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '0.52rem', color: P.faint, letterSpacing: '0.01em' }}>{url}</span>
        </div>
        <div style={{ width: '2rem' }} />
      </div>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Idea feed mockup — used in product showcase
// ─────────────────────────────────────────────────────────────────────────────
function IdeaFeedMockup() {
  const ideas = [
    { title: 'Replace weekly all-hands with async updates', likes: 23, status: 'Planned', sColor: '#16a34a', sBg: 'rgba(22,163,74,0.07)' },
    { title: 'Flexible start times — 8 to 10 am window',   likes: 17, status: 'Open',    sColor: P.faint,   sBg: 'transparent' },
    { title: 'Dedicated learning time — 2 hrs per week',   likes: 11, status: 'Open',    sColor: P.faint,   sBg: 'transparent' },
    { title: 'Better onboarding docs for new hires',       likes:  8, status: 'Open',    sColor: P.faint,   sBg: 'transparent' },
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
            fontSize: '0.58rem', fontWeight: 700, color: '#16a34a',
            background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.16)',
            borderRadius: '999px', padding: '0.18rem 0.5rem',
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
              background: i === 0 ? 'rgba(201,139,95,0.05)' : P.surface,
              border: `1px solid ${i === 0 ? 'rgba(201,139,95,0.20)' : P.border}`,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem', minWidth: '1.5rem', paddingTop: '0.05rem' }}>
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
                <span style={{ fontSize: '0.57rem', fontWeight: 700, color: i === 0 ? P.ink : P.faint }}>{idea.likes}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: P.ink, lineHeight: 1.4, marginBottom: '0.2rem' }}>{idea.title}</p>
                <span style={{ fontSize: '0.56rem', fontWeight: 600, color: idea.sColor, background: idea.sBg, borderRadius: '999px', padding: idea.sBg !== 'transparent' ? '0.1rem 0.4rem' : '0' }}>{idea.status}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.58rem', color: P.faint, marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: `1px solid ${P.border}` }}>
          4 ideas · 18 team members voted
        </p>
      </div>
    </MockupShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Flow selector mockup — used in product showcase
// ─────────────────────────────────────────────────────────────────────────────
function FlowSelectorMockup() {
  const flows = [
    { name: 'Q1 Retrospective',   status: 'Active', ideas: 12, scope: 'All members' },
    { name: 'Engineering Process', status: 'Active', ideas:  5, scope: '4 members'   },
    { name: 'Team Culture',        status: 'Draft',  ideas:  0, scope: 'All members' },
  ]
  return (
    <MockupShell url="app.useideaflow.com/dashboard/flows">
      <div style={{ background: P.bg, padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: P.ink }}>IdeaFlows</p>
            <p style={{ fontSize: '0.6rem', color: P.faint }}>Your active collection rounds</p>
          </div>
          <span style={{ fontSize: '0.58rem', fontWeight: 600, color: P.ink, background: P.surface, border: `1px solid ${P.border}`, borderRadius: '5px', padding: '0.2rem 0.5rem', cursor: 'default' }}>+ New flow</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {flows.map((flow, i) => {
            const isActive = flow.status === 'Active'
            return (
              <div key={i} style={{
                background: P.surface, border: `1px solid ${P.border}`, borderRadius: '7px',
                padding: '0.625rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: P.ink, marginBottom: '0.15rem' }}>{flow.name}</p>
                  <p style={{ fontSize: '0.58rem', color: P.faint }}>{flow.ideas} ideas · {flow.scope}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '0.56rem', fontWeight: 600,
                    color: isActive ? '#15803d' : P.faint,
                    background: isActive ? 'rgba(22,163,74,0.07)' : 'rgba(0,0,0,0.05)',
                    borderRadius: '999px', padding: '0.15rem 0.45rem',
                  }}>{flow.status}</span>
                  {isActive && <span style={{ fontSize: '0.58rem', fontWeight: 600, color: P.ink, cursor: 'default' }}>Open →</span>}
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
      <main style={{ fontFamily: "'DM Sans', sans-serif", background: P.bg }}>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HERO
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{
          background: P.bg,
          padding: 'clamp(4.5rem, 9vw, 7.5rem) 0 clamp(4rem, 8vw, 6rem)',
          borderBottom: `1px solid ${P.border}`,
        }}>
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}>

              {/* Copy */}
              <div style={{ maxWidth: '34rem' }}>
                <h1
                  className="fade-up"
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: 'italic',
                    fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.025em',
                    color: P.ink,
                    marginBottom: '1.25rem',
                  }}
                >
                  Stop sending surveys.<br />Start collecting ideas with IdeaFlow.
                </h1>

                <p
                  className="fade-up fade-up-1"
                  style={{
                    fontSize: '1.0625rem',
                    lineHeight: 1.75,
                    color: P.slate,
                    marginBottom: '2.25rem',
                    maxWidth: '26rem',
                  }}
                >
                  Collect ideas, let your team vote, and see what matters most.
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
                          background: P.ink, color: '#ffffff',
                          textDecoration: 'none',
                          letterSpacing: '-0.01em',
                          transition: 'background 0.15s',
                        }}
                      >
                        Get started free →
                      </Link>
                      <Link
                        href="/auth?mode=login"
                        style={{
                          fontSize: '0.875rem', fontWeight: 500,
                          color: P.slate, textDecoration: 'none',
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
                        background: P.ink, color: '#ffffff',
                        textDecoration: 'none',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Open dashboard →
                    </Link>
                  )}
                </div>
              </div>

              {/* Animated product visual */}
              <div className="fade-up fade-up-2">
                <HeroAnimation />
              </div>

            </div>
          </div>
        </section>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TRUST ROW
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{
          background: P.raised,
          borderBottom: `1px solid ${P.border}`,
          padding: '1.25rem 0',
        }}>
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexWrap: 'wrap', gap: '0.5rem 2.5rem',
            }}>
              {[
                { icon: '🔒', label: 'Private workspace' },
                { icon: '🗳️', label: 'Team voting'       },
                { icon: '⚡', label: 'Set up in minutes' },
              ].map(({ icon, label }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.8125rem', fontWeight: 500, color: P.slate,
                }}>
                  <span style={{ fontSize: '0.875rem' }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PRODUCT SHOWCASE — feature 1
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ background: P.bg, padding: 'clamp(4.5rem,9vw,7rem) 0', borderTop: `1px solid ${P.border}` }}>
          <PageContainer>

            <div style={{ maxWidth: '24rem', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                How it works
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(1.75rem, 3vw, 2.375rem)',
                letterSpacing: '-0.02em',
                color: P.ink,
                lineHeight: 1.15,
              }}>
                The best ideas rise — no politics, just votes.
              </h2>
            </div>

            {/* Feature 1: Idea feed */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '4rem', alignItems: 'center', marginBottom: '5rem',
            }}>
              <div style={{ maxWidth: '24rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                  Idea feed
                </p>
                <h3 style={{
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                  fontWeight: 700, color: P.ink,
                  letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '0.75rem',
                }}>
                  Ranked by real votes, in real time
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: P.slate, marginBottom: '1.25rem' }}>
                  Team members post ideas and vote on each other&apos;s. The ranking is just the data — no filtering, no hierarchy.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {[
                    'Votes update live as the team weighs in',
                    'Status badges track what\'s been acted on',
                    'Open to everyone, or specific groups',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: P.slate }}>
                      <span style={{ marginTop: '0.18rem', flexShrink: 0, color: P.accent, fontWeight: 700, fontSize: '0.7rem' }}>—</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <IdeaFeedMockup />
            </div>

            {/* Feature 2: IdeaFlows */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '4rem', alignItems: 'center',
            }}>
              <FlowSelectorMockup />
              <div style={{ maxWidth: '24rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                  IdeaFlows
                </p>
                <h3 style={{
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                  fontWeight: 700, color: P.ink,
                  letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '0.75rem',
                }}>
                  Separate rounds for different questions
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: P.slate, marginBottom: '1.25rem' }}>
                  Run focused collection rounds for retros, planning, or culture — each with their own team and timeline.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {[
                    'Keep engineering feedback separate from HR topics',
                    'Open and close rounds on your schedule',
                    'Invite specific people to specific flows',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: P.slate }}>
                      <span style={{ marginTop: '0.18rem', flexShrink: 0, color: P.accent, fontWeight: 700, fontSize: '0.7rem' }}>—</span>
                      {item}
                    </div>
                  ))}
                </div>
                {!user && (
                  <Link href="/features" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    marginTop: '1.5rem', fontSize: '0.875rem', fontWeight: 600,
                    color: P.ink, textDecoration: 'none',
                  }}>
                    See all features →
                  </Link>
                )}
              </div>
            </div>

          </PageContainer>
        </section>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            PRICING
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="pricing" style={{ background: P.raised, borderTop: `1px solid ${P.border}`, padding: 'clamp(4.5rem,9vw,7rem) 0' }}>
          <PageContainer>

            <div style={{ maxWidth: '26rem', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                Pricing
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(1.75rem, 3vw, 2.375rem)',
                letterSpacing: '-0.02em',
                color: P.ink,
                lineHeight: 1.15,
                marginBottom: '0.625rem',
              }}>
                Simple yearly pricing for every team size.
              </h2>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: P.slate }}>
                Start free, upgrade when you&apos;re ready.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', maxWidth: '74rem' }}>

              {/* Free */}
              <div style={{
                background: P.surface,
                border: `1px solid ${P.border}`,
                borderRadius: '1rem',
                padding: '2rem',
                display: 'flex', flexDirection: 'column',
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: P.faint, marginBottom: '1rem' }}>
                  Free
                </p>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, color: P.ink, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.375rem' }}>€0</p>
                <p style={{ fontSize: '0.825rem', color: P.faint, marginBottom: '1.75rem' }}>No credit card required</p>

                <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {[
                    'Up to 10 workspace members',
                    'Up to 2 active IdeaFlows',
                    'Idea submission and voting',
                    'Comments on ideas',
                    'Basic analytics',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: P.slate }}>
                      <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '0.15rem', color: P.faint }}>
                        <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>

                {!user ? (
                  <Link href="/auth?mode=signup" style={{
                    display: 'block', textAlign: 'center', padding: '0.7rem 1rem',
                    borderRadius: '0.5rem', border: `1px solid ${P.border}`,
                    fontSize: '0.875rem', fontWeight: 600, color: P.ink,
                    textDecoration: 'none', transition: 'background 0.12s',
                  }}>
                    Start free →
                  </Link>
                ) : (
                  <Link href="/dashboard" style={{
                    display: 'block', textAlign: 'center', padding: '0.7rem 1rem',
                    borderRadius: '0.5rem', border: `1px solid ${P.border}`,
                    fontSize: '0.875rem', fontWeight: 600, color: P.ink,
                    textDecoration: 'none',
                  }}>
                    Open dashboard →
                  </Link>
                )}
              </div>

              {/* Pro */}
              <div style={{
                background: P.dark,
                borderRadius: '1rem',
                padding: '2rem',
                display: 'flex', flexDirection: 'column',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 4px 32px rgba(19,22,42,0.16)',
              }}>
                {/* Warm glow top-right */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: '60%', height: '50%',
                  background: 'radial-gradient(ellipse at top right, rgba(201,139,95,0.12) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ marginBottom: '1rem', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)' }}>Pro</p>
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.80)',
                      background: 'rgba(201,139,95,0.22)',
                      borderRadius: '999px', padding: '0.15rem 0.5rem',
                      border: '1px solid rgba(201,139,95,0.32)',
                    }}>
                      Most popular
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.25rem' }}>
                    <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.04em', lineHeight: 1 }}>€49</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>/year</p>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.35)' }}>Under €5/month · For your whole team</p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, position: 'relative' }}>
                  {[
                    'Everything in Free',
                    'Up to 50 workspace members',
                    'Unlimited IdeaFlows',
                    'Full analytics dashboard',
                    'PDF report export',
                    'Admin controls and roles',
                    'Priority support',
                  ].map((item, i) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: i === 0 ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.78)', fontStyle: i === 0 ? 'italic' : 'normal' }}>
                      <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '0.15rem', color: i === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(201,139,95,0.80)' }}>
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
                    background: '#ffffff', color: P.ink,
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
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.13)',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>You&apos;re on Pro</span>
                  </div>
                ) : (
                  <UpgradeButton
                    style={{
                      display: 'block', width: '100%', textAlign: 'center',
                      padding: '0.7rem 1rem', fontSize: '0.875rem', borderRadius: '0.5rem',
                      background: '#ffffff', color: P.ink, fontWeight: 600,
                    }}
                    label="Upgrade to Pro →"
                  />
                )}
              </div>

              {/* Pro+ */}
              <div style={{
                background: 'linear-gradient(160deg, #1a2035 0%, #0f1726 100%)',
                borderRadius: '1rem',
                padding: '2rem',
                display: 'flex', flexDirection: 'column',
                position: 'relative', overflow: 'hidden',
                border: '1px solid rgba(99,179,237,0.12)',
                boxShadow: '0 4px 32px rgba(9,13,30,0.22)',
              }}>
                {/* Blue-teal glow */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, width: '70%', height: '55%',
                  background: 'radial-gradient(ellipse at top right, rgba(56,189,248,0.09) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ marginBottom: '1rem', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)' }}>Pro+</p>
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'rgba(186,230,253,0.90)',
                      background: 'rgba(56,189,248,0.12)',
                      borderRadius: '999px', padding: '0.15rem 0.5rem',
                      border: '1px solid rgba(56,189,248,0.22)',
                    }}>
                      Large teams
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.25rem' }}>
                    <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.04em', lineHeight: 1 }}>€99</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>/year</p>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.35)' }}>Under €9/month · For growing organisations</p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, position: 'relative' }}>
                  {[
                    'Everything in Pro',
                    'Up to 100 workspace members',
                    'Unlimited IdeaFlows',
                    'Full analytics dashboard',
                    'PDF report export',
                    'Admin controls and roles',
                    'Priority support',
                  ].map((item, i) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: i === 0 ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.78)', fontStyle: i === 0 ? 'italic' : 'normal' }}>
                      <svg width="13" height="13" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '0.15rem', color: i === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(56,189,248,0.75)' }}>
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
                    background: 'rgba(56,189,248,0.14)',
                    border: '1px solid rgba(56,189,248,0.26)',
                    color: 'rgba(186,230,253,0.95)',
                    fontSize: '0.875rem', fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'background 0.12s',
                  }}>
                    Get started →
                  </Link>
                ) : companyPlan === 'pro_plus' ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.7rem 1rem', borderRadius: '0.5rem',
                    background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.18)',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(186,230,253,0.65)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(186,230,253,0.75)' }}>You&apos;re on Pro+</span>
                  </div>
                ) : (
                  <Link href="/contact" style={{
                    display: 'block', textAlign: 'center', padding: '0.7rem 1rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(56,189,248,0.14)',
                    border: '1px solid rgba(56,189,248,0.26)',
                    color: 'rgba(186,230,253,0.95)',
                    fontSize: '0.875rem', fontWeight: 600,
                    textDecoration: 'none',
                  }}>
                    Contact us →
                  </Link>
                )}
              </div>

            </div>

            <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: P.faint }}>
              Questions?{' '}
              <Link href="/contact" style={{ color: P.slate, textDecoration: 'none', fontWeight: 500 }}>
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
            <div style={{ maxWidth: '34rem' }}>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(2rem, 4vw, 2.875rem)',
                lineHeight: 1.1, letterSpacing: '-0.025em',
                color: 'rgba(255,255,255,0.95)',
                marginBottom: '1rem',
              }}>
                The best idea in your company is waiting to be heard.
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.38)', marginBottom: '2.25rem' }}>
                Set up in under 10 minutes. Invite your team. See what they&apos;re actually thinking.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {!user ? (
                  <>
                    <Link href="/auth?mode=signup" style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      height: '2.75rem', padding: '0 1.5rem',
                      borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
                      background: '#ffffff', color: P.ink, textDecoration: 'none',
                    }}>
                      Get started free →
                    </Link>
                    <Link href="/auth?mode=login" style={{
                      display: 'inline-flex', alignItems: 'center',
                      height: '2.75rem', padding: '0 1.5rem',
                      fontSize: '0.9rem', fontWeight: 500,
                      color: 'rgba(255,255,255,0.38)', textDecoration: 'none',
                    }}>
                      Sign in
                    </Link>
                  </>
                ) : (
                  <Link href="/dashboard" style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: '2.75rem', padding: '0 1.5rem',
                    borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
                    background: '#ffffff', color: P.ink, textDecoration: 'none',
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
        <footer style={{ background: P.dark, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 0' }}>
          <PageContainer style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <IdeaFlowMark width={16} color="rgba(255,255,255,0.32)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.32)', letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif" }}>
                IdeaFlow
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.16)' }}>
              © {new Date().getFullYear()} IdeaFlow. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '1.75rem' }}>
              {([['Features', '/features'], ['Pricing', '/#pricing'], ['Contact', '/contact']] as [string, string][]).map(([label, href]) => (
                <a key={label} href={href} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', textDecoration: 'none', fontWeight: 500 }}>
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
