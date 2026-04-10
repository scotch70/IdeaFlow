import Link from 'next/link'
import type { Idea } from '@/types/database'

interface ManagerQueueProps {
  ideas: Idea[]
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function isOlderThan7Days(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() > SEVEN_DAYS_MS
}

export default function ManagerQueue({ ideas }: ManagerQueueProps) {
  const openIdeas        = ideas.filter(i => (i.status ?? 'open') === 'open')
  const underReviewIdeas = ideas.filter(i => (i.status ?? 'open') === 'under_review')

  const openStale        = openIdeas.filter(i => isOlderThan7Days(i.created_at))
  const underReviewStale = underReviewIdeas.filter(i => isOlderThan7Days(i.created_at))
  const totalOpen        = openIdeas.length

  // If there's nothing to act on, render nothing — don't clutter the sidebar
  if (totalOpen === 0 && underReviewIdeas.length === 0) return null

  const hasUrgent = openStale.length > 0

  return (
    <div
      style={{
        borderRadius: '0.75rem',
        border: hasUrgent
          ? '1px solid rgba(220,38,38,0.18)'
          : '1px solid var(--border)',
        background: hasUrgent
          ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(254,242,242,0.5) 100%)'
          : '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.875rem 1rem 0.75rem',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {/* Pulsing dot — only when there are stale open ideas */}
        {hasUrgent && (
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#ef4444',
              flexShrink: 0,
              boxShadow: '0 0 0 2px rgba(239,68,68,0.20)',
              display: 'inline-block',
            }}
          />
        )}
        <p
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: hasUrgent ? '#b91c1c' : '#9ab0c8',
          }}
        >
          Needs attention
        </p>
      </div>

      {/* Rows */}
      <div style={{ padding: '0.375rem 0' }}>

        {/* Open > 7 days */}
        <QueueRow
          label="Open · over 7 days"
          count={openStale.length}
          urgency="high"
        />

        {/* Under review > 7 days */}
        <QueueRow
          label="In review · over 7 days"
          count={underReviewStale.length}
          urgency="medium"
        />

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '0.375rem 1rem' }} />

        {/* All open */}
        <QueueRow
          label="All open ideas"
          count={totalOpen}
          urgency="neutral"
        />
      </div>

      {/* Footer nudge + review link */}
      <div
        style={{
          padding: '0.625rem 1rem',
          borderTop: hasUrgent ? '1px solid rgba(220,38,38,0.10)' : '1px solid rgba(0,0,0,0.05)',
          background: hasUrgent ? 'rgba(254,242,242,0.6)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        {hasUrgent ? (
          <p style={{ fontSize: '0.72rem', color: '#b91c1c', lineHeight: 1.5, flex: 1 }}>
            Ideas without a response lose team trust.
          </p>
        ) : (
          <span />
        )}
        <Link
          href="/dashboard/review"
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: hasUrgent ? '#b91c1c' : '#5a7fa8',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Review inbox →
        </Link>
      </div>
    </div>
  )
}

// ─── Row sub-component ────────────────────────────────────────────────────────

interface QueueRowProps {
  label: string
  count: number
  urgency: 'high' | 'medium' | 'neutral'
}

function QueueRow({ label, count, urgency }: QueueRowProps) {
  const dotColor =
    urgency === 'high'    ? '#ef4444' :
    urgency === 'medium'  ? '#f59e0b' :
    'rgba(0,0,0,0.20)'

  const countColor =
    urgency === 'high'   ? '#dc2626' :
    urgency === 'medium' ? '#b45309' :
    '#5a7fa8'

  const countWeight = urgency === 'high' ? 800 : urgency === 'medium' ? 700 : 600
  const countSize   = urgency === 'high' ? '1.375rem' : urgency === 'medium' ? '1.125rem' : '1rem'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.45rem 1rem',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '0.775rem',
            color: urgency === 'neutral' ? '#9ab0c8' : '#4a5568',
            fontWeight: urgency === 'neutral' ? 400 : 500,
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: countSize,
          fontWeight: countWeight,
          color: countColor,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {count}
      </span>
    </div>
  )
}
