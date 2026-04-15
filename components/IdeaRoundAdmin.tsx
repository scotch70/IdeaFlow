'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────────────────

type RoundStatus = 'draft' | 'active' | 'closed'
type ConfirmAction = 'close' | 'archive'
type ModalView = 'main' | 'new-form'

export interface IdeaRoundAdminProps {
  companyId: string
  initialName: string | null
  initialStatus: RoundStatus | null
  initialStartsAt: string | null
  initialEndsAt: string | null
}

// ── Status badge ──────────────────────────────────────────────────────────────

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

// ── Primitive buttons ─────────────────────────────────────────────────────────

function ActionBtn({
  children, onClick, disabled = false, variant = 'secondary', full = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  full?: boolean
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--orange)',           color: '#fff',         border: 'none' },
    secondary: { background: '#fff',                    color: 'var(--ink-mid)', border: '1px solid var(--border-mid)' },
    danger:    { background: 'rgba(239,68,68,0.07)',    color: '#991b1b',      border: '1px solid rgba(239,68,68,0.20)' },
    ghost:     { background: 'transparent',             color: 'var(--ink-light)', border: '1px solid var(--tint-border)' },
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        height: '2.125rem', padding: '0 1rem',
        borderRadius: '0.45rem',
        fontSize: '0.8rem', fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: full ? '100%' : undefined,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}

function FormField({ label, children, noMargin = false }: {
  label: string; children: React.ReactNode; noMargin?: boolean
}) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : '0.875rem' }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ── Inline confirmation panel ─────────────────────────────────────────────────

