'use client'

/**
 * DashboardSidebar
 *
 * position: fixed — intentionally kept out of the document flow so
 * the main content column retains its full max-w-7xl width.
 *
 * Sidebar width is exposed via --sidebar-w CSS variable on :root so the
 * layout's margin-left can reference it without hard-coding a number in
 * two places.
 *
 * All navigation uses real Next.js routes — no anchor (#) links.
 */

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Width + height tokens ──────────────────────────────────────────────────────
const SIDEBAR_W = 240   // px  (keep in sync with --sidebar-w)
// SiteHeader inner container is 3.625rem tall; the <header> element itself
// renders at that exact height (border-bottom is inset via box-sizing).
const HEADER_H  = '3.625rem'

// ── Icons ─────────────────────────────────────────────────────────────────────

function Ico({ d, d2 }: { d: string; d2?: string }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
      {d2 && <path d={d2} />}
    </svg>
  )
}

const ICONS = {
  dashboard:  <Ico d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  ideas:      <Ico d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" d2="M9 21h6" />,
  review:     <Ico d="M9 11l3 3L22 4" d2="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  members:    <Ico d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" d2="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0c1.66 0 3-1.34 3-3s-1.34-3-3-3m3 13v-2a4 4 0 0 0-3-3.87" />,
  invite:     <Ico d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" d2="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6 3h6m-3-3v6" />,
  setup:      <Ico d="M12 20h9" d2="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />,
  analytics:  <Ico d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  settings:   <Ico d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.93-3c.04-.32.07-.65.07-1s-.03-.68-.07-1l2.16-1.68a.5.5 0 0 0 .12-.64l-2.05-3.55a.5.5 0 0 0-.61-.22l-2.55 1.02a7.46 7.46 0 0 0-1.72-.99L14 2.21A.5.5 0 0 0 13.5 2h-3a.5.5 0 0 0-.5.21l-.38 2.73a7.46 7.46 0 0 0-1.72.99L5.35 4.91a.5.5 0 0 0-.61.22L2.69 8.68a.49.49 0 0 0 .12.64L4.97 11c-.04.32-.07.65-.07 1s.03.68.07 1l-2.16 1.68a.5.5 0 0 0-.12.64l2.05 3.55c.13.22.38.31.61.22l2.55-1.02c.54.38 1.11.7 1.72.99l.38 2.73c.06.28.31.21.5.21h3c.19 0 .44.07.5-.21l.38-2.73a7.46 7.46 0 0 0 1.72-.99l2.55 1.02c.23.09.48 0 .61-.22l2.05-3.55a.49.49 0 0 0-.12-.64L18.93 12z" />,
  signout:    <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" d2="M16 17l5-5-5-5M21 12H9" />,
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '0.575rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#94a3b8',
      padding: '0 0.5rem',
      marginBottom: '0.25rem',
    }}>
      {children}
    </p>
  )
}

// ── Nav link ──────────────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  badge?: number
}

