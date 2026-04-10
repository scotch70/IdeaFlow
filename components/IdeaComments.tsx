'use client'

import { useEffect, useRef, useState } from 'react'
import type { Comment } from '@/types/database'

const MAX_LENGTH = 200

interface IdeaCommentsProps {
  ideaId: string
  currentUserId: string
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

export default function IdeaComments({ ideaId, currentUserId }: IdeaCommentsProps) {
  const [comments, setComments]     = useState<Comment[]>([])
  const [loading, setLoading]       = useState(true)
  const [content, setContent]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const inputRef                    = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/comments?ideaId=${ideaId}`)
      .then(r => r.json())
      .then((data: Comment[]) => setComments(Array.isArray(data) ? data : []))
      .catch(() => {/* silently ignore — not critical */})
      .finally(() => setLoading(false))
  }, [ideaId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    setError('')

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
      setError(err instanceof Error ? err.message : 'Failed to post')
    } finally {
      setSubmitting(false)
    }
  }

  const charsLeft = MAX_LENGTH - content.length
  const nearLimit = charsLeft <= 20

  return (
    <div
      style={{
        marginTop: '0.625rem',
        paddingTop: '0.625rem',
        borderTop: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Comment list — Instagram style: Name comment · time */}
      {!loading && comments.length > 0 && (
        <div style={{ marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {comments.map(c => {
            const name    = c.profiles?.full_name ?? 'Anonymous'
            const isOwn   = c.user_id === currentUserId
            const display = isOwn ? 'You' : name

            return (
              <p
                key={c.id}
                style={{
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
                  {timeAgo(c.created_at)}
                </span>
              </p>
            )
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize: '0.72rem', color: '#dc2626', marginBottom: '0.375rem' }}>
          {error}
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
          onChange={e => setContent(e.target.value.slice(0, MAX_LENGTH))}
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
