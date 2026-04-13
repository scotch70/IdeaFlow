'use client'

import { useState } from 'react'
import type { Idea } from '@/types/database'
import StatusBadge from './StatusBadge'
import StatusModal from './StatusModal'
import InnerPageHeader from './InnerPageHeader'
import PageContainer from './PageContainer'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isStale(idea: Idea): boolean {
  // Only open and under_review ideas become "stale" — planned/in_progress
  // are actively being worked on so we don't flag them.
  return (
    (idea.status === 'open' || idea.status === 'under_review') &&
    Date.now() - new Date(idea.created_at).getTime() > SEVEN_DAYS_MS
  )
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + '…'
}

// ─── Root component ───────────────────────────────────────────────────────────

interface ReviewClientProps {
  ideas: Idea[]
}

export default function ReviewClient({ ideas }: ReviewClientProps) {
  const [modalIdea, setModalIdea] = useState<Idea | null>(null)

  const staleIdeas   = ideas.filter(isStale)
  const hasStale     = staleIdeas.length > 0
  const totalActive  = ideas.length

  const headerRight = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      {hasStale && (
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#b91c1c',
          background: 'rgba(220,38,38,0.07)',
          border: '1px solid rgba(220,38,38,0.18)',
          borderRadius: '999px',
          padding: '0.25rem 0.7rem',
        }}>
          {staleIdeas.length} need{staleIdeas.length === 1 ? 's' : ''} attention
        </span>
      )}
      <span style={{ fontSize: '0.8rem', color: '#9ab0c8', fontWeight: 500 }}>
        {totalActive} active idea{totalActive !== 1 ? 's' : ''}
      </span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <InnerPageHeader
        title="Review inbox"
        backHref="/dashboard"
        backLabel="Dashboard"
        right={headerRight}
      />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main>
      <PageContainer style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>

        {/* All caught up */}
        {totalActive === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            borderRadius: '1rem',
            border: '1px dashed rgba(26,107,191,0.15)',
            background: '#ffffff',
          }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>✓</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.375rem' }}>
              You&apos;re all caught up
            </p>
            <p style={{ fontSize: '0.825rem', color: '#9ab0c8', lineHeight: 1.6, maxWidth: '22rem', margin: '0 auto' }}>
              No ideas need attention right now.
            </p>
          </div>
        )}

        {/* ── Section 1: Needs attention ─────────────────────────────────── */}
        {hasStale && (
          <section style={{ marginBottom: '2.5rem' }}>
            <SectionHeader label="Needs attention" count={staleIdeas.length} urgent />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {staleIdeas.map((idea) => (
                <IdeaReviewCard
                  key={idea.id}
                  idea={idea}
                  stale
                  onStatusClick={() => setModalIdea(idea)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Section 2: All active ideas ────────────────────────────────── */}
        {totalActive > 0 && (
          <section>
            <SectionHeader label="All active ideas" count={totalActive} sub="oldest first" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ideas.map((idea) => (
                <IdeaReviewCard
                  key={idea.id}
                  idea={idea}
                  stale={isStale(idea)}
                  onStatusClick={() => setModalIdea(idea)}
                />
              ))}
            </div>
          </section>
        )}
      </PageContainer>
      </main>

      {/* ── Status modal ─────────────────────────────────────────────────── */}
      {modalIdea && (
        <StatusModal
          ideaId={modalIdea.id}
          ideaTitle={modalIdea.title}
          currentStatus={modalIdea.status}
          onClose={() => setModalIdea(null)}
        />
      )}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  label,
  count,
  urgent,
  sub,
}: {
  label: string
  count: number
  urgent?: boolean
  sub?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
      {/* Pulsing dot for urgent sections */}
      {urgent && (
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#ef4444',
          flexShrink: 0,
          boxShadow: '0 0 0 2px rgba(239,68,68,0.20)',
        }} />
      )}
      <h2 style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: urgent ? '#b91c1c' : '#9ab0c8',
      }}>
        {label}
      </h2>
      <span style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        color: urgent ? '#dc2626' : '#9ab0c8',
        background: urgent ? 'rgba(220,38,38,0.07)' : 'rgba(0,0,0,0.05)',
        borderRadius: '999px',
        padding: '0.1rem 0.45rem',
      }}>
        {count}
      </span>
      {sub && (
        <span style={{ fontSize: '0.69rem', color: '#c5d5e8', fontWeight: 400 }}>
          · {sub}
        </span>
      )}
    </div>
  )
}

// ─── Individual idea card ─────────────────────────────────────────────────────

function IdeaReviewCard({
  idea,
  stale,
  onStatusClick,
}: {
  idea: Idea
  stale: boolean
  onStatusClick: () => void
}) {
  const authorName = idea.profiles?.full_name ?? 'Anonymous'
  const days       = daysSince(idea.created_at)

  return (
    <div
      style={{
        background: '#ffffff',
        border: stale ? '1px solid rgba(245,158,11,0.25)' : '1px solid var(--tint-border)',
        borderLeft: stale ? '3px solid #f59e0b' : '3px solid transparent',
        borderRadius: '0.75rem',
        padding: '0.875rem 1rem',
        display: 'flex',
        gap: '0.875rem',
        alignItems: 'flex-start',
      }}
    >
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Title */}
        <p style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#0d1f35',
          lineHeight: 1.4,
          marginBottom: '0.3rem',
        }}>
          {idea.title}
        </p>

        {/* Meta row: author · badge · date · stale chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          flexWrap: 'wrap',
          fontSize: '0.72rem',
          color: '#9ab0c8',
          marginBottom: idea.status_note ? '0.5rem' : 0,
        }}>
          <span style={{ fontWeight: 500, color: '#5a7fa8' }}>{authorName}</span>
          <span style={{ color: 'var(--dot-color)' }}>·</span>
          <StatusBadge status={idea.status} />
          <span style={{ color: 'var(--dot-color)' }}>·</span>
          <span>{formatDate(idea.created_at)}</span>
          {stale && (
            <>
              <span style={{ color: 'var(--dot-color)' }}>·</span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#d97706',
                background: 'rgba(245,158,11,0.09)',
                border: '1px solid rgba(245,158,11,0.22)',
                borderRadius: '999px',
                padding: '0.1rem 0.45rem',
              }}>
                {days}d — no update
              </span>
            </>
          )}
        </div>

        {/* Status note (admin context, shown italicised) */}
        {idea.status_note && (
          <p style={{
            fontSize: '0.775rem',
            lineHeight: 1.55,
            color: '#6b7280',
            fontStyle: 'italic',
          }}>
            &ldquo;{truncate(idea.status_note, 120)}&rdquo;
          </p>
        )}
      </div>

      {/* Status action button */}
      <button
        onClick={onStatusClick}
        title="Update status"
        style={{
          background: 'none',
          border: '1px solid rgba(0,0,0,0.09)',
          borderRadius: '0.4rem',
          cursor: 'pointer',
          padding: '0.3rem 0.425rem',
          color: '#9ab0c8',
          lineHeight: 1,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
        </svg>
      </button>
    </div>
  )
}
