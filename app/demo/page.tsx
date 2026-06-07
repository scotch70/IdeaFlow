import SiteHeader from '@/components/SiteHeader'
import DemoSwitcher from './DemoSwitcher'

export const metadata = {
  title: 'Try the brainstorming software demo',
  description:
    'Click through a live demo of IdeaFlow — the team brainstorming tool that turns ideas into decisions. No sign-up needed.',
}

export default function DemoPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <SiteHeader />

      {/* Demo banner */}
      <div style={{
        background: 'linear-gradient(90deg, #1f2330 0%, #2d3348 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0.6rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '1.25rem', height: '1.25rem',
            background: 'rgba(201,139,95,0.2)', borderRadius: '50%',
            fontSize: '0.6rem',
          }}>✦</span>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
            Try your own <strong style={{ color: '#e8b77e' }}>Brainstorm Session</strong>. No sign-up needed.
          </span>
        </div>
        <a
          href="/auth?mode=signup"
          style={{
            display: 'inline-flex', alignItems: 'center',
            fontSize: '0.75rem', fontWeight: 600,
            color: '#1f2330',
            background: '#e8b77e',
            borderRadius: '6px',
            padding: '0.3rem 0.75rem',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Start free →
        </a>
      </div>

      {/* Page H1 — small, above the switcher. Present primarily so the demo
          page has a proper indexable headline + supporting sentence (the
          embedded demo content otherwise carries the only large heading). */}
      <div
        style={{
          maxWidth: '40rem',
          margin: '0 auto',
          padding: '1.5rem 1rem 0.5rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0d1f35',
            letterSpacing: '-0.02em',
            marginBottom: '0.35rem',
          }}
        >
          Try the IdeaFlow demo
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#5d667a', lineHeight: 1.6 }}>
          A live preview of the team brainstorming tool — explore the workspace
          and run a Brainstorm Circle without signing up.
        </p>
      </div>

      <DemoSwitcher />
    </div>
  )
}
