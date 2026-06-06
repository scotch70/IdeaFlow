'use client'

/**
 * DashboardSidebar — the main left rail of every dashboard page.
 *
 * Collapsible on desktop (md+). Expanded ~240px / collapsed ~64px. The
 * collapsed state hides labels, section headers and badges, leaving just
 * the icons centred in the rail with a title attribute so hover tooltips
 * still convey meaning. State is persisted in localStorage so the user's
 * choice survives page reloads.
 *
 * The aside owns its width via inline style — the dashboard layout uses
 * `flexShrink: 0` so the content column reflows whenever this changes.
 */

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { canUseSessions } from '@/lib/plans/planFeatures'

const SIDEBAR_W_EXPANDED  = 240
const SIDEBAR_W_COLLAPSED = 64
const LS_KEY              = 'ideaflow:dashboardSidebarCollapsed'

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
  flows:      <Ico d="M12 2L2 7l10 5 10-5-10-5z" d2="M2 12l10 5 10-5M2 17l10 5 10-5" />,
  sessions:   <Ico d="M4 4h12a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4z" d2="M9 9h7M9 13h7M9 17h4" />,
  review:     <Ico d="M9 11l3 3L22 4" d2="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  members:    <Ico d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" d2="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0c1.66 0 3-1.34 3-3s-1.34-3-3-3m3 13v-2a4 4 0 0 0-3-3.87" />,
  invite:     <Ico d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" d2="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6 3h6m-3-3v6" />,
  setup:      <Ico d="M12 20h9" d2="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />,
  analytics:  <Ico d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  settings:   <Ico d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.93-3c.04-.32.07-.65.07-1s-.03-.68-.07-1l2.16-1.68a.5.5 0 0 0 .12-.64l-2.05-3.55a.5.5 0 0 0-.61-.22l-2.55 1.02a7.46 7.46 0 0 0-1.72-.99L14 2.21A.5.5 0 0 0 13.5 2h-3a.5.5 0 0 0-.5.21l-.38 2.73a7.46 7.46 0 0 0-1.72.99L5.35 4.91a.5.5 0 0 0-.61.22L2.69 8.68a.49.49 0 0 0 .12.64L4.97 11c-.04.32-.07.65-.07 1s.03.68.07 1l-2.16 1.68a.5.5 0 0 0-.12.64l2.05 3.55c.13.22.38.31.61.22l2.55-1.02c.54.38 1.11.7 1.72.99l.38 2.73c.06.28.31.21.5.21h3c.19 0 .44.07.5-.21l.38-2.73a7.46 7.46 0 0 0 1.72-.99l2.55 1.02c.23.09.48 0 .61-.22l2.05-3.55a.49.49 0 0 0-.12-.64L18.93 12z" />,
  signout:    <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" d2="M16 17l5-5-5-5M21 12H9" />,
}

function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) {
    // Collapsed sections compress to a thin spacing line so the icons retain
    // visual rhythm without text.
    return <div style={{ height: '0.4rem' }} aria-hidden />
  }
  return (
    <p style={{
      fontSize: '0.58rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#b0bac8',
      padding: '0 0.5rem',
      marginBottom: '0.3rem',
      marginTop: '0.125rem',
    }}>
      {children}
    </p>
  )
}

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  collapsed: boolean
  badge?: number
  proChip?: boolean
}

