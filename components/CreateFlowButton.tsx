'use client'

/**
 * CreateFlowButton
 *
 * Opens an inline modal to create a new IdeaFlow.
 * Admin only — guard is enforced server-side too.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CreateFlowButtonProps {
  companyId: string
}

// ── Palettes ──────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreateFlowButton({ companyId: _companyId }: CreateFlowButtonProps) {
  const [open,     setOpen]     = useState(false)
  const [name,     setName]     = useState('')
  const [prompt,   setPrompt]   = useState('')
  const [status,   setStatus]   = useState<'draft' | 'active'>('active')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt,   setEndsAt]   = useState('')
  const [icon,     setIcon]     = useState('💡')
  const [color,    setColor]    = useState('#f97316')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const router = useRouter()

  function reset() {
    setName(''); setPrompt(''); setStatus('active')
    setStartsAt(''); setEndsAt(''); setError('')
    setIcon('💡'); setColor('#f97316')
  }

  function close() { reset(); setOpen(false) }

  async function handleCreate() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/rounds', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:      name.trim() || 'New IdeaFlow',
          prompt:    prompt.trim() || null,
          status,
          starts_at: startsAt ? new Date(startsAt).toISOString() : null,
          ends_at:   endsAt   ? new Date(endsAt).toISOString()   : null,
          icon,
          color,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to create')
      }
      const round = await res.json()
      router.push(`/dashboard/flows/${round.id}`)
      router.refresh()
      close()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          height: '2.125rem', padding: '0 1rem',
          fontSize: '0.825rem', fontWeight: 600,
          color: '#fff',
          background: 'var(--orange)',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        New IdeaFlow
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={close}
            style={{
              position: 'fixed', inset: 0, zIndex: 900,
              background: 'rgba(13,31,53,0.4)',
              backdropFilter: 'blur(3px)',
            }}
            aria-hidden
          />

          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create IdeaFlow"
            style={{
              position: 'fixed', zIndex: 901,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(30rem, calc(100vw - 2rem))',
              background: '#ffffff',
              borderRadius: '1.125rem',
              border: '1px solid rgba(26,107,191,0.12)',
              boxShadow: '0 8px 40px rgba(13,31,53,0.18)',
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
                {/* Live icon preview */}
                <div style={{
                  width: '2rem', height: '2rem', borderRadius: '0.5rem',
                  background: `${color}14`, border: `1px solid ${color}38`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', lineHeight: 1, transition: 'background 0.15s',
                }}>
                  {icon}
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                  Create IdeaFlow
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '1.75rem', height: '1.75rem', borderRadius: '0.4rem',
                  background: 'transparent', border: '1px solid var(--tint-border)',
                  color: 'var(--ink-light)', cursor: 'pointer', padding: 0,
                }}
                aria-label="Close"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div style={{
              padding: '1.25rem',
              display: 'flex', flexDirection: 'column', gap: '0.875rem',
              maxHeight: 'calc(100vh - 12rem)', overflowY: 'auto',
            }}>

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
                  Name
                </label>
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Product ideas, Team events…"
                  maxLength={60}
                  disabled={saving}
                  autoFocus
                />
              </div>

              {/* Question */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
                  Question (optional)
                </label>
                <input
                  className="input"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="What should your team improve?"
                  maxLength={120}
                  disabled={saving}
                />
              </div>

              {/* Icon picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.4rem' }}>
                  Icon
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {ICONS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setIcon(e)}
                      disabled={saving}
                      title={e}
                      style={{
                        width: '2.25rem', height: '2.25rem',
                        borderRadius: '0.45rem',
                        fontSize: '1.1rem',
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
              </div>

              {/* Color picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.4rem' }}>
                  Color
                </label>
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
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
                    Opens (optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={startsAt}
                    onChange={e => setStartsAt(e.target.value)}
                    disabled={saving}
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
                    onChange={e => setEndsAt(e.target.value)}
                    disabled={saving}
                    style={{ fontSize: '0.775rem' }}
                  />
                </div>
              </div>

              {/* Start as */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
                  Start as
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['active', 'draft'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      disabled={saving}
                      style={{
                        height: '2rem', padding: '0 0.875rem',
                        borderRadius: '0.4rem',
                        fontSize: '0.775rem', fontWeight: 600,
                        cursor: 'pointer',
                        background: status === s ? (s === 'active' ? 'rgba(16,185,129,0.09)' : 'rgba(0,0,0,0.04)') : 'transparent',
                        border: status === s
                          ? (s === 'active' ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(0,0,0,0.12)')
                          : '1px solid var(--tint-border)',
                        color: status === s ? (s === 'active' ? '#065f46' : '#475569') : '#94a3b8',
                      }}
                    >
                      {s === 'active' ? '🟢 Active' : '⏳ Draft'}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p style={{ fontSize: '0.775rem', color: '#dc2626' }}>{error}</p>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={close}
                  disabled={saving}
                  style={{
                    height: '2.125rem', padding: '0 1rem', borderRadius: '0.45rem',
                    fontSize: '0.8rem', fontWeight: 600,
                    background: 'transparent', color: '#64748b',
                    border: '1px solid var(--tint-border)', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving}
                  style={{
                    height: '2.125rem', padding: '0 1.125rem', borderRadius: '0.45rem',
                    fontSize: '0.8rem', fontWeight: 600,
                    background: color, color: '#fff',
                    border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    transition: 'opacity 0.1s',
                  }}
                >
                  {saving ? 'Creating…' : 'Create IdeaFlow'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
