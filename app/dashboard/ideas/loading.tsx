/**
 * /dashboard/ideas — lightweight loading state.
 *
 * Real "Ideas" heading + loading bar + form box outline + 2 idea rows.
 */
import PageLoadingIndicator from '@/components/PageLoadingIndicator'

const PAD = {
  paddingLeft:  'clamp(1.25rem, 4vw, 2.5rem)',
  paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
}

export default function IdeasLoading() {
  return (
    <div className="sk-enter" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Real sticky header ───────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(26,107,191,0.09)',
        position: 'sticky',
        top: 0,
        zIndex: 9,
      }}>
        <PageLoadingIndicator showLabel={false} />
        <div style={{ maxWidth: '80rem', margin: '0 auto', ...PAD, paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                Workspace
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', margin: 0 }}>
                Ideas
              </h1>
            </div>
            <PageLoadingIndicator label="Loading ideas…" />
          </div>
        </div>
      </div>

      {/* ── Compact content area ─────────────────────────────────── */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', width: '100%', ...PAD, paddingTop: '1.75rem', paddingBottom: '3rem' }}>

        {/* Form box outline */}
        <div style={{
          background: '#fff',
          border: '1px solid rgba(26,107,191,0.09)',
          borderRadius: '1.25rem',
          padding: '1.25rem',
          marginBottom: '1.25rem',
        }}>
          <div className="skeleton sk-h-sm" style={{ width: '26%', marginBottom: '0.75rem' }} />
          <div className="skeleton sk-h-input" style={{ width: '100%', borderRadius: '0.75rem' }} />
        </div>

        {/* 2 idea rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {[64, 50].map((tw, i) => (
            <div key={i} className="sk-idea-card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', width: '1.875rem', flexShrink: 0 }}>
                <div className="skeleton" style={{ width: '1.875rem', height: '1.75rem', borderRadius: '0.5rem' }} />
                <div className="skeleton sk-h-xs" style={{ width: '1rem' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="skeleton sk-h-sm" style={{ width: `${tw}%`, marginBottom: '0.4rem' }} />
                <div className="skeleton sk-h-xs" style={{ width: '75%' }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
