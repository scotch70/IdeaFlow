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
        ── Dashboard shell ───────────────────────────────────────────────────
        Full-viewport-width flex shell. No outer max-width so content fills
        the screen at every breakpoint (1280px, 1440px, 1728px+).

        The sidebar is 240px fixed. The content column takes the rest (flex:1).
        PageContainer inside each page provides its own max-width + padding so
        there is intentionally NO outer padding here — that was the source of
        double-padding on desktop (40px outer + 40px inner = 80px wasted each side).

        On mobile (< md): sidebar hidden, content = full viewport width.
        PageContainer's px-6 handles mobile padding. The safe-area override in
        globals.css adds env(safe-area-inset-*) for notch/home-indicator devices.
      */}
      <div
        className="flex"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}
      >
        {/* ── Sidebar — hidden on mobile ───────────────────────────────── */}
        <div className="hidden md:flex" style={{ flexShrink: 0 }}>
          <DashboardSidebar
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
          />
        </div>

        {/* ── Scrollable content column — full remaining width ─────────── */}
        {/*   .dash-content-inner inside caps content at 80rem and centers  */}
        {/*   it on very wide screens (>1519px). No mobile effect.           */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          <div className="dash-content-inner">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
