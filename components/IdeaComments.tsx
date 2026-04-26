'use client'

import { useEffect, useRef, useState } from 'react'
import type { Comment } from '@/types/database'

const MAX_POST_LENGTH = 200
const MAX_EDIT_LENGTH = 500

interface IdeaCommentsProps {
  ideaId: string
  currentUserId: string
  isAdmin?: boolean
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export default function IdeaComments({ ideaId, currentUserId, isAdmin = false }: IdeaCommentsProps) {
  const [comments, setComments]           = useState<Comment[]>([])
  const [loading, setLoading]             = useState(true)
  const [loadFailed, setLoadFailed]       = useState(false)
  const [content, setContent]             = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [postError, setPostError]         = useState('')
  const inputRef                          = useRef<HTMLInputElement>(null)

  // Per-comment interaction state
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [editValue, setEditValue]         = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [busyId, setBusyId]               = useState<string | null>(null)
  const [commentErrors, setCommentErrors] = useState<Map<string, string>>(new Map())

  function setCommentError(id: string, msg: string) {
    setCommentErrors(prev => new Map(prev).set(id, msg))
  }
  function clearCommentError(id: string) {
    setCommentErrors(prev => { const n = new Map(prev); n.delete(id); return n })
  }

  function fetchComments() {
    setLoading(true)
    setLoadFailed(false)
    fetch(`/api/comments?ideaId=${ideaId}`)
      .then(r => r.json())
      .then((data: Comment[]) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setLoadFailed(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchComments() }, [ideaId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Post new comment ──────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    setPostError('')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, content: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to post')
      setComments(prev => [...prev, data as Comment])
      setContent('')
      inputRef.current?.focus()
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Failed to post')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Edit comment ──────────────────────────────────────────────────────────

  function startEdit(comment: Comment) {
    setEditingId(comment.id)
    setEditValue(comment.content)
    setConfirmDeleteId(null)
    clearCommentError(comment.id)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  async function saveEdit(comment: Comment) {
    const trimmed = editValue.trim()
    if (!trimmed || busyId === comment.id) return
    if (trimmed === comment.content) { cancelEdit(); return }

    setBusyId(comment.id)
    clearCommentError(comment.id)

    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setComments(prev => prev.map(c => c.id === comment.id ? { ...c, content: trimmed, updated_at: data.updated_at ?? null } : c))
      setEditingId(null)
      setEditValue('')
    } catch (err) {
      setCommentError(comment.id, err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setBusyId(null)
    }
  }

  // ── Delete comment ────────────────────────────────────────────────────────

  function requestDelete(id: string) {
    setConfirmDeleteId(id)
    setEditingId(null)
    clearCommentError(id)
  }

  function cancelDelete() {
    setConfirmDeleteId(null)
  }

  async function confirmDelete(id: string) {
    if (busyId === id) return
    setBusyId(id)
    clearCommentError(id)

    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')
      setComments(prev => prev.filter(c => c.id !== id))
      setConfirmDeleteId(null)
    } catch (err) {
      setCommentError(id, err instanceof Error ? err.message : 'Failed to delete')
      setBusyId(null)
    }
  }

  const charsLeft  = MAX_POST_LENGTH - content.length
  const nearLimit  = charsLeft <= 20

  return (
    <div
      style={{
        marginTop: '0.625rem',
        paddingTop: '0.625rem',
        borderTop: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Comment list */}
      {!loading && comments.length > 0 && (
        <div style={{ marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {comments.map(c => {
            const name     = c.profiles?.full_name ?? 'Anonymous'
            const isOwn    = c.user_id === currentUserId
            const display  = isOwn ? 'You' : name
            const canEdit  = isOwn
            const canDelete = isOwn || isAdmin
            const isBusy   = busyId === c.id
            const isEditing = editingId === c.id
            const isConfirmingDelete = confirmDeleteId === c.id
            const errMsg   = commentErrors.get(c.id)

            return (
              <div key={c.id}>
                {isEditing ? (
                  /* ── Edit mode ── */
                  <div>
                    <textarea
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value.slice(0, MAX_EDIT_LENGTH))}
                      disabled={isBusy}
                      style={{
                        display: 'block',
                        width: '100%',
                        fontSize: '0.775rem',
                        lineHeight: 1.45,
                        padding: '0.3rem 0.4rem',
                        border: '1px solid rgba(26,107,191,0.25)',
                        borderRadius: '0.375rem',
                        background: 'rgba(26,107,191,0.02)',
                        color: '#0d1f35',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        minHeight: '3.5rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                      <button
                        onClick={() => saveEdit(c)}
                        disabled={isBusy || !editValue.trim()}
                        style={actionBtnStyle('#1a6bbf', isBusy || !editValue.trim())}
                      >
                        {isBusy ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isBusy}
                        style={actionBtnStyle('#9ab0c8', isBusy)}
                      >
                        Cancel
                      </button>
                      <span style={{ fontSize: '0.62rem', color: editValue.length > MAX_EDIT_LENGTH - 20 ? '#f59e0b' : 'transparent', fontVariantNumeric: 'tabular-nums' }}>
                        {MAX_EDIT_LENGTH - editValue.length}
                      </span>
                    </div>
                  </div>
                ) : isConfirmingDelete ? (
                  /* ── Delete confirm ── */
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Delete this comment?</span>
                    <button
                      onClick={() => confirmDelete(c.id)}
                      disabled={isBusy}
                      style={actionBtnStyle('#dc2626', isBusy)}
                    >
                      {isBusy ? 'Deleting…' : 'Delete'}
                    </button>
                    <button
                      onClick={cancelDelete}
                      disabled={isBusy}
                      style={actionBtnStyle('#9ab0c8', isBusy)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  /* ── Normal display ── */
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                    <p
                      style={{
                        flex: 1,
                        margin: 0,
                        fontSize: '0.775rem',
                        lineHeight: 1.45,
                        color: '#374151',
                        wordBreak: 'break-word',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#0d1f35', marginRight: '0.3rem' }}>
                        {display}
                      </span>
                      {c.content}
                      <span style={{ marginLeft: '0.4rem', fontSize: '0.68rem', color: '#c4d0dc', fontWeight: 400 }}>
                        {timeAgo(c.updated_at ?? c.created_at)}
                        {c.updated_at && c.updated_at !== c.created_at && (
                          <span title="Edited" style={{ marginLeft: '0.2rem', opacity: 0.7 }}>·&nbsp;edited</span>
                        )}
                      </span>
                    </p>

                    {/* Action buttons — only shown for owner/admin */}
                    {(canEdit || canDelete) && (
                      <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0, opacity: 0.55, transition: 'opacity 0.1s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.55'}
                      >
                        {canEdit && (
                          <button
                            onClick={() => startEdit(c)}
                            title="Edit comment"
                            style={iconBtnStyle}
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => requestDelete(c.id)}
                            title="Delete comment"
                            style={{ ...iconBtnStyle, color: '#dc2626' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Per-comment error */}
                {errMsg && (
                  <p style={{ fontSize: '0.68rem', color: '#dc2626', marginTop: '0.2rem' }}>
                    {errMsg}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Load failure */}
      {loadFailed && (
        <p style={{ fontSize: '0.72rem', color: '#dc2626', marginBottom: '0.375rem' }}>
          Could not load comments.{' '}
          <button
            onClick={fetchComments}
            style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', color: '#dc2626', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Retry
          </button>
        </p>
      )}

      {/* Post error */}
      {postError && (
        <p style={{ fontSize: '0.72rem', color: '#dc2626', marginBottom: '0.375rem' }}>
          {postError}
        </p>
      )}

      {/* Single-line input */}
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={e => setContent(e.target.value.slice(0, MAX_POST_LENGTH))}
          placeholder={loading ? 'Loading…' : 'Add a comment…'}
          disabled={submitting || loading}
          style={{
            flex: 1,
            fontSize: '0.775rem',
            padding: '0.35rem 0.6rem',
            border: 'none',
            borderBottom: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 0,
            background: 'transparent',
            color: '#0d1f35',
            outline: 'none',
            fontFamily: 'inherit',
            minWidth: 0,
          }}
          onFocus={e  => { e.currentTarget.style.borderBottomColor = 'rgba(26,107,191,0.40)' }}
          onBlur={e   => { e.currentTarget.style.borderBottomColor = 'rgba(0,0,0,0.10)' }}
        />

        {/* Char counter — only shown near limit */}
        {nearLimit && content.length > 0 && (
          <span
            style={{
              fontSize: '0.65rem',
              color: charsLeft <= 0 ? '#dc2626' : '#f59e0b',
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}
          >
            {charsLeft}
          </span>
        )}

        <button
          type="submit"
          disabled={!content.trim() || submitting || charsLeft < 0}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.2rem 0',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: content.trim() && !submitting ? '#f97316' : '#c4d0dc',
            cursor: content.trim() && !submitting ? 'pointer' : 'default',
            flexShrink: 0,
            letterSpacing: '0.01em',
            transition: 'color 0.12s',
          }}
        >
          {submitting ? '…' : 'Post'}
        </button>
      </form>
    </div>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '0 0.15rem',
  fontSize: '0.65rem',
  fontWeight: 600,
  color: '#9ab0c8',
  cursor: 'pointer',
  lineHeight: 1,
}

function actionBtnStyle(color: string, disabled: boolean): React.CSSProperties {
  return {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '0.72rem',
    fontWeight: 600,
    color: disabled ? '#c4d0dc' : color,
    cursor: disabled ? 'default' : 'pointer',
  }
}
