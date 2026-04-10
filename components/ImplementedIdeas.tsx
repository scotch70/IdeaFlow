import type { Idea } from '@/types/database'

const MAX_IDEAS = 5

const IMPACT_TYPE_LABELS: Record<string, string> = {
  revenue:      'Revenue',
  cost_saving:  'Cost saving',
  productivity: 'Productivity',
  culture:      'Culture',
  other:        'Other',
}

function sortKey(idea: Idea): number {
  const dateStr = idea.status_changed_at ?? idea.created_at
  return new Date(dateStr).getTime()
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + '…'
}

interface ImplementedIdeasProps {
  ideas: Idea[]
}

export default function ImplementedIdeas({ ideas }: ImplementedIdeasProps) {
  const implemented = ideas
    .filter((idea) => idea.status === 'implemented')
    .sort((a, b) => sortKey(b) - sortKey(a))
    .slice(0, MAX_IDEAS)

  return (
    <section>
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.625rem',
          marginBottom: '1rem',
        }}
      >
        <h2
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#0d1f35',
            letterSpacing: '-0.01em',
          }}
        >
          Implemented ideas
        </h2>
        {implemented.length > 0 && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#10b981',
              background: 'rgba(16,185,129,0.10)',
              border: '1px solid rgba(16,185,129,0.18)',
              borderRadius: '999px',
              padding: '0.1rem 0.5rem',
            }}
          >
            {implemented.length}
          </span>
        )}
      </div>

      {/* Empty state */}
      {implemented.length === 0 && (
        <div
          style={{
            borderRadius: '0.875rem',
            border: '1px dashed rgba(26,107,191,0.15)',
            padding: '1.75rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.825rem',
              color: '#9ab0c8',
              lineHeight: 1.6,
              maxWidth: '28rem',
              margin: '0 auto',
            }}
          >
            No ideas implemented yet — start reviewing and approving ideas to
            create impact.
          </p>
        </div>
      )}

      {/* Idea cards */}
      {implemented.length > 0 && (
        <div
          style={{
            display: 'grid',
            gap: '0.625rem',
            // 1 column on mobile, up to 2–3 on wide screens
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 22rem), 1fr))',
          }}
        >
          {implemented.map((idea) => (
            <ImpactCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Individual card ──────────────────────────────────────────────────────────

function ImpactCard({ idea }: { idea: Idea }) {
  const hasImpact = Boolean(idea.impact_summary)

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid rgba(16,185,129,0.18)',
        borderRadius: '0.875rem',
        padding: '0.875rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        // Subtle left accent to signal "done"
        borderLeft: '3px solid #10b981',
      }}
    >
      {/* Top row: title + type pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <p
          style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            color: '#0d1f35',
            lineHeight: 1.4,
            flex: 1,
          }}
        >
          {idea.title}
        </p>
        {idea.impact_type && IMPACT_TYPE_LABELS[idea.impact_type] && (
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: '#065f46',
              background: 'rgba(16,185,129,0.10)',
              border: '1px solid rgba(16,185,129,0.18)',
              borderRadius: '999px',
              padding: '0.15rem 0.5rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              marginTop: '0.1rem',
            }}
          >
            {IMPACT_TYPE_LABELS[idea.impact_type]}
          </span>
        )}
      </div>

      {/* Status note — what was shipped */}
      {idea.status_note && (
        <p
          style={{
            fontSize: '0.775rem',
            lineHeight: 1.55,
            color: '#374151',
          }}
        >
          {truncate(idea.status_note, 120)}
        </p>
      )}

      {/* Impact summary — the outcome */}
      {hasImpact && (
        <div
          style={{
            background: 'rgba(16,185,129,0.05)',
            border: '1px solid rgba(16,185,129,0.14)',
            borderRadius: '0.5rem',
            padding: '0.4rem 0.625rem',
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#10b981',
              marginBottom: '0.2rem',
            }}
          >
            Impact
          </p>
          <p
            style={{
              fontSize: '0.775rem',
              lineHeight: 1.5,
              color: '#065f46',
            }}
          >
            {truncate(idea.impact_summary!, 160)}
          </p>
        </div>
      )}

      {/* Footer: view outcome link */}
      {idea.impact_link && (
        <div style={{ marginTop: '0.125rem' }}>
          <a
            href={idea.impact_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.72rem',
              fontWeight: 500,
              color: '#059669',
              textDecoration: 'none',
            }}
          >
            View outcome →
          </a>
        </div>
      )}
    </div>
  )
}