function NavLink({ href, icon, label, active, badge }: NavLinkProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        // Active: left-border accent + orange tint; keep padding compensated so text stays aligned
        paddingTop: '0.375rem',
        paddingBottom: '0.375rem',
        paddingRight: '0.5rem',
        paddingLeft: active ? 'calc(0.5rem - 2px)' : '0.5rem',
        borderRadius: '7px',
        textDecoration: 'none',
        background: active ? 'rgba(249,115,22,0.09)' : 'transparent',
        color: active ? '#c2540a' : '#475569',
        borderLeft: active ? '2px solid #f97316' : '2px solid transparent',
        transition: 'background 0.12s ease, color 0.12s ease, border-color 0.12s ease',
      }}
      className={active ? '' : 'db-nav-inactive'}
    >
      <span style={{ color: active ? '#ea580c' : '#94a3b8', display: 'flex', flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ fontSize: '0.775rem', fontWeight: active ? 700 : 500, flex: 1, letterSpacing: '-0.01em' }}>
        {label}
      </span>
      {active && (
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
      )}
      {!active && badge !== undefined && badge > 0 && (
        <span style={{
          fontSize: '0.55rem', fontWeight: 700,
          background: '#f97316', color: '#fff',
          borderRadius: '999px', padding: '0.1rem 0.35rem',
          minWidth: '1rem', textAlign: 'center',
        }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: '1px', background: '#e8ecf0', margin: '0.5rem 0' }} />
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

interface Props {
  userName: string
  userEmail: string
  userRole: string
  pendingReviewCount?: number
}

export default function DashboardSidebar({
  userName,
  userEmail,
  userRole,
  pendingReviewCount,
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const isAdmin = userRole === 'admin'
  const firstName = userName.split(' ')[0] || 'You'
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase() || '?'

  // Exact-match helper — prevents /dashboard from matching /dashboard/review etc.
  const exact = (href: string) => pathname === href
  // Prefix-match helper for sections that have nested routes
  const under = (href: string) => pathname.startsWith(href + '/')

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <>
      {/* Inject hover styles + sidebar-w CSS variable */}
      <style>{`
        :root { --sidebar-w: ${SIDEBAR_W}px; }
        .db-nav-inactive:hover { background: rgba(0,0,0,0.04) !important; }
        .db-signout-btn:hover  { background: rgba(0,0,0,0.05) !important; }
      `}</style>

      <aside
        style={{
          position: 'fixed',
          // Sit flush under the SiteHeader — no extra offset, no gap
          top: HEADER_H,
          left: 0,
          bottom: 0,
          width: `${SIDEBAR_W}px`,
          background: '#ffffff',
          borderRight: '1px solid #e8ecf0',
          display: 'flex',
          flexDirection: 'column',
          // Tight top padding so the first nav item starts close to the header edge
          padding: '0.5rem 0.625rem 0.875rem',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 40,
        }}
      >

        {/* ─────────────────── Workspace ──────────────────── */}
        <SectionLabel>Workspace</SectionLabel>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.25rem' }}>
          <NavLink
            href="/dashboard"
            icon={ICONS.dashboard}
            label="Dashboard"
            active={exact('/dashboard')}
          />
          <NavLink
            href="/dashboard/ideas"
            icon={ICONS.ideas}
            label="Ideas"
            active={exact('/dashboard/ideas') || under('/dashboard/ideas')}
          />
        </nav>

        {/* ─────────────────── Management (admin only) ────── */}
        {isAdmin && (
          <>
            <Divider />
            <SectionLabel>Management</SectionLabel>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.25rem' }}>
              <NavLink
                href="/dashboard/review"
                icon={ICONS.review}
                label="Needs attention"
                active={exact('/dashboard/review') || under('/dashboard/review')}
                badge={pendingReviewCount}
              />
              <NavLink
                href="/dashboard/invites"
                icon={ICONS.invite}
                label="Generate invite"
                active={exact('/dashboard/invites') || under('/dashboard/invites')}
              />
              <NavLink
                href="/dashboard/idea-flow"
                icon={ICONS.setup}
                label="Set up IdeaFlow"
                active={exact('/dashboard/idea-flow') || under('/dashboard/idea-flow')}
              />
              <NavLink
                href="/dashboard/analytics"
                icon={ICONS.analytics}
                label="Analytics"
                active={exact('/dashboard/analytics') || under('/dashboard/analytics')}
              />
            </nav>
          </>
        )}

        {/* ─────────────────── Team ───────────────────────── */}
        <Divider />
        <SectionLabel>Team</SectionLabel>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <NavLink
            href="/dashboard/members"
            icon={ICONS.members}
            label="Members"
            active={exact('/dashboard/members') || under('/dashboard/members')}
          />
        </nav>

        {/* ─────────────────── Spacer ─────────────────────── */}
        <div style={{ flex: 1 }} />

        {/* ─────────────────── Bottom ─────────────────────── */}
        <div>
          <Divider />

          <NavLink
            href="/settings"
            icon={ICONS.settings}
            label="Settings"
            active={exact('/settings') || under('/settings')}
          />

          {/* User card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e8ecf0',
              marginTop: '0.375rem',
              marginBottom: '0.375rem',
            }}
          >
            <div
              style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.6rem',
                fontWeight: 800,
                color: '#fff',
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {firstName}
              </p>
              <p style={{ fontSize: '0.575rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isAdmin ? 'Admin' : 'Member'}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="db-signout-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.375rem 0.5rem',
              borderRadius: '7px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              color: '#64748b',
              transition: 'background 0.12s ease',
            }}
          >
            <span style={{ color: '#94a3b8', display: 'flex' }}>{ICONS.signout}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Sign out</span>
          </button>
        </div>

      </aside>
    </>
  )
}
