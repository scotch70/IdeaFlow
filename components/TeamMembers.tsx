'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Member {
  id: string
  full_name: string | null
  role: string
}

interface Props {
  members: Member[]
  currentUserId: string
  currentUserRole: string
}

function getInitials(name: string | null) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function avatarColor(name: string | null): { bg: string; color: string } {
  if (!name) return { bg: 'rgba(26,107,191,0.12)', color: '#0e52a8' }
  const palette = [
    { bg: 'rgba(249,115,22,0.12)', color: '#ea580c' },
    { bg: 'rgba(26,107,191,0.12)', color: '#0e52a8' },
    { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
    { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
    { bg: 'rgba(236,72,153,0.12)', color: '#db2777' },
    { bg: 'rgba(234,179,8,0.12)',  color: '#b45309' },
  ]
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

export default function TeamMembers({ members, currentUserId, currentUserRole }: Props) {
  const router = useRouter()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleRemove(memberId: string, name: string | null) {
    if (!confirm(`Remove ${name || 'this user'} from the workspace?`)) return
    setRemovingId(memberId)
    setError('')
    try {
      const res = await fetch('/api/members/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-light)', marginBottom: '0.2rem' }}>
          Team members
        </p>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>
          People in your workspace
        </h2>
      </div>

      {error && (
        <p style={{ borderRadius: '0.625rem', border: '1px solid rgba(220,38,38,0.15)', background: 'rgba(220,38,38,0.05)', padding: '0.5rem 0.75rem', fontSize: '0.825rem', color: '#dc2626' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {members.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)' }}>No members yet.</p>
        ) : (
          members.map(member => {
            const isYou = member.id === currentUserId
            const canRemove = currentUserRole === 'admin' && !isYou && member.role !== 'admin'
            const { bg, color } = avatarColor(member.full_name)

            return (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  borderRadius: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  border: '1px solid var(--border)',
                  background: isYou ? 'rgba(249,115,22,0.03)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0 }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0, letterSpacing: '0.02em' }}>
                    {getInitials(member.full_name)}
                  </div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.full_name || 'Unnamed'}
                    {isYou && <span style={{ marginLeft: '0.375rem', fontSize: '0.72rem', fontWeight: 400, color: 'var(--ink-light)' }}>(You)</span>}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{ borderRadius: '9999px', padding: '0.2rem 0.625rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'capitalize', background: member.role === 'admin' ? 'var(--badge-admin-bg)' : 'var(--badge-member-bg)', color: member.role === 'admin' ? 'var(--badge-admin-text)' : 'var(--badge-member-text)' }}>
                    {member.role}
                  </span>
                  {canRemove && (
                    <button
                      onClick={() => handleRemove(member.id, member.full_name)}
                      disabled={removingId === member.id}
                      style={{ fontSize: '0.72rem', fontWeight: 500, color: '#dc2626', background: 'none', border: 'none', cursor: removingId === member.id ? 'default' : 'pointer', opacity: removingId === member.id ? 0.5 : 1, padding: 0 }}
                    >
                      {removingId === member.id ? '…' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
