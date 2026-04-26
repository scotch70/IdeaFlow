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
  manualOverride?: ManualOverride
}

export default function IdeaRoundBanner({
  name,
  status,
  endsAt,
  isAdmin       = false,
  companyId,
  manualOverride: initialOverride = null,
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
  const sourceLabel = manualOverride !== null ? 'manual' : 'scheduled'

  async function applyOverride(action: 'open' | 'close') {
    if (!companyId || saving) return
    const optimistic: ManualOverride = action === 'open' ? 'open' : 'closed'
    setSaving(true)
    setManualOverride(optimistic)
    try {
      const res = await fetch('/api/company/round-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
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
        borderRadius: '1rem',
        padding: '0.875rem 1.25rem',
        background: 'rgba(249,115,22,0.04)',
        border: '1px solid rgba(249,115,22,0.18)',
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
        {isAdmin && companyId && (
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
        borderRadius: '1rem',
        padding: '0.875rem 1.25rem',
        background: 'rgba(239,68,68,0.04)',
        border: '1px solid rgba(239,68,68,0.15)',
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔴</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7f1d1d', lineHeight: 1.3 }}>
            {displayName ?? 'IdeaFlow'} is closed
          </p>
          <p style={{ fontSize: '0.775rem', color: '#b91c1c', marginTop: '0.125rem' }}>
            Idea submission has ended.{' '}
            {isAdmin && (
              <span style={{ opacity: 0.7 }}>
                {manualOverride === 'closed' ? 'Closed manually.' : 'Closed by schedule.'}
              </span>
            )}
          </p>
        </div>
        {isAdmin && companyId && (
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

  return (
    <div style={{
      marginBottom: '1.5rem',
      borderRadius: '1rem',
      padding: '0.875rem 1.25rem',
      background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(16,185,129,0.02))',
      border: '1px solid rgba(16,185,129,0.22)',
      display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>🟢</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b', lineHeight: 1.3 }}>
          {displayName ?? 'IdeaFlow'} is open
        </p>
        <p style={{ fontSize: '0.775rem', color: '#065f46', marginTop: '0.125rem' }}>
          {manualOverride === 'open'
            ? 'Opened manually — share your ideas.'
            : daysLeft !== null
              ? daysLeft > 0
                ? `Share your ideas — closes in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`
                : 'Share your ideas — IdeaFlow closes today.'
              : 'Share your ideas — IdeaFlow is now open.'}
        </p>
      </div>

      {/* Active pill */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        fontSize: '0.68rem', fontWeight: 700,
        color: '#065f46',
        background: 'rgba(16,185,129,0.10)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '999px',
        padding: '0.2rem 0.6rem',
        flexShrink: 0,
      }}>
        <span className="pulse-dot" style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: '#10b981', display: 'inline-block', flexShrink: 0,
        }} />
        {sourceLabel === 'manual' ? 'Manual' : 'Active'}
      </span>

      {/* Admin close button */}
      {isAdmin && companyId && (
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
    background: isGreen ? 'rgba(16,185,129,0.09)'  : 'rgba(239,68,68,0.07)',
    border:     isGreen ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.20)',
    color:      isGreen ? '#065f46'                 : '#991b1b',
  }
}
