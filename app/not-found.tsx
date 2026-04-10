import Link from 'next/link'
import LogoMark from '@/components/LogoMark'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f4f8fc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background bloom */}
      <div aria-hidden style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 68%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '28rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            borderRadius: '1.25rem',
            background: 'rgba(249,115,22,0.08)',
            border: '1px solid rgba(249,115,22,0.16)',
            marginBottom: '1.5rem',
          }}
        >
          <LogoMark size={40} />
        </div>

        <p
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#c2540a',
            marginBottom: '0.5rem',
          }}
        >
          404 — Page not found
        </p>

        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
            letterSpacing: '-0.025em',
            color: '#0d1f35',
            lineHeight: 1.2,
            marginBottom: '1rem',
          }}
        >
          This page doesn&apos;t exist
        </h1>

        <p
          style={{
            fontSize: '0.925rem',
            lineHeight: 1.75,
            color: '#5a7fa8',
            marginBottom: '2rem',
          }}
        >
          The page you&apos;re looking for may have been moved, renamed, or never existed.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary" style={{ fontSize: '0.875rem' }}>
            Back to home
          </Link>
          <Link href="/dashboard" className="btn-ghost-dark" style={{ fontSize: '0.875rem' }}>
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
