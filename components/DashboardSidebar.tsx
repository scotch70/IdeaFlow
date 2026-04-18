'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LogoMark from '@/components/LogoMark'

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
  matchExact?: boolean
}

interface Props {
  userName: string
  userEmail: string
  userRole: string
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const Icon = {
  dashboard: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  ideas: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
      <path d="M9 21h6M10 17v4M14 17v4"/>
    </svg>
  ),
  review: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  members: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4"/>
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      <path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  signout: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

// ── Nav items config ──────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard',        icon: Icon.dashboard, matchExact: true },
  { label: 'Ideas',      href: '/dashboard',        icon: Icon.ideas,     matchExact: true },
  { label: 'Review',     href: '/dashboard/review', icon: Icon.review,    adminOnly: true },
  { label: 'Members',    href: '/dashboard',        icon: Icon.members,   matchExact: true },
  { label: 'Settings',   href: '/settings',         icon: Icon.settings,  matchExact: false },
]

// ── NavLink ───────────────────────────────────────────────────────────────────

function NavLink({
  item,
  isActive,
}: {
  item: NavItem
  isActive: boolean
}) {
  return (
    <Link
      href={item.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.45rem 0.625rem',
        borderRadius: '8px',
        textDecoration: 'none',
        background: isActive ? 'rgba(249,115,22,0.09)' : 'transparent',
        transition: 'background 0.15s ease',
      }}
      className={isActive ? '' : 'sidebar-link-inactive'}
    >
      <span style={{ color: isActive ? '#ea580c' : '#64748b', display: 'flex', flexShrink: 0 }}>
        {item.icon}
      </span>
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: isActive ? 700 : 500,
          color: isActive ? '#c2540a' : '#475569',
          letterSpacing: '-0.01em',
        }}
      >
        {item.label}
      </span>
      {isActive && (
        <span
          style={{
            marginLeft: 'auto',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#f97316',
            flexShrink: 0,
          }}
        />
      )}
    </Link>
  )
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function DashboardSidebar({ userName, userEmail, userRole }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const isAdmin = userRole === 'admin'

  const firstName = userName.split(' ')[0] || 'You'
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  function isItemActive(item: NavItem): boolean {
    if (item.matchExact !== false) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <>
      {/* Hover styles injected globally */}
      <style>{`
        .sidebar-link-inactive:hover { background: rgba(0,0,0,0.04) !important; }
        .sidebar-signout:hover { background: rgba(0,0,0,0.05) !important; color: #0f172a !important; }
      `}</style>

      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRight: '1px solid #e8ecf0',
          padding: '1.25rem 0.875rem',
          overflow: 'hidden',
        }}
      >
        {/* ── Logo ── */}
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.75rem',
            paddingLeft: '0.25rem',
            textDecoration: 'none',
          }}
        >
          <LogoMark size={30} />
          <span
            style={{
              fontSize: '0.975rem',
              fontWeight: 800,
              color: '#0d1f35',
              letterSpacing: '-0.03em',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Idea<span style={{ color: '#f97316' }}>Flow</span>
          </span>
        </Link>

        {/* ── Nav label ── */}
        <p
          style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#94a3b8',
            marginBottom: '0.375rem',
            paddingLeft: '0.625rem',
          }}
        >
          Workspace
        </p>

        {/* ── Nav items ── */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {visibleItems.map((item) => (
            <NavLink key={item.label} item={item} isActive={isItemActive(item)} />
          ))}
        </nav>

        {/* ── Spacer ── */}
        <div style={{ flex: 1 }} />

        {/* ── User footer ── */}
        <div
          style={{
            borderTop: '1px solid #e8ecf0',
            paddingTop: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {/* User card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.5rem 0.625rem',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e8ecf0',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '1.875rem',
                height: '1.875rem',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '0.65rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.02em',
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {firstName}
              </p>
              <p
                style={{
                  fontSize: '0.6rem',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {isAdmin ? 'Admin' : 'Member'}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="sidebar-signout"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.625rem',
              borderRadius: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              transition: 'background 0.15s ease',
            }}
          >
            <span style={{ color: '#94a3b8', display: 'flex' }}>{Icon.signout}</span>
            <span style={{ fontSize: '0.775rem', fontWeight: 500, color: '#64748b' }}>
              Sign out
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
