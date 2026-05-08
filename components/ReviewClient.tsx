'use client'

import { useState } from 'react'
import type { Idea } from '@/types/database'
import StatusBadge from './StatusBadge'
import PageContainer from './PageContainer'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ageLabel(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function isStale(idea: Idea): boolean {
  const days = Math.floor((Date.now() - new Date(idea.created_at).getTime()) / 86_400_000)
  return idea.status === 'open' && days >= 7
}

function sortIdeas(ideas: Idea[]): Idea[] {
  return [...ideas].sort((a, b) => {
    // Stale open ideas first, then by age (oldest first)
    const aStale = isStale(a) ? 0 : 1
    const bStale = isStale(b) ? 0 : 1
    if (aStale !== bStale) return aStale - bStale
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function ReviewClient({ ideas: initialIdeas }: { ideas: Idea[] }) {
  const [ideaMap, setIdeaMap] = useState<Map<string, Idea>>(
    () => new Map(initialIdeas.map((i) => [i.id, i])),
  )
  const [pending, setPending] = useState<Set<string>>(new Set())
  const [errors,  setErrors]  = useState<Map<string, string>>(new Map())

  const sorted = sortIdeas(Array.from(ideaMap.values()))

  async function markPlanned(idea: Idea) {
    if (pending.has(idea.id)) return

    // Optimistic update
    setIdeaMap((m) => new Map(m).set(idea.id, { ...idea, status: 'planned' }))
    setPending((p) => new Set(p).add(idea.id))
    setErrors((e) => { const n = new Map(e); n.delete(idea.id); return n })

    try {
      const res = await fetch('/api/ideas/status', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ideaId: idea.id, status: 'planned' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update')
      setIdeaMap((m) => new Map(m).set(idea.id, { ...idea, ...data }))
    } catch (err) {
      setIdeaMap((m) => new Map(m).set(idea.id, idea))
      setErrors((e) => new Map(e).set(idea.id, err instanceof Error ? err.message : 'Failed'))
    } finally {
      setPending((p) => { const n = new Set(p); n.delete(idea.id); return n })
    }
  }

  return (
    <div style={{ background: 'var(--page-bg)', minHeight: '100%' }}>

      {/* ── Sticky page header ── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(26,107,191,0.09)', position: 'sticky', top: 0, zIndex: 9 }}>
        <PageContainer style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                Management
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Idea inbox
              </h1>
            </div>
            {sorted.length > 0 && (
              <span style={{ fontSize: '0.825rem', color: '#9ab0c8', fontWeight: 500 }}>
                {sorted.length} idea{sorted.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </PageContainer>
      </div>

      <main>
        <PageContainer style={{ paddingTop: '1.75rem', paddingBottom: '3rem' }}>

          {sorted.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '1rem', border: '1px dashed rgba(26,107,191,0.15)', background: '#ffffff' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#059669' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.375rem' }}>
                Nothing needs attention right now.
              </p>
              <p style={{ fontSize: '0.825rem', color: '#9ab0c8', maxWidth: '22rem', margin: '0 auto', lineHeight: 1.6 }}>
                All ideas are handled. Check back when new ones come in.
              </p>
            </div>
          )}

          {sorted.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {sorted.map((idea) => (
                <IdeaRow
                  key={idea.id}
                  idea={idea}
                  isPending={pending.has(idea.id)}
                  error={errors.get(idea.id)}
                  onPlan={() => markPlanned(idea)}
                />
              ))}
            </div>
          )}

        </PageContainer>
      </main>
    </div>
  )
}

// ─── Idea row ─────────────────────────────────────────────────────────────────

interface IdeaRowProps {
  idea:      Idea
  isPending: boolean
  error:     string | undefined
  onPlan:    () => void
}

function IdeaRow({ idea, isPending, error, onPlan }: IdeaRowProps) {
  const stale      = isStale(idea)
  const isOpen     = !idea.status || idea.status === 'open'
  const isPlanned  = idea.status === 'planned'
  const authorName = idea.profiles?.full_name ?? 'Anonymous'
  const likes      = idea.likes_count ?? 0

  return (
    <div style={{
      background: '#ffffff',
      border: stale ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(26,107,191,0.09)',
      borderLeft: stale ? '3px solid #f59e0b' : '3px solid rgba(26,107,191,0.18)',
      borderRadius: '0.875rem',
      padding: '1rem 1.125rem 0.875rem',
      opacity: isPending ? 0.65 : 1,
      transition: 'opacity 0.15s',
    }}>
      {/* Title + status badge */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
        <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#0d1f35', lineHeight: 1.4 }}>
          {idea.title}
        </p>
        <StatusBadge status={idea.status} />
      </div>

      {idea.description && (
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.55 }}>
          {idea.description}
        </p>
      )}

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.72rem', color: '#9ab0c8', marginBottom: '0.875rem' }}>
        <span style={{ fontWeight: 600, color: '#5a7fa8' }}>{authorName}</span>
        <Dot />
        <span>{ageLabel(idea.created_at)}</span>
        {likes > 0 && (
          <>
            <Dot />
            <span>{likes} like{likes !== 1 ? 's' : ''}</span>
          </>
        )}
        {stale && (
          <>
            <Dot />
            <span style={{ fontWeight: 600, color: '#d97706', background: 'rgba(245,158,11,0.09)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '999px', padding: '0.1rem 0.45rem' }}>
              Waiting {Math.floor((Date.now() - new Date(idea.created_at).getTime()) / 86_400_000)}d
            </span>
          </>
        )}
      </div>

      {error && (
        <p style={{ fontSize: '0.72rem', color: '#dc2626', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '0.375rem', padding: '0.3rem 0.6rem', marginBottom: '0.75rem' }}>
          {error}
        </p>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(26,107,191,0.07)' }}>
        {isOpen && (
          <button
            onClick={onPlan}
            disabled={isPending}
            style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4338ca', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '0.4rem', padding: '0.3rem 0.7rem', cursor: isPending ? 'default' : 'pointer', opacity: isPending ? 0.5 : 1 }}
          >
            Plan
          </button>
        )}
        {isPlanned && (
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4338ca', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '0.4rem', padding: '0.3rem 0.7rem' }}>
            Planned ✓
          </span>
        )}
      </div>
    </div>
  )
}

function Dot() {
  return <span style={{ color: 'rgba(154,176,200,0.45)', fontSize: '0.55rem' }}>●</span>
}
