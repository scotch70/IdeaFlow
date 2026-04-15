import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoMark from '@/components/LogoMark'
import PageContainer from '@/components/PageContainer'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8f9fb', minHeight: '100vh' }}>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO — dark editorial, amber glow, Instrument Serif italic
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
        {/* Layered glows */}
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
        {/* Dot-grid texture */}
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.75rem',
                padding: '0.3rem 0.875rem',
                borderRadius: '999px',
                background: 'rgba(249,115,22,0.12)',
                border: '1px solid rgba(249,115,22,0.28)',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(249,115,22,0.92)' }}>
                Idea management · Built for teams
              </span>
            </div>

            {/* Headline — Instrument Serif italic */}
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
              Stop sending surveys.<br />
              Start collecting ideas.{' '}
              <span
                style={{
                  background: 'linear-gradient(92deg, #f97316 10%, #fbbf24 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                IdeaFlow fixes that.
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
              Give every voice in your company a fair hearing. Post, vote, and act on what actually matters — without another meeting.
            </p>

            <div
              className="fade-up fade-up-3"
              style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
            >
              {!user ? (
                <>
                  <Link href="/auth" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.7rem 1.5rem' }}>
                    Start for free →
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
                <>
                  <Link href="/dashboard" className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.7rem 1.5rem' }}>
                    Open dashboard →
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
              )}
            </div>

            {/* Social proof strip */}
            <div
              className="fade-up fade-up-4"
              style={{
                marginTop: '2.5rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
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

          {/* ── Product mockup ── */}
          <div
            className="fade-up fade-up-2"
            style={{
              borderRadius: '1rem',
              overflow: 'hidden',
              background: '#ffffff',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 0 0 1px rgba(249,115,22,0.08), 0 20px 60px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.35)',
            }}
          >
            {/* Browser chrome */}
            <div style={{ background: '#f7f8fa', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {['#f87171','#fbbf24','#34d399'].map((c, i) => (
                  <div key={i} style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: c, opacity: 0.7 }} />
                ))}
              </div>
              <div style={{ flex: 1, marginLeft: '0.375rem', height: '1.25rem', borderRadius: '0.375rem', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#9ab0c8', letterSpacing: '0.03em' }}>ideaflow.app/dashboard</span>
              </div>
            </div>
            {/* Feed */}
            <div style={{ padding: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0d1f35', marginBottom: '0.1rem' }}>Company idea feed</p>
                  <p style={{ fontSize: '0.64rem', color: '#9ab0c8' }}>Sorted by team support</p>
                </div>
                <span style={{ borderRadius: '0.375rem', padding: '0.2rem 0.55rem', fontSize: '0.62rem', fontWeight: 600, background: 'rgba(16,185,129,0.08)', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span className="pulse-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#059669', display: 'inline-block', flexShrink: 0 }} />
                  Live
                </span>
              </div>
              {[
                { title: 'Let employees suggest improvements anonymously', tag: 'People & HR', likes: 31, active: true },
                { title: 'Better shift handover between teams', tag: 'Operations', likes: 24, active: false },
                { title: 'Show which ideas leadership has acted on', tag: 'Leadership', likes: 18, active: false },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                    borderRadius: '0.625rem', padding: '0.7rem 0.75rem', marginBottom: '0.4rem',
                    background: item.active ? 'rgba(249,115,22,0.04)' : '#f8f9fb',
                    border: `1px solid ${item.active ? 'rgba(249,115,22,0.14)' : 'rgba(0,0,0,0.05)'}`,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem', minWidth: '1.6rem', paddingTop: '0.1rem' }}>
                    <div style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.active ? 'rgba(249,115,22,0.10)' : 'rgba(0,0,0,0.04)' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill={item.active ? '#f97316' : 'none'} stroke={item.active ? '#f97316' : '#9ab0c8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: item.active ? '#f97316' : '#9ab0c8', fontVariantNumeric: 'tabular-nums' }}>{item.likes}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.4, color: '#0d1f35' }}>{item.title}</p>
                    <p style={{ marginTop: '0.2rem', fontSize: '0.6rem', color: '#9ab0c8' }}>{item.tag}</p>
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.6rem', color: '#b0c4d8' }}>3 new ideas today</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f97316' }} />
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#c2540a' }}>12 active members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HOW IT WORKS — clean white, numbered steps
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
                title: 'Employees submit ideas',
                body: 'Anyone on the team can post an idea in seconds — no forms, no friction. Ideas are visible to everyone in the workspace.',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
              },
              {
                step: '02',
                title: 'The team votes on what matters',
                body: 'Colleagues like the ideas they genuinely support. The most-liked ideas rise to the top automatically — no committees needed.',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
              },
              {
                step: '03',
                title: 'Leaders see what to act on',
                body: 'Managers get a clear, ranked view of what the team actually wants — backed by real votes, not just the loudest voice in the room.',
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
                {/* Faint step number watermark */}
                <p
                  style={{
                    position: 'absolute', top: '1rem', right: '1.25rem',
                    fontSize: '4.5rem', fontWeight: 800,
                    color: 'rgba(0,0,0,0.035)',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {s.step}
                </p>
                <div
                  style={{
                    width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
                    background: 'rgba(249,115,22,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#f97316', marginBottom: '1.375rem',
                  }}
                >
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

          {/* ── "See all features" nudge ── */}
          <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#9ab0c8' }}>
              Status tracking, manager accountability, outcomes, analytics and more.
            </p>
            <Link href="/features" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f97316', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              See all features →
            </Link>
          </div>
        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ANALYTICS SPOTLIGHT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: '#ffffff', borderTop: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(5rem,9vw,7rem) 0' }}>
        <PageContainer style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '5rem', alignItems: 'center' }}>

          <div style={{ maxWidth: '29rem' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f97316', marginBottom: '0.875rem' }}>Analytics</p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 'clamp(1.875rem, 3.2vw, 2.625rem)', letterSpacing: '-0.02em', color: '#0d1f35', lineHeight: 1.15, marginBottom: '1.375rem' }}>
              See what&apos;s happening across your workspace
            </h2>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#7a9ab8', marginBottom: '2rem' }}>
              The built-in analytics panel gives leadership a live view of idea volume, team participation, and trending topics — without asking anyone for a report.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                'Track ideas and likes over time',
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

          {/* Leaderboard card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: '1.25rem',
              padding: '1.875rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(26,107,191,0.07)',
            }}
          >
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
                    <div
                      style={{
                        height: '100%',
                        width: `${(x.c / 8) * 100}%`,
                        background: i === 0 ? '#f97316' : i === 1 ? 'rgba(249,115,22,0.50)' : 'rgba(249,115,22,0.25)',
                        borderRadius: '9999px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FINAL CTA
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
            Give your team a voice today
          </h2>
          <p className="fade-up fade-up-2" style={{ fontSize: '1rem', lineHeight: 1.75, color: 'rgba(168,216,240,0.68)', marginBottom: '2.75rem' }}>
            Create a free workspace and start collecting ideas in minutes. No credit card required.
          </p>
          <div className="fade-up fade-up-3" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!user ? (
              <Link href="/auth" className="btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}>
                Get started free →
              </Link>
            ) : (
              <Link href="/dashboard" className="btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}>
                Open dashboard →
              </Link>
            )}
            <Link href="/contact" className="btn-ghost" style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem', textDecoration: 'none' }}>
              Contact us
            </Link>
          </div>
        </div>
      </section>


      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{ background: '#04091a', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem 0' }}>
        <PageContainer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <LogoMark size={22} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em' }}>IdeaFlow</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)' }}>© {new Date().getFullYear()} IdeaFlow. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.75rem' }}>
            {([['Home', '/'], ['Features', '/features'], ['Contact', '/contact']] as [string, string][]).map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}>
                {label}
              </Link>
            ))}
          </div>
        </PageContainer>
      </footer>

    </main>
  )
}
