/**
 * /dashboard/flows/[id] — lightweight loading state.
 *
 * We know the route is "a flow detail" but not the name — so we show a
 * minimal header placeholder + loading bar + 2 idea row skeletons on the
 * left, and a compact panel outline on the right (desktop only).
 */
import PageLoadingIndicator from '@/components/PageLoadingIndicator'

const PAD = {
  paddingLeft:  'clamp(1.25rem, 4vw, 2.5rem)',
  paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
}

export default function FlowDetailLoading() {
  return (
    <div
      className="sk-enter"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'DM Sans', sans-serif" }}
    >

      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(26,107,191,0.09)',
        flexShrink: 0,
      }}>
        <PageLoadingIndicator showLabel={false} />
        <div style={{ maxWidth: '80rem', margin: '0 auto', ...PAD, paddingTop: '1rem', paddingBottom: '1rem' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>IdeaFlows</span>
            <span style={{ fontSize: '0.75rem', color: '#c8d6e5' }}>/</span>
            <div className="skeleton sk-h-xs" style={{ width: '7rem' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div className="skeleton sk-h-lg" style={{ width: '11rem' }} />
              <div className="skeleton" style={{ height: '1.25rem', width: '3.75rem', borderRadius: '999px' }} />
            </div>
            <PageLoadingIndicator label="Loading flow…" />
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', width: '100%', ...PAD, paddingTop: '2rem', paddingBottom: '3rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 380px',
            gap: '3rem',
            alignItems: 'start',
          }}
            className="flow-detail-loading-grid"
          >

            {/* Left — 2 idea card outlines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[62, 50].map((tw, i) => (
                <div key={i} className="sk-idea-card">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', width: '1.875rem', flexShrink: 0 }}>
                    <div className="skeleton" style={{ width: '1.875rem', height: '1.75rem', borderRadius: '0.5rem' }} />
                    <div className="skeleton sk-h-xs" style={{ width: '1rem' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="skeleton sk-h-sm" style={{ width: `${tw}%`, marginBottom: '0.4rem' }} />
                    <div className="skeleton sk-h-xs" style={{ width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Right — compact admin panel outline (hidden on mobile) */}
            <div className="flow-detail-loading-panel">
              <div style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.07)',
                borderRadius: '1rem',
                padding: '1.375rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}>
                <div className="skeleton sk-h-md" style={{ width: '55%' }} />
                <div className="skeleton sk-h-input" style={{ width: '100%', borderRadius: '0.5rem' }} />
                <div className="skeleton sk-h-input" style={{ width: '100%', borderRadius: '0.5rem' }} />
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
                  <div className="skeleton sk-h-btn" style={{ flex: 1, borderRadius: '0.5rem' }} />
                  <div className="skeleton sk-h-btn" style={{ width: '4rem', borderRadius: '0.5rem' }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .flow-detail-loading-grid  { grid-template-columns: 1fr !important; }
          .flow-detail-loading-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
