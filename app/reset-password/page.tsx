import SiteHeader from '@/components/SiteHeader'
import ResetPasswordForm from '@/components/ResetPasswordForm'

export const metadata = { title: 'Set New Password — IdeaFlow' }

export default function ResetPasswordPage() {
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
        <ResetPasswordForm />
      </div>
    </div>
  )
}
