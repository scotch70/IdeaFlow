'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type RoundStatus = 'draft' | 'active' | 'closed'

interface IdeaRoundAdminProps {
  companyId: string
  initialName: string | null
  initialStatus: RoundStatus | null
  initialStartsAt: string | null
  initialEndsAt: string | null
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<RoundStatus, { bg: string; color: string; label: string }> = {
  draft:  { bg: 'rgba(0,0,0,0.05)',           color: '#64748b', label: 'Draft'  },
  active: { bg: 'rgba(16,185,129,0.09)',       color: '#065f46', label: 'Active' },
  closed: { bg: 'rgba(239,68,68,0.08)',        color: '#991b1b', label: 'Closed' },
}

function StatusBadge({ status }: { status: RoundStatus | null }) {
  const s = STATUS_STYLE[status ?? 'draft']
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 700,
      padding: '0.2rem 0.65rem', borderRadius: '999px',
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert ISO timestamp to value accepted by <input type="datetime-local"> */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  // "2025-06-30T00:00:00.000Z" → "2025-06-30T00:00"
  return iso.slice(0, 16)
}

/** Convert <input type="datetime-local"> value back to ISO string or null */
function fromDatetimeLocal(v: string): string | null {
  if (!v) return null
  return new Date(v).toISOString()
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function IdeaRoundAdmin({
  companyId,
  initialName,
  initialStatus,
  initialStartsAt,
  initialEndsAt,
}: IdeaRoundAdminProps) {
  const [name, setName]         = useState(initialName ?? '')
  const [status, setStatus]     = useState<RoundStatus | null>(initialStatus)
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(initialStartsAt))
  const [endsAt, setEndsAt]     = useState(toDatetimeLocal(initialEndsAt))
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const router = useRouter()

  const isActivated = status !== null // null = feature not yet set up

  // ── API helper ──────────────────────────────────────────────────────────────
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────
  function handleActivate() {
    save({
      name: name.trim() || 'Idea Round',
      status: 'active',
      startsAt: fromDatetimeLocal(startsAt),
      endsAt: fromDatetimeLocal(endsAt),
    })
  }

  function handleSaveDraft() {
    save({
      name: name.trim() || null,
      status: 'draft',
      startsAt: fromDatetimeLocal(startsAt),
      endsAt: fromDatetimeLocal(endsAt),
    })
  }

  function handleClose() {
    save({ status: 'closed' })
  }

  function handleReopen() {
    save({ status: 'active' })
  }

  function handleReset() {
    setName('')
    setStartsAt('')
    setEndsAt('')
    setStatus(null)
    save({ name: null, status: null, startsAt: null, endsAt: null })
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{
      borderRadius: '0.75rem',
      border: '1px solid var(--border)',
      background: '#ffffff',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--tint-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-light)' }}>
          Idea round
        </p>
        <StatusBadge status={status} />
      </div>

      <div style={{ padding: '1rem' }}>

        {/* ── Not yet set up ── */}
        {!isActivated && (
          <>
            <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Create a named idea collection window — like &ldquo;Q3 improvements&rdquo; or &ldquo;Innovation week&rdquo;. Only active rounds accept submissions.
            </p>
            <NameInput value={name} onChange={setName} disabled={saving} />
            <DateRow
              startsAt={startsAt} onStartsAt={setStartsAt}
              endsAt={endsAt}   onEndsAt={setEndsAt}
              disabled={saving}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
              <ActionButton onClick={handleSaveDraft} disabled={saving} variant="secondary">
                Save as draft
              </ActionButton>
              <ActionButton onClick={handleActivate} disabled={saving} variant="primary">
                {saving ? 'Starting…' : 'Start round'}
              </ActionButton>
            </div>
          </>
        )}

        {/* ── Draft ── */}
        {status === 'draft' && (
          <>
            <p style={{ fontSize: '0.775rem', color: '#d97706', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '1rem', lineHeight: 1.5 }}>
              Round is in draft — employees cannot submit yet.
            </p>
            <NameInput value={name} onChange={setName} disabled={saving} />
            <DateRow startsAt={startsAt} onStartsAt={setStartsAt} endsAt={endsAt} onEndsAt={setEndsAt} disabled={saving} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
              <ActionButton onClick={handleSaveDraft} disabled={saving} variant="secondary">
                {saving ? 'Saving…' : 'Save draft'}
              </ActionButton>
              <ActionButton onClick={handleActivate} disabled={saving} variant="primary">
                {saving ? 'Activating…' : 'Activate round'}
              </ActionButton>
            </div>
          </>
        )}

        {/* ── Active ── */}
        {status === 'active' && (
          <>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.25rem' }}>
              {name || 'Unnamed round'}
            </p>
            {initialEndsAt && (
              <p style={{ fontSize: '0.775rem', color: 'var(--ink-light)', marginBottom: '0.75rem' }}>
                Closes {new Date(initialEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
            <p style={{ fontSize: '0.78rem', color: '#065f46', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '0.875rem', lineHeight: 1.5 }}>
              Employees can currently submit ideas.
            </p>
            <ActionButton onClick={handleClose} disabled={saving} variant="danger">
              {saving ? 'Closing…' : 'Close round'}
            </ActionButton>
          </>
        )}

        {/* ── Closed ── */}
        {status === 'closed' && (
          <>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.25rem' }}>
              {name || 'Unnamed round'}
            </p>
            <p style={{ fontSize: '0.78rem', color: '#991b1b', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '0.875rem', lineHeight: 1.5 }}>
              Idea submission is closed for this round.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ActionButton onClick={handleReopen} disabled={saving} variant="secondary">
                {saving ? '…' : 'Re-open'}
              </ActionButton>
              <ActionButton onClick={handleReset} disabled={saving} variant="ghost">
                New round
              </ActionButton>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <p style={{ marginTop: '0.625rem', fontSize: '0.775rem', color: '#dc2626' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NameInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <div style={{ marginBottom: '0.625rem' }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
        Round name
      </label>
      <input
        className="input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. Q3 improvements, Innovation week…"
        maxLength={60}
        disabled={disabled}
        style={{ fontSize: '0.825rem' }}
      />
    </div>
  )
}

function DateRow({
  startsAt, onStartsAt, endsAt, onEndsAt, disabled,
}: {
  startsAt: string; onStartsAt: (v: string) => void
  endsAt: string;   onEndsAt:   (v: string) => void
  disabled: boolean
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
          Opens (optional)
        </label>
        <input
          type="datetime-local"
          className="input"
          value={startsAt}
          onChange={e => onStartsAt(e.target.value)}
          disabled={disabled}
          style={{ fontSize: '0.775rem' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
          Closes (optional)
        </label>
        <input
          type="datetime-local"
          className="input"
          value={endsAt}
          onChange={e => onEndsAt(e.target.value)}
          disabled={disabled}
          style={{ fontSize: '0.775rem' }}
        />
      </div>
    </div>
  )
}

function ActionButton({
  children, onClick, disabled, variant,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean
  variant: 'primary' | 'secondary' | 'danger' | 'ghost'
}) {
  const styles: Record<typeof variant, React.CSSProperties> = {
    primary:   { background: 'var(--orange)', color: '#fff', border: 'none' },
    secondary: { background: '#ffffff', color: 'var(--ink-mid)', border: '1px solid var(--border-mid)' },
    danger:    { background: 'rgba(239,68,68,0.07)', color: '#991b1b', border: '1px solid rgba(239,68,68,0.20)' },
    ghost:     { background: 'transparent', color: 'var(--ink-light)', border: '1px solid var(--tint-border)' },
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        height: '2rem', padding: '0 0.875rem',
        borderRadius: '0.4rem',
        fontSize: '0.78rem', fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        flexShrink: 0,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}
