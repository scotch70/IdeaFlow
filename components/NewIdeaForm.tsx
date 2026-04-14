'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface NewIdeaFormProps {
  userId: string
  companyId: string
  isAdmin?: boolean
}

export default function NewIdeaForm({
  userId,
  companyId,
  isAdmin = false,
}: NewIdeaFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    setError('')

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
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Collapsed state ─────────────────────────────────────────────
  if (!open) {
    return (
      <div>
        <div style={{ marginBottom: '0.75rem' }}>
          <p
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ink-light)',
              marginBottom: '0.2rem',
            }}
          >
            Share your idea
          </p>

          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>
            {isAdmin
              ? 'What should your team improve?'
              : 'What would you like to improve?'}
          </h2>
        </div>

        <button
          onClick={() => setOpen(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            borderRadius: '1rem',
            border: '1.5px dashed var(--tint-border)',
            background: 'var(--tint-bg)',
            color: 'var(--ink-light)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span
            style={{
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: '0.45rem',
              background: 'rgba(249,115,22,0.10)',
              color: 'var(--orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
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

  // ── Expanded state ─────────────────────────────────────────────
  return (
    <div className="card">
      <div style={{ marginBottom: '1rem' }}>
        <p
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ink-light)',
            marginBottom: '0.2rem',
          }}
        >
          Share your idea
        </p>

        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>
          {isAdmin
            ? 'What should your team improve?'
            : 'What would you like to improve?'}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
        }}
      >
        <input
          className="input"
          placeholder={
            isAdmin
              ? 'Share an idea your team should work on...'
              : 'Share a new idea...'
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />

        {error && (
          <p
            style={{
              borderRadius: '0.625rem',
              border: '1px solid rgba(220,38,38,0.15)',
              background: 'rgba(220,38,38,0.05)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.825rem',
              color: '#dc2626',
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
            paddingTop: '0.25rem',
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setOpen(false)
              setError('')
              setTitle('')
              setDescription('')
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !title.trim()}
          >
            {loading ? 'Posting…' : 'Post idea'}
          </button>
        </div>
      </form>
    </div>
  )
}