import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/DashboardSidebar'
import MobileDashboardHeader from '@/components/MobileDashboardHeader'
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

  const userName  = profile?.full_name ?? ''
  const userEmail = user.email         ?? ''
  const userRole  = profile?.role      ?? 'member'

  return (
    <>
      {/* Desktop nav — hidden on mobile */}
      <div className="hidden md:block">
        <SiteHeader />
      </div>

      {/* Mobile sticky header — logo + hamburger drawer, hidden on desktop */}
      <div className="md:hidden sticky top-0 z-40">
        <MobileDashboardHeader
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
        />
      </div>

      {/* Shell — identical pattern to dashboard/layout.tsx */}
      <div
        className="mx-auto flex max-w-7xl"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}
      >
        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:flex" style={{ flexShrink: 0 }}>
          <DashboardSidebar
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
          />
        </div>

        {/* Scrollable content column — full width on mobile */}
        <div
          className="px-4 sm:px-6 lg:px-10"
          style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
