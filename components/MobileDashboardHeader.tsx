'use client'

/**
 * MobileDashboardHeader
 *
 * Sticky top bar shown on mobile only (hidden ≥ md via parent class).
 * Contains:
 *   - IdeaFlow logo (left)
 *   - Hamburger button (right) that toggles a full-height slide-over drawer
 *
 * The drawer replicates all navigation from DashboardSidebar so users
 * can reach every route on small screens.
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LogoMark from '@/components/LogoMark'

interface Props {
  userName:  string
  userEmail: string
  userRole:  string
}

function Ico({ d, d2 }: { d: string; d2?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d} />
      {d2 && <path d={d2} />}
    </svg>
  )
}

const ICONS = {
  dashboard: <Ico d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  ideas:     <Ico d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" d2="M9 21h6" />,
  flows:     <Ico d="M12 2L2 7l10 5 10-5-10-5z" d2="M2 12l10 5 10-5M2 17l10 5 10-5" />,
  review:    <Ico d="M9 11l3 3L22 4" d2="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  members:   <Ico d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" d2="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0c1.66 0 3-1.34 3-3s-1.34-3-3-3m3 13v-2a4 4 0 0 0-3-3.87" />,
  setup:     <Ico d="M12 20h9" d2="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />,
  analytics: <Ico d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  settings:  <Ico d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  signout:   <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" d2="M16 17l5-5-5-5M21 12H9" />,
}

function DrawerLink({ href, icon, label, active, onClick }: {
  href: string; icon: React.ReactNode; label: string; active: boolean; onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        textDecoration: 'none',
        background: active ? 'rgba(249,115,22,0.08)' : 'transparent',
        color: active ? '#c2540a' : '#374151',
        borderLeft: `3px solid ${active ? '#f97316' : 'transparent'}`,
        fontSize: '0.925rem', fontWeight: active ? 700 : 500,
        transition: 'background 0.1s',
      }}
    >
      <span style={{ color: active ? '#ea580c' : '#9ab0c8' }}>{icon}</span>
      {label}
    </Link>
  )
}

function DrawerDivider({ label }: { label: string }) {
  return (
    <div style={{ padding: '0.875rem 1.25rem 0.375rem' }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9ab0c8' }}>
        {label}
      </p>
    </div>
  )
}

export default function MobileDashboardHeader({ userName, userEmail, userRole }: Props) {
  const [open, setOpen]   = useState(false)
  const pathname          = usePathname()
  const router            = useRouter()
  const supabase          = createClient()

  const isAdmin   = userRole === 'admin'
  const firstName = userName.split(' ')[0] || 'You'
  const initials  = userName.split(' ').slice(0, 2).map(n => n[0] ?? '').join('').toUpperCase() || '?'

  const exact  = (href: string) => pathname === href
  const under  = (href: string) => pathname.startsWith(href + '/')
  const active = (href: string) => exact(href) || under(href)

  function close() { setOpen(false) }

  async function handleSignOut() {
    close()
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div style={{
        height: '3.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.25rem',
        background: '#ffffff',
        borderBottom: '1px solid #e8ecf0',
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <LogoMark size={22} />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.03em' }}>
            Idea<span style={{ color: '#f97316' }}>Flow</span>
          </span>
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          style={{
            width: '2.25rem', height: '2.25rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '0.3rem',
            background: 'none', border: 'none', cursor: 'pointer',
            borderRadius: '8px',
            padding: '0',
          }}
        >
          <span style={{ display: 'block', width: '1.25rem', height: '2px', background: '#475569', borderRadius: '2px' }} />
          <span style={{ display: 'block', width: '1.25rem', height: '2px', background: '#475569', borderRadius: '2px' }} />
          <span style={{ display: 'block', width: '1.25rem', height: '2px', background: '#475569', borderRadius: '2px' }} />
        </button>
      </div>

      {/* ── Drawer backdrop ─────────────────────────────────────────────── */}
      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 49,
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Slide-over drawer ───────────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 'min(85vw, 320px)',
          zIndex: 50,
          background: '#ffffff',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
        }}
      >
        {/* Drawer header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e8ecf0',
        }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '2rem', height: '2rem', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{firstName}</p>
              <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{isAdmin ? 'Admin' : 'Member'}</p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={close}
            aria-label="Close navigation"
            style={{
              width: '2rem', height: '2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
              borderRadius: '50%', fontSize: '1.1rem', color: '#475569',
            }}
          >
            ×
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <DrawerDivider label="Workspace" />
          <DrawerLink href="/dashboard"        icon={ICONS.dashboard} label="Dashboard"   active={exact('/dashboard')} onClick={close} />
          <DrawerLink href="/dashboard/flows"  icon={ICONS.flows}     label="IdeaFlows"   active={active('/dashboard/flows')} onClick={close} />
          <DrawerLink href="/dashboard/ideas"  icon={ICONS.ideas}     label="Ideas"       active={active('/dashboard/ideas')} onClick={close} />

          {isAdmin && (
            <>
              <DrawerDivider label="Management" />
              <DrawerLink href="/dashboard/review"     icon={ICONS.review}    label="Needs attention"  active={active('/dashboard/review')}    onClick={close} />
              <DrawerLink href="/dashboard/idea-flow"  icon={ICONS.setup}     label="Set up IdeaFlow"  active={active('/dashboard/idea-flow')} onClick={close} />
              <DrawerLink href="/dashboard/analytics"  icon={ICONS.analytics} label="Analytics"        active={active('/dashboard/analytics')} onClick={close} />
            </>
          )}

          <DrawerDivider label="Team" />
          <DrawerLink href="/dashboard/members" icon={ICONS.members}  label="Members"  active={active('/dashboard/members')} onClick={close} />

          <DrawerDivider label="Account" />
          <DrawerLink href="/settings"          icon={ICONS.settings} label="Settings" active={active('/settings')} onClick={close} />
        </nav>

        {/* Sign out */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #e8ecf0' }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.75rem 0',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.925rem', fontWeight: 500, color: '#64748b',
            }}
          >
            <span style={{ color: '#9ab0c8' }}>{ICONS.signout}</span>
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}
