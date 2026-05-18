/**
 * Dashboard loading skeleton
 *
 * Shown by Next.js (App Router) while dashboard/page.tsx is streaming.
 * Mirrors the visual structure of the real page so layout shift is
 * imperceptible: heading → metrics strip → IdeaFlow banner →
 * new-idea form → idea-card list.
 *
 * Shimmer is scoped via an inline <style> tag — no Tailwind dependency.
 */

export default function DashboardLoading() {
  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes _sk_shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .sk {
          background: linear-gradient(
            90deg,
            rgba(0,0,0,0.042) 25%,
            rgba(0,0,0,0.072) 37%,
            rgba(0,0,0,0.042) 63%
          );
          background-size: 600px 100%;
          animation: _sk_shimmer 1.45s ease infinite;
          border-radius: 0.4rem;
        }
      `}</style>

      {/* PageContainer equivalent — mx-auto max-w-3xl with responsive padding */}
      <div style={{
        maxWidth: '48rem',
        margin: '0 auto',
        paddingLeft: 'clamp(1rem, 4vw, 2.5rem)',
        paddingRight: 'clamp(1rem, 4vw, 2.5rem)',
        paddingTop: '2rem',
        paddingBottom: '4rem',
      }}>

        {/* ── Welcome heading ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 'clamp(1.75rem, 4vw, 2.75rem)', paddingTop: '0.5rem' }}>
          <div className="sk" style={{ height: '1.85rem', width: '52%', marginBottom: '0.625rem' }} />
          <div className="sk" style={{ height: '0.875rem', width: '40%' }} />
        </div>

        {/* ── Workspace metrics strip — 3 cards ───────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '0.75rem',
                padding: '0.875rem 1rem',
              }}
            >
              <div className="sk" style={{ height: '0.65rem', width: '58%', marginBottom: '0.55rem' }} />
              <div className="sk" style={{ height: '1.4rem', width: '38%' }} />
            </div>
          ))}
        </div>

        {/* ── IdeaFlow banner ──────────────────────────────────────────────── */}
        <div style={{
          background: '#fff',
          border: '1px solid rgba(26,107,191,0.10)',
          borderRadius: '0.875rem',
          padding: '0.875rem 1.125rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Round label pill */}
            <div className="sk" style={{ height: '0.65rem', width: '28%', marginBottom: '0.5rem', borderRadius: '999px' }} />
            {/* Round name */}
            <div className="sk" style={{ height: '1rem', width: '60%', marginBottom: '0.4rem' }} />
            {/* Ends at */}
            <div className="sk" style={{ height: '0.72rem', width: '38%' }} />
          </div>
          {/* Status pill */}
          <div className="sk" style={{ height: '1.75rem', width: '5rem', borderRadius: '0.4rem', flexShrink: 0 }} />
        </div>

        {/* ── New-idea form box ────────────────────────────────────────────── */}
        <div style={{
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: '0.875rem',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}>
          <div className="sk" style={{ height: '0.75rem', width: '32%', marginBottom: '0.875rem' }} />
          <div className="sk" style={{ height: '2.625rem', width: '100%', borderRadius: '0.5rem' }} />
        </div>

        {/* ── Idea list header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="sk" style={{ height: '0.72rem', width: '22%' }} />
          <div className="sk" style={{ height: '0.72rem', width: '8%' }} />
        </div>

        {/* ── Idea card skeletons ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {([72, 58, 66] as const).map((titleW, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '0.875rem',
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '0.75rem',
                padding: '1rem 1.125rem',
              }}
            >
              {/* Like column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', paddingTop: '0.1rem', minWidth: '1.875rem' }}>
                <div className="sk" style={{ width: '1.875rem', height: '1.75rem', borderRadius: '0.5rem' }} />
                <div className="sk" style={{ width: '1.1rem', height: '0.7rem' }} />
              </div>

              {/* Content column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title + badge row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '1rem' }}>
                  <div className="sk" style={{ height: '0.875rem', width: `${titleW}%` }} />
                  <div className="sk" style={{ height: '1.25rem', width: '4.25rem', borderRadius: '999px', flexShrink: 0 }} />
                </div>

                {/* Description — vary line count per card */}
                {i === 0 && (
                  <div className="sk" style={{ height: '0.78rem', width: '86%', marginBottom: '0.375rem' }} />
                )}
                {i === 1 && (
                  <>
                    <div className="sk" style={{ height: '0.78rem', width: '94%', marginBottom: '0.325rem' }} />
                    <div className="sk" style={{ height: '0.78rem', width: '72%', marginBottom: '0.375rem' }} />
                  </>
                )}

                {/* Meta row */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div className="sk" style={{ height: '0.68rem', width: '3.75rem' }} />
                  <div className="sk" style={{ height: '0.68rem', width: '2.25rem' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
