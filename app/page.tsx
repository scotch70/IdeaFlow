import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoMark from '@/components/LogoMark'
import PageContainer from '@/components/PageContainer'
import ProductDemo from '@/components/ProductDemo'
import SiteHeader from '@/components/SiteHeader'

// ── Inline product mockup helpers ─────────────────────────────────────────────
// These are faithful representations of the actual product UI, not illustrations.
// Each wraps its content in a browser-chrome shell for immediate recognition.

function MockupShell({ children, url = 'app.useideaflow.com' }: { children: React.ReactNode; url?: string }) {
  return (
    <div style={{
      borderRadius: '12px', overflow: 'hidden', background: '#ffffff',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.03), 0 20px 48px rgba(6,14,38,0.10)',
    }}>
      <div style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '0.5rem 0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
          {(['#fc5f57','#fdbc2c','#33c748'] as const).map((c, i) => (
            <div key={i} style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
        </div>
        <div style={{ flex: 1, height: '1.1rem', borderRadius: '4px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.52rem', color: '#94a3b8', letterSpacing: '0.01em' }}>{url}</span>
        </div>
        <div style={{ width: '2rem' }} />
      </div>
      {children}
    </div>
  )
}

function IdeaFeedMockup() {
  const ideas = [
    { title: 'Replace weekly all-hands with async video updates', likes: 23, status: 'Planned', statusColor: '#10b981', statusBg: 'rgba(16,185,129,0.08)' },
    { title: 'Flexible start times — 8 to 10am window', likes: 17, status: 'Open', statusColor: '#3b82f6', statusBg: 'rgba(59,130,246,0.08)' },
    { title: 'Dedicated learning time — 2 hours per week', likes: 11, status: 'Open', statusColor: '#3b82f6', statusBg: 'rgba(59,130,246,0.08)' },
    { title: 'Better onboarding docs for new hires', likes: 8, status: 'Open', statusColor: '#3b82f6', statusBg: 'rgba(59,130,246,0.08)' },
  ]
  return (
    <MockupShell url="app.useideaflow.com/dashboard/flows/q1-retro">
      <div style={{ background: '#f8fafc', padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d1f35' }}>Q1 Retrospective</p>
            <p style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Sorted by team votes</p>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.58rem', fontWeight: 700, color: '#16a34a', background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '999px', padding: '0.2rem 0.5rem' }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            Active
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {ideas.map((idea, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
              padding: '0.625rem 0.75rem',
              borderRadius: '8px',
              background: i === 0 ? 'rgba(249,115,22,0.04)' : '#ffffff',
              border: `1px solid ${i === 0 ? 'rgba(249,115,22,0.20)' : '#e8ecf0'}`,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem', minWidth: '1.5rem', paddingTop: '0.05rem' }}>
                <div style={{ width: '1.4rem', height: '1.4rem', borderRadius: '6px', background: i === 0 ? 'rgba(249,115,22,0.08)' : '#f8fafc', border: `1px solid ${i === 0 ? 'rgba(249,115,22,0.18)' : '#e8ecf0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill={i === 0 ? '#f97316' : 'none'} stroke={i === 0 ? '#f97316' : '#cbd5e1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, color: i === 0 ? '#f97316' : '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{idea.likes}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.4, marginBottom: '0.25rem' }}>{idea.title}</p>
                <span style={{ fontSize: '0.56rem', fontWeight: 600, color: idea.statusColor, background: idea.statusBg, borderRadius: '999px', padding: '0.1rem 0.45rem' }}>{idea.status}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
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
      <div style={{ background: '#f8fafc', padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d1f35' }}>Needs attention</p>
            <p style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Ideas waiting on a manager response</p>
          </div>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#c2540a', background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.20)', borderRadius: '999px', padding: '0.2rem 0.5rem' }}>
            {items.length} pending
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid rgba(26,107,191,0.09)', borderRadius: '8px', padding: '0.625rem 0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0d1f35', lineHeight: 1.4, marginBottom: '0.2rem' }}>{item.title}</p>
                  <p style={{ fontSize: '0.58rem', color: '#94a3b8' }}>{item.author} · {item.likes} likes · {item.days}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, marginTop: '0.1rem' }}>
                  <span style={{ fontSize: '0.56rem', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)', borderRadius: '4px', padding: '0.15rem 0.4rem', cursor: 'default' }}>Plan it</span>
                  <span style={{ fontSize: '0.56rem', fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.15rem 0.4rem', cursor: 'default' }}>Dismiss</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
          Ideas marked &lsquo;Planned&rsquo; notify the author automatically.
        </p>
      </div>
    </MockupShell>
  )
}

function FlowSelectorMockup() {
  const flows = [
    { name: 'Q1 Retrospective', status: 'Active', statusColor: '#10b981', statusBg: 'rgba(16,185,129,0.08)', ideas: 12, members: 'All members' },
    { name: 'Engineering Process', status: 'Active', statusColor: '#10b981', statusBg: 'rgba(16,185,129,0.08)', ideas: 5, members: '4 members' },
    { name: 'Team Culture', status: 'Draft', statusColor: '#9ab0c8', statusBg: 'rgba(154,176,200,0.10)', ideas: 0, members: 'All members' },
  ]
  return (
    <MockupShell url="app.useideaflow.com/dashboard/flows">
      <div style={{ background: '#f8fafc', padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d1f35' }}>IdeaFlows</p>
            <p style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Your active collection rounds</p>
          </div>
          <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#f97316', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'default' }}>+ New flow</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {flows.map((flow, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid rgba(26,107,191,0.09)', borderRadius: '8px', padding: '0.625rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.2rem' }}>{flow.name}</p>
                <p style={{ fontSize: '0.58rem', color: '#94a3b8' }}>{flow.ideas} ideas · {flow.members}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.56rem', fontWeight: 600, color: flow.statusColor, background: flow.statusBg, borderRadius: '999px', padding: '0.15rem 0.45rem' }}>{flow.status}</span>
                {flow.status !== 'Draft' && (
                  <span style={{ fontSize: '0.58rem', fontWeight: 600, color: '#1a6bbf', cursor: 'default' }}>Open →</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockupShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
    <SiteHeader />
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8f9fb', minHeight: '100vh' }}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO — updated copy, same layout
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        style={{
          background: '#04091a',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: 'clamp(5rem,10vw,8rem)',
          paddingBottom: 'clamp(4.5rem,9vw,7rem)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `
              radial-gradient(ellipse 70% 55% at 50% -5%, rgba(249,115,22,0.22) 0%, transparent 68%),
              radial-gradient(ellipse 40% 35% at 82% 65%, rgba(26,107,191,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 30% 30% at 15% 75%, rgba(249,115,22,0.06) 0%, transparent 60%)
            `,
          }}
        />
        <div className="hero-dot-grid" aria-hidden />

        <div
          className="mx-auto max-w-7xl px-6 lg:px-10"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* ── Copy ── */}
          <div style={{ maxWidth: '38rem' }}>

            {/* Overline badge */}
            <div
              className="fade-up"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                marginBottom: '1.75rem', padding: '0.3rem 0.875rem',
                borderRadius: '999px', background: 'rgba(249,115,22,0.12)',
                border: '1px solid rgba(249,115,22,0.28)',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.92)' }}>
                For team leads at growing companies
              </span>
            </div>

            {/* H1 */}
            <h1
              className="fade-up fade-up-1"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(2.75rem, 5.2vw, 4.375rem)',
                lineHeight: 1.04,
                letterSpacing: '-0.02em',
                color: 'rgba(255,255,255,0.96)',
                marginBottom: '1.5rem',
              }}
            >
              Your team has better ideas{' '}
              <span
                style={{
                  background: 'linear-gradient(92deg, #f97316 10%, #fbbf24 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                than you&apos;re currently hearing.
              </span>
            </h1>

            <p
              className="fade-up fade-up-2"
              style={{
                fontSize: '1.0625rem',
                lineHeight: 1.75,
                color: 'rgba(168,216,240,0.72)',
                marginBottom: '2.5rem',
                maxWidth: '30rem',
              }}
            >
              IdeaFlow gives your team a structured place to share ideas and vote on priorities — so you always know what matters, without scheduling another meeting to find out.
            </p>

            <div
              className="fade-up fade-up-3"
              style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
            >
              {!user ? (
                <>
                  <Link href="/auth" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.7rem 1.5rem' }}>
                    Create your free workspace →
                  </Link>
                  <a
                    href="#how-it-works"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      fontSize: '0.875rem', fontWeight: 600,
                      color: 'rgba(168,216,240,0.72)', textDecoration: 'none',
                    }}
                  >
                    See how it works
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </a>
                </>
              ) : (
                <Link href="/dashboard" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.7rem 1.5rem' }}>
                  Open dashboard →
                </Link>
              )}
            </div>

            {/* Micro-trust row */}
            <div
              className="fade-up fade-up-4"
              style={{
                marginTop: '2.5rem', paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
              }}
            >
              {[
                { value: '10 min', label: 'to set up' },
                { value: 'Free', label: 'to start' },
                { value: 'No', label: 'credit card' },
              ].map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f97316' }}>{s.value}</span>
                  <span style={{ fontSize: '0.775rem', color: 'rgba(168,216,240,0.55)', fontWeight: 400 }}>{s.label}</span>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', marginLeft: '0.25rem', display: 'inline-block' }} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Product demo ── */}
          <div className="fade-up fade-up-2">
            <ProductDemo />
          </div>
        </div>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SOCIAL PROOF STRIP — lightweight, honest, replaceable
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(2rem,4vw,3rem) 0' }}>
        <PageContainer>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}>

            {/* Testimonial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[0,1,2,3,4].map(i => (
                  <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f97316" stroke="none">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                ))}
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: '#2c4a6e', fontStyle: 'italic' }}>
                &ldquo;We tried suggestion boxes and Slack channels. IdeaFlow is the first thing that actually changed how we handle team input.&rdquo;
              </p>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5a7fa8' }}>
                — Operations Lead, SaaS startup
              </p>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '1px', height: '4rem', background: 'rgba(0,0,0,0.07)' }} />
            </div>

            {/* Metric */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <p style={{ fontSize: 'clamp(2rem,4vw,2.5rem)', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.04em', lineHeight: 1 }}>
                4×
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d1f35', lineHeight: 1.4 }}>
                more ideas collected
              </p>
              <p style={{ fontSize: '0.775rem', color: '#9ab0c8', lineHeight: 1.5 }}>
                Teams using IdeaFlow collect significantly more input than those relying on email or Slack threads.
              </p>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '1px', height: '4rem', background: 'rgba(0,0,0,0.07)' }} />
            </div>

            {/* Trust statement */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { icon: '🔒', text: 'Your data is private to your workspace' },
                { icon: '⚡', text: 'Live setup — invite your team in minutes' },
                { icon: '💳', text: 'No credit card needed to get started' },
              ].map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>{item.icon}</span>
                  <span style={{ fontSize: '0.8rem', color: '#2c4a6e', lineHeight: 1.45 }}>{item.text}</span>
                </div>
              ))}
            </div>

          </div>
        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PROBLEM SECTION — before How it works
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#f8f9fb', padding: 'clamp(4.5rem,8vw,6.5rem) 0', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <PageContainer>
          <div style={{ maxWidth: '34rem', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f97316', marginBottom: '1rem' }}>
              The problem
            </p>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(1.875rem, 3.4vw, 2.75rem)',
              letterSpacing: '-0.02em',
              color: '#0d1f35',
              lineHeight: 1.12,
            }}>
              Good ideas are dying before they reach you.
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                ),
                heading: 'Lost in Slack',
                body: 'A good idea lands in a busy channel, gets three reactions, and disappears by lunch. Nobody acts on it. Nobody follows up. The person who posted it stops bothering.',
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
                heading: 'Heard in 1:1s, nowhere else',
                body: 'Your most thoughtful people share ideas privately — to their direct manager, once. If that manager doesn\'t escalate it, the idea dies with the conversation.',
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                ),
                heading: 'Surveys nobody fills out',
                body: 'A quarterly survey with fifteen questions gets 30% completion. The results are averaged into mush. Nothing is actionable. The team learns that sharing doesn\'t change anything.',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.07)',
                  borderRadius: '1rem',
                  padding: '1.875rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
                  background: 'rgba(249,115,22,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f97316', marginBottom: '1.25rem',
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.625rem', letterSpacing: '-0.015em' }}>
                  {item.heading}
                </h3>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#7a9ab8' }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HOW IT WORKS — three steps + bottom CTA
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="how-it-works" style={{ background: '#ffffff', padding: 'clamp(5rem,9vw,7rem) 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <PageContainer>
          <div style={{ maxWidth: '32rem', marginBottom: '4rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f97316', marginBottom: '1rem' }}>
              How it works
            </p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.875rem, 3.2vw, 2.625rem)', letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.15 }}>
              From idea to action in three steps
            </h2>
          </div>

          <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0', borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
            {[
              {
                step: '01',
                title: 'Anyone posts an idea in seconds',
                body: 'No forms, no email threads, no suggestion box. Post an idea from any device in under 30 seconds. Everyone on the team can see and respond immediately.',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
              },
              {
                step: '02',
                title: 'The team votes on what matters',
                body: 'Colleagues vote for ideas they genuinely support. The most-liked ideas rise automatically — no committees, no politics, no interpretation needed.',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
              },
              {
                step: '03',
                title: 'You see exactly what to tackle next',
                body: 'A ranked, voted list means you skip the guesswork and start with what the team actually wants — backed by real numbers, not just the loudest voice in the room.',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '2.5rem 2.25rem',
                  background: '#ffffff',
                  borderRight: i < 2 ? '1px solid rgba(0,0,0,0.07)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <p style={{ position: 'absolute', top: '1rem', right: '1.25rem', fontSize: '4.5rem', fontWeight: 800, color: 'rgba(0,0,0,0.035)', fontVariantNumeric: 'tabular-nums', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', fontFamily: "'DM Sans', sans-serif" }}>
                  {s.step}
                </p>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(249,115,22,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', marginBottom: '1.375rem' }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.625rem', lineHeight: 1.3, letterSpacing: '-0.015em' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#7a9ab8' }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#9ab0c8' }}>
              Status tracking, manager accountability, built-in analytics and more.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/features" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f97316', textDecoration: 'none' }}>
                See all features →
              </Link>
              {!user && (
                <Link href="/auth" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.125rem' }}>
                  Start free — takes 10 minutes →
                </Link>
              )}
            </div>
          </div>
        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PRODUCT SCREENSHOTS — three feature callouts
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#f8f9fb', padding: 'clamp(5rem,9vw,7rem) 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <PageContainer>
          <div style={{ maxWidth: '32rem', marginBottom: '4rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f97316', marginBottom: '1rem' }}>
              The product
            </p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.875rem, 3.2vw, 2.625rem)', letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.15 }}>
              Built for the way real teams actually work
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>

            {/* Feature 1: Idea feed — text left, mockup right */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div style={{ maxWidth: '28rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.875rem' }}>Idea feed</p>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.2, marginBottom: '1rem' }}>
                  A ranked list of what your team actually wants
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#7a9ab8', marginBottom: '1.5rem' }}>
                  Ideas sort themselves by votes. The most supported ones rise to the top — no committees, no interpretation, no manager bias.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    'Ranked by real team votes',
                    'Updates in real time as people vote',
                    'Open to every member of the workspace',
                    'Status badges show which ideas are in motion',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: '#2c4a6e' }}>
                      <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '0.15rem', color: '#f97316' }}>
                        <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <IdeaFeedMockup />
            </div>

            {/* Feature 2: Review queue — mockup left, text right */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <ReviewQueueMockup />
              <div style={{ maxWidth: '28rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.875rem' }}>Manager accountability</p>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.2, marginBottom: '1rem' }}>
                  Nothing gets quietly ignored
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#7a9ab8', marginBottom: '1.5rem' }}>
                  A dedicated queue flags ideas waiting on a manager&apos;s response. Your team can see progress. Ideas don&apos;t disappear.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    'Review inbox highlights ideas waiting on you',
                    'Close the loop with a status update',
                    'Authors are notified when things move forward',
                    'No idea is ever silently dropped',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: '#2c4a6e' }}>
                      <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '0.15rem', color: '#f97316' }}>
                        <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 3: IdeaFlows selector — text left, mockup right */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div style={{ maxWidth: '28rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.875rem' }}>IdeaFlows</p>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.2, marginBottom: '1rem' }}>
                  Focused rounds for different questions
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#7a9ab8', marginBottom: '1.5rem' }}>
                  Run separate IdeaFlows for different teams or topics. Keep Q1 retrospective ideas separate from engineering process improvements. Open when ready, close when you have what you need.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {[
                    'Time-bounded rounds keep input fresh',
                    'Assign to the whole company or specific teams',
                    'Archive rounds without losing the history',
                    'Invite links let specific people join a round',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: '#2c4a6e' }}>
                      <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '0.15rem', color: '#f97316' }}>
                        <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <FlowSelectorMockup />
            </div>

          </div>
        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ANALYTICS SPOTLIGHT — updated headline
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(5rem,9vw,7rem) 0' }}>
        <PageContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '5rem', alignItems: 'center' }}>

          <div style={{ maxWidth: '29rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f97316', marginBottom: '0.875rem' }}>Analytics</p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.875rem, 3.2vw, 2.625rem)', letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.15, marginBottom: '1.375rem' }}>
              Know what your team wants to change — without asking them in a meeting
            </h2>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#7a9ab8', marginBottom: '2rem' }}>
              The built-in analytics panel gives leadership a live view of idea volume, team participation, and trending topics. It updates itself. No one has to write a report.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                'Track ideas and votes over time',
                'See which team members contribute most',
                'Monitor weekly activity at a glance',
                'Spot the top-ranked idea instantly',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#2c4a6e', fontWeight: 500 }}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, color: '#f97316' }}>
                    <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Analytics leaderboard card */}
          <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '1.25rem', padding: '1.875rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(26,107,191,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.2rem' }}>Most active members</p>
                <p style={{ fontSize: '0.72rem', color: '#9ab0c8' }}>Ranked by ideas submitted this month</p>
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>Live</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {[
                { name: 'Alex M.', role: 'Product', c: 8 },
                { name: 'Maria K.', role: 'Engineering', c: 6 },
                { name: 'Tom R.', role: 'Operations', c: 5 },
                { name: 'Sara L.', role: 'Design', c: 3 },
              ].map((x, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: i === 0 ? '#c2540a' : '#c8d8e8', fontVariantNumeric: 'tabular-nums', minWidth: '1.25rem' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontWeight: 600, color: '#0d1f35' }}>{x.name}</span>
                      <span style={{ fontSize: '0.72rem', color: '#9ab0c8' }}>{x.role}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#5a7fa8', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{x.c} ideas</span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(0,0,0,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(x.c / 8) * 100}%`, background: i === 0 ? '#f97316' : i === 1 ? 'rgba(249,115,22,0.50)' : 'rgba(249,115,22,0.25)', borderRadius: '9999px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PRICING
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="pricing" style={{ background: '#f8f9fb', borderTop: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(5rem,9vw,7rem) 0' }}>
        <PageContainer>
          <div style={{ maxWidth: '32rem', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f97316', marginBottom: '1rem' }}>
              Pricing
            </p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.875rem, 3.2vw, 2.625rem)', letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.15, marginBottom: '0.875rem' }}>
              Start free. Grow when you&apos;re ready.
            </h2>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: '#7a9ab8' }}>
              No credit card required to get started. Upgrade when your team outgrows the free tier.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', maxWidth: '52rem' }}>

            {/* Free */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '1.25rem', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.5rem' }}>Free trial</p>
                <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.5rem' }}>$0</p>
                <p style={{ fontSize: '0.825rem', color: '#9ab0c8' }}>No time limit on your trial</p>
              </div>

              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {[
                  'Up to 10 workspace members',
                  '1 active IdeaFlow at a time',
                  'Idea submission and voting',
                  'Comments on ideas',
                  'Basic workspace analytics',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: '#2c4a6e' }}>
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '0.15rem', color: '#f97316' }}>
                      <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </div>
                ))}
              </div>

              {!user ? (
                <Link href="/auth" style={{ display: 'block', textAlign: 'center', padding: '0.7rem 1rem', borderRadius: '0.625rem', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.875rem', fontWeight: 600, color: '#475569', textDecoration: 'none', transition: 'background 0.15s' }}>
                  Start free trial →
                </Link>
              ) : (
                <Link href="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '0.7rem 1rem', borderRadius: '0.625rem', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.875rem', fontWeight: 600, color: '#475569', textDecoration: 'none' }}>
                  Open dashboard →
                </Link>
              )}
            </div>

            {/* Pro */}
            <div style={{ background: '#0d1f35', border: '1px solid rgba(26,107,191,0.25)', borderRadius: '1.25rem', padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <div aria-hidden style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: 'radial-gradient(ellipse at top right, rgba(249,115,22,0.08), transparent 65%)', pointerEvents: 'none' }} />

              <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f97316' }}>Pro</p>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f97316', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '999px', padding: '0.1rem 0.4rem' }}>Popular</span>
                </div>
                <p style={{ fontSize: '2.25rem', fontWeight: 800, color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.5rem' }}>Custom</p>
                <p style={{ fontSize: '0.825rem', color: 'rgba(168,216,240,0.55)' }}>Priced for your team size</p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, position: 'relative', zIndex: 1 }}>
                {[
                  'Everything in Free',
                  'Unlimited members',
                  'Unlimited IdeaFlows',
                  'Full analytics dashboard',
                  'PDF report export',
                  'Admin controls and roles',
                  'Priority support',
                ].map((item, i) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: i === 0 ? 'rgba(168,216,240,0.55)' : 'rgba(168,216,240,0.85)', fontStyle: i === 0 ? 'italic' : 'normal' }}>
                    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: '0.15rem', color: '#f97316' }}>
                      <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {item}
                  </div>
                ))}
              </div>

              <Link href="/contact" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '0.7rem 1rem', fontSize: '0.875rem', textDecoration: 'none', position: 'relative', zIndex: 1 }}>
                Talk to us →
              </Link>
            </div>

          </div>

          <p style={{ marginTop: '1.75rem', fontSize: '0.8rem', color: '#9ab0c8' }}>
            Questions? <Link href="/contact" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 500 }}>Get in touch</Link> — we reply within one business day.
          </p>
        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FINAL CTA — rewritten headline
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="cta-dark" style={{ padding: 'clamp(5rem,10vw,8rem) 0' }}>
        <div style={{ maxWidth: '40rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p
            className="fade-up"
            style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.85)', marginBottom: '1.25rem' }}
          >
            Get started today
          </p>
          <h2
            className="fade-up fade-up-1"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)',
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
              color: 'rgba(255,255,255,0.96)',
              marginBottom: '1.25rem',
            }}
          >
            The best idea in your company<br />
            is waiting to be heard.
          </h2>
          <p className="fade-up fade-up-2" style={{ fontSize: '1rem', lineHeight: 1.75, color: 'rgba(168,216,240,0.68)', marginBottom: '2.75rem' }}>
            Set up a workspace in under 10 minutes. Invite your team. See what they&apos;re actually thinking.
          </p>
          <div className="fade-up fade-up-3" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!user ? (
              <Link href="/auth" className="btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}>
                Create your free workspace →
              </Link>
            ) : (
              <Link href="/dashboard" className="btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}>
                Open dashboard →
              </Link>
            )}
            <Link href="/contact" className="btn-ghost" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem', textDecoration: 'none' }}>
              Talk to us
            </Link>
          </div>
        </div>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER — pricing link added
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{ background: '#04091a', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 0' }}>
        <PageContainer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <LogoMark size={22} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em' }}>IdeaFlow</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)' }}>© {new Date().getFullYear()} IdeaFlow. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.75rem' }}>
            {([['Features', '/features'], ['Pricing', '/#pricing'], ['Contact', '/contact']] as [string, string][]).map(([label, href]) => (
              <a key={label} href={href} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 500 }}>
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
