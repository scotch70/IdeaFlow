'use client'

/**
 * FlowAdminPanel
 *
 * Admin-only management panel shown at the bottom of /dashboard/flows/[id].
 * Handles: edit name/prompt/icon/color/dates, open/close/draft toggle,
 * member assignment, and delete with inline confirmation.
 *
 * All mutations call /api/rounds/[id] (PATCH | DELETE) or
 * /api/rounds/[id]/members (POST | DELETE).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FlowMemberPicker from './FlowMemberPicker'
import type { SlimProfile } from '@/types/database'

type RoundStatus = 'draft' | 'active' | 'closed'

// ── Palettes (kept in sync with CreateFlowButton) ─────────────────────────────

const ICONS = ['💡', '🚀', '🎯', '🌱', '⚡', '🏆', '💬', '🔥', '🔮', '🛠️', '📣', '🎉']

const COLORS = [
  { hex: '#f97316', name: 'Orange'  },
  { hex: '#3b82f6', name: 'Blue'    },
  { hex: '#10b981', name: 'Green'   },
  { hex: '#8b5cf6', name: 'Purple'  },
  { hex: '#ec4899', name: 'Pink'    },
  { hex: '#f59e0b', name: 'Amber'   },
  { hex: '#14b8a6', name: 'Teal'    },
  { hex: '#ef4444', name: 'Red'     },
]

interface FlowAdminPanelProps {
  roundId:         string
  initialName:     string
  initialPrompt:   string | null
  initialStatus:   RoundStatus
  initialStartsAt: string | null
  initialEndsAt:   string | null
  initialManualOverride: 'open' | 'closed' | null
  effectiveStatus: 'active' | 'closed' | 'draft'
  companyMembers:  SlimProfile[]
  assignedUserIds: string[]
  initialIcon:     string | null
  initialColor:    string | null
}

// ── Helper ────────────────────────────────────────────────────────────────────

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}
function fromDatetimeLocal(v: string): string | null {
  return v ? new Date(v).toISOString() : null
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.75rem' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function ActionBtn({
  children, onClick, disabled = false, variant = 'secondary',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'green'
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--orange)',              color: '#fff',    border: 'none' },
    secondary: { background: '#fff',                       color: '#475569', border: '1px solid var(--border-mid)' },
    danger:    { background: 'rgba(239,68,68,0.07)',        color: '#991b1b', border: '1px solid rgba(239,68,68,0.20)' },
    ghost:     { background: 'transparent',                color: '#64748b', border: '1px solid var(--tint-border)' },
    green:     { background: 'rgba(16,185,129,0.09)',      color: '#065f46', border: '1px solid rgba(16,185,129,0.25)' },
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
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FlowAdminPanel({
  roundId,
  initialName,
  initialPrompt,
  initialStatus,
  initialStartsAt,
  initialEndsAt,
  initialManualOverride,
  companyMembers,
  assignedUserIds,
  initialIcon,
  initialColor,
}: FlowAdminPanelProps) {
  const router = useRouter()

  const [name,     setName]     = useState(initialName)
  const [prompt,   setPrompt]   = useState(initialPrompt ?? '')
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(initialStartsAt))
  const [endsAt,   setEndsAt]   = useState(toDatetimeLocal(initialEndsAt))
  const [icon,     setIcon]     = useState(initialIcon  ?? '💡')
  const [color,    setColor]    = useState(initialColor ?? '#f97316')

  const [saving,        setSaving]        = useState(false)
  const [saveError,     setSaveError]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [deleteError,   setDeleteError]   = useState('')
  const [overrideSaving, setOverrideSaving] = useState(false)

  async function patch(body: Record<string, unknown>) {
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to save')
      }
      router.refresh()
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    await patch({
      name:     name.trim() || 'IdeaFlow',
      prompt:   prompt.trim() || null,
      starts_at: fromDatetimeLocal(startsAt),
      ends_at:   fromDatetimeLocal(endsAt),
      icon,
      color,
    })
  }

  async function handleStatusChange(status: RoundStatus) {
    await patch({ status })
  }

  async function handleOverride(action: 'open' | 'closed' | null) {
    setOverrideSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ manual_override: action }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed')
      }
      router.refresh()
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setOverrideSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to delete')
      }
      router.push('/dashboard/flows')
      router.refresh()
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  return (
    <div style={{
      borderRadius: '1rem',
      border: '1px solid rgba(26,107,191,0.12)',
      background: 'rgba(248,250,255,0.8)',
      padding: '1.375rem',
    }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '1.25rem' }}>
        Admin controls
      </p>

      {/* ── Settings ── */}
      <Section title="Settings">
        <Field label="Name">
          <input
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={60}
            disabled={saving}
          />
        </Field>
        <Field label="Question / prompt">
          <input
            className="input"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="What should your team improve?"
            maxLength={120}
            disabled={saving}
          />
          <p style={{ fontSize: '0.7rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>
            Shown to members when they submit an idea.
          </p>
        </Field>

        {/* Icon picker */}
        <Field label="Icon">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {ICONS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setIcon(e)}
                disabled={saving}
                title={e}
                style={{
                  width: '2.125rem', height: '2.125rem',
                  borderRadius: '0.4rem',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  background: icon === e ? `${color}14` : 'transparent',
                  border: icon === e ? `2px solid ${color}` : '1px solid var(--tint-border)',
                  transition: 'border 0.1s, background 0.1s',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </Field>

        {/* Color picker */}
        <Field label="Color">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {COLORS.map(c => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                disabled={saving}
                title={c.name}
                style={{
                  width: '1.625rem', height: '1.625rem',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  background: c.hex,
                  border: 'none',
                  boxShadow: color === c.hex
                    ? `0 0 0 2px #fff, 0 0 0 4px ${c.hex}`
                    : '0 1px 3px rgba(0,0,0,0.18)',
                  transition: 'box-shadow 0.12s',
                }}
              />
            ))}
          </div>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1rem' }}>
          <Field label="Opens (optional)">
            <input
              type="datetime-local"
              className="input"
              value={startsAt}
              onChange={e => setStartsAt(e.target.value)}
              disabled={saving}
              style={{ fontSize: '0.775rem' }}
            />
          </Field>
          <Field label="Closes (optional)">
            <input
              type="datetime-local"
              className="input"
              value={endsAt}
              onChange={e => setEndsAt(e.target.value)}
              disabled={saving}
              style={{ fontSize: '0.775rem' }}
            />
          </Field>
        </div>

        {saveError && (
          <p style={{ fontSize: '0.775rem', color: '#dc2626', marginBottom: '0.625rem' }}>{saveError}</p>
        )}

        <ActionBtn onClick={handleSave} disabled={saving} variant="secondary">
          {saving ? 'Saving…' : 'Save changes'}
        </ActionBtn>
      </Section>

      {/* ── Status control ── */}
      <Section title="Status">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          <ActionBtn
            onClick={() => handleStatusChange('draft')}
            disabled={saving || initialStatus === 'draft'}
            variant={initialStatus === 'draft' ? 'ghost' : 'secondary'}
          >
            Set draft
          </ActionBtn>
          <ActionBtn
            onClick={() => handleStatusChange('active')}
            disabled={saving || initialStatus === 'active'}
            variant={initialStatus === 'active' ? 'ghost' : 'green'}
          >
            🟢 Set active
          </ActionBtn>
          <ActionBtn
            onClick={() => handleStatusChange('closed')}
            disabled={saving || initialStatus === 'closed'}
            variant={initialStatus === 'closed' ? 'ghost' : 'danger'}
          >
            🔴 Set closed
          </ActionBtn>
        </div>

        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.5rem' }}>
          Manual override
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <ActionBtn
            onClick={() => handleOverride('open')}
            disabled={overrideSaving || initialManualOverride === 'open'}
            variant={initialManualOverride === 'open' ? 'ghost' : 'green'}
          >
            Force open
          </ActionBtn>
          <ActionBtn
            onClick={() => handleOverride('closed')}
            disabled={overrideSaving || initialManualOverride === 'closed'}
            variant={initialManualOverride === 'closed' ? 'ghost' : 'danger'}
          >
            Force close
          </ActionBtn>
          {initialManualOverride !== null && (
            <ActionBtn
              onClick={() => handleOverride(null)}
              disabled={overrideSaving}
              variant="ghost"
            >
              ↩ Use schedule
            </ActionBtn>
          )}
        </div>
      </Section>

      {/* ── Member assignment ── */}
      <Section title="Audience">
        <FlowMemberPicker
          roundId={roundId}
          companyMembers={companyMembers}
          assignedUserIds={assignedUserIds}
        />
      </Section>

      {/* ── Delete ── */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '1.25rem' }}>
        {confirmDelete ? (
          <div style={{
            borderRadius: '0.625rem',
            border: '1px solid rgba(239,68,68,0.25)',
            background: 'rgba(239,68,68,0.04)',
            padding: '0.875rem',
          }}>
            <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '0.25rem' }}>
              Delete this IdeaFlow?
            </p>
            <p style={{ fontSize: '0.775rem', color: '#991b1b', lineHeight: 1.5, marginBottom: '0.875rem' }}>
              This permanently removes all ideas, likes, and comments. Cannot be undone.
            </p>
            {deleteError && (
              <p style={{ fontSize: '0.775rem', color: '#dc2626', marginBottom: '0.5rem' }}>{deleteError}</p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ActionBtn onClick={() => { setConfirmDelete(false); setDeleteError('') }} variant="ghost" disabled={deleting}>
                Cancel
              </ActionBtn>
              <ActionBtn onClick={handleDelete} variant="danger" disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </ActionBtn>
            </div>
          </div>
        ) : (
          <ActionBtn onClick={() => setConfirmDelete(true)} variant="danger">
            Delete IdeaFlow
          </ActionBtn>
        )}
      </div>
    </div>
  )
}
