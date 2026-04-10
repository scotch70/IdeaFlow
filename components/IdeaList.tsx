'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import IdeaCard from './IdeaCard'
import type { Idea } from '@/types/database'

type FilterKey = 'all' | 'open' | 'under_review' | 'planned' | 'in_progress' | 'implemented' | 'declined'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',          label: 'All'         },
  { key: 'open',         label: 'Open'        },
  { key: 'under_review', label: 'In Review'   },
  { key: 'planned',      label: 'Planned'     },
  { key: 'in_progress',  label: 'In Progress' },
  { key: 'implemented',  label: 'Implemented' },
  { key: 'declined',     label: 'Declined'    },
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
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

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
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [companyId, router])

  const filtered = activeFilter === 'all'
    ? ideas
    : ideas.filter(idea => (idea.status ?? 'open') === activeFilter)

  // Only show tabs that have at least one idea (plus All), to avoid clutter
  const countsPerFilter = FILTERS.reduce<Record<FilterKey, number>>((acc, f) => {
    acc[f.key] = f.key === 'all'
      ? ideas.length
      : ideas.filter(idea => (idea.status ?? 'open') === f.key).length
    return acc
  }, {} as Record<FilterKey, number>)

  const visibleFilters = FILTERS.filter(
    f => f.key === 'all' || countsPerFilter[f.key] > 0
  )

  return (
    <div className="space-y-3">
      {/* Header + filter tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-stone-400 uppercase tracking-wider">
            Ideas · sorted by likes
          </h2>
          <span className="text-xs text-stone-400">
            {filtered.length}{activeFilter !== 'all' ? ` / ${ideas.length}` : ''} total
          </span>
        </div>

        {/* Filter tabs — only rendered when there are ideas */}
        {ideas.length > 0 && visibleFilters.length > 1 && (
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
                    color: active ? '#1a6bbf' : '#9ab0c8',
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

      {ideas.length === 0 ? (
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
      ) : filtered.length === 0 ? (
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
        filtered.map(idea => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        ))
      )}
    </div>
  )
}
