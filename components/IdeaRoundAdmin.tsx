'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────────────────

type RoundStatus = 'draft' | 'active' | 'closed'

export interface IdeaRoundAdminProps {
  companyId: string
  initialName: string | null
  initialStatus: RoundStatus | null
  initialStartsAt: string | null
  initialEndsAt: string | null
}

// ── Shared constants ──────────────────────────────────────────────────────────

const STATUS_STYLE: Record<RoundStatus, { bg: string; color: string; label: string }> = {
  draft:  { bg: 'rgba(0,0,0,0.05)',        color: '#64748b', label: 'Draft'  },
  active: { bg: 'rgba(16,185,129,0.09)',   color: '#065f46', label: 'Active' },
  closed: { bg: 'rgba(239,68,68,0.08)',    color: '#991b1b', label: 'Closed' },
}

function StatusBadge({ status }: { status: RoundStatus | null }) {
  const s = STATUS_STYLE[status ?? 'draft']
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700,
      padding: '0.2rem 0.625rem', borderRadius: '999px',
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}

function fromDatetimeLocal(v: string): string | null {
  return v ? new Date(v).toISOString() : null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ── Action button ─────────────────────────────────────────────────────────────

function ActionBtn({
  children, onClick, disabled = false, variant = 'secondary', full = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  full?: boolean
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: '2.125rem', padding: '0 1rem',
    borderRadius: '0.45rem',
    fontSize: '0.8rem', fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: 'none',
    width: full ? '100%' : undefined,
    transition: 'opacity 0.1s',
  }
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--orange)',           color: '#fff' },
    secondary: { background: '#fff',                    color: 'var(--ink-mid)', border: '1px solid var(--border-mid)' },
    danger:    { background: 'rgba(239,68,68,0.07)',    color: '#991b1b',       border: '1px solid rgba(239,68,68,0.20)' },
    ghost:     { background: 'transparent',             color: 'var(--ink-light)', border: '1px solid var(--tint-border)' },
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ ...base, ...styles[variant] }}>
      {children}
    </button>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════════════════════════════════

