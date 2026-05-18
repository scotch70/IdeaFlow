/**
 * /dashboard/flows loading skeleton.
 *
 * Structure mirrors flows/page.tsx:
 *   sticky header (title + "New IdeaFlow" button) →
 *   section label → responsive grid of flow cards
 */
export default function FlowsLoading() {
  return (
    <div>
      {/* ── Sticky page header ───────────────────────────────────────────── */}
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
              <div className="skeleton sk-h-lg" style={{ width: '8rem' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="skeleton sk-h-sm" style={{ width: '3.5rem' }} />
              <div className="skeleton sk-h-btn" style={{ width: '8rem', borderRadius: '0.5rem' }} />
            </div>
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
            paddingTop: '2rem',
            paddingBottom: '3rem',
          }}
        >
          {/* Active section */}
          <FlowSectionSkeleton cardCount={3} />

          {/* Draft section */}
          <div style={{ marginTop: '2rem' }}>
            <FlowSectionSkeleton cardCount={2} />
          </div>
        </div>
      </main>
    </div>
  )
}

function FlowSectionSkeleton({ cardCount }: { cardCount: number }) {
  return (
    <div>
      {/* Section label */}
      <div className="skeleton sk-h-xs" style={{ width: '6rem', marginBottom: '0.875rem' }} />

      {/* Flow card grid — mirrors the real auto-fill grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
          gap: '0.875rem',
        }}
      >
        {Array.from({ length: cardCount }).map((_, i) => (
          <div key={i} className="sk-flow-card">
            {/* Status pill */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="skeleton" style={{ height: '1.25rem', width: '4.5rem', borderRadius: '999px' }} />
              <div className="skeleton sk-h-xs" style={{ width: '2.5rem' }} />
            </div>
            {/* Title */}
            <div className="skeleton sk-h-md" style={{ width: i === 0 ? '72%' : i === 1 ? '60%' : '68%' }} />
            {/* Description lines */}
            <div>
              <div className="skeleton sk-h-xs" style={{ width: '92%', marginBottom: '0.3rem' }} />
              {i < 2 && <div className="skeleton sk-h-xs" style={{ width: '75%' }} />}
            </div>
            {/* Meta row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="skeleton sk-h-xs" style={{ width: '3.5rem' }} />
              <div className="skeleton sk-h-xs" style={{ width: '3rem' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
