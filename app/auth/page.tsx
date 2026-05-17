import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import AuthForm from '@/components/AuthForm'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your IdeaFlow workspace, or create a free account.',
  robots: { index: false, follow: false },
}

export default function AuthPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f3f0ea' }}>
      <SiteHeader />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 3.5rem)',
        padding: '3rem 1rem 4rem',
      }}>
        <AuthForm />
      </div>
    </div>
  )
}
