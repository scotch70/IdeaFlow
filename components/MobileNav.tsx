'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface MobileNavProps {
  isLoggedIn: boolean
  email: string | null
}

export default function MobileNav({ isLoggedIn, email }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const linkStyle = {
    display: 'block',
    padding: '0.75rem 1rem',
    borderRadius: '0.625rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#2c4a6e',
    textDecoration: 'none',
    transition: 'background 0.15s',
  }

  return (
    <div className="lg:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '5px',
          width: '2.25rem',
          height: '2.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
        }}
      >
        <span style={{ display: 'block', width: '1.25rem', height: '1.5px', background: '#2c4a6e', transform: open ? 'translateY(6.5px) rotate(45deg)' : 'none', transition: 'all 0.2s ease' }} />
        <span style={{ display: 'block', width: '1.25rem', height: '1.5px', background: '#2c4a6e', opacity: open ? 0 : 1, transition: 'opacity 0.15s ease' }} />
        <span style={{ display: 'block', width: '1.25rem', height: '1.5px', background: '#2c4a6e', transform: open ? 'translateY(-6.5px) rotate(-45deg)' : 'none', transition: 'all 0.2s ease' }} />
      </button>

      {/* Drawer */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(26,107,191,0.10)',
            padding: '0.75rem 1.25rem 1.25rem',
            zIndex: 50,
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            <Link href="/" onClick={() => setOpen(false)} style={linkStyle}>Home</Link>
            <Link href="/features" onClick={() => setOpen(false)} style={linkStyle}>Features</Link>
            <Link href="/contact" onClick={() => setOpen(false)} style={linkStyle}>Contact</Link>

            {isLoggedIn ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} style={linkStyle}>Dashboard</Link>
                <Link href="/settings" onClick={() => setOpen(false)} style={linkStyle}>Profile &amp; settings</Link>
                {email && (
                  <p style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#9ab0c8' }}>{email}</p>
                )}
                <div style={{ borderTop: '1px solid rgba(26,107,191,0.09)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                  <button
                    onClick={handleSignOut}
                    style={{ ...linkStyle, width: '100%', textAlign: 'left', cursor: 'pointer', color: '#5a7fa8' }}
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/join" onClick={() => setOpen(false)} style={linkStyle}>Join</Link>
                <Link href="/auth" onClick={() => setOpen(false)} style={linkStyle}>Login</Link>
                <div style={{ borderTop: '1px solid rgba(26,107,191,0.09)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                  <Link
                    href="/auth"
                    onClick={() => setOpen(false)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: '9999px',
                      padding: '0.5rem 1.25rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      color: '#fff',
                      textDecoration: 'none',
                    }}
                  >
                    Register
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
