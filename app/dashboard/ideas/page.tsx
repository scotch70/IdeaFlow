import PageContainer from '@/components/PageContainer'

export const metadata = { title: 'Ideas — IdeaFlow' }

export default function IdeasPage() {
  return (
    <div>
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(26,107,191,0.09)',
          position: 'sticky',
          top: 0,
          zIndex: 9,
        }}
      >
        <PageContainer style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
            Workspace
          </p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
            Ideas
          </h1>
        </PageContainer>
      </div>
      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <p style={{ color: '#9ab0c8', fontSize: '0.9rem' }}>
            Ideas view coming soon.
          </p>
        </PageContainer>
      </main>
    </div>
  )
}
