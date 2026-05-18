import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/PageContainer'
import SiteHeader from '@/components/SiteHeader'
import UpgradeButton from '@/components/UpgradeButton'
import { IdeaFlowMark } from '@/components/Logo'
import HeroAnimation from '@/components/HeroAnimation'
import SiteFooter from '@/components/SiteFooter'

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
                  Most team feedback gets lost in meetings and Slack threads. IdeaFlow gives everyone a voice, ranks ideas by vote, and shows you exactly what matters most.
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
            TRUSTED BY — social proof bar
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ background: P.surface, borderBottom: `1px solid ${P.border}`, padding: '1.875rem 0' }}>
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <p style={{
              textAlign: 'center', fontSize: '0.72rem', fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: P.faint, marginBottom: '1.25rem',
            }}>
              Built for product, engineering and operations teams
            </p>
            <div className="trusted-by-logos">
              {([
                ['F', 'Forma'],
                ['S', 'Spendr'],
                ['K', 'Kantu'],
                ['L', 'Lumio'],
                ['O', 'Orbit'],
                ['V', 'Vertex'],
              ] as [string, string][]).map(([letter, name]) => (
                <div key={name} className="trusted-by-logo-item">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="6" fill="rgba(0,0,0,0.05)"/>
                    <text x="14" y="19.5" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="'DM Sans',sans-serif" fill="rgba(0,0,0,0.22)">{letter}</text>
                  </svg>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'rgba(0,0,0,0.22)', letterSpacing: '-0.01em' }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECURITY TRUST STRIP
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ background: P.raised, borderBottom: `1px solid ${P.border}`, padding: '1rem 0' }}>
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="trust-strip">
              {([
                {
                  label: 'GDPR-friendly',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                },
                {
                  label: 'Private workspaces',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                },
                {
                  label: 'Secure authentication',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
                },
                {
                  label: 'Stripe-secured billing',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
                },
                {
                  label: 'No employee tracking',
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
                },
              ] as { label: string; icon: React.ReactNode }[]).map(({ label, icon }) => (
                <div key={label} className="trust-item">
                  {icon}
                  <span>{label}</span>
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
                No lost ideas. No loudest voice wins. Just your team's thinking, ranked.
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
            TESTIMONIALS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ background: P.surface, borderTop: `1px solid ${P.border}`, padding: 'clamp(4rem,8vw,6rem) 0' }}>
          <PageContainer>
            <div style={{ maxWidth: '22rem', marginBottom: '3rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.faint, marginBottom: '0.75rem' }}>
                What teams say
              </p>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                letterSpacing: '-0.02em', color: P.ink, lineHeight: 1.15,
              }}>
                Teams that actually listen to each other.
              </h2>
            </div>

            <div className="testimonials-grid">
              {([
                {
                  quote: "IdeaFlow changed how we run retros. Ideas that used to get lost in Notion docs now bubble up through votes. Our team actually trusts the process now.",
                  name: 'Sander T.',
                  role: 'Head of Product',
                  company: 'Forma',
                },
                {
                  quote: "I was skeptical about another feedback tool. But the vote-ranking model is genuinely different — the best ideas win, not the loudest voices in the room. We ship better decisions for it.",
                  name: 'Maya R.',
                  role: 'Engineering Manager',
                  company: 'Lumio',
                },
                {
                  quote: "We run separate IdeaFlows for HR, engineering, and ops each quarter. It's become a real part of how we stay connected to what the team actually needs.",
                  name: 'Lotte V.',
                  role: 'Operations Lead',
                  company: 'Kantu · 120 people',
                },
              ] as { quote: string; name: string; role: string; company: string }[]).map(({ quote, name, role, company }) => (
                <div key={name} className="testimonial-card">
                  <div style={{ marginBottom: '1.25rem' }}>
                    {[0,1,2,3,4].map(i => (
                      <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={P.accent} style={{ display: 'inline-block', marginRight: '2px' }}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: P.slate, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                      width: '2rem', height: '2rem', borderRadius: '50%',
                      background: P.raised, border: `1px solid ${P.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, color: P.slate,
                      flexShrink: 0,
                    }}>
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.825rem', fontWeight: 700, color: P.ink, lineHeight: 1.2 }}>{name}</p>
                      <p style={{ fontSize: '0.75rem', color: P.faint, lineHeight: 1.3 }}>{role} · {company}</p>
                    </div>
                  </div>
                </div>
              ))}
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
                One flat rate. Your whole team, always included.
              </h2>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: P.slate }}>
                No per-seat pricing, no hidden fees. Start free and upgrade when you need more.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', maxWidth: '74rem' }}>

              {/* Free */}
              <div className="pricing-card-interactive" style={{
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

              {/* Standard */}
              <div className="pricing-card-interactive" style={{
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
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)' }}>Standard</p>
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
                  <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.35)' }}>One flat yearly rate — the whole team, no limits</p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, position: 'relative' }}>
                  {[
                    'Everything in Free',
                    'Up to 50 workspace members',
                    'Unlimited IdeaFlows',
                    'Full analytics dashboard',
                    'Member management & roles',
                    'Participation reports',
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
                    Get started →
                  </Link>
                ) : (companyPlan === 'standard' || companyPlan === 'pro' || companyPlan === 'pro_plus') ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.7rem 1rem', borderRadius: '0.5rem',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.13)',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
                      {companyPlan === 'standard' ? "You’re on Standard" : "You’re on a higher plan"}
                    </span>
                  </div>
                ) : (
                  <UpgradeButton
                    plan="standard"
                    style={{
                      display: 'block', width: '100%', textAlign: 'center',
                      padding: '0.7rem 1rem', fontSize: '0.875rem', borderRadius: '0.5rem',
                      background: '#ffffff', color: P.ink, fontWeight: 600,
                    }}
                    label="Upgrade to Standard →"
                  />
                )}
              </div>

              {/* Pro */}
              <div className="pricing-card-interactive" style={{
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
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)' }}>Pro</p>
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                      color: 'rgba(249,115,22,0.95)',
                      background: 'rgba(249,115,22,0.14)',
                      borderRadius: '999px', padding: '0.15rem 0.5rem',
                      border: '1px solid rgba(249,115,22,0.25)',
                    }}>
                      ✦ AI-powered
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.25rem' }}>
                    <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.04em', lineHeight: 1 }}>€99</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>/year</p>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.35)' }}>Everything in Standard, plus AI that turns raw feedback into clear priorities</p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, position: 'relative' }}>
                  {([
                    { label: 'Everything in Standard',      ai: false },
                    { label: 'AI workspace summaries',       ai: true  },
                    { label: 'Executive AI reports',         ai: true  },
                    { label: 'AI action recommendations',    ai: true  },
                    { label: 'PDF executive exports',        ai: true  },
                    { label: 'Workspace Pulse & trends',     ai: true  },
                    { label: 'Up to 100 workspace members',  ai: false },
                  ] as { label: string; ai: boolean }[]).map(({ label, ai }, i) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: i === 0 ? 'rgba(255,255,255,0.30)' : ai ? 'rgba(186,230,253,0.85)' : 'rgba(255,255,255,0.70)', fontStyle: i === 0 ? 'italic' : 'normal' }}>
                      <span style={{ flexShrink: 0, marginTop: '0.15rem', fontSize: '0.8rem', color: ai ? 'rgba(249,115,22,0.7)' : i === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(99,179,237,0.6)' }}>
                        {ai ? '✦' : '✓'}
                      </span>
                      {label}
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
                ) : (companyPlan === 'pro' || companyPlan === 'pro_plus') ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.7rem 1rem', borderRadius: '0.5rem',
                    background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.18)',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(186,230,253,0.65)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(186,230,253,0.75)' }}>You&apos;re on Pro</span>
                  </div>
                ) : (
                  <UpgradeButton
                    plan="pro"
                    style={{
                      display: 'block', width: '100%', textAlign: 'center',
                      padding: '0.7rem 1rem', fontSize: '0.875rem', borderRadius: '0.5rem',
                      background: 'rgba(56,189,248,0.14)',
                      border: '1px solid rgba(56,189,248,0.26)',
                      color: 'rgba(186,230,253,0.95)', fontWeight: 600,
                      boxShadow: 'none',
                    }}
                    label="Upgrade to Pro →"
                  />
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


        <SiteFooter isLoggedIn={!!user} />

      </main>
    </>
  )
}
