export default function DashboardLoading() {
  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, var(--shimmer-base) 25%, var(--shimmer-peak) 50%, var(--shimmer-base) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '0.625rem',
  }

  return (
    <div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>

      {/* Sticky page-header skeleton — mirrors the real page sub-header */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(26,107,191,0.09)',
        padding: '1.125rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 9,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ ...shimmer, width: '4rem', height: '0.6rem', marginBottom: '0.4rem' }} />
            <div style={{ ...shimmer, width: '9rem', height: '1.1rem' }} />
          </div>
          <div style={{ ...shimmer, width: '8rem', height: '0.75rem' }} />
        </div>
      </div>

      {/* Single-column content skeleton — matches the real dashboard feed */}
      <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Idea form card */}
        <div style={{ background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '1.25rem' }}>
          <div style={{ ...shimmer, width: '8rem', height: '0.7rem', marginBottom: '0.75rem' }} />
          <div style={{ ...shimmer, height: '2.5rem', marginBottom: '0.5rem' }} />
          <div style={{ ...shimmer, height: '2.5rem' }} />
        </div>

        {/* Idea list items */}
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
    </div>
  )
}
