import SiteHeader from '@/components/SiteHeader'
import DemoWorkspace from './DemoWorkspace'

export const metadata = { title: 'Live Demo — IdeaFlow' }

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
            You're exploring a demo workspace — <strong style={{ color: '#e8b77e' }}>Meridian Labs</strong>. No sign-up needed.
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

      <DemoWorkspace />
    </div>
  )
}
