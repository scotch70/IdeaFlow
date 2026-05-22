'use client'

/**
 * MembersRelationshipList — flow-aware, grouped per member.
 *
 * Each row is a member, with the IdeaFlows they belong to nested under them.
 *
 *   Alex                                      admin · 2 flows · active 3d ago
 *     ↳ What car should I buy?      active   open
 *     ↳ What house should I buy?    active   restricted
 *
 *   Morgan                                    member · 1 flow · active 1d ago
 *     ↳ What car should I buy?      active   open
 *
 * Members with zero flow access roll into a collapsible "Inactive members"
 * section at the bottom. The whole list is searchable.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { FlowSummary, WorkspaceMemberWithFlows } from '@/types/database'
import { isPaidPlan } from '@/lib/plans/planFeatures'

interface Props {
  members:         WorkspaceMemberWithFlows[]
  currentUserId:   string
  currentUserRole: string
  /** Company plan slug — search bar only renders on Standard+ */
  companyPlan?:    string
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function getInitials(name: string | null): string {
  if (!name) return '?'
  const p = name.trim().split(/\s+/)
  return p.length === 1
    ? p[0][0].toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

function avatarColor(name: string | null): { bg: string; color: string } {
  const palette = [
    { bg: 'rgba(249,115,22,0.12)', color: '#ea580c' },
    { bg: 'rgba(26,107,191,0.12)', color: '#0e52a8' },
    { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
    { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
    { bg: 'rgba(236,72,153,0.12)', color: '#db2777' },
    { bg: 'rgba(234,179,8,0.12)',  color: '#b45309' },
  ]
  if (!name) return palette[1]
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'never'
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return 'just now'
  const m = Math.floor(ms / 60_000)
  if (m < 1)    return 'just now'
  if (m < 60)   return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24)   return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)    return `${d}d ago`
  if (d < 30)   return `${Math.floor(d / 7)}w ago`
  if (d < 365)  return `${Math.floor(d / 30)}mo ago`
  return `${Math.floor(d / 365)}y ago`
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const FLOW_STATUS_META: Record<FlowSummary['status'], { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: '#065f46', bg: 'rgba(16,185,129,0.10)' },
  draft:  { label: 'Draft',  color: '#92400e', bg: 'rgba(249,115,22,0.10)' },
  closed: { label: 'Closed', color: '#475569', bg: 'rgba(0,0,0,0.06)' },
}

function FlowChip({ flow }: { flow: FlowSummary }) {
  const sm  = FLOW_STATUS_META[flow.status]
  const aud = flow.audienceMode === 'restricted' ? 'Restricted' : 'Open'
  return (
    <Link
      href={`/dashboard/flows/${flow.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.45rem 0.6rem 0.45rem 0.55rem',
        borderRadius: '0.55rem',
        background: '#ffffff',
        border: '1px solid rgba(26,107,191,0.10)',
        textDecoration: 'none',
        color: '#0d1f35',
        minWidth: 0,
        transition: 'border-color 0.12s, background 0.12s',
      }}
      className="member-flow-chip"
    >
      <span
        aria-hidden
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: sm.color,
          flexShrink: 0,
        }}
      />
      <span style={{
        fontSize: '0.825rem',
        fontWeight: 600,
        color: '#0d1f35',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: 1,
        minWidth: 0,
      }}>
        {flow.name}
      </span>
      <span style={{
        fontSize: '0.66rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: sm.color,
        background: sm.bg,
        padding: '0.15rem 0.45rem',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        {sm.label}
      </span>
      <span style={{
        fontSize: '0.66rem',
        fontWeight: 600,
        color: '#94a3b8',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        {aud}
      </span>
    </Link>
  )
}

function MemberCard({
  member, currentUserId, canRemove, onRemove, removing,
}: {
  member:        WorkspaceMemberWithFlows
  currentUserId: string
  canRemove:     boolean
  removing:      boolean
  onRemove:      () => void
}) {
  const isYou = member.id === currentUserId
  const { bg, color } = avatarColor(member.fullName)
  const flowCount = member.flows.length
  const [confirming, setConfirming] = useState(false)

  return (
    <div
      style={{
        borderRadius: '0.875rem',
        border: '1px solid rgba(26,107,191,0.10)',
        background: isYou ? 'rgba(249,115,22,0.025)' : '#ffffff',
        padding: '1rem 1.125rem',
      }}
    >
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: flowCount > 0 ? '0.75rem' : 0,
      }}>
        <div style={{
          width: '2.25rem', height: '2.25rem', borderRadius: '50%',
          background: bg, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.02em',
          flexShrink: 0,
        }}>
          {getInitials(member.fullName)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
            <p style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#0d1f35',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {member.fullName || 'Unnamed'}
            </p>
            {isYou && (
              <span style={{ fontSize: '0.72rem', color: '#9ab0c8', fontWeight: 500 }}>(You)</span>
            )}
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              borderRadius: '999px',
              padding: '0.15rem 0.5rem',
              background: member.workspaceRole === 'admin' ? 'var(--badge-admin-bg, rgba(249,115,22,0.10))' : 'var(--badge-member-bg, rgba(26,107,191,0.08))',
              color:      member.workspaceRole === 'admin' ? 'var(--badge-admin-text, #c2540a)' : 'var(--badge-member-text, #0e52a8)',
            }}>
              {member.workspaceRole}
            </span>
          </div>
          <p style={{
            fontSize: '0.72rem',
            color: '#9ab0c8',
            marginTop: '0.1rem',
            fontWeight: 500,
          }}>
            {flowCount === 0
              ? 'No active IdeaFlows'
              : `${flowCount} ${flowCount === 1 ? 'IdeaFlow' : 'IdeaFlows'}`}
            {' · '}active {relativeTime(member.lastActiveAt)}
          </p>
        </div>

        {canRemove && (
          confirming ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <button
                onClick={onRemove}
                disabled={removing}
                style={{
                  fontSize: '0.72rem', fontWeight: 700, color: '#dc2626',
                  background: 'none', border: 'none', cursor: removing ? 'wait' : 'pointer',
                  padding: 0,
                }}
              >
                {removing ? 'Removing…' : 'Sure?'}
              </button>
              <span style={{ color: 'rgba(154,176,200,0.5)' }}>·</span>
              <button
                onClick={() => setConfirming(false)}
                disabled={removing}
                style={{
                  fontSize: '0.72rem', fontWeight: 500, color: '#9ab0c8',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              style={{
                fontSize: '0.72rem', fontWeight: 600, color: '#dc2626',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                flexShrink: 0,
              }}
            >
              Remove
            </button>
          )
        )}
      </div>

      {/* Flow chips */}
      {flowCount > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          paddingLeft: '3rem',  // align under name
        }}>
          {member.flows.map(flow => (
            <FlowChip key={flow.id} flow={flow} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function MembersRelationshipList({
  members, currentUserId, currentUserRole, companyPlan,
}: Props) {
  const router = useRouter()
  const isAdmin    = currentUserRole === 'admin'
  // Search is a Standard+ feature. On Free we hide the input entirely and
  // keep the list unfiltered (query stays '').
  const canSearch  = isAdmin && isPaidPlan(companyPlan)

  const [query,      setQuery]      = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error,      setError]      = useState('')
  const [showInactive, setShowInactive] = useState(false)

  // ── Search + partitioning ──────────────────────────────────────────────────
  const { active, inactive } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = (m: WorkspaceMemberWithFlows) => {
      if (!q) return true
      if ((m.fullName ?? '').toLowerCase().includes(q)) return true
      return m.flows.some(f => f.name.toLowerCase().includes(q))
    }
    const filtered = members.filter(matches)
    return {
      active:   filtered.filter(m => m.flows.length > 0),
      inactive: filtered.filter(m => m.flows.length === 0),
    }
  }, [members, query])

  async function handleRemove(memberId: string) {
    setRemovingId(memberId)
    setError('')
    try {
      const res = await fetch('/api/members/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to remove member')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Search (Standard+ admins only) ──────────────────────────────── */}
      {canSearch && (
        <div style={{ position: 'relative' }}>
          <input
            type="search"
            placeholder="Search members or IdeaFlows…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Search members"
            className="input"
            style={{
              fontSize: '0.875rem',
              paddingLeft: '2.25rem',
              paddingRight: query ? '2.25rem' : undefined,
              borderColor: searchFocused ? 'rgba(249,115,22,0.45)' : undefined,
              boxShadow:   searchFocused ? '0 0 0 3px rgba(249,115,22,0.10)' : undefined,
              transition:  'border-color 0.12s, box-shadow 0.12s',
            }}
          />
          <svg
            aria-hidden
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke={searchFocused ? '#c2540a' : '#9ab0c8'} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              transition: 'stroke 0.12s',
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '0.6rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(15,23,42,0.06)',
                border: 'none',
                width: '1.4rem', height: '1.4rem',
                borderRadius: '999px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '0.95rem', lineHeight: 1,
              }}
            >×</button>
          )}
          {/* Live result count for accessibility */}
          {query && (
            <p
              aria-live="polite"
              style={{
                fontSize: '0.7rem', color: '#9ab0c8',
                marginTop: '0.4rem', paddingLeft: '0.25rem',
              }}
            >
              {active.length + inactive.length} match{(active.length + inactive.length) === 1 ? '' : 'es'} for &ldquo;{query}&rdquo;
            </p>
          )}
        </div>
      )}

      {error && (
        <p style={{
          borderRadius: '0.625rem',
          border: '1px solid rgba(220,38,38,0.18)',
          background: 'rgba(220,38,38,0.05)',
          padding: '0.55rem 0.85rem',
          fontSize: '0.825rem',
          color: '#dc2626',
        }}>
          {error}
        </p>
      )}

      {/* ── Active members ──────────────────────────────────────────────── */}
      {active.length === 0 && inactive.length === 0 ? (
        <div style={{ padding: '2rem 0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink, #0d1f35)', marginBottom: '0.25rem' }}>
            {query ? 'No matches' : 'No members yet'}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-faint, #9ab0c8)' }}>
            {query ? 'Try a different name or flow.' : 'Invite someone from any IdeaFlow to get started.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {active.map(m => (
            <MemberCard
              key={m.id}
              member={m}
              currentUserId={currentUserId}
              canRemove={isAdmin && m.id !== currentUserId && m.workspaceRole !== 'admin'}
              removing={removingId === m.id}
              onRemove={() => handleRemove(m.id)}
            />
          ))}
        </div>
      )}

      {/* ── Inactive / orphaned ─────────────────────────────────────────── */}
      {inactive.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setShowInactive(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.5rem 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#9ab0c8',
            }}>
              Inactive members · {inactive.length}
            </span>
            <span style={{
              fontSize: '0.66rem',
              color: '#9ab0c8',
              marginLeft: 'auto',
            }}>
              {showInactive ? '▾ Hide' : '▸ Show'}
            </span>
          </button>
          {showInactive && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}>
              {inactive.map(m => (
                <MemberCard
                  key={m.id}
                  member={m}
                  currentUserId={currentUserId}
                  canRemove={isAdmin && m.id !== currentUserId && m.workspaceRole !== 'admin'}
                  removing={removingId === m.id}
                  onRemove={() => handleRemove(m.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .member-flow-chip:hover {
          border-color: rgba(26,107,191,0.22) !important;
          background: rgba(248,250,255,0.6) !important;
        }
      `}</style>
    </div>
  )
}
