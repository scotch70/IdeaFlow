import Link from 'next/link'
import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import PageContainer from '@/components/PageContainer'
import AboutHero from './AboutHero'
import AnimatedCard from './AnimatedCard'

export const metadata: Metadata = {
  title: 'About IdeaFlow — Collect ideas, run sessions, decide together',
  description:
    'Learn why IdeaFlow helps teams collect ideas, run brainstorming sessions, and make clearer decisions together.',
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: '#6b7799', opacity: 0.75,
      marginBottom: '0.625rem',
    }}>
      {children}
    </p>
  )
}

const DIVIDER = { borderTop: '1px solid rgba(0,0,0,0.06)' } as const

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9f9f8', minHeight: '100vh' }}>

        {/* ── HERO ─────────────────────────────────────────────────────────────
            AboutHero is 'use client' so the headline / subtext / CTAs animate
            in on mount. Subtle fade-up — not a performance, just polish.
        ────────────────────────────────────────────────────────────────────── */}
        <section style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: 'clamp(4rem,8vw,6rem) 0' }}>
          <PageContainer>
            <AboutHero />
          </PageContainer>
        </section>

        {/* ── THE PROBLEM ─────────────────────────────────────────────────────── */}
        <section style={{ background: '#f9f9f8', padding: 'clamp(3.5rem,6vw,5rem) 0', ...DIVIDER }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '3rem' }}>
              <Overline>The problem</Overline>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.5rem, 2.8vw, 2.125rem)',
                letterSpacing: '-0.02em', color: '#1c1f2e',
                lineHeight: 1.2, marginBottom: '1rem',
              }}>
                Ideas get lost in the noise
              </h2>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#6b7799' }}>
                Most teams have no shortage of ideas. They have a shortage of good places to
                put them. Slack threads go cold. Meeting notes never get revisited. Surveys
                collect responses that nobody acts on. The result: your team&apos;s best thinking
                never makes it into a decision.
              </p>
            </div>

            {/*
              Problem cards — stagger in on scroll.
              Three items, 0.08 s apart. Each "lands" as you read down,
              reinforcing the list structure without overwhelming.
              The outer grid wrapper is a plain div so overflow:hidden
              and the 1px gap trick work correctly.
            */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1px',
              background: 'rgba(0,0,0,0.07)',
              borderRadius: '1.25rem',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.07)',
            }}>
              {[
                {
                  label: 'Slack & chat',
                  body: "Ideas posted in channels get buried within hours. There's no way to vote, prioritise, or follow up.",
                },
                {
                  label: 'Meetings',
                  body: 'Workshop energy fades fast. Without a structured outcome, even the best session produces nothing actionable.',
                },
                {
                  label: 'Surveys & forms',
                  body: 'Collecting responses is easy. Deciding what to do with 200 answers — and telling people what happened — is not.',
                },
              ].map((item, i) => (
                <AnimatedCard
                  key={item.label}
                  delay={i * 0.08}
                  style={{
                    padding: '1.75rem 2rem', background: '#ffffff',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  }}
                >
                  <p style={{
                    fontSize: '0.9375rem', fontWeight: 700,
                    color: '#1c1f2e', letterSpacing: '-0.01em',
                    marginBottom: '0.25rem',
                  }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '0.855rem', lineHeight: 1.7, color: '#6b7799' }}>
                    {item.body}
                  </p>
                </AnimatedCard>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* ── WHAT IDEAFLOW DOES ───────────────────────────────────────────────── */}
        <section style={{ background: '#ffffff', padding: 'clamp(3.5rem,6vw,5rem) 0', ...DIVIDER }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '3rem' }}>
              <Overline>What IdeaFlow does</Overline>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.5rem, 2.8vw, 2.125rem)',
                letterSpacing: '-0.02em', color: '#1c1f2e',
                lineHeight: 1.2, marginBottom: '1rem',
              }}>
                From idea to decision — without the noise
              </h2>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#6b7799' }}>
                IdeaFlow gives every teammate a way to contribute, and gives leadership a clear
                signal about what the team cares about most.
              </p>
            </div>

            {/*
              Feature cards — static. Five items in a wrapping grid stagger
              unpredictably across breakpoints and add no narrative value.
            */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1px',
              background: 'rgba(0,0,0,0.07)',
              borderRadius: '1.25rem',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.07)',
            }}>
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  ),
                  title: 'Collect ideas',
                  body: 'Any team member can submit an idea in seconds. No forms, no friction — just a place where good thinking is captured.',
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                  ),
                  title: 'Vote on priorities',
                  body: 'Democratic voting surfaces what the team genuinely cares about. The most-supported ideas rise to the top automatically.',
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 8v4l3 3"/>
                    </svg>
                  ),
                  title: 'Run Brainstorm Circle',
                  body: 'A structured session format where everyone adds ideas in rounds — no one dominates, no idea gets dismissed too early.',
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ),
                  title: 'Run Starbursting',
                  body: 'Question-first exploration that challenges assumptions and uncovers angles your team would otherwise miss.',
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  ),
                  title: 'Export decisions',
                  body: 'Every session ends with a written summary you can share. Nothing gets lost between the room and the roadmap.',
                },
              ].map((f) => (
                <div key={f.title} style={{
                  padding: '2rem', background: '#ffffff',
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
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1c1f2e', letterSpacing: '-0.01em' }}>
                    {f.title}
                  </p>
                  <p style={{ fontSize: '0.855rem', lineHeight: 1.7, color: '#6b7799' }}>
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* ── WHO IT IS FOR ───────────────────────────────────────────────────── */}
        <section style={{ background: '#f9f9f8', padding: 'clamp(3.5rem,6vw,5rem) 0', ...DIVIDER }}>
          <PageContainer>
            <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 auto', maxWidth: '22rem' }}>
                <Overline>Who it&apos;s for</Overline>
                <h2 style={{
                  fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                  fontSize: 'clamp(1.5rem, 2.8vw, 2.125rem)',
                  letterSpacing: '-0.02em', color: '#1c1f2e',
                  lineHeight: 1.2, marginBottom: '1rem',
                }}>
                  Built for teams that decide together
                </h2>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#6b7799' }}>
                  IdeaFlow works best in small-to-medium teams where everyone&apos;s
                  contribution matters — and where leadership wants a real signal, not just
                  the loudest voice.
                </p>
              </div>

              <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(0,0,0,0.07)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.07)' }}>
                {[
                  {
                    label: 'Startup founders',
                    body: "You need product input from the whole team, not just whoever speaks loudest in the all-hands.",
                  },
                  {
                    label: 'Product teams',
                    body: 'Structured sessions and voting give you a defensible prioritisation signal — not just gut instinct.',
                  },
                  {
                    label: 'Agencies',
                    body: 'Run client workshops, retrospectives, and creative sessions with a shared canvas that produces a clear output.',
                  },
                  {
                    label: 'Small teams',
                    body: "You don't need a heavyweight enterprise tool. IdeaFlow is focused, fast to set up, and actually used.",
                  },
                ].map((item) => (
                  <div key={item.label} style={{
                    padding: '1.5rem 1.75rem', background: '#ffffff',
                    display: 'flex', flexDirection: 'column', gap: '0.375rem',
                  }}>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1c1f2e', letterSpacing: '-0.01em' }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: '0.855rem', lineHeight: 1.7, color: '#6b7799' }}>
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </PageContainer>
        </section>

        {/* ── WHY DIFFERENT ───────────────────────────────────────────────────── */}
        <section style={{ background: '#ffffff', padding: 'clamp(3.5rem,6vw,5rem) 0', ...DIVIDER }}>
          <PageContainer>
            <div style={{ maxWidth: '38rem', marginBottom: '3rem' }}>
              <Overline>Why we&apos;re different</Overline>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.5rem, 2.8vw, 2.125rem)',
                letterSpacing: '-0.02em', color: '#1c1f2e',
                lineHeight: 1.2, marginBottom: '1rem',
              }}>
                Focused on decisions, not conversation
              </h2>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.8, color: '#6b7799' }}>
                Most team tools optimise for more communication. IdeaFlow optimises for
                fewer, clearer decisions.
              </p>
            </div>

            {/*
              Differentiator cards — stagger in on scroll.
              Three contrast statements, each landing individually so the reader
              absorbs "not X" before moving to the next. The positioning argument
              earns the sequential reveal.
            */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}>
              {[
                {
                  contrast: 'Not another chat tool',
                  body: "Chat is great for real-time coordination. It's terrible for ideas that need time to breathe, gather support, and get acted on. IdeaFlow is asynchronous by design.",
                },
                {
                  contrast: 'Not another infinite canvas',
                  body: "Whiteboards are great for exploration. They're hard to close. IdeaFlow sessions have a defined structure and a written outcome — so every session ends with something.",
                },
                {
                  contrast: 'Built around decisions',
                  body: "Every feature — voting, sessions, status tracking, exports — is designed to move ideas toward a concrete decision. That's the only metric that matters.",
                },
              ].map((item, i) => (
                <AnimatedCard
                  key={item.contrast}
                  delay={i * 0.1}
                  style={{
                    padding: '1.75rem 2rem',
                    background: '#f9f9f8',
                    border: '1px solid rgba(0,0,0,0.07)',
                    borderRadius: '1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  }}
                >
                  <p style={{
                    fontSize: '0.9375rem', fontWeight: 700,
                    color: '#1c1f2e', letterSpacing: '-0.01em',
                  }}>
                    {item.contrast}
                  </p>
                  <p style={{ fontSize: '0.855rem', lineHeight: 1.7, color: '#6b7799' }}>
                    {item.body}
                  </p>
                </AnimatedCard>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* ── CTA — static. Visual weight carries it; motion would be noise. ─── */}
        <section style={{ background: '#1c1f2e', padding: 'clamp(3.5rem,6vw,5rem) 0' }}>
          <PageContainer>
            <div style={{ maxWidth: '32rem' }}>
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
                fontSize: 'clamp(1.5rem, 2.8vw, 2.125rem)',
                letterSpacing: '-0.02em', color: '#ffffff',
                lineHeight: 1.2, marginBottom: '0.875rem',
              }}>
                Ready to stop losing good ideas?
              </h2>
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', marginBottom: '2rem' }}>
                IdeaFlow is free to try — no credit card, no setup call, no enterprise sales process.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/auth?mode=signup" style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '0.625rem 1.25rem',
                  background: '#ffffff', color: '#1c1f2e',
                  borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 700,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}>
                  Try IdeaFlow free
                </Link>
                <Link href="/demo" style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '0.625rem 1.25rem',
                  border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)',
                  borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                  background: 'transparent',
                }}>
                  See the demo
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>

      </main>
    </>
  )
}
