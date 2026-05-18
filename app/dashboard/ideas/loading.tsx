/**
 * /dashboard/ideas loading skeleton.
 *
 * Structure mirrors ideas/page.tsx:
 *   sticky header → new-idea form → idea list with filter tabs
 */
export default function IdeasLoading() {
  return (
    <div>
      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <div className="sk-page-header">
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: '80rem',
            paddingLeft: 'clamp(1.25rem, 4vw, 2.5rem)',
            paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
            paddingTop: '1.125rem',
            paddingBottom: '1.125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div className="skeleton sk-h-xs" style={{ width: '4.5rem', marginBottom: '0.375rem' }} />
              <div className="skeleton sk-h-lg" style={{ width: '5rem' }} />
            </div>
            <div className="skeleton sk-h-sm" style={{ width: '4rem' }} />
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main>
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: '80rem',
            paddingLeft: 'clamp(1.25rem, 4vw, 2.5rem)',
            paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
            paddingTop: '1.75rem',
            paddingBottom: '3rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* New-idea form */}
            <div
              style={{
                background: '#fff',
                border: '1px solid rgba(26,107,191,0.11)',
                borderRadius: '1.25rem',
                padding: '1.25rem',
              }}
            >
              <div className="skeleton sk-h-sm" style={{ width: '28%', marginBottom: '0.875rem' }} />
              <div className="skeleton sk-h-input" style={{ width: '100%', borderRadius: '0.75rem' }} />
            </div>

            {/* Idea list — header + filter tabs + cards */}
            <div>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                <div className="skeleton sk-h-xs" style={{ width: '22%' }} />
                <div className="skeleton sk-h-xs" style={{ width: '6%' }} />
              </div>
              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.875rem' }}>
                {['5rem', '4rem', '5.5rem'].map((w, i) => (
                  <div key={i} className="skeleton" style={{ height: '1.5rem', width: w, borderRadius: '0.375rem' }} />
                ))}
              </div>
              {/* Idea cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {([66, 52, 70, 58] as const).map((tw, i) => (
                  <div key={i} className="sk-idea-card">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', paddingTop: '0.1rem', width: '1.875rem', flexShrink: 0 }}>
                      <div className="skeleton" style={{ width: '1.875rem', height: '1.75rem', borderRadius: '0.5rem' }} />
                      <div className="skeleton sk-h-xs" style={{ width: '1.1rem' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '1rem' }}>
                        <div className="skeleton sk-h-sm" style={{ width: `${tw}%` }} />
                        <div className="skeleton" style={{ height: '1.25rem', width: '3.75rem', borderRadius: '999px', flexShrink: 0 }} />
                      </div>
                      {i % 2 === 0 && <div className="skeleton sk-h-xs" style={{ width: '80%', marginBottom: '0.35rem' }} />}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.45rem' }}>
                        <div className="skeleton sk-h-xs" style={{ width: '3.5rem' }} />
                        <div className="skeleton sk-h-xs" style={{ width: '2rem' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
