/**
 * /settings loading skeleton.
 *
 * Mirrors SettingsForm.tsx structure:
 *   InnerPageHeader → profile card → account card → save button → plan card
 *
 * Uses PageContainer size="narrow" positioning (max-w-3xl centered).
 */
export default function SettingsLoading() {
  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* InnerPageHeader equivalent */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(26,107,191,0.09)',
          position: 'sticky',
          top: 0,
          zIndex: 9,
        }}
      >
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: '48rem',
            paddingLeft: 'clamp(1.25rem, 4vw, 2.5rem)',
            paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
            paddingTop: '0.9rem',
            paddingBottom: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}
        >
          <div className="skeleton" style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.4rem' }} />
          <div className="skeleton sk-h-md" style={{ width: '7rem' }} />
        </div>
      </div>

      {/* Page body — narrow column */}
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: '48rem',
          paddingLeft: 'clamp(1.25rem, 4vw, 2.5rem)',
          paddingRight: 'clamp(1.25rem, 4vw, 2.5rem)',
          paddingTop: '2.5rem',
          paddingBottom: '4rem',
        }}
      >
        {/* Page title */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="skeleton sk-h-xl" style={{ width: '55%', marginBottom: '0.45rem' }} />
          <div className="skeleton sk-h-sm" style={{ width: '44%' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Profile card */}
          <SettingsCard>
            <div className="skeleton sk-h-xs" style={{ width: '4rem', marginBottom: '1.5rem' }} />
            {/* Avatar row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="skeleton" style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton sk-h-md" style={{ width: '50%', marginBottom: '0.35rem' }} />
                <div className="skeleton sk-h-xs" style={{ width: '38%', marginBottom: '0.5rem' }} />
                <div className="skeleton sk-h-xs" style={{ width: '5.5rem' }} />
              </div>
            </div>
            {/* Name grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
              <div>
                <div className="skeleton sk-h-xs" style={{ width: '55%', marginBottom: '0.375rem' }} />
                <div className="skeleton sk-h-input" style={{ width: '100%', borderRadius: '0.75rem' }} />
              </div>
              <div>
                <div className="skeleton sk-h-xs" style={{ width: '50%', marginBottom: '0.375rem' }} />
                <div className="skeleton sk-h-input" style={{ width: '100%', borderRadius: '0.75rem' }} />
              </div>
            </div>
            {/* Job function */}
            <div>
              <div className="skeleton sk-h-xs" style={{ width: '48%', marginBottom: '0.375rem' }} />
              <div className="skeleton sk-h-input" style={{ width: '100%', borderRadius: '0.75rem' }} />
            </div>
          </SettingsCard>

          {/* Account card */}
          <SettingsCard>
            <div className="skeleton sk-h-xs" style={{ width: '4.5rem', marginBottom: '1.5rem' }} />
            <div className="skeleton sk-h-xs" style={{ width: '40%', marginBottom: '0.375rem' }} />
            <div className="skeleton sk-h-input" style={{ width: '100%', borderRadius: '0.75rem', marginBottom: '0.5rem', opacity: 0.5 }} />
            <div className="skeleton sk-h-xs" style={{ width: '55%' }} />
          </SettingsCard>

          {/* Save button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="skeleton sk-h-btn" style={{ width: '9rem', borderRadius: '0.5rem' }} />
          </div>

          {/* Plan card */}
          <SettingsCard>
            <div className="skeleton sk-h-xs" style={{ width: '6rem', marginBottom: '1.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div className="skeleton sk-h-lg" style={{ width: '8rem', marginBottom: '0.875rem' }} />
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div className="skeleton" style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', flexShrink: 0 }} />
                    <div className="skeleton sk-h-xs" style={{ width: `${[60, 72, 55, 68][i]}%` }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', alignItems: 'flex-end' }}>
                <div className="skeleton sk-h-btn" style={{ width: '7.5rem', borderRadius: '0.5rem' }} />
                <div className="skeleton sk-h-btn" style={{ width: '9rem', borderRadius: '0.5rem' }} />
              </div>
            </div>
          </SettingsCard>

        </div>
      </div>
    </main>
  )
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '1.25rem',
        border: '1px solid rgba(26,107,191,0.10)',
        padding: '2rem',
        boxShadow: '0 2px 12px rgba(6,14,38,0.05)',
      }}
    >
      {children}
    </div>
  )
}
