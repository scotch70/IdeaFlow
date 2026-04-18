import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) redirect('/auth')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()) as unknown as {
    data: { full_name: string | null; role: string } | null
  }

  return (
    <div style={{ background: 'var(--page-bg)' }}>
      <DashboardSidebar
        userName={profile?.full_name ?? ''}
        userEmail={user.email ?? ''}
        userRole={profile?.role ?? 'member'}
      />

      {/* Mirror the dashboard content wrapper so settings aligns consistently */}
      <div
        style={{
          marginLeft: 'var(--sidebar-w, 200px)',
          maxWidth: 'calc((100vw + 80rem) / 2 - var(--sidebar-w, 200px))',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}
