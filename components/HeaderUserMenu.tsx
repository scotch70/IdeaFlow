'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
}

function Initials({ first, last, size = 32 }: { first: string; last: string; size?: number }) {
  const a = (first[0] ?? '').toUpperCase()
  const b = (last[0] ?? first[1] ?? '').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, color: '#fff',
      letterSpacing: '-0.02em', userSelect: 'none', flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {a || '?'}{b}
    </div>
  )
}

export default function HeaderUserMenu({ firstName, lastName, email, avatarUrl }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || email

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: open ? 'rgba(26,107,191,0.06)' : 'transparent',
          border: '1px solid transparent',
          borderRadius: '9999px', padding: '0.2rem 0.6rem 0.2rem 0.2rem',
          cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(26,107,191,0.06)' }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        aria-label="Account menu"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#5a7fa8" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
        )}
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2c4a6e', maxWidth: '7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {firstName || email.split('@')[0]}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="#9ab0c8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
            minWidth: '13rem', background: '#fff',
            borderRadius: '1rem', border: '1px solid rgba(26,107,191,0.12)',
            boxShadow: '0 8px 32px rgba(6,14,38,0.12)', padding: '0.5rem',
            zIndex: 100,
          }}
        >
          {/* User info */}
          <div style={{ padding: '0.75rem 0.875rem 0.875rem', borderBottom: '1px solid rgba(26,107,191,0.08)', marginBottom: '0.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <Initials first={firstName} last={lastName} size={36} />
              )}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1f35', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </p>
                <p style={{ fontSize: '0.72rem', color: '#9ab0c8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.55rem 0.875rem', borderRadius: '0.625rem', fontSize: '0.85rem', fontWeight: 500, color: '#2c4a6e', textDecoration: 'none', transition: 'background 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,107,191,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </Link>

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.55rem 0.875rem', borderRadius: '0.625rem', fontSize: '0.85rem', fontWeight: 500, color: '#2c4a6e', textDecoration: 'none', transition: 'background 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,107,191,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            Profile &amp; settings
          </Link>

          <div style={{ borderTop: '1px solid rgba(26,107,191,0.08)', margin: '0.375rem 0' }} />

          <button
            onClick={handleSignOut}
            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.55rem 0.875rem', borderRadius: '0.625rem', fontSize: '0.85rem', fontWeight: 500, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
