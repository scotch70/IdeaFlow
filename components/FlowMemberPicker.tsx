'use client'

/**
 * FlowMemberPicker
 *
 * Shown to admins on the flow detail page.
 * Lists every member in the workspace with a toggle to assign/unassign them to
 * this specific IdeaFlow.
 *
 * Audience semantics:
 *   - 0 assigned  → everyone in the workspace can see/submit (implicit-all)
 *   - ≥1 assigned → only listed members can see/submit
 */

import { useState } from 'react'

interface Member {
  id: string
  full_name: string | null
  role: string
}

interface FlowMemberPickerProps {
  roundId:         string
  companyMembers:  Member[]
  assignedUserIds: string[]
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  const p = name.trim().split(/\s+/)
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

export default function FlowMemberPicker({
  roundId,
  companyMembers,
  assignedUserIds: initialAssigned,
}: FlowMemberPickerProps) {
  const [assigned, setAssigned] = useState<Set<string>>(new Set(initialAssigned))
  const [loading,  setLoading]  = useState<string | null>(null)
  const [error,    setError]    = useState('')

  const isAll = assigned.size === 0

  async function toggle(userId: string) {
    if (loading) return
    setLoading(userId)
    setError('')

    const isCurrentlyAssigned = assigned.has(userId)

    try {
      const res = await fetch(`/api/rounds/${roundId}/members`, {
        method:  isCurrentlyAssigned ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed')
      }
      setAssigned(prev => {
        const next = new Set(prev)
        isCurrentlyAssigned ? next.delete(userId) : next.add(userId)
        return next
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {/* Audience info */}
      <div style={{
        borderRadius: '0.625rem',
        border: isAll ? '1px solid rgba(16,185,129,0.20)' : '1px solid rgba(26,107,191,0.15)',
        background: isAll ? 'rgba(16,185,129,0.04)' : 'rgba(26,107,191,0.04)',
        padding: '0.625rem 0.875rem',
        marginBottom: '0.875rem',
        fontSize: '0.775rem',
        color: isAll ? '#065f46' : '#0e52a8',
        lineHeight: 1.5,
      }}>
        {isAll
          ? '✓ All workspace members can see and submit to this IdeaFlow.'
          : `${assigned.size} member${assigned.size !== 1 ? 's' : ''} assigned — only they can see and submit.`
        }
      </div>

      {error && (
        <p style={{ fontSize: '0.775rem', color: '#dc2626', marginBottom: '0.625rem' }}>{error}</p>
      )}

      {/* Member list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {companyMembers.map(member => {
          const isAssigned  = assigned.has(member.id)
          const isLoading   = loading === member.id

          return (
            <div
              key={member.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: isAssigned ? '1px solid rgba(16,185,129,0.22)' : '1px solid var(--border)',
                background: isAssigned ? 'rgba(16,185,129,0.04)' : '#ffffff',
                transition: 'border-color 0.12s, background 0.12s',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '1.875rem', height: '1.875rem', borderRadius: '50%',
                background: 'rgba(26,107,191,0.1)', color: '#0e52a8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.62rem', fontWeight: 700, flexShrink: 0,
              }}>
                {getInitials(member.full_name)}
              </div>

              {/* Name + role */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0d1f35', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {member.full_name || 'Unnamed'}
                </p>
                <p style={{ fontSize: '0.7rem', color: '#9ab0c8', textTransform: 'capitalize' }}>
                  {member.role}
                </p>
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => toggle(member.id)}
                disabled={isLoading}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  height: '1.75rem', padding: '0 0.75rem',
                  borderRadius: '0.35rem',
                  fontSize: '0.72rem', fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'background 0.1s',
                  background: isAssigned ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.09)',
                  border:     isAssigned ? '1px solid rgba(239,68,68,0.20)' : '1px solid rgba(16,185,129,0.25)',
                  color:      isAssigned ? '#991b1b' : '#065f46',
                  flexShrink: 0,
                }}
              >
                {isLoading ? '…' : isAssigned ? 'Remove' : 'Assign'}
              </button>
            </div>
          )
        })}

        {companyMembers.length === 0 && (
          <p style={{ fontSize: '0.825rem', color: '#9ab0c8', textAlign: 'center', padding: '1rem 0' }}>
            No other members in this workspace yet.
          </p>
        )}
      </div>
    </div>
  )
}
