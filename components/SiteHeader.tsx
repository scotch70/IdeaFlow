import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MobileNav from './MobileNav'
import HeaderUserMenu from './HeaderUserMenu'

export default async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { full_name: string | null; last_name: string | null; avatar_url: string | null } | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, last_name, avatar_url')
      .eq('id', user.id)
      .single() as unknown as { data: { full_name: string | null; last_name: string | null; avatar_url: string | null } | null }
    profile = data
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10"
        style={{ height: '3.5rem' }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            textDecoration: 'none', flexShrink: 0,
          }}
        >
          <span style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#111111',
            letterSpacing: '-0.03em',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            IdeaFlow
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 text-sm font-medium">
          <Link href="/features" className="nav-link">Features</Link>
          <a href="/#pricing" className="nav-link">Pricing</a>

          {user ? (
            <>
              <Link href="/dashboard" className="nav-link" style={{ marginLeft: '0.25rem' }}>Dashboard</Link>
              <div style={{ marginLeft: '0.625rem' }}>
                <HeaderUserMenu
                  firstName={profile?.full_name ?? ''}
                  lastName={profile?.last_name ?? ''}
                  email={user.email ?? ''}
                  avatarUrl={profile?.avatar_url ?? null}
                />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.5rem' }}>
              {/* Sign in — text only, subdued */}
              <Link
                href="/auth?mode=login"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#6b6b6b',
                  textDecoration: 'none',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.4rem',
                  transition: 'color 0.12s',
                }}
              >
                Sign in
              </Link>

              {/* Get started — filled black button */}
              <Link
                href="/auth?mode=signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '2rem',
                  padding: '0 0.875rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: '#111111',
                  color: '#ffffff',
                  textDecoration: 'none',
                  letterSpacing: '-0.005em',
                  transition: 'background 0.12s',
                }}
              >
                Get started →
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile nav */}
        <MobileNav isLoggedIn={!!user} email={user?.email ?? null} />
      </div>
    </header>
  )
}
