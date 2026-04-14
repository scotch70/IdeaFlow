'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const MAX_PROMPT_LENGTH = 80

interface NewIdeaFormProps {
  userId: string
  companyId: string
  isAdmin?: boolean
  /** Current custom heading from companies.custom_idea_prompt. Null = use default. */
  customPrompt?: string | null
}

export default function NewIdeaForm({
  userId,
  companyId,
  isAdmin = false,
  customPrompt = null,
}: NewIdeaFormProps) {
  // ── Idea submission state ──────────────────────────────────────────────────
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Prompt inline-edit state ───────────────────────────────────────────────
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [promptDraft, setPromptDraft] = useState('')
  const [promptSaving, setPromptSaving] = useState(false)
  const [promptError, setPromptError] = useState('')

  const promptInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Resolved heading: custom > role default
  const defaultHeading = isAdmin
    ? 'What should your team improve?'
    : 'What would you like to improve?'
  const heading = customPrompt?.trim() || defaultHeading

  // ── Prompt edit handlers ───────────────────────────────────────────────────
  function startEditingPrompt() {
    setPromptDraft(customPrompt?.trim() || defaultHeading)
    setPromptError('')
    setEditingPrompt(true)
    // Focus after state flush
    setTimeout(() => promptInputRef.current?.select(), 0)
  }

  function cancelEditingPrompt() {
    setEditingPrompt(false)
    setPromptError('')
  }

  async function savePrompt() {
    const value = promptDraft.trim()
    if (!value) return

    setPromptSaving(true)
    setPromptError('')

    try {
      const res = await fetch('/api/company/update-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, prompt: value }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save')
      }

      setEditingPrompt(false)
      router.refresh() // re-fetch server data so heading reflects new value
    } catch (err: unknown) {
      setPromptError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setPromptSaving(false)
    }
  }

  function handlePromptKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); savePrompt() }
    if (e.key === 'Escape') { e.preventDefault(); cancelEditingPrompt() }
  }

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
  // Rendered identically in both collapsed and expanded states.
  // minHeight is fixed so the row never shifts between view/edit mode.
  const headingBlock = (
  <div style={{ marginBottom: '0.85rem' }}>
    {/* Label */}
    <p
      style={{
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--ink-light)',
        marginBottom: '0.25rem',
      }}
    >
      Share your idea
    </p>

    {/* Heading row */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        minHeight: '1.9rem',
      }}
    >
      {editingPrompt ? (
        <>
          {/* Input */}
          <input
            ref={promptInputRef}
            value={promptDraft}
            onChange={(e) => setPromptDraft(e.target.value)}
            onKeyDown={handlePromptKeyDown}
            maxLength={MAX_PROMPT_LENGTH}
            disabled={promptSaving}
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1.5,
              flex: 1,
              minWidth: 0,
              padding: '0 0.25rem',
              border: 'none',
              borderBottom: '1.5px solid var(--orange)',
              background: 'transparent',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          {/* Save */}
          <button
            onClick={savePrompt}
            disabled={!promptDraft.trim() || promptSaving}
            style={{
              height: '1.6rem',
              padding: '0 0.6rem',
              borderRadius: '0.4rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: 'var(--orange)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              opacity: !promptDraft.trim() || promptSaving ? 0.5 : 1,
            }}
          >
            {promptSaving ? '…' : 'Save'}
          </button>

          {/* Cancel */}
          <button
            onClick={cancelEditingPrompt}
            disabled={promptSaving}
            style={{
              height: '1.6rem',
              padding: '0 0.6rem',
              borderRadius: '0.4rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--ink-light)',
              background: '#fff',
              border: '1px solid var(--tint-border)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          {/* Heading text */}
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--ink)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {heading}
          </h2>

          {/* Edit button (VISIBLE now) */}
          {isAdmin && (
            <button
              type="button"
              onClick={startEditingPrompt}
              title="Edit question"
              aria-label="Edit question"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.9rem',
                height: '1.9rem',
                borderRadius: '0.5rem',
                background: '#ffffff',
                border: '1px solid rgba(26,107,191,0.14)',
                color: '#5a7fa8',
                cursor: 'pointer',
                flexShrink: 0,
                padding: 0,
                boxShadow: '0 1px 4px rgba(6,14,38,0.04)',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>

    {/* Error */}
    {promptError && (
      <p
        style={{
          marginTop: '0.3rem',
          fontSize: '0.75rem',
          color: '#dc2626',
        }}
      >
        {promptError}
      </p>
    )}
  </div>
)

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
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
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
