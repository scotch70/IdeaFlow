import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/DashboardSidebar'
import MobileDashboardHeader from '@/components/MobileDashboardHeader'
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

  const userName  = profile?.full_name  ?? ''
  const userEmail = user.email           ?? ''
  const userRole  = profile?.role        ?? 'member'

  return (
    <>
      {/*
        ── Global top navbar ─────────────────────────────────────────────────
        Shown on desktop. On mobile we skip the public SiteHeader inside the
        dashboard shell and replace it with MobileDashboardHeader below.
      */}
      <div className="hidden md:block">
        <SiteHeader />
      </div>

      {/*
        ── Mobile sticky header ──────────────────────────────────────────────
        Only visible below md (768px). Provides logo + hamburger drawer nav.
        Sits above the content column so it stays sticky inside the viewport.
      */}
      <div className="md:hidden sticky top-0 z-40">
        <MobileDashboardHeader
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
        />
      </div>

      {/*
        ── Desktop dashboard shell ───────────────────────────────────────────
        Mirrors the exact centering system used by SiteHeader and PageContainer:
          mx-auto max-w-7xl px-6 lg:px-10

        Fixed-height flex shell — the sidebar fills the visible area naturally.
        The content column scrolls internally (overflow-y: auto) so sticky
        sub-headers inside pages stick at top: 0 of their scroll viewport,
        which renders visually right below the global navbar.

        ── Mobile shell ─────────────────────────────────────────────────────
        On mobile (< md), the sidebar is hidden and the content takes full
        width. The mobile header above provides navigation via the drawer.
        No margin-left math, no horizontal scroll.
      */}
      <div
        className="mx-auto flex max-w-7xl"
        style={{
          // Desktop: subtract the SiteHeader height
          // Mobile:  subtract the MobileDashboardHeader height (3.5rem)
          height: `calc(100vh - ${HEADER_HEIGHT})`,
        }}
      >
        {/* ── Sidebar — hidden on mobile ───────────────────────────────── */}
        <div className="hidden md:flex" style={{ flexShrink: 0 }}>
          <DashboardSidebar
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
          />
        </div>

        {/* ── Scrollable content column ────────────────────────────────── */}
        {/*
          px-4 sm:px-6 lg:px-10 — tighter on mobile so cards have more room.
          On desktop the padding matches the marketing site gutters.
        */}
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
