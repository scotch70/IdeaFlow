/**
 * Dashboard home — lightweight loading state.
 *
 * Philosophy:
 *   - Real header text (no skeleton on content we know statically)
 *   - Slim progress bar signals activity without dominating the screen
 *   - 2–3 compact skeleton rows; no full-height page replica
 *   - Fades in so the transition feels smooth, not jarring
 */
import PageLoadingIndicator from '@/components/PageLoadingIndicator'

const PAD = {
  paddingLeft:  'clamp(1.25rem, 4vw, 2.5rem)',
  paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
}

export default function DashboardLoading() {
  return (
    <div className="sk-enter" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Loading bar — top of content area ───────────────────── */}
      <PageLoadingIndicator label="Loading workspace…" showLabel={false} />

      <div style={{ maxWidth: '80rem', margin: '0 auto', ...PAD, paddingTop: '2.5rem' }}>

        {/* ── Real heading — we know this without server data ─────── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 800,
            color: 'rgba(13,31,53,0.18)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '0.4rem',
          }}>
            Welcome back
          </div>
          <PageLoadingIndicator label="Loading workspace…" />
        </div>

        {/* ── 3 compact metric pills ───────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="sk-metric-card" style={{ minHeight: '4.5rem' }}>
              <div className="skeleton sk-h-xs" style={{ width: '52%', marginBottom: '0.5rem' }} />
              <div className="skeleton sk-h-lg" style={{ width: '36%' }} />
            </div>
          ))}
        </div>

        {/* ── IdeaFlow banner outline ──────────────────────────────── */}
        <div style={{
          background: '#fff',
          border: '1px solid rgba(26,107,191,0.08)',
          borderRadius: '0.875rem',
          padding: '0.875rem 1.125rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="skeleton sk-h-xs" style={{ width: '25%', marginBottom: '0.4rem' }} />
            <div className="skeleton sk-h-md" style={{ width: '52%' }} />
          </div>
          <div className="skeleton sk-h-btn" style={{ width: '4.5rem', borderRadius: '0.4rem', flexShrink: 0 }} />
        </div>

        {/* ── 2 idea card outlines ─────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {[62, 50].map((tw, i) => (
            <div key={i} className="sk-idea-card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', width: '1.875rem', flexShrink: 0 }}>
                <div className="skeleton" style={{ width: '1.875rem', height: '1.75rem', borderRadius: '0.5rem' }} />
                <div className="skeleton sk-h-xs" style={{ width: '1rem' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="skeleton sk-h-sm" style={{ width: `${tw}%`, marginBottom: '0.5rem' }} />
                <div className="skeleton sk-h-xs" style={{ width: '80%' }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