function RoundModal({
  companyId,
  name: initName,
  status: initStatus,
  startsAt: initStartsAt,
  endsAt: initEndsAt,
  onClose,
}: {
  companyId: string
  name: string | null
  status: RoundStatus | null
  startsAt: string | null
  endsAt: string | null
  onClose: () => void
}) {
  const [name, setName]         = useState(initName ?? '')
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(initStartsAt))
  const [endsAt, setEndsAt]     = useState(toDatetimeLocal(initEndsAt))
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const router  = useRouter()
  const trapRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── API ─────────────────────────────────────────────────────────────────────
  async function save(patch: Record<string, unknown>) {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/company/update-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...patch }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to save')
      }
      router.refresh()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  // ── Action handlers ─────────────────────────────────────────────────────────
  const commonFields = () => ({
    name: name.trim() || 'Idea Round',
    startsAt: fromDatetimeLocal(startsAt),
    endsAt:   fromDatetimeLocal(endsAt),
  })

  const handleSaveDraft   = () => save({ ...commonFields(), status: 'draft'  })
  const handleStartRound  = () => save({ ...commonFields(), status: 'active' })
  const handleSaveChanges = () => save({ ...commonFields(), status: initStatus ?? 'active' })
  const handleCloseRound  = () => save({ status: 'closed' })
  const handleReopen      = () => save({ status: 'active' })
  const handleNewRound    = () => {
    setName('')
    setStartsAt('')
    setEndsAt('')
    save({ name: null, status: null, startsAt: null, endsAt: null })
  }

  // ── What the modal body shows depends on current status ─────────────────────
  const isNew    = initStatus === null
  const isDraft  = initStatus === 'draft'
  const isActive = initStatus === 'active'
  const isClosed = initStatus === 'closed'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 900,
          background: 'rgba(13,31,53,0.45)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
        aria-hidden
      />

      {/* Modal */}
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Manage idea round"
        style={{
          position: 'fixed', zIndex: 901,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(28rem, calc(100vw - 2rem))',
          background: '#ffffff',
          borderRadius: '1.125rem',
          border: '1px solid rgba(26,107,191,0.12)',
          boxShadow: '0 8px 40px rgba(13,31,53,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid rgba(26,107,191,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <p style={{
              fontSize: '0.875rem', fontWeight: 700,
              color: 'var(--ink)', letterSpacing: '-0.01em',
            }}>
              Manage idea round
            </p>
            {initStatus !== null && <StatusBadge status={initStatus} />}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '1.75rem', height: '1.75rem',
              borderRadius: '0.4rem',
              background: 'transparent',
              border: '1px solid var(--tint-border)',
              color: 'var(--ink-light)',
              cursor: 'pointer', padding: 0,
            }}
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem' }}>

          {/* ── NEW or DRAFT — full setup form ── */}
          {(isNew || isDraft) && (
            <>
              {isDraft && (
                <div style={{
                  fontSize: '0.775rem', color: '#92400e',
                  background: 'rgba(245,158,11,0.07)',
                  border: '1px solid rgba(245,158,11,0.18)',
                  borderRadius: '0.5rem', padding: '0.625rem 0.875rem',
                  marginBottom: '1.125rem', lineHeight: 1.5,
                }}>
                  This round is in draft. Employees cannot submit ideas until you start it.
                </div>
              )}

              {isNew && (
                <p style={{ fontSize: '0.825rem', color: 'var(--ink-light)', lineHeight: 1.65, marginBottom: '1.125rem' }}>
                  Create a named idea collection window — like &ldquo;Q3 improvements&rdquo; or &ldquo;Innovation week&rdquo;.
                </p>
              )}

              <FormField label="Round name">
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Q3 improvements, Innovation week…"
                  maxLength={60}
                  disabled={saving}
                  autoFocus
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <FormField label="Opens (optional)" noMargin>
                  <input type="datetime-local" className="input"
                    value={startsAt} onChange={e => setStartsAt(e.target.value)}
                    disabled={saving} style={{ fontSize: '0.775rem' }} />
                </FormField>
                <FormField label="Closes (optional)" noMargin>
                  <input type="datetime-local" className="input"
                    value={endsAt} onChange={e => setEndsAt(e.target.value)}
                    disabled={saving} style={{ fontSize: '0.775rem' }} />
                </FormField>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <ActionBtn onClick={handleSaveDraft} disabled={saving} variant="ghost">
                  Save as draft
                </ActionBtn>
                <ActionBtn onClick={handleStartRound} disabled={saving} variant="primary">
                  {saving ? 'Starting…' : 'Start round'}
                </ActionBtn>
              </div>
            </>
          )}

          {/* ── ACTIVE — edit + close ── */}
          {isActive && (
            <>
              <FormField label="Round name">
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Round name"
                  maxLength={60}
                  disabled={saving}
                  autoFocus
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <FormField label="Opens (optional)" noMargin>
                  <input type="datetime-local" className="input"
                    value={startsAt} onChange={e => setStartsAt(e.target.value)}
                    disabled={saving} style={{ fontSize: '0.775rem' }} />
                </FormField>
                <FormField label="Closes (optional)" noMargin>
                  <input type="datetime-local" className="input"
                    value={endsAt} onChange={e => setEndsAt(e.target.value)}
                    disabled={saving} style={{ fontSize: '0.775rem' }} />
                </FormField>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <ActionBtn onClick={onClose} variant="ghost">Cancel</ActionBtn>
                <ActionBtn onClick={handleSaveChanges} disabled={saving} variant="secondary">
                  {saving ? 'Saving…' : 'Save changes'}
                </ActionBtn>
              </div>

              {/* Divider before destructive action */}
              <div style={{ borderTop: '1px solid rgba(239,68,68,0.12)', paddingTop: '1rem' }}>
                <p style={{ fontSize: '0.775rem', color: 'var(--ink-light)', marginBottom: '0.625rem' }}>
                  Closing the round locks idea submission for everyone.
                </p>
                <ActionBtn onClick={handleCloseRound} disabled={saving} variant="danger" full>
                  {saving ? 'Closing…' : 'Close round'}
                </ActionBtn>
              </div>
            </>
          )}

          {/* ── CLOSED — re-open or start fresh ── */}
          {isClosed && (
            <>
              <div style={{
                borderRadius: '0.625rem',
                border: '1px solid rgba(239,68,68,0.15)',
                background: 'rgba(239,68,68,0.04)',
                padding: '0.875rem',
                marginBottom: '1.25rem',
              }}>
                <p style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.2rem' }}>
                  {initName || 'Unnamed round'}
                </p>
                {initEndsAt && (
                  <p style={{ fontSize: '0.775rem', color: 'var(--ink-light)' }}>
                    Closed {formatDate(initEndsAt)}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <ActionBtn onClick={handleReopen} disabled={saving} variant="secondary" full>
                  {saving ? '…' : 'Re-open this round'}
                </ActionBtn>
                <ActionBtn onClick={handleNewRound} disabled={saving} variant="primary" full>
                  {saving ? '…' : 'Start new round'}
                </ActionBtn>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.775rem', color: '#dc2626' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SUMMARY CARD (sidebar)
// ══════════════════════════════════════════════════════════════════════════════

export default function IdeaRoundAdmin({
  companyId,
  initialName,
  initialStatus,
  initialStartsAt,
  initialEndsAt,
}: IdeaRoundAdminProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const displayName = initialName?.trim() || null
  const hasRound    = initialStatus !== null

  return (
    <>
      <div style={{
        borderRadius: '0.75rem',
        border: '1px solid var(--border)',
        background: '#ffffff',
        overflow: 'hidden',
      }}>
        {/* Header row */}
        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--tint-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.5rem',
        }}>
          <p style={{
            fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--ink-light)',
          }}>
            Idea round
          </p>
          {hasRound && <StatusBadge status={initialStatus} />}
        </div>

        {/* Summary body */}
        <div style={{ padding: '0.875rem 1rem' }}>
          {!hasRound ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', lineHeight: 1.55, marginBottom: '0.875rem' }}>
              No round active. Set up a named collection window to control when ideas can be submitted.
            </p>
          ) : (
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.2rem' }}>
                {displayName ?? 'Unnamed round'}
              </p>
              {initialEndsAt && initialStatus !== 'closed' && (
                <p style={{ fontSize: '0.775rem', color: 'var(--ink-light)' }}>
                  Closes {formatDate(initialEndsAt)}
                </p>
              )}
              {initialStatus === 'draft' && (
                <p style={{ fontSize: '0.775rem', color: '#92400e', marginTop: '0.25rem' }}>
                  Draft — employees cannot submit yet
                </p>
              )}
              {initialStatus === 'closed' && (
                <p style={{ fontSize: '0.775rem', color: '#991b1b', marginTop: '0.25rem' }}>
                  Submission is closed
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.8rem', fontWeight: 600,
              color: 'var(--orange)',
              background: 'rgba(249,115,22,0.07)',
              border: '1px solid rgba(249,115,22,0.18)',
              borderRadius: '0.45rem',
              padding: '0.375rem 0.875rem',
              cursor: 'pointer',
              width: '100%', justifyContent: 'center',
            }}
          >
            {hasRound ? 'Manage round' : 'Set up round'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Modal — rendered outside the card */}
      {modalOpen && (
        <RoundModal
          companyId={companyId}
          name={initialName}
          status={initialStatus}
          startsAt={initialStartsAt}
          endsAt={initialEndsAt}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

// ── FormField helper ──────────────────────────────────────────────────────────

function FormField({
  label, children, noMargin = false,
}: {
  label: string
  children: React.ReactNode
  noMargin?: boolean
}) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : '0.875rem' }}>
      <label style={{
        display: 'block', fontSize: '0.72rem',
        fontWeight: 600, color: 'var(--ink-light)',
        marginBottom: '0.3rem',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}
