import { Suspense } from 'react'
import JoinPageClient from './JoinPageClient'

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            background:
              'linear-gradient(160deg, #060e26 0%, #0a1f50 35%, #0e3278 60%, #1a5a9a 85%, #2e7abf 100%)',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div
            style={{
              borderRadius: '1.5rem',
              padding: '2rem',
              background: 'rgba(255,255,255,0.97)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)',
            }}
          >
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
              Loading…
            </p>
          </div>
        </main>
      }
    >
      <JoinPageClient />
    </Suspense>
  )
}