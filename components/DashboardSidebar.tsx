'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SIDEBAR_W = 240
const HEADER_H  = '3.625rem'

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
  review:     <Ico d="M9 11l3 3L22 4" d2="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  members:    <Ico d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" d2="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0c1.66 0 3-1.34 3-3s-1.34-3-3-3m3 13v-2a4 4 0 0 0-3-3.87" />,
  invite:     <Ico d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" d2="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6 3h6m-3-3v6" />,
  setup:      <Ico d="M12 20h9" d2="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />,
  analytics:  <Ico d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  settings:   <Ico d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.93-3c.04-.32.07-.65.07-1s-.03-.68-.07-1l2.16-1.68a.5.5 0 0 0 .12-.64l-2.05-3.55a.5.5 0 0 0-.61-.22l-2.55 1.02a7.46 7.46 0 0 0-1.72-.99L14 2.21A.5.5 0 0 0 13.5 2h-3a.5.5 0 0 0-.5.21l-.38 2.73a7.46 7.46 0 0 0-1.72.99L5.35 4.91a.5.5 0 0 0-.61.22L2.69 8.68a.49.49 0 0 0 .12.64L4.97 11c-.04.32-.07.65-.07 1s.03.68.07 1l-2.16 1.68a.5.5 0 0 0-.12.64l2.05 3.55c.13.22.38.31.61.22l2.55-1.02c.54.38 1.11.7 1.72.99l.38 2.73c.06.28.31.21.5.21h3c.19 0 .44.07.5-.21l.38-2.73a7.46 7.46 0 0 0 1.72-.99l2.55 1.02c.23.09.48 0 .61-.22l2.05-3.55a.49.49 0 0 0-.12-.64L18.93 12z" />,
  signout:    <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" d2="M16 17l5-5-5-5M21 12H9" />,
}

function SectionLabel({ children }: { children: React.ReactNode }) {
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
        paddingTop: '0.375rem',
        paddingBottom: '0.375rem',
        paddingRight: '0.625rem',
        paddingLeft: active ? 'calc(0.625rem - 2px)' : '0.625rem',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        background: active ? 'rgba(249,115,22,0.07)' : 'transparent',
        color: active ? '#b84a09' : '#5d667a',
        borderLeft: active ? '2px solid rgba(249,115,22,0.65)' : '2px solid transparent',
        transition: 'background 0.12s ease, color 0.12s ease',
      }}
      className={active ? '' : 'db-nav-inactive'}
    >
      <span style={{ color: active ? '#ea580c' : '#9faab8', display: 'flex', flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ fontSize: '0.775rem', fontWeight: active ? 700 : 500, flex: 1, letterSpacing: '-0.01em' }}>
        {label}
      </span>
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

function Divider() {
  return <div style={{ height: '1px', background: 'rgba(0,0,0,0.055)', margin: '0.5rem 0' }} />
}

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
      `}</style>

      <aside
        style={{
          width: `${SIDEBAR_W}px`,
          flexShrink: 0,
          background: '#faf9f7',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          padding: '0.75rem 0.625rem 1rem',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >

        {/* ─────────────────── Workspace ──────────────────── */}
        <SectionLabel>Workspace</SectionLabel>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '0.25rem' }}>
          <NavLink
            href="/dashboard"
            icon={ICONS.dashboard}
            label="Dashboard"
            active={exact('/dashboard')}
          />
          <NavLink
            href="/dashboard/flows"
            icon={ICONS.flows}
            label="IdeaFlows"
            active={exact('/dashboard/flows') || under('/dashboard/flows')}
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
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '0.25rem' }}>
              <NavLink
                href="/dashboard/review"
                icon={ICONS.review}
                label="Needs attention"
                active={exact('/dashboard/review') || under('/dashboard/review')}
                badge={pendingReviewCount}
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
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
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
            className="db-user-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.5rem 0.625rem',
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.725rem', fontWeight: 600, color: '#1e2533', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userName || firstName}
              </p>
              <p style={{ fontSize: '0.59rem', color: '#9faab8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
              padding: '0.375rem 0.625rem',
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
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Sign out</span>
          </button>
        </div>

      </aside>
    </>
  )
}
