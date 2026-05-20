'use client'

/**
 * IdeaRoundBanner — shown to ALL users when a round is active, closed, or in draft.
 *
 * Draft:  muted orange "coming soon" banner (submissions locked temporarily).
 * Active: green banner with optional countdown + admin "Close now" button.
 * Closed: red banner + admin "Open now" button.
 *
 * Admin controls call PATCH /api/company/round-status and refresh the page.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type EffectiveStatus = 'draft' | 'active' | 'closed'
type ManualOverride  = 'open' | 'closed' | null

interface IdeaRoundBannerProps {
  name:           string | null
  status:         EffectiveStatus
  endsAt?:        string | null
  /** Whether the current user is an admin (shows open/close button). */
  isAdmin?:       boolean
  companyId?:     string
  /** Round ID — used to call PATCH /api/rounds/[id] for open/close overrides. */
  roundId?:       string
  manualOverride?: ManualOverride
  /** Number of ideas in the current round (for the metadata row). */
  ideaCount?:     number
  /** Total workspace member count (for the metadata row). */
  memberCount?:   number
}

export default function IdeaRoundBanner({
  name,
  status,
  endsAt,
  isAdmin       = false,
  companyId,
  roundId,
  manualOverride: initialOverride = null,
  ideaCount,
  memberCount,
}: IdeaRoundBannerProps) {
  const router = useRouter()

  // Local override state for optimistic UI
  const [manualOverride, setManualOverride] = useState<ManualOverride>(initialOverride)
  const [saving, setSaving]                 = useState(false)

  // Re-derive effective display status from local override (optimistic)
  const effectiveStatus: EffectiveStatus =
    manualOverride === 'closed' ? 'closed' :
    manualOverride === 'open'   ? 'active' :
    status

  const displayName = name?.trim() || null

  async function applyOverride(action: 'open' | 'close') {
    if (!roundId || saving) return
    const override: ManualOverride = action === 'open' ? 'open' : 'closed'
    setSaving(true)
    setManualOverride(override)
    try {
      const res = await fetch(`/api/rounds/${roundId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual_override: override }),
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch {
      setManualOverride(initialOverride) // roll back on error
    } finally {
      setSaving(false)
    }
  }

  // ── Draft ─────────────────────────────────────────────────────────────────
  if (effectiveStatus === 'draft') {
    return (
      <div style={{
        marginBottom: '1.5rem',
        borderRadius: '0.875rem',
        padding: '0.875rem 1.25rem',
        background: 'rgba(249,115,22,0.03)',
        border: '1px solid rgba(249,115,22,0.14)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>⏳</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9a3412', lineHeight: 1.3 }}>
            {displayName ? `${displayName} is coming soon` : 'An idea round is coming soon'}
          </p>
          <p style={{ fontSize: '0.775rem', color: '#c2410c', marginTop: '0.125rem' }}>
            Your admin is setting up an idea round — submissions will open soon.
          </p>
        </div>
        {isAdmin && roundId && (
          <button
            disabled={saving}
            onClick={() => applyOverride('open')}
            style={overrideBtnStyle('green', saving)}
          >
            {saving ? '…' : 'Open now'}
          </button>
        )}
      </div>
    )
  }

  // ── Closed ────────────────────────────────────────────────────────────────
  if (effectiveStatus === 'closed') {
    return (
      <div style={{
        marginBottom: '1.5rem',
        borderRadius: '0.875rem',
        padding: '0.875rem 1.25rem',
        background: 'rgba(239,68,68,0.03)',
        border: '1px solid rgba(239,68,68,0.12)',
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      }}>
        <div
          style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#ef4444', flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7f1d1d', lineHeight: 1.3 }}>
            {displayName ?? 'IdeaFlow'} is closed
          </p>
          <p style={{ fontSize: '0.775rem', color: '#b91c1c', marginTop: '0.1rem' }}>
            Idea submission has ended.{' '}
            {isAdmin && (
              <span style={{ opacity: 0.7 }}>
                {manualOverride === 'closed' ? 'Closed manually.' : 'Closed by schedule.'}
              </span>
            )}
          </p>
        </div>
        {isAdmin && roundId && (
          <button
            disabled={saving}
            onClick={() => applyOverride('open')}
            style={overrideBtnStyle('green', saving)}
          >
            {saving ? '…' : 'Open now'}
          </button>
        )}
      </div>
    )
  }

  // ── Active ────────────────────────────────────────────────────────────────
  const closingDate = endsAt ? new Date(endsAt) : null
  const daysLeft = closingDate
    ? Math.ceil((closingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  // Build metadata chips
  const metaChips: string[] = []
  if (memberCount !== undefined && memberCount > 0) metaChips.push(`${memberCount} member${memberCount !== 1 ? 's' : ''}`)
  if (ideaCount !== undefined) metaChips.push(`${ideaCount} idea${ideaCount !== 1 ? 's' : ''}`)
  if (daysLeft !== null) {
    metaChips.push(daysLeft > 0 ? `closes in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'closes today')
  }

  return (
    <div style={{
      marginBottom: '1.75rem',
      borderRadius: '0.875rem',
      padding: '1rem 1.375rem',
      background: 'rgba(16,185,129,0.04)',
      border: '1px solid rgba(16,185,129,0.16)',
      display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row with pulse dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.3rem' }}>
          <span
            className="pulse-dot"
            style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#10b981', display: 'inline-block', flexShrink: 0,
            }}
          />
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#064e3b', lineHeight: 1.3 }}>
            {displayName ?? 'IdeaFlow'} is open
          </p>
        </div>

        {/* Metadata chips row */}
        {metaChips.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', paddingLeft: '1.125rem', marginBottom: '0.3rem' }}>
            {metaChips.map((chip, i) => (
              <span key={chip}>
                <span style={{ fontSize: '0.775rem', color: '#065f46', fontWeight: 500 }}>{chip}</span>
                {i < metaChips.length - 1 && (
                  <span style={{ fontSize: '0.7rem', color: 'rgba(6,95,70,0.35)', marginLeft: '0.375rem' }}>·</span>
                )}
              </span>
            ))}
          </div>
        )}

        <p style={{ fontSize: '0.8rem', color: '#047857', paddingLeft: '1.125rem', lineHeight: 1.55 }}>
          {manualOverride === 'open'
            ? 'Opened manually — share your ideas below.'
            : 'Share your ideas — IdeaFlow is now open.'}
        </p>
      </div>

      {/* Admin close button */}
      {isAdmin && roundId && (
        <button
          disabled={saving}
          onClick={() => applyOverride('close')}
          style={overrideBtnStyle('red', saving)}
        >
          {saving ? '…' : 'Close now'}
        </button>
      )}
    </div>
  )
}

// ─── Style helper ─────────────────────────────────────────────────────────────

function overrideBtnStyle(color: 'green' | 'red', disabled: boolean): React.CSSProperties {
  const isGreen = color === 'green'
  return {
    display: 'inline-flex',
    alignItems: 'center',
    height: '1.875rem',
    padding: '0 0.75rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    borderRadius: '0.4rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    flexShrink: 0,
    background: isGreen ? 'rgba(16,185,129,0.08)'  : 'rgba(239,68,68,0.06)',
    border:     isGreen ? '1px solid rgba(16,185,129,0.22)' : '1px solid rgba(239,68,68,0.17)',
    color:      isGreen ? '#065f46'                 : '#991b1b',
  }
}
