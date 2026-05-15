'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LogoMark from '@/components/LogoMark'

interface Props {
  userEmail: string
  userFullName: string
}

type View = 'join' | 'create'

const CARD: React.CSSProperties = {
  borderRadius: '1.5rem',
  padding: '2rem',
  background: 'rgba(255,255,255,0.97)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)',
  border: '1px solid rgba(255,255,255,0.20)',
}

export default function JoinWorkspaceClient({ userEmail, userFullName }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [view, setView] = useState<View>('join')

  // Join-with-code state
  const [code, setCode]       = useState('')
  const [name, setName]       = useState(userFullName)
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError]     = useState('')

  // Create-workspace state
  const [workspaceName, setWorkspaceName]       = useState('')
  const [createLoading, setCreateLoading]       = useState(false)
  const [createError, setCreateError]           = useState('')

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setJoinLoading(true)
    setJoinError('')
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code.trim().toUpperCase(), fullName: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to join workspace')
      router.push(data.redirectTo ?? '/dashboard')
    } catch (err: unknown) {
      setJoinError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setJoinLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError('')
    try {
      // Write workspace name into the user's metadata so /api/onboard can read it.
      const { error: updateError } = await supabase.auth.updateUser({
        data: { company_name: workspaceName.trim() },
      })
      if (updateError) throw updateError
      // /api/onboard reads company_name from metadata, creates company + profile, redirects.
      router.push('/api/onboard')
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Something went wrong')
      setCreateLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const pageShell = (children: React.ReactNode) => (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background:
          'linear-gradient(160deg, #060e26 0%, #0a1f50 35%, #0e3278 60%, #1a5a9a 85%, #2e7abf 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 60% 55% at 30% 60%, rgba(249,115,22,0.09) 0%, transparent 65%)',
        }}
      />
      <div style={{ width: '100%', maxWidth: '22rem', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginBottom: '2rem',
            justifyContent: 'center',
          }}
        >
          <div style={{ filter: 'drop-shadow(0 3px 12px rgba(240,104,0,0.40))' }}>
            <LogoMark size={30} />
          </div>
          <span
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.03em',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Idea<span style={{ color: '#ffb733' }}>Flow</span>
          </span>
        </div>
        {children}
      </div>
    </main>
  )

  // ── Signed-in-as pill ─────────────────────────────────────────────────────
  const signedInAs = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderRadius: '0.625rem',
        border: '1px solid rgba(26,107,191,0.14)',
        background: 'rgba(26,107,191,0.04)',
        padding: '0.5rem 0.75rem',
        fontSize: '0.775rem',
        color: '#5d667a',
        marginBottom: '1.25rem',
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ab0c8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span>
        Signed in as <strong style={{ color: '#1f2330', fontWeight: 600 }}>{userEmail}</strong>
      </span>
    </div>
  )

  // ── Sign-out link ─────────────────────────────────────────────────────────
  const signOutLink = (
    <div
      style={{
        marginTop: '1.25rem',
        paddingTop: '1.125rem',
        borderTop: '1px solid #e7e2d8',
        textAlign: 'center',
      }}
    >
      <button
        type="button"
        onClick={handleSignOut}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#5d667a',
          textDecoration: 'underline',
          textDecorationColor: 'rgba(93,102,122,0.3)',
          textUnderlineOffset: '2px',
        }}
      >
        Sign out
      </button>
    </div>
  )

  // ── View: join with invite code ───────────────────────────────────────────
  if (view === 'join') {
    return pageShell(
      <div style={CARD}>
        <div style={{ marginBottom: '1.25rem' }}>
          <p
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#b8c0ce',
              marginBottom: '0.3rem',
            }}
          >
            No workspace yet
          </p>
          <h1
            style={{
              fontSize: '1.375rem',
              fontWeight: 800,
              color: '#1f2330',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '0.4rem',
            }}
          >
            Join a workspace
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#5d667a', lineHeight: 1.6 }}>
            You&apos;re signed in, but not part of a workspace yet. Enter your invite code to
            get access.
          </p>
        </div>

        {signedInAs}

        <form
          onSubmit={handleJoin}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <input
            className="input"
            placeholder="Invite code"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            required
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <input
            className="input"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          {joinError && (
            <p
              style={{
                borderRadius: '0.625rem',
                border: '1px solid rgba(220,38,38,0.18)',
                background: 'rgba(220,38,38,0.06)',
                padding: '0.5rem 0.75rem',
                fontSize: '0.825rem',
                color: '#dc2626',
              }}
            >
              {joinError}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ marginTop: '0.25rem' }}
            disabled={joinLoading || !code.trim() || !name.trim()}
          >
            {joinLoading ? 'Joining…' : 'Join workspace →'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e7e2d8',
            textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => setView('create')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#1a6bbf',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(26,107,191,0.3)',
              textUnderlineOffset: '2px',
            }}
          >
            Create a new workspace instead
          </button>
        </div>

        {signOutLink}
      </div>
    )
  }

  // ── View: create a new workspace ──────────────────────────────────────────
  return pageShell(
    <div style={CARD}>
      <div style={{ marginBottom: '1.25rem' }}>
        <p
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#b8c0ce',
            marginBottom: '0.3rem',
          }}
        >
          New workspace
        </p>
        <h1
          style={{
            fontSize: '1.375rem',
            fontWeight: 800,
            color: '#1f2330',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: '0.4rem',
          }}
        >
          Create a workspace
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#5d667a', lineHeight: 1.6 }}>
          Start fresh with a new IdeaFlow workspace. Free plan, up to 10 members.
        </p>
      </div>

      {signedInAs}

      <form
        onSubmit={handleCreate}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <input
          className="input"
          placeholder="Workspace name (e.g. Acme Corp)"
          value={workspaceName}
          onChange={e => setWorkspaceName(e.target.value)}
          required
          autoFocus
        />

        {createError && (
          <p
            style={{
              borderRadius: '0.625rem',
              border: '1px solid rgba(220,38,38,0.18)',
              background: 'rgba(220,38,38,0.06)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.825rem',
              color: '#dc2626',
            }}
          >
            {createError}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: '0.25rem' }}
          disabled={createLoading || !workspaceName.trim()}
        >
          {createLoading ? 'Creating…' : 'Create workspace →'}
        </button>
      </form>

      <div
        style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e7e2d8',
          textAlign: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => setView('join')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#1a6bbf',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(26,107,191,0.3)',
            textUnderlineOffset: '2px',
          }}
        >
          I have an invite code instead
        </button>
      </div>

      {signOutLink}
    </div>
  )
}
