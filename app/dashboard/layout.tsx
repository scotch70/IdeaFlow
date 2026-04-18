import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/DashboardSidebar'
import SiteHeader from '@/components/SiteHeader'

// The SiteHeader inner-container is exactly 3.625rem tall.
// We export this as a CSS custom property so the sidebar can reference it.
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
      {/* ── Top navbar — full viewport width, sticky ── */}
      <SiteHeader />

      {/*
        ── Sidebar + content shell ──────────────────────────────────────────
        The sidebar is position:fixed so it does NOT steal width from the
        content column.  The content div gets margin-left equal to the
        sidebar width so it starts to the right of the sidebar.
        PageContainer (max-w-7xl mx-auto) then centres inside the remaining
        viewport width — identical to the old top-nav-only layout.
      */}
      <div style={{ position: 'relative', background: 'var(--page-bg)' }}>
        <DashboardSidebar
          userName={profile?.full_name ?? ''}
          userEmail={user.email ?? ''}
          userRole={profile?.role ?? 'member'}
        />

        {/* Content: starts to the right of the fixed sidebar */}
        <div
          style={{
            marginLeft: 'var(--sidebar-w, 200px)',
            minHeight: `calc(100vh - ${HEADER_HEIGHT})`,
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
