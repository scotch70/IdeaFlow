'use client'

import { useState } from 'react'
import type { Idea } from '@/types/database'
import StatusBadge from './StatusBadge'
import IdeaComments from './IdeaComments'

interface IdeaCardProps {
  idea: Idea
  currentUserId: string
  isAdmin: boolean
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export default function IdeaCard({ idea, currentUserId, isAdmin }: IdeaCardProps) {
  const [liked, setLiked]           = useState(idea.liked_by_user ?? false)
  const [likesCount, setLikesCount] = useState(idea.likes_count)
  const [loading, setLoading]       = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [planning, setPlanning]     = useState(false)
  const [editing, setEditing]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [actionError, setActionError] = useState('')
  const [editTitle, setEditTitle]   = useState(idea.title)
  const [editDescription, setEditDescription] = useState(idea.description ?? '')

  const isOwn      = idea.user_id === currentUserId
  const authorName = idea.profiles?.full_name ?? 'Anonymous'
  const isPlanned  = idea.status === 'planned'
  const isOpen     = !idea.status || idea.status === 'open'

  async function toggleLike() {
    if (loading || deleting || editing || saving) return
    setLoading(true)

    const previousLiked = liked
    const previousCount = likesCount
    const newLiked = !liked

    setLiked(newLiked)
    setLikesCount(newLiked ? previousCount + 1 : Math.max(0, previousCount - 1))

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id, liked: newLiked }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update like')
      window.location.reload()
    } catch (error) {
      setLiked(previousLiked)
      setLikesCount(previousCount)
      setActionError(error instanceof Error ? error.message : 'Failed to update like')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    setConfirmDelete(false)
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ideaId: idea.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete idea')
      window.location.reload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete idea')
      setDeleting(false)
    }
  }

  async function handlePlan() {
    setPlanning(true)
    setActionError('')
    try {
      const res = await fetch('/api/ideas/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id, status: 'planned' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update status')
      window.location.reload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to update status')
      setPlanning(false)
    }
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) { setActionError('Title is required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          ideaId: idea.id,
          title: editTitle,
          description: editDescription,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update idea')
      window.location.reload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to update idea')
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setEditTitle(idea.title)
    setEditDescription(idea.description ?? '')
    setEditing(false)
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.875rem',
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: '0.75rem',
        padding: '1rem 1.125rem',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      className="idea-card-item"
    >

      {/* Like column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', paddingTop: '0.1rem', minWidth: '1.875rem' }}>
        <button
          onClick={toggleLike}
          disabled={loading || deleting || editing || saving}
          title={liked ? 'Unlike' : 'Like this idea'}
          style={{
            width: '1.875rem',
            height: '1.75rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: liked ? '1px solid rgba(249,115,22,0.30)' : '1px solid var(--tint-border)',
            background: liked ? 'rgba(249,115,22,0.09)' : 'var(--tint-bg)',
            color: liked ? '#f97316' : 'var(--ink-light)',
            cursor: loading ? 'default' : 'pointer',
            transition: 'all 0.14s ease',
          }}
        >
          <HeartIcon filled={liked} />
        </button>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: liked ? '#f97316' : 'var(--ink-light)',
          }}
        >
          {likesCount}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <input
              className="input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Idea title"
            />
            <textarea
              className="input"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              placeholder="Add more details (optional)"
            />
            {actionError && (
              <p style={{ fontSize: '0.75rem', color: '#dc2626' }}>{actionError}</p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="btn-primary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="btn-secondary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <p style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.45, color: 'var(--ink)' }}>
                {idea.title}
              </p>

              {/* Status badge + admin inline actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0, paddingTop: '0.1rem' }}>
                <StatusBadge status={idea.status} />

                {isAdmin && isOpen && (
                  <button
                    onClick={handlePlan}
                    disabled={planning || deleting}
                    style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      border: '1px solid rgba(99,102,241,0.30)',
                      background: 'rgba(99,102,241,0.07)',
                      color: '#4338ca',
                      cursor: planning ? 'default' : 'pointer',
                      opacity: planning ? 0.6 : 1,
                      transition: 'all 0.12s ease',
                      whiteSpace: 'nowrap',
                      lineHeight: 1,
                    }}
                  >
                    {planning ? '…' : 'Plan'}
                  </button>
                )}

                {isAdmin && !confirmDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting || planning}
                    title="Delete idea"
                    style={{
                      padding: '0.2rem 0.45rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      border: '1px solid rgba(220,38,38,0.20)',
                      background: 'rgba(220,38,38,0.05)',
                      color: '#dc2626',
                      cursor: deleting ? 'default' : 'pointer',
                      opacity: deleting ? 0.5 : 1,
                      transition: 'all 0.12s ease',
                      lineHeight: 1,
                    }}
                  >
                    {deleting ? '…' : 'Delete'}
                  </button>
                )}

                {isAdmin && confirmDelete && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button
                      onClick={handleDelete}
                      style={{
                        padding: '0.2rem 0.45rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        border: '1px solid rgba(220,38,38,0.40)',
                        background: 'rgba(220,38,38,0.10)',
                        color: '#dc2626',
                        cursor: 'pointer',
                        lineHeight: 1,
                      }}
                    >
                      Sure?
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{
                        padding: '0.2rem 0.35rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.68rem',
                        fontWeight: 500,
                        border: '1px solid rgba(0,0,0,0.10)',
                        background: 'transparent',
                        color: 'var(--ink-light)',
                        cursor: 'pointer',
                        lineHeight: 1,
                      }}
                    >
                      Cancel
                    </button>
                  </span>
                )}
              </div>
            </div>

            {idea.description && (
              <p style={{ marginTop: '0.25rem', fontSize: '0.825rem', lineHeight: 1.65, color: 'var(--ink-light)' }}>
                {idea.description}
              </p>
            )}

            {/* Meta row — author, time, owner edit/delete */}
            <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--ink-light)' }}>
              <span style={{ fontWeight: 500 }}>{isOwn ? 'You' : authorName}</span>
              <span style={{ color: 'var(--dot-color)' }}>·</span>
              <span>{timeAgo(idea.created_at)}</span>

              {isOwn && !isAdmin && (
                <>
                  <span style={{ color: 'var(--dot-color)' }}>·</span>
                  <button
                    onClick={() => setEditing(true)}
                    disabled={deleting || saving}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', cursor: 'pointer', color: 'var(--ink-mid)', fontWeight: 500 }}
                  >
                    Edit
                  </button>
                  <span style={{ color: 'var(--dot-color)' }}>·</span>
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      disabled={deleting || saving}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', cursor: 'pointer', color: '#dc2626', fontWeight: 500, opacity: deleting ? 0.5 : 1 }}
                    >
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleDelete}
                        style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}
                      >
                        Sure?
                      </button>
                      <span style={{ color: 'var(--dot-color)' }}>·</span>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', cursor: 'pointer', color: 'var(--ink-light)', fontWeight: 500 }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </>
              )}

              {isOwn && isAdmin && (
                <>
                  <span style={{ color: 'var(--dot-color)' }}>·</span>
                  <button
                    onClick={() => setEditing(true)}
                    disabled={deleting || saving}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', cursor: 'pointer', color: 'var(--ink-mid)', fontWeight: 500 }}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>

            {actionError && (
              <p style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#dc2626' }}>
                {actionError}
              </p>
            )}

            {/* Comments — always visible, fetched on mount */}
            <IdeaComments ideaId={idea.id} currentUserId={currentUserId} isAdmin={isAdmin} />
          </>
        )}
      </div>
    </div>
  )
}
