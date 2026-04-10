export default function DashboardLoading() {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, var(--shimmer-base) 25%, var(--shimmer-peak) 50%, var(--shimmer-base) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '0.625rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>

      {/* Header strip skeleton */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(26,107,191,0.09)', padding: '1.5rem 2.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ ...shimmer, width: '4rem', height: '0.65rem', marginBottom: '0.5rem' }} />
            <div style={{ ...shimmer, width: '11rem', height: '1.2rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ ...shimmer, width: '2rem', height: '1.25rem', margin: '0 auto 0.3rem' }} />
                <div style={{ ...shimmer, width: '3.5rem', height: '0.6rem' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0,2fr) minmax(280px,1fr)' }}>

          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Form card skeleton */}
            <div style={{ background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.25rem' }}>
              <div style={{ ...shimmer, width: '8rem', height: '0.7rem', marginBottom: '0.75rem' }} />
              <div style={{ ...shimmer, height: '2.5rem', marginBottom: '0.5rem' }} />
              <div style={{ ...shimmer, height: '2.5rem' }} />
            </div>

            {/* Idea cards skeleton */}
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.25rem', display: 'flex', gap: '0.875rem' }}>
                <div style={{ ...shimmer, width: '2rem', height: '2.5rem', borderRadius: '0.5rem', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ ...shimmer, height: '0.8rem', marginBottom: '0.5rem', width: '85%' }} />
                  <div style={{ ...shimmer, height: '0.7rem', width: '60%' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.25rem' }}>
              <div style={{ ...shimmer, width: '6rem', height: '0.7rem', marginBottom: '0.75rem' }} />
              {[0, 1, 2].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                  <div style={{ ...shimmer, width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ ...shimmer, height: '0.7rem', width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