function NavLink({ href, icon, label, active, collapsed, badge, proChip }: NavLinkProps) {
  const showBadge   = !active && badge !== undefined && badge > 0
  const badgeNumber = showBadge ? (badge! > 9 ? '9+' : String(badge)) : null

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      aria-label={label}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : '0.5rem',
        paddingTop: '0.375rem',
        paddingBottom: '0.375rem',
        paddingRight: collapsed ? '0.4rem' : '0.625rem',
        paddingLeft: collapsed ? '0.4rem' : (active ? 'calc(0.625rem - 2px)' : '0.625rem'),
        borderRadius: '0.5rem',
        textDecoration: 'none',
        background: active ? 'rgba(249,115,22,0.07)' : 'transparent',
        color: active ? '#b84a09' : '#5d667a',
        borderLeft: !collapsed && active ? '2px solid rgba(249,115,22,0.65)' : '2px solid transparent',
        transition: 'background 0.12s ease, color 0.12s ease',
      }}
      className={active ? '' : 'db-nav-inactive'}
    >
      <span style={{ color: active ? '#ea580c' : '#9faab8', display: 'flex', flexShrink: 0 }}>
        {icon}
      </span>

      {!collapsed && (
        <>
          <span style={{ fontSize: '0.775rem', fontWeight: active ? 700 : 500, flex: 1, letterSpacing: '-0.01em' }}>
            {label}
          </span>
          {showBadge && (
            <span style={{
              fontSize: '0.55rem', fontWeight: 700,
              background: '#f97316', color: '#fff',
              borderRadius: '999px', padding: '0.1rem 0.35rem',
              minWidth: '1rem', textAlign: 'center',
            }}>
              {badgeNumber}
            </span>
          )}
          {proChip && (
            <span style={{
              fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#c2540a',
              background: 'rgba(249,115,22,0.10)',
              border: '1px solid rgba(249,115,22,0.22)',
              borderRadius: '999px',
              padding: '0.06rem 0.32rem',
              flexShrink: 0,
            }}>
              ✦ Pro
            </span>
          )}
        </>
      )}

      {/* Collapsed: tiny corner dot for unread badge so the count cue isn't lost */}
      {collapsed && showBadge && (
        <span
          aria-hidden
          style={{
            position: 'absolute', top: '0.3rem', right: '0.3rem',
            width: '0.45rem', height: '0.45rem', borderRadius: '999px',
            background: '#f97316',
          }}
        />
      )}
      {collapsed && proChip && (
        <span
          aria-hidden
          title={`${label} — Pro feature`}
          style={{
            position: 'absolute', top: '0.2rem', right: '0.2rem',
            fontSize: '0.45rem', fontWeight: 800,
            color: '#c2540a',
          }}
        >
          ✦
        </span>
      )}
    </Link>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: 'rgba(0,0,0,0.055)', margin: '0.5rem 0' }} />
}

interface Props {
  userName: string
  userEmail: string
  userRole: string
  /** Company plan — used to decide whether to show the "Pro" chip next to Sessions */
  companyPlan?: string
  pendingReviewCount?: number
}