function ConfirmPanel({ action, onConfirm, onCancel, saving }: {
  action: ConfirmAction
  onConfirm: () => void
  onCancel: () => void
  saving: boolean
}) {
  const COPY: Record<ConfirmAction, { message: string; detail: string; confirmLabel: string }> = {
    close: {
      message:      'Close IdeaFlow?',
      detail:       'Employees will no longer be able to submit ideas. You can re-open it at any time.',
      confirmLabel: 'Yes, close IdeaFlow',
    },
    archive: {
      message:      'Archive IdeaFlow?',
      detail:       'This will permanently remove the IdeaFlow configuration. You can set up a new one at any time.',
      confirmLabel: 'Yes, archive IdeaFlow',
    },
  }
  const c = COPY[action]
  return (
    <div style={{
      borderRadius: '0.625rem',
      border: '1px solid rgba(239,68,68,0.20)',
      background: 'rgba(239,68,68,0.04)',
      padding: '0.875rem',
    }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '0.25rem' }}>
        {c.message}
      </p>
      <p style={{ fontSize: '0.775rem', color: '#991b1b', lineHeight: 1.5, marginBottom: '0.875rem' }}>
        {c.detail}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <ActionBtn onClick={onCancel} variant="ghost" disabled={saving}>
          Cancel
        </ActionBtn>
        <ActionBtn onClick={onConfirm} variant="danger" disabled={saving}>
          {saving ? 'Working…' : c.confirmLabel}
        </ActionBtn>
      </div>
    </div>
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
  const [view, setView]             = useState<ModalView>('main')
  const [confirmAction, setConfirm] = useState<ConfirmAction | null>(null)
  const [name, setName]             = useState(initName ?? '')
  const [startsAt, setStartsAt]     = useState(toDatetimeLocal(initStartsAt))
  const [endsAt, setEndsAt]         = useState(toDatetimeLocal(initEndsAt))
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const router  = useRouter()
  const trapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmAction) { setConfirm(null); return }
        if (view === 'new-form') { setView('main'); return }
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, confirmAction, view])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── API ─────────────────────────────────────────────────────────────────────
  async function callApi(patch: Record<string, unknown>) {
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

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const ideaFlowFields = () => ({
    name:     name.trim() || 'IdeaFlow',
    startsAt: fromDatetimeLocal(startsAt),
    endsAt:   fromDatetimeLocal(endsAt),
  })

  const handleSaveDraft   = () => callApi({ ...ideaFlowFields(), status: 'draft'  })
  const handleStartFlow   = () => callApi({ ...ideaFlowFields(), status: 'active' })
  const handleSaveChanges = () => callApi({ ...ideaFlowFields(), status: initStatus ?? 'active' })
  const handleCloseFlow   = () => callApi({ status: 'closed' })
  const handleReopen      = () => callApi({ status: 'active' })
  const handleArchive     = () => callApi({ name: null, status: null, startsAt: null, endsAt: null })

  function openNewForm() {
    setName('')
    setStartsAt('')
    setEndsAt('')
    setConfirm(null)
    setView('new-form')
  }

  const isNew    = initStatus === null
  const isDraft  = initStatus === 'draft'
  const isActive = initStatus === 'active'
  const isClosed = initStatus === 'closed'

  const title = view === 'new-form'
    ? 'Start new IdeaFlow'
    : isNew ? 'Set up IdeaFlow' : 'Manage IdeaFlow'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => {
          if (confirmAction) { setConfirm(null); return }
          if (view === 'new-form') { setView('main'); return }
          onClose()
        }}
        style={{
          position: 'fixed', inset: 0, zIndex: 900,
          background: 'rgba(13,31,53,0.45)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
        aria-hidden
      />

      {/* Modal panel */}
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'fixed', zIndex: 901,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(29rem, calc(100vw - 2rem))',
          maxHeight: 'calc(100vh - 3rem)',
          overflowY: 'auto',
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
            {view === 'new-form' && (
              <button
                type="button"
                onClick={() => setView('main')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.35rem', background: 'transparent', border: '1px solid var(--tint-border)', color: 'var(--ink-light)', cursor: 'pointer', padding: 0, marginRight: '0.125rem' }}
                aria-label="Back"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
            )}
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
              {title}
            </p>
            {view === 'main' && initStatus !== null && <StatusBadge status={initStatus} />}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.75rem', height: '1.75rem', borderRadius: '0.4rem', background: 'transparent', border: '1px solid var(--tint-border)', color: 'var(--ink-light)', cursor: 'pointer', padding: 0 }}
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem' }}>

          {/* ══ VIEW: new-form ══ */}
          {view === 'new-form' && (
            <>
              {isClosed && (
                <div style={{ fontSize: '0.775rem', color: '#64748b', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--tint-border)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', marginBottom: '1.125rem', lineHeight: 1.5 }}>
                  The current IdeaFlow will be archived when you start this new one.
                </div>
              )}
              <FormField label="IdeaFlow name">
                <input className="input" value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Q3 improvements, Innovation week…" maxLength={60} disabled={saving} autoFocus />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <FormField label="Opens (optional)" noMargin>
                  <input type="datetime-local" className="input" value={startsAt}
                    onChange={e => setStartsAt(e.target.value)} disabled={saving} style={{ fontSize: '0.775rem' }} />
                </FormField>
                <FormField label="Closes (optional)" noMargin>
                  <input type="datetime-local" className="input" value={endsAt}
                    onChange={e => setEndsAt(e.target.value)} disabled={saving} style={{ fontSize: '0.775rem' }} />
                </FormField>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <ActionBtn onClick={handleSaveDraft} disabled={saving} variant="ghost">
                  Save as draft
                </ActionBtn>
                <ActionBtn onClick={handleStartFlow} disabled={saving} variant="primary">
                  {saving ? 'Starting…' : 'Start IdeaFlow'}
                </ActionBtn>
              </div>
            </>
          )}

          {/* ══ VIEW: main ══ */}
          {view === 'main' && (
            <>
              {/* ── Status: null (not yet set up) or draft ── */}
              {(isNew || isDraft) && (
                <>
                  {isDraft && (
                    <div style={{ fontSize: '0.775rem', color: '#92400e', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', marginBottom: '1.125rem', lineHeight: 1.5 }}>
                      IdeaFlow is in draft — employees cannot submit ideas until you start it.
                    </div>
                  )}
                  {isNew && (
                    <p style={{ fontSize: '0.825rem', color: 'var(--ink-light)', lineHeight: 1.65, marginBottom: '1.125rem' }}>
                      Set up a named IdeaFlow to control when your team can submit ideas — like &ldquo;Q3 improvements&rdquo; or &ldquo;Innovation week&rdquo;.
                    </p>
                  )}
                  <FormField label="IdeaFlow name">
                    <input className="input" value={name} onChange={e => setName(e.target.value)}
                      placeholder="e.g. Q3 improvements, Innovation week…" maxLength={60} disabled={saving} autoFocus />
                  </FormField>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.25rem' }}>
                    <FormField label="Opens (optional)" noMargin>
                      <input type="datetime-local" className="input" value={startsAt}
                        onChange={e => setStartsAt(e.target.value)} disabled={saving} style={{ fontSize: '0.775rem' }} />
                    </FormField>
                    <FormField label="Closes (optional)" noMargin>
                      <input type="datetime-local" className="input" value={endsAt}
                        onChange={e => setEndsAt(e.target.value)} disabled={saving} style={{ fontSize: '0.775rem' }} />
                    </FormField>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <ActionBtn onClick={handleSaveDraft} disabled={saving} variant="ghost">
                      Save as draft
                    </ActionBtn>
                    <ActionBtn onClick={handleStartFlow} disabled={saving} variant="primary">
                      {saving ? 'Starting…' : 'Start IdeaFlow'}
                    </ActionBtn>
                  </div>
                </>
              )}

              {/* ── Status: active ── */}
              {isActive && (
                <>
                  <FormField label="IdeaFlow name">
                    <input className="input" value={name} onChange={e => setName(e.target.value)}
                      placeholder="IdeaFlow name" maxLength={60} disabled={saving} autoFocus />
                  </FormField>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1.25rem' }}>
                    <FormField label="Opens (optional)" noMargin>
                      <input type="datetime-local" className="input" value={startsAt}
                        onChange={e => setStartsAt(e.target.value)} disabled={saving} style={{ fontSize: '0.775rem' }} />
                    </FormField>
                    <FormField label="Closes (optional)" noMargin>
                      <input type="datetime-local" className="input" value={endsAt}
                        onChange={e => setEndsAt(e.target.value)} disabled={saving} style={{ fontSize: '0.775rem' }} />
                    </FormField>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
                    <ActionBtn onClick={onClose} variant="ghost">Cancel</ActionBtn>
                    <ActionBtn onClick={handleSaveChanges} disabled={saving} variant="secondary">
                      {saving ? 'Saving…' : 'Save changes'}
                    </ActionBtn>
                  </div>

                  {/* Close IdeaFlow — requires inline confirmation */}
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '1rem' }}>
                    {confirmAction === 'close' ? (
                      <ConfirmPanel action="close" onConfirm={handleCloseFlow} onCancel={() => setConfirm(null)} saving={saving} />
                    ) : (
                      <>
                        <p style={{ fontSize: '0.775rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>
                          Closing stops idea submission for everyone until you re-open IdeaFlow.
                        </p>
                        <ActionBtn onClick={() => setConfirm('close')} variant="danger" full>
                          Close IdeaFlow
                        </ActionBtn>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* ── Status: closed ── */}
              {isClosed && (
                <>
                  {/* Summary of closed IdeaFlow */}
                  <div style={{ borderRadius: '0.625rem', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.04)', padding: '0.875rem', marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.2rem' }}>
                      {initName || 'Unnamed IdeaFlow'}
                    </p>
                    {initEndsAt && (
                      <p style={{ fontSize: '0.775rem', color: 'var(--ink-light)' }}>
                        Closed {formatDate(initEndsAt)}
                      </p>
                    )}
                  </div>

                  {/* Primary actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <ActionBtn onClick={handleReopen} disabled={saving} variant="secondary" full>
                      {saving ? '…' : 'Re-open IdeaFlow'}
                    </ActionBtn>
                    <ActionBtn onClick={openNewForm} disabled={saving} variant="primary" full>
                      Start new IdeaFlow
                    </ActionBtn>
                  </div>

                  {/* Archive IdeaFlow — destructive, requires confirmation */}
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '1rem' }}>
                    {confirmAction === 'archive' ? (
                      <ConfirmPanel action="archive" onConfirm={handleArchive} onCancel={() => setConfirm(null)} saving={saving} />
                    ) : (
                      <>
                        <p style={{ fontSize: '0.775rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>
                          Archive IdeaFlow to clear its configuration entirely.
                        </p>
                        <ActionBtn onClick={() => setConfirm('archive')} variant="ghost" full>
                          Archive IdeaFlow
                        </ActionBtn>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <p style={{ marginTop: '0.875rem', fontSize: '0.775rem', color: '#dc2626' }}>{error}</p>
              )}
            </>
          )}

          {/* Error in new-form view */}
          {view === 'new-form' && error && (
            <p style={{ marginTop: '0.875rem', fontSize: '0.775rem', color: '#dc2626' }}>{error}</p>
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
  companyId, initialName, initialStatus, initialStartsAt, initialEndsAt,
}: IdeaRoundAdminProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const displayName = initialName?.trim() || null
  const hasFlow     = initialStatus !== null

  return (
    <>
      <div style={{ borderRadius: '0.75rem', border: '1px solid var(--border)', background: '#ffffff', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--tint-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-light)' }}>
            IdeaFlow
          </p>
          {hasFlow && <StatusBadge status={initialStatus} />}
        </div>

        {/* Body */}
        <div style={{ padding: '0.875rem 1rem' }}>
          {!hasFlow ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', lineHeight: 1.55, marginBottom: '0.875rem' }}>
              No IdeaFlow active. Set up a named collection window to control when ideas can be submitted.
            </p>
          ) : (
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.2rem' }}>
                {displayName ?? 'Unnamed IdeaFlow'}
              </p>
              {initialEndsAt && initialStatus !== 'closed' && (
                <p style={{ fontSize: '0.775rem', color: 'var(--ink-light)' }}>
                  Closes {formatDate(initialEndsAt)}
                </p>
              )}
              {initialStatus === 'draft' && (
                <p style={{ fontSize: '0.775rem', color: '#92400e', marginTop: '0.2rem' }}>
                  Draft — employees cannot submit yet
                </p>
              )}
              {initialStatus === 'active' && (
                <p style={{ fontSize: '0.775rem', color: '#065f46', marginTop: '0.2rem' }}>
                  Open — employees can submit ideas
                </p>
              )}
              {initialStatus === 'closed' && (
                <p style={{ fontSize: '0.775rem', color: '#991b1b', marginTop: '0.2rem' }}>
                  Closed — submission is locked
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              width: '100%', padding: '0.375rem 0.875rem',
              fontSize: '0.8rem', fontWeight: 600,
              color: 'var(--orange)',
              background: 'rgba(249,115,22,0.07)',
              border: '1px solid rgba(249,115,22,0.18)',
              borderRadius: '0.45rem', cursor: 'pointer',
            }}
          >
            {hasFlow ? 'Manage IdeaFlow' : 'Set up IdeaFlow'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

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
