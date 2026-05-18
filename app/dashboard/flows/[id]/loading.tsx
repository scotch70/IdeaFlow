/**
 * /dashboard/flows/[id] loading skeleton.
 *
 * Structure mirrors the admin view of flows/[id]/page.tsx:
 *   sticky header (breadcrumb + title + status badge) →
 *   two-column body: idea list (left) + admin panel (right)
 *
 * On mobile the right column collapses, matching the responsive grid.
 */
export default function FlowDetailLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <div className="sk-page-header" style={{ flexShrink: 0 }}>
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: '80rem',
            paddingLeft: 'clamp(1.25rem, 4vw, 2.5rem)',
            paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
            paddingTop: '1rem',
            paddingBottom: '1rem',
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.4rem' }}>
            <div className="skeleton sk-h-xs" style={{ width: '4rem' }} />
            <div className="skeleton sk-h-xs" style={{ width: '0.5rem' }} />
            <div className="skeleton sk-h-xs" style={{ width: '7rem' }} />
          </div>
          {/* Title + badge row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div className="skeleton sk-h-lg" style={{ width: '12rem' }} />
              <div className="skeleton" style={{ height: '1.25rem', width: '4rem', borderRadius: '999px' }} />
            </div>
            <div className="skeleton sk-h-xs" style={{ width: '5rem' }} />
          </div>
        </div>
      </div>

      {/* ── Main body ──────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: '80rem',
            paddingLeft: 'clamp(1.25rem, 4vw, 2.5rem)',
            paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
            paddingTop: '2rem',
            paddingBottom: '3rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 380px',
              gap: '3rem',
              alignItems: 'start',
            }}
            className="flow-detail-grid"
          >

            {/* ── Left: idea list ──────────────────────────────────────── */}
            <div>
              {/* New-idea form box */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.07)',
                  borderRadius: '1.25rem',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div className="skeleton sk-h-sm" style={{ width: '32%', marginBottom: '0.875rem' }} />
                <div className="skeleton sk-h-input" style={{ width: '100%', borderRadius: '0.625rem' }} />
              </div>

              {/* Idea list header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div className="skeleton sk-h-xs" style={{ width: '22%' }} />
                <div className="skeleton sk-h-xs" style={{ width: '8%' }} />
              </div>

              {/* Idea cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {([68, 55, 62] as const).map((tw, i) => (
                  <div key={i} className="sk-idea-card">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', paddingTop: '0.1rem', width: '1.875rem', flexShrink: 0 }}>
                      <div className="skeleton" style={{ width: '1.875rem', height: '1.75rem', borderRadius: '0.5rem' }} />
                      <div className="skeleton sk-h-xs" style={{ width: '1.1rem' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '1rem' }}>
                        <div className="skeleton sk-h-sm" style={{ width: `${tw}%` }} />
                        <div className="skeleton" style={{ height: '1.25rem', width: '4rem', borderRadius: '999px', flexShrink: 0 }} />
                      </div>
                      {i < 2 && <div className="skeleton sk-h-xs" style={{ width: '84%', marginBottom: '0.35rem' }} />}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.45rem' }}>
                        <div className="skeleton sk-h-xs" style={{ width: '3.5rem' }} />
                        <div className="skeleton sk-h-xs" style={{ width: '2rem' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: admin panel ────────────────────────────────────── */}
            <div
              style={{ position: 'sticky', top: 'calc(4rem + 1px)' }}
              className="flow-admin-panel-skeleton"
            >
              <div
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.07)',
                  borderRadius: '1rem',
                  padding: '1.375rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {/* Panel header */}
                <div>
                  <div className="skeleton sk-h-xs" style={{ width: '40%', marginBottom: '0.5rem' }} />
                  <div className="skeleton sk-h-md" style={{ width: '70%' }} />
                </div>
                {/* Fields */}
                {[0, 1, 2].map(i => (
                  <div key={i}>
                    <div className="skeleton sk-h-xs" style={{ width: '35%', marginBottom: '0.375rem' }} />
                    <div className="skeleton sk-h-input" style={{ width: '100%', borderRadius: '0.5rem' }} />
                  </div>
                ))}
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
                  <div className="skeleton sk-h-btn" style={{ flex: 1, borderRadius: '0.5rem' }} />
                  <div className="skeleton sk-h-btn" style={{ width: '4rem', borderRadius: '0.5rem' }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Hide right column on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .flow-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .flow-admin-panel-skeleton {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
