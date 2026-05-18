/**
 * Dashboard home loading skeleton.
 *
 * Structure mirrors dashboard/page.tsx:
 *   welcome heading → metrics strip → IdeaFlow banner → new-idea form → idea cards
 *
 * Uses shared skeleton classes from globals.css (.skeleton, .sk-*, etc.)
 */
export default function DashboardLoading() {
  return (
    <main>
      {/* PageContainer equivalent — max-w-7xl px-6 lg:px-10 */}
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: '80rem',
          paddingLeft:  'clamp(1.25rem, 4vw, 2.5rem)',
          paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
          paddingTop:   '2.5rem',
          paddingBottom: '3rem',
        }}
      >

        {/* ── Welcome heading ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 'clamp(1.75rem, 4vw, 2.75rem)' }}>
          <div className="skeleton sk-h-xl" style={{ width: '44%', marginBottom: '0.625rem' }} />
          <div className="skeleton sk-h-sm" style={{ width: '36%' }} />
        </div>

        {/* ── Metrics strip — 3 pills ─────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}
        >
          {[0, 1, 2].map(i => (
            <div key={i} className="sk-metric-card">
              <div className="skeleton sk-h-xs" style={{ width: '55%', marginBottom: '0.5rem' }} />
              <div className="skeleton sk-h-lg" style={{ width: '38%' }} />
            </div>
          ))}
        </div>

        {/* ── IdeaFlow round banner ────────────────────────────────────── */}
        <div
          style={{
            background: '#fff',
            border: '1px solid rgba(26,107,191,0.10)',
            borderRadius: '0.875rem',
            padding: '0.875rem 1.125rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="skeleton sk-h-xs" style={{ width: '28%', marginBottom: '0.45rem', borderRadius: '999px' }} />
            <div className="skeleton sk-h-md" style={{ width: '55%', marginBottom: '0.35rem' }} />
            <div className="skeleton sk-h-xs" style={{ width: '38%' }} />
          </div>
          <div className="skeleton sk-h-btn" style={{ width: '5rem', borderRadius: '0.4rem', flexShrink: 0 }} />
        </div>

        {/* ── New-idea form box ────────────────────────────────────────── */}
        <div
          style={{
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: '0.875rem',
            padding: '1.25rem',
            marginBottom: '1rem',
          }}
        >
          <div className="skeleton sk-h-sm" style={{ width: '30%', marginBottom: '0.875rem' }} />
          <div className="skeleton sk-h-input" style={{ width: '100%', borderRadius: '0.625rem' }} />
        </div>

        {/* ── Idea list label ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div className="skeleton sk-h-xs" style={{ width: '20%' }} />
          <div className="skeleton sk-h-xs" style={{ width: '8%' }} />
        </div>

        {/* ── Idea cards ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {([70, 56, 64] as const).map((tw, i) => (
            <div key={i} className="sk-idea-card">
              {/* Like column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', paddingTop: '0.1rem', width: '1.875rem', flexShrink: 0 }}>
                <div className="skeleton" style={{ width: '1.875rem', height: '1.75rem', borderRadius: '0.5rem' }} />
                <div className="skeleton sk-h-xs" style={{ width: '1.1rem' }} />
              </div>
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '1rem' }}>
                  <div className="skeleton sk-h-sm" style={{ width: `${tw}%` }} />
                  <div className="skeleton" style={{ height: '1.25rem', width: '4rem', borderRadius: '999px', flexShrink: 0 }} />
                </div>
                {i < 2 && <div className="skeleton sk-h-xs" style={{ width: i === 0 ? '88%' : '72%', marginBottom: '0.35rem' }} />}
                {i === 1 && <div className="skeleton sk-h-xs" style={{ width: '60%', marginBottom: '0.35rem' }} />}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.45rem' }}>
                  <div className="skeleton sk-h-xs" style={{ width: '3.5rem' }} />
                  <div className="skeleton sk-h-xs" style={{ width: '2rem' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
