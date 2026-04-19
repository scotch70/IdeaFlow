import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/DashboardSidebar'
import SiteHeader from '@/components/SiteHeader'

const HEADER_HEIGHT = '3.625rem'

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
    <>
      <SiteHeader />

      {/* Identical shell to dashboard/layout.tsx — same centering, same gutters */}
      <div
        className="mx-auto flex max-w-7xl px-6 lg:px-10"
        style={{ minHeight: `calc(100vh - ${HEADER_HEIGHT})` }}
      >
        <DashboardSidebar
          userName={profile?.full_name ?? ''}
          userEmail={user.email ?? ''}
          userRole={profile?.role ?? 'member'}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </>
  )
}
