import SiteHeader from '@/components/SiteHeader'
import ForgotPasswordForm from '@/components/ForgotPasswordForm'

export const metadata = { title: 'Reset Password — IdeaFlow' }

export default function ForgotPasswordPage() {
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
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
