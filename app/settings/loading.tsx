/**
 * /settings — lightweight loading state.
 *
 * Shows the real "Account settings" heading (statically known) +
 * a loading bar + a single compact profile card outline.
 * No account card or plan card skeletons — less visual noise.
 */
import PageLoadingIndicator from '@/components/PageLoadingIndicator'

const PAD = {
  paddingLeft:  'clamp(1.25rem, 4vw, 2.5rem)',
  paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
}

const NARROW = { maxWidth: '48rem', margin: '0 auto', width: '100%' }

export default function SettingsLoading() {
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
        <div style={{ ...NARROW, ...PAD, paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                Workspace
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', margin: 0 }}>
                Account settings
              </h1>
            </div>
            <PageLoadingIndicator label="Loading settings…" />
          </div>
        </div>
      </div>

      {/* ── Compact content area ─────────────────────────────────── */}
      <div style={{ ...NARROW, ...PAD, paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* Profile card — avatar + 2 lines only */}
        <div style={{
          background: '#fff',
          border: '1px solid rgba(26,107,191,0.10)',
          borderRadius: '1.25rem',
          padding: '1.75rem',
          boxShadow: '0 2px 12px rgba(6,14,38,0.05)',
        }}>
          <div className="skeleton sk-h-xs" style={{ width: '3.5rem', marginBottom: '1.25rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="skeleton" style={{ width: '3.75rem', height: '3.75rem', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="skeleton sk-h-md" style={{ width: '45%', marginBottom: '0.45rem' }} />
              <div className="skeleton sk-h-xs" style={{ width: '62%' }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
