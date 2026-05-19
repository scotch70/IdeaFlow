/**
 * /dashboard/flows — lightweight loading state.
 *
 * Shows the REAL page title (we know it's "IdeaFlows" without server data)
 * + a loading bar + 3 compact flow card outlines in the auto-fill grid.
 */
import PageLoadingIndicator from '@/components/PageLoadingIndicator'

const PAD = {
  paddingLeft:  'clamp(1.25rem, 4vw, 2.5rem)',
  paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
}

export default function FlowsLoading() {
  return (
    <div
      className="sk-enter"
      style={{ display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}
    >

      {/* ── Real sticky header — no skeletons needed ─────────────── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(26,107,191,0.09)',
        position: 'sticky',
        top: 0,
        zIndex: 9,
        flexShrink: 0,
      }}>
        {/* Loading bar lives at the very top of the header */}
        <PageLoadingIndicator showLabel={false} />

        <div style={{ maxWidth: '80rem', margin: '0 auto', ...PAD, paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                Workspace
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', margin: 0 }}>
                IdeaFlows
              </h1>
            </div>
            {/* Muted button placeholder — same size as real button */}
            <div className="skeleton sk-h-btn" style={{ width: '8.5rem', borderRadius: '0.5rem', opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {/* ── 3 flow card skeletons ────────────────────────────────── */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', width: '100%', ...PAD, paddingTop: '2rem', paddingBottom: '3rem' }}>

        <div className="skeleton sk-h-xs" style={{ width: '5rem', marginBottom: '0.875rem' }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
          gap: '0.875rem',
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="sk-flow-card" style={{ minHeight: '9rem', gap: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ height: '1.25rem', width: '4rem', borderRadius: '999px' }} />
                <div className="skeleton sk-h-xs" style={{ width: '2rem' }} />
              </div>
              <div className="skeleton sk-h-md" style={{ width: i === 0 ? '70%' : i === 1 ? '58%' : '65%' }} />
              <div className="skeleton sk-h-xs" style={{ width: '88%' }} />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
