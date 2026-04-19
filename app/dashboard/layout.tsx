import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/DashboardSidebar'
import SiteHeader from '@/components/SiteHeader'

export const HEADER_HEIGHT = '3.625rem'

export default async function DashboardLayout({
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
      {/* ── Top navbar — full width, sticky at top ── */}
      <SiteHeader />

      {/*
        ── Dashboard shell ──────────────────────────────────────────────────
        Mirrors the exact centering system used by SiteHeader and PageContainer:
          mx-auto max-w-7xl px-6 lg:px-10
        This gives identical left/right gutters to every other page on the site.

        The sidebar is position:sticky (not fixed), so it lives inside this
        centered container — no margin-left hacks, no CSS custom-property math.
        Both sidebar and content are naturally bounded by max-w-7xl.
      */}
      <div
        className="mx-auto flex max-w-7xl px-6 lg:px-10"
        style={{ minHeight: `calc(100vh - ${HEADER_HEIGHT})` }}
      >
        <DashboardSidebar
          userName={profile?.full_name ?? ''}
          userEmail={user.email ?? ''}
          userRole={profile?.role ?? 'member'}
        />

        {/* Main content — takes all remaining width */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </>
  )
}