export default function DashboardSidebar({
  userName,
  userEmail,
  userRole,
  companyPlan,
  pendingReviewCount,
}: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Default to expanded — flips on mount if the user previously collapsed it.
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const v = window.localStorage.getItem(LS_KEY)
      if (v === '1') setCollapsed(true)
    } catch { /* private mode etc. — stay expanded */ }
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    try { window.localStorage.setItem(LS_KEY, collapsed ? '1' : '0') } catch {}
  }, [collapsed])

  // External "force collapse / expand" hook. SessionWorkspace dispatches
  // `ideaflow:dashboardSidebarForce` when opening Brainstorm Circle so the
  // canvas claims maximum width without the user having to collapse this
  // rail manually. We update local state only — the persist effect above
  // then writes the new value to localStorage so the choice survives
  // reloads inside the session.
  useEffect(() => {
    if (typeof window === 'undefined') return
    function onForce(e: Event) {
      const detail = (e as CustomEvent<{ collapsed?: boolean }>).detail
      if (typeof detail?.collapsed === 'boolean') {
        setCollapsed(detail.collapsed)
      }
    }
    window.addEventListener('ideaflow:dashboardSidebarForce', onForce as EventListener)
    return () => window.removeEventListener('ideaflow:dashboardSidebarForce', onForce as EventListener)
  }, [])

  const isAdmin = userRole === 'admin'
  const firstName = userName.split(' ')[0] || 'You'
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase() || '?'

  const exact = (href: string) => pathname === href
  const under = (href: string) => pathname.startsWith(href + '/')

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <>
      <style>{`
        .db-nav-inactive:hover {
          background: rgba(0,0,0,0.035) !important;
          color: #3d4758 !important;
        }
        .db-nav-inactive:hover span:first-child {
          color: #6b7688 !important;
        }
        .db-signout-btn:hover {
          background: rgba(0,0,0,0.04) !important;
          color: #3d4758 !important;
        }
        .db-user-card:hover {
          background: rgba(0,0,0,0.03) !important;
        }
        .db-collapse-btn:hover {
          background: rgba(0,0,0,0.06) !important;
          color: #3d4758 !important;
        }
      `}</style>

      <aside
        style={{
          width: `${collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED}px`,
          flexShrink: 0,
          background: '#faf9f7',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          padding: collapsed ? '0.75rem 0.4rem 1rem' : '0.75rem 0.625rem 1rem',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 0.18s ease, padding 0.18s ease',
        }}
      >
        {/* ── Collapse toggle ─────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: collapsed ? 'center' : 'flex-end',
            marginBottom: '0.45rem',
          }}
        >
          <button
            type="button"
            onClick={() => setCollapsed(v => !v)}
            className="db-collapse-btn"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              width: '1.65rem', height: '1.65rem', borderRadius: '0.4rem',
              border: 'none', background: 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#94a3b8',
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            <svg
              width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}
              aria-hidden
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* ─────────────────── Workspace ──────────────────── */}
        <SectionLabel collapsed={collapsed}>Workspace</SectionLabel>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '0.25rem' }}>
          <NavLink
            href="/dashboard"
            icon={ICONS.dashboard}
            label="Dashboard"
            active={exact('/dashboard')}
            collapsed={collapsed}
          />
          <NavLink
            href="/dashboard/flows"
            icon={ICONS.flows}
            label="IdeaFlows"
            active={exact('/dashboard/flows') || under('/dashboard/flows')}
            collapsed={collapsed}
          />
          <NavLink
            href="/dashboard/ideas"
            icon={ICONS.ideas}
            label="Ideas"
            active={exact('/dashboard/ideas') || under('/dashboard/ideas')}
            collapsed={collapsed}
          />
          <NavLink
            href="/dashboard/sessions"
            icon={ICONS.sessions}
            label="Sessions"
            active={exact('/dashboard/sessions') || under('/dashboard/sessions')}
            collapsed={collapsed}
            proChip={!canUseSessions(companyPlan)}
          />
        </nav>

        {/* ─────────────────── Management (admin only) ────── */}
        {isAdmin && (
          <>
            <Divider />
            <SectionLabel collapsed={collapsed}>Management</SectionLabel>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '0.25rem' }}>
              <NavLink
                href="/dashboard/review"
                icon={ICONS.review}
                label="Needs attention"
                active={exact('/dashboard/review') || under('/dashboard/review')}
                collapsed={collapsed}
                badge={pendingReviewCount}
              />
              <NavLink
                href="/dashboard/idea-flow"
                icon={ICONS.setup}
                label="Set up IdeaFlow"
                active={exact('/dashboard/idea-flow') || under('/dashboard/idea-flow')}
                collapsed={collapsed}
              />
              <NavLink
                href="/dashboard/analytics"
                icon={ICONS.analytics}
                label="Analytics"
                active={exact('/dashboard/analytics') || under('/dashboard/analytics')}
                collapsed={collapsed}
              />
            </nav>
          </>
        )}

        {/* ─────────────────── Team ───────────────────────── */}
        <Divider />
        <SectionLabel collapsed={collapsed}>Team</SectionLabel>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <NavLink
            href="/dashboard/members"
            icon={ICONS.members}
            label="Members"
            active={exact('/dashboard/members') || under('/dashboard/members')}
            collapsed={collapsed}
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
            collapsed={collapsed}
          />

          {/* User card */}
          <div
            className="db-user-card"
            title={collapsed ? `${userName || firstName} · ${isAdmin ? 'Admin' : 'Member'}` : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? 0 : '0.625rem',
              padding: collapsed ? '0.4rem' : '0.5rem 0.625rem',
              borderRadius: '0.5rem',
              marginTop: '0.25rem',
              marginBottom: '0.25rem',
              cursor: 'default',
              transition: 'background 0.12s ease',
            }}
          >
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.625rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '0.03em',
              }}
            >
              {initials}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.725rem', fontWeight: 600, color: '#1e2533', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userName || firstName}
                </p>
                <p style={{ fontSize: '0.59rem', color: '#9faab8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isAdmin ? 'Admin' : 'Member'}
                </p>
              </div>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="db-signout-btn"
            title={collapsed ? 'Sign out' : undefined}
            aria-label="Sign out"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? 0 : '0.5rem',
              padding: collapsed ? '0.4rem' : '0.375rem 0.625rem',
              borderRadius: '0.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              color: '#8b96a8',
              transition: 'background 0.12s ease, color 0.12s ease',
            }}
          >
            <span style={{ color: '#b0bac8', display: 'flex' }}>{ICONS.signout}</span>
            {!collapsed && (
              <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Sign out</span>
            )}
          </button>
        </div>

      </aside>
    </>
  )
}
