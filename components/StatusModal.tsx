'use client'

import { useState } from 'react'
import { IDEA_STATUSES, STATUS_CONFIG, IdeaStatus } from './StatusBadge'

const NOTE_REQUIRED: IdeaStatus[] = ['declined', 'implemented']
const MIN_NOTE_LENGTH = 30

const IMPACT_TYPES = [
  { value: 'revenue',      label: 'Revenue' },
  { value: 'cost_saving',  label: 'Cost saving' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'culture',      label: 'Culture' },
  { value: 'other',        label: 'Other' },
]

interface StatusModalProps {
  ideaId: string
  ideaTitle: string
  currentStatus: string
  onClose: () => void
}

export default function StatusModal({
  ideaId,
  ideaTitle,
  currentStatus,
  onClose,
}: StatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<IdeaStatus>(
    IDEA_STATUSES.includes(currentStatus as IdeaStatus)
      ? (currentStatus as IdeaStatus)
      : 'open',
  )
  const [note, setNote]                   = useState('')
  const [impactSummary, setImpactSummary] = useState('')
  const [impactType, setImpactType]       = useState('')
  const [impactLink, setImpactLink]       = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState('')

  const noteRequired    = NOTE_REQUIRED.includes(selectedStatus)
  const noteValid       = !noteRequired || note.trim().length >= MIN_NOTE_LENGTH
  const isImplemented   = selectedStatus === 'implemented'
  const impactValid     = !isImplemented || impactSummary.trim().length >= 10
  const canSubmit       = noteValid && impactValid

  async function handleSubmit() {
    if (!canSubmit) {
      if (!noteValid) {
        setError(`A note of at least ${MIN_NOTE_LENGTH} characters is required.`)
      } else if (!impactValid) {
        setError('Impact summary (at least 10 characters) is required.')
      }
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/ideas/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId,
          status: selectedStatus,
          note,
          impactSummary,
          impactType,
          impactLink,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(13,31,53,0.30)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          width: 'min(30rem, calc(100vw - 2rem))',
          background: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          maxHeight: 'calc(100vh - 4rem)',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
              Update Status
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d1f35', lineHeight: 1.4 }}>
              {ideaTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.125rem', color: '#9ab0c8', flexShrink: 0, lineHeight: 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Status pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {IDEA_STATUSES.map((s) => {
            const cfg    = STATUS_CONFIG[s]
            const active = selectedStatus === s
            return (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                style={{
                  borderRadius: '0.5rem',
                  padding: '0.45rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: active ? `1.5px solid ${cfg.color}` : '1.5px solid rgba(0,0,0,0.09)',
                  background: active ? cfg.bg : 'transparent',
                  color: active ? cfg.color : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  textAlign: 'center',
                }}
              >
                {cfg.label}
              </button>
            )
          })}
        </div>

        {/* Note textarea */}
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#5a7fa8', marginBottom: '0.4rem' }}>
            Note{noteRequired ? ` (required — ${MIN_NOTE_LENGTH}+ chars)` : ' (optional)'}
          </label>
          <textarea
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              selectedStatus === 'declined'
                ? 'Explain why this idea was declined…'
                : selectedStatus === 'implemented'
                  ? 'Describe what was built or shipped…'
                  : 'Add context for the team (optional)'
            }
            style={{ minHeight: '5rem', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
          />
          <p style={{ fontSize: '0.68rem', color: noteRequired && note.trim().length < MIN_NOTE_LENGTH ? '#dc2626' : '#9ab0c8', marginTop: '0.3rem', textAlign: 'right' }}>
            {note.trim().length} / {MIN_NOTE_LENGTH} min
          </p>
        </div>

        {/* ── Impact fields — only shown when status = implemented ── */}
        {isImplemented && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
              borderTop: '1px solid rgba(16,185,129,0.15)',
              paddingTop: '1rem',
            }}
          >
            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#065f46' }}>
              Impact details
            </p>

            {/* Impact summary — required */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#5a7fa8', marginBottom: '0.4rem' }}>
                Impact summary <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                className="input"
                value={impactSummary}
                onChange={(e) => setImpactSummary(e.target.value)}
                placeholder="What measurable or qualitative impact did this idea deliver?"
                style={{ minHeight: '4rem', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: '0.68rem', color: impactSummary.trim().length < 10 ? '#dc2626' : '#9ab0c8', marginTop: '0.3rem', textAlign: 'right' }}>
                {impactSummary.trim().length} / 10 min
              </p>
            </div>

            {/* Impact type — optional */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#5a7fa8', marginBottom: '0.4rem' }}>
                Impact type <span style={{ color: '#9ab0c8', fontWeight: 400 }}>(optional)</span>
              </label>
              <select
                className="input"
                value={impactType}
                onChange={(e) => setImpactType(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <option value="">— select type —</option>
                {IMPACT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Impact link — optional */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#5a7fa8', marginBottom: '0.4rem' }}>
                Link <span style={{ color: '#9ab0c8', fontWeight: 400 }}>(optional — PR, doc, announcement…)</span>
              </label>
              <input
                type="url"
                className="input"
                value={impactLink}
                onChange={(e) => setImpactLink(e.target.value)}
                placeholder="https://…"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p style={{ borderRadius: '0.5rem', border: '1px solid rgba(220,38,38,0.15)', background: 'rgba(220,38,38,0.05)', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#dc2626' }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={submitting}
            className="btn-secondary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="btn-primary"
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.8rem', opacity: submitting || !canSubmit ? 0.6 : 1, cursor: submitting || !canSubmit ? 'default' : 'pointer' }}
          >
            {submitting ? 'Saving…' : 'Update'}
          </button>
        </div>
      </div>
    </>
  )
}
