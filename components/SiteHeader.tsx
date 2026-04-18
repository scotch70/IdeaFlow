import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MobileNav from './MobileNav'
import LogoMark from './LogoMark'
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
        background: 'rgba(255,255,255,0.92)',
        borderBottom: '1px solid rgba(26,107,191,0.10)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
      }}
    >
      <div
        className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10"
        style={{ height: '3.625rem' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline" style={{ flexShrink: 0 }}>
          <div style={{ flexShrink: 0 }}>
            <LogoMark size={36} />
          </div>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>
            Idea<span style={{ color: '#f97316' }}>Flow</span>
          </span>
        </Link>

        {/* Desktop navigation — hidden on mobile */}
        <nav className="hidden lg:flex items-center gap-0.5 text-sm font-medium">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/features" className="nav-link">Features</Link>
          <Link href="/contact" className="nav-link">Contact</Link>

          {user ? (
            <>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <div style={{ marginLeft: '0.5rem' }}>
                <HeaderUserMenu
                  firstName={profile?.full_name ?? ''}
                  lastName={profile?.last_name ?? ''}
                  email={user.email ?? ''}
                  avatarUrl={profile?.avatar_url ?? null}
                />
              </div>
            </>
          ) : (
            <>
              <Link href="/join" className="nav-link">Join</Link>
              <Link href="/auth" className="nav-link">Login</Link>
              <Link
                href="/auth"
                className="ml-1.5"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', padding: '0.375rem 1.05rem', fontSize: '0.8rem', fontWeight: 700, background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', letterSpacing: '0.01em', boxShadow: '0 2px 10px rgba(240,104,0,0.25)', textDecoration: 'none' }}
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile navigation — hidden on desktop */}
        <MobileNav isLoggedIn={!!user} email={user?.email ?? null} />
      </div>
    </header>
  )
}
