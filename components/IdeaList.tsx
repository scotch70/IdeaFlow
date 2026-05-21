'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import IdeaCard from './IdeaCard'
import type { Idea } from '@/types/database'

type FilterKey = 'all' | 'open' | 'planned'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: 'All'     },
  { key: 'open',    label: 'Open'    },
  { key: 'planned', label: 'Planned' },
]

type SortKey = 'most-liked' | 'latest' | 'oldest' | 'most-comments'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'most-liked',    label: 'Most liked'    },
  { key: 'latest',        label: 'Newest first'  },
  { key: 'oldest',        label: 'Oldest first'  },
  { key: 'most-comments', label: 'Most comments' },
]

interface IdeaListProps {
  ideas: Idea[]
  currentUserId: string
  companyId: string
  isAdmin: boolean
}

export default function IdeaList({
  ideas,
  currentUserId,
  companyId,
  isAdmin,
}: IdeaListProps) {
  const router       = useRouter()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [activeSort,   setActiveSort]   = useState<SortKey>('most-liked')

  /**
   * Local copy of ideas so like-count updates are instant and don't depend on
   * a server round-trip. Synced with the prop whenever a background router.refresh()
   * returns fresh server data (e.g. when another user posts or an admin changes status).
   */
  const [localIdeas, setLocalIdeas] = useState<Idea[]>(ideas)

  // Keep localIdeas in sync when server data arrives (background refresh).
  useEffect(() => {
    setLocalIdeas(ideas)
  }, [ideas])

  /**
   * Suppress the next realtime-triggered router.refresh() when the change was
   * caused by the current user's own like (the DB trigger fires back at us).
   * We track this with a short-lived timestamp.
   */
  const selfLikeTs = useRef(0)

  /**
   * Called by IdeaCard after a successful like/unlike API call.
   * Updates localIdeas immediately so the list reflects the correct count
   * without waiting for a server round-trip.
   */
  function handleLikeChange(ideaId: string, liked: boolean, count: number) {
    selfLikeTs.current = Date.now()
    setLocalIdeas(prev =>
      prev.map(i => i.id === ideaId ? { ...i, liked_by_user: liked, likes_count: count } : i)
    )
  }

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`ideas-realtime-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ideas',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          // Skip the refresh if it was triggered by the current user's own like
          // (the likes_count trigger fires an ideas UPDATE back to us within ~500 ms).
          // For all other changes (new idea, status update, delete) we do refresh.
          const msSinceSelfLike = Date.now() - selfLikeTs.current
          if (msSinceSelfLike < 1500) return

          // Use startTransition so this background refresh doesn't block
          // any in-progress interactions (typing, filtering, etc.).
          startTransition(() => router.refresh())
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [companyId, router])

  const filtered = activeFilter === 'all'
    ? localIdeas
    : localIdeas.filter(idea => (idea.status ?? 'open') === activeFilter)

  /**
   * Apply the current sort to a *copy* so the prop reference isn't mutated
   * (would break the realtime sync useEffect's reference comparison).
   *
   * 'most-comments' falls back to 0 when the parent hasn't hydrated
   * comments_count (e.g. older call sites that haven't been updated to
   * select comments(count) yet) — sort is stable in that case.
   */
  const sorted = (() => {
    const list = [...filtered]
    switch (activeSort) {
      case 'most-liked':
        return list.sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0)
                              || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'latest':
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'oldest':
        return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case 'most-comments':
        return list.sort((a, b) => (b.comments_count ?? 0) - (a.comments_count ?? 0)
                              || (b.likes_count ?? 0) - (a.likes_count ?? 0))
    }
  })()

  // Only show tabs that have at least one idea (plus All), to avoid clutter
  const countsPerFilter = FILTERS.reduce<Record<FilterKey, number>>((acc, f) => {
    acc[f.key] = f.key === 'all'
      ? localIdeas.length
      : localIdeas.filter(idea => (idea.status ?? 'open') === f.key).length
    return acc
  }, {} as Record<FilterKey, number>)

  const visibleFilters = FILTERS.filter(
    f => f.key === 'all' || countsPerFilter[f.key] > 0
  )

  return (
    <div className="space-y-3">
      {/* Header + filter tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>

          {/* Count + sort selector inline. The dropdown replaces the static
              "most liked" label so admins can re-sort with a single click. */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '0.775rem', fontWeight: 500, color: 'var(--ink-light)', margin: 0, letterSpacing: '-0.01em' }}>
              {localIdeas.length === 1 ? '1 idea' : `${localIdeas.length} ideas`}
            </h2>
            <span aria-hidden style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>·</span>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <select
                aria-label="Sort ideas"
                value={activeSort}
                onChange={e => setActiveSort(e.target.value as SortKey)}
                disabled={localIdeas.length === 0}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  background: 'transparent',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '0.4rem',
                  padding: '0.18rem 1.35rem 0.18rem 0.55rem',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#0d1f35',
                  cursor: localIdeas.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: localIdeas.length === 0 ? 0.55 : 1,
                  lineHeight: 1.4,
                }}
              >
                {SORTS.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <span aria-hidden style={{
                position: 'absolute',
                right: '0.4rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '0.55rem',
                pointerEvents: 'none',
              }}>▾</span>
            </div>
          </div>

          <span style={{ fontSize: '0.72rem', color: '#b8c0ce', fontVariantNumeric: 'tabular-nums' }}>
            {filtered.length}{activeFilter !== 'all' ? ` / ${localIdeas.length}` : ''} total
          </span>
        </div>

        {/* Filter tabs — only rendered when there are ideas */}
        {localIdeas.length > 0 && visibleFilters.length > 1 && (
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {visibleFilters.map(f => {
              const active = activeFilter === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    border: active
                      ? '1px solid rgba(26,107,191,0.25)'
                      : '1px solid rgba(0,0,0,0.08)',
                    background: active ? 'rgba(26,107,191,0.07)' : 'transparent',
                    color: active ? '#1a6bbf' : '#b0bac8',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    lineHeight: 1.4,
                  }}
                >
                  {f.label}
                  {f.key !== 'all' && (
                    <span style={{ marginLeft: '0.3rem', opacity: 0.65 }}>
                      {countsPerFilter[f.key]}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {localIdeas.length === 0 ? (
        <div style={{
          border: '1.5px dashed rgba(26,107,191,0.20)',
          borderRadius: '1rem',
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'rgba(248,250,255,0.6)',
        }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#f97316' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.375rem' }}>No ideas yet</p>
          <p style={{ fontSize: '0.825rem', color: '#5a7fa8', maxWidth: '22rem', margin: '0 auto' }}>
            Be the first to post. The best teams build on each other&apos;s thinking.
          </p>
        </div>
      ) : sorted.length === 0 ? (
        <div style={{
          border: '1.5px dashed rgba(26,107,191,0.15)',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
          background: 'rgba(248,250,255,0.4)',
        }}>
          <p style={{ fontSize: '0.825rem', color: '#9ab0c8' }}>
            No ideas with this status yet.
          </p>
        </div>
      ) : (
        sorted.map(idea => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onLikeChange={handleLikeChange}
          />
        ))
      )}
    </div>
  )
}
