import SiteHeader from '@/components/SiteHeader'
import AuthForm from '@/components/AuthForm'

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
