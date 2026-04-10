'use client'

import { useState } from 'react'
import type { Idea } from '@/types/database'
import StatusBadge from './StatusBadge'
import StatusModal from './StatusModal'
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
  const [liked, setLiked] = useState(idea.liked_by_user ?? false)
  const [likesCount, setLikesCount] = useState(idea.likes_count)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editTitle, setEditTitle] = useState(idea.title)
  const [editDescription, setEditDescription] = useState(idea.description ?? '')
  const [statusModalOpen, setStatusModalOpen] = useState(false)

  const isOwn = idea.user_id === currentUserId
  const authorName = idea.profiles?.full_name ?? 'Anonymous'
  const isResolved = idea.status === 'declined' || idea.status === 'implemented'

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
      alert(error instanceof Error ? error.message : 'Failed to update like')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('Delete this idea?')
    if (!confirmed) return
    setDeleting(true)
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
      alert(error instanceof Error ? error.message : 'Failed to delete idea')
      setDeleting(false)
    }
  }

  async function handleSaveEdit() {
    if (!editTitle.trim()) { alert('Title is required'); return }
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
      alert(error instanceof Error ? error.message : 'Failed to update idea')
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setEditTitle(idea.title)
    setEditDescription(idea.description ?? '')
    setEditing(false)
  }

  return (
    <>
      <div className="card" style={{ display: 'flex', gap: '0.875rem', opacity: isResolved ? 0.75 : 1, transition: 'opacity 0.15s ease' }}>

        {/* Like column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', paddingTop: '0.125rem', minWidth: '2rem' }}>
          <button
            onClick={toggleLike}
            disabled={loading || deleting || editing || saving}
            title={liked ? 'Unlike' : 'Like this idea'}
            style={{
              width: '2rem',
              height: '2rem',
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
              {/* Title row with status badge + admin trigger */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <p style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.45, color: 'var(--ink)' }}>
                  {idea.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0, paddingTop: '0.1rem' }}>
                  <StatusBadge status={idea.status} />
                  {isAdmin && (
                    <button
                      onClick={() => setStatusModalOpen(true)}
                      title="Update status"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.1rem 0.2rem',
                        color: 'var(--ink-light)',
                        lineHeight: 1,
                        borderRadius: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {idea.description && (
                <p style={{ marginTop: '0.25rem', fontSize: '0.825rem', lineHeight: 1.65, color: 'var(--ink-light)' }}>
                  {idea.description}
                </p>
              )}

              <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--ink-light)' }}>
                <span style={{ fontWeight: 500 }}>{isOwn ? 'You' : authorName}</span>
                <span style={{ color: 'var(--dot-color)' }}>·</span>
                <span>{timeAgo(idea.created_at)}</span>

                {isOwn && (
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
                    <button
                      onClick={handleDelete}
                      disabled={deleting || saving}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: 'inherit', cursor: deleting ? 'default' : 'pointer', color: '#dc2626', fontWeight: 500, opacity: deleting ? 0.5 : 1 }}
                    >
                      {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </>
                )}

              </div>

              {/* Status note — shown for resolved statuses */}
              {isResolved && idea.status_note && (
                <div
                  style={{
                    marginTop: '0.625rem',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: idea.status === 'implemented'
                      ? 'rgba(16,185,129,0.06)'
                      : 'rgba(239,68,68,0.05)',
                    border: idea.status === 'implemented'
                      ? '1px solid rgba(16,185,129,0.15)'
                      : '1px solid rgba(239,68,68,0.12)',
                  }}
                >
                  <p style={{ fontSize: '0.775rem', lineHeight: 1.55, color: idea.status === 'implemented' ? '#065f46' : '#7f1d1d' }}>
                    {idea.status_note}
                  </p>
                </div>
              )}

              {/* Impact block — only when implemented + has impact data */}
              {idea.status === 'implemented' && idea.impact_summary && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    borderRadius: '0.5rem',
                    padding: '0.625rem 0.75rem',
                    background: 'rgba(16,185,129,0.04)',
                    border: '1px solid rgba(16,185,129,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#10b981', marginBottom: '0.1rem' }}>
                    🎯 Impact
                  </p>
                  <p style={{ fontSize: '0.775rem', lineHeight: 1.55, color: '#065f46' }}>
                    {idea.impact_summary}
                  </p>
                  {(idea.impact_type || idea.impact_link) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                      {idea.impact_type && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            background: 'rgba(16,185,129,0.12)',
                            color: '#065f46',
                            textTransform: 'capitalize',
                          }}
                        >
                          {idea.impact_type.replace('_', ' ')}
                        </span>
                      )}
                      {idea.impact_link && (
                        <a
                          href={idea.impact_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 500, textDecoration: 'none' }}
                        >
                          View details →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Comments — always visible, fetched on mount */}
              <IdeaComments ideaId={idea.id} currentUserId={currentUserId} />
            </>
          )}
        </div>
      </div>

      {/* Status modal — rendered outside card so it can use fixed positioning cleanly */}
      {statusModalOpen && (
        <StatusModal
          ideaId={idea.id}
          ideaTitle={idea.title}
          currentStatus={idea.status}
          onClose={() => setStatusModalOpen(false)}
        />
      )}
    </>
  )
}
