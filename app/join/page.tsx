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
            padding: '3rem 1rem 4rem',
            background: '#f3f0ea',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '22rem',
              borderRadius: '1.25rem',
              padding: '2rem',
              background: '#ffffff',
              border: '1px solid #e7e2d8',
              boxShadow: '0 2px 16px rgba(6,14,38,0.06)',
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