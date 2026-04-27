'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface NewIdeaFormProps {
  userId: string
  companyId: string
  isAdmin?: boolean
  /** Prompt/question from the active IdeaFlow round. Falls back to default if null. */
  roundPrompt?: string | null
  /**
   * Whether an idea round is currently accepting submissions.
   * true (default) = open; false = locked (round closed or in draft).
   */
  roundActive?: boolean
  /** Name of the current round, shown in the locked state message. */
  roundName?: string | null
  /**
   * Start the form in expanded state (e.g. when the user is nudged from the
   * empty-state CTA so they don't land on a collapsed, ambiguous widget).
   */
  defaultOpen?: boolean
  /**
   * True when a round exists but is still in draft — changes the lock message
   * from "closed" to "coming soon" so members aren't confused.
   */
  roundIsDraft?: boolean
}

export default function NewIdeaForm({
  userId,
  companyId,
  isAdmin = false,
  roundPrompt = null,
  roundActive = true,
  roundName = null,
  defaultOpen = false,
  roundIsDraft = false,
}: NewIdeaFormProps) {
  const [open, setOpen]             = useState(defaultOpen)
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const router = useRouter()

  // Heading shown above the form: admin-set per round, with a sensible default.
  const heading = roundPrompt?.trim() || 'What should your team improve?'

  // ── Idea submission handler ────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, companyId, userId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create idea')
      }

      setTitle('')
      setDescription('')
      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Shared heading block ───────────────────────────────────────────────────
  const headingBlock = (
    <div style={{ marginBottom: '0.85rem' }}>
      <p style={{
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--ink-light)',
        marginBottom: '0.25rem',
      }}>
        Share your idea
      </p>
      <h2 style={{
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--ink)',
        margin: 0,
        lineHeight: 1.5,
      }}>
        {heading}
      </h2>
    </div>
  )

  // ── Round locked state ────────────────────────────────────────────────────
  if (!roundActive) {
    return (
      <div>
        {headingBlock}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.875rem 1rem',
          borderRadius: '1rem',
          border: '1px solid rgba(239,68,68,0.15)',
          background: 'rgba(239,68,68,0.03)',
          color: '#9ab0c8',
        }}>
          <span style={{
            width: '1.75rem', height: '1.75rem', borderRadius: '0.45rem',
            background: 'rgba(239,68,68,0.08)', color: '#dc2626',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem', flexShrink: 0,
          }}>
            🔒
          </span>
          <span style={{ fontSize: '0.855rem', fontWeight: 500 }}>
            {roundIsDraft
              ? (roundName
                  ? `${roundName} is coming soon — submissions will open shortly.`
                  : 'Your admin is setting up an idea round — submissions will open soon.')
              : (roundName
                  ? `${roundName} is closed — idea submission is not available right now.`
                  : 'Idea submission is closed right now.')}
          </span>
        </div>
      </div>
    )
  }

  // ── Collapsed state ────────────────────────────────────────────────────────
  if (!open) {
    return (
      <div>
        {headingBlock}
        <button
          onClick={() => setOpen(true)}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center',
            gap: '0.75rem', padding: '0.875rem 1rem',
            borderRadius: '1rem',
            border: '1.5px dashed var(--tint-border)',
            background: 'var(--tint-bg)',
            color: 'var(--ink-light)',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{
            width: '1.75rem', height: '1.75rem',
            borderRadius: '0.45rem',
            background: 'rgba(249,115,22,0.10)',
            color: 'var(--orange)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', flexShrink: 0,
          }}>
            +
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {isAdmin
              ? 'Share an idea your team should work on…'
              : 'Share a new idea…'}
          </span>
        </button>
      </div>
    )
  }

  // ── Expanded state ─────────────────────────────────────────────────────────
  return (
    <div className="card">
      {headingBlock}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
      >
        <input
          className="input"
          placeholder={
            isAdmin
              ? 'Share an idea your team should work on...'
              : 'Share a new idea...'
          }
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          autoFocus
          maxLength={120}
        />

        <textarea
          className="input"
          style={{ resize: 'none', minHeight: '5rem' }}
          placeholder="Add more detail… (optional)"
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={500}
        />

        {submitError && (
          <p style={{
            borderRadius: '0.625rem',
            border: '1px solid rgba(220,38,38,0.15)',
            background: 'rgba(220,38,38,0.05)',
            padding: '0.5rem 0.75rem',
            fontSize: '0.825rem', color: '#dc2626',
          }}>
            {submitError}
          </p>
        )}

        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          gap: '0.5rem', paddingTop: '0.25rem',
        }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setOpen(false)
              setSubmitError('')
              setTitle('')
              setDescription('')
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || !title.trim()}
          >
            {submitting ? 'Posting…' : 'Post idea'}
          </button>
        </div>
      </form>
    </div>
  )
}
