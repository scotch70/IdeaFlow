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
      {/*
        Fixed-height flex shell — the key to making sticky sub-headers work.
        height (not min-height) constrains the shell to exactly the visible area
        below the navbar. The sidebar fills that height as a plain flex item.
        The content column scrolls internally (overflow-y: auto), so
        position:sticky inside it sticks at top:0 of the scroll viewport —
        which is visually right below the global navbar.
      */}
      <div
        className="mx-auto flex max-w-7xl px-6 lg:px-10"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}
      >
        <DashboardSidebar
          userName={profile?.full_name ?? ''}
          userEmail={user.email ?? ''}
          userRole={profile?.role ?? 'member'}
        />

        {/* Scrollable content column — only this area scrolls */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </>
  )
}
