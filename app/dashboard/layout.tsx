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
    .select('full_name, role, company_id')
    .eq('id', user.id)
    .single()) as unknown as {
    data: { full_name: string | null; role: string; company_id: string | null } | null
  }

  const userName  = profile?.full_name  ?? ''
  const userEmail = user.email           ?? ''
  const userRole  = profile?.role        ?? 'member'

  // Plan is surfaced in the sidebar so Pro-only items (Sessions) can show a
  // small Pro chip when the user isn't on Pro yet.
  let companyPlan = 'free'
  if (profile?.company_id) {
    const { data: companyRow } = (await supabase
      .from('companies')
      .select('plan')
      .eq('id', profile.company_id)
      .single()) as unknown as { data: { plan: string } | null }
    companyPlan = companyRow?.plan ?? 'free'
  }

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
        Constrained to max-w-7xl (80rem / 1280px) and centred with mx-auto so
        the entire shell — sidebar + content — sits inside the same horizontal
        bounds as SiteHeader's inner container.

        At 1440px: shell = 1280px, centred with 80px margin each side.
          Sidebar 240px | Content column flex-1 (1040px) → matches logo/avatar
        At 1728px+: shell stays 1280px, margins grow — never edge-to-edge.
        Mobile (<md): max-w-7xl > any phone screen → no constraint, full width.

        No outer padding on the content column — PageContainer inside each
        page is the single padding source (px-6 lg:px-10). No double-padding.
      */}
      <div
        className="mx-auto flex w-full max-w-7xl"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}
      >
        {/* ── Sidebar — hidden on mobile ───────────────────────────────── */}
        <div className="hidden md:flex" style={{ flexShrink: 0 }}>
          <DashboardSidebar
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
            companyPlan={companyPlan}
          />
        </div>

        {/* ── Scrollable content column ────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </>
  )
}
