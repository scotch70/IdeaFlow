'use client'

// ─────────────────────────────────────────────────────────────────────────────
// WorkspaceMetrics — compact participation strip shown at the top of the
// dashboard when there is at least one idea in the active flow.
//
// Surfaces the most actionable numbers for managers at a glance:
//   • Team participation rate (% of members who submitted an idea)
//   • Ideas posted this week
//   • Total ideas + average engagement (likes per idea)
// ─────────────────────────────────────────────────────────────────────────────

interface WorkspaceMetricsProps {
  participationRate: number   // 0–100
  ideasThisWeek: number
  totalIdeas: number
  memberCount: number
  activeMembers: number
  avgLikesPerIdea: number
}

function MetricPill({
  label,
  value,
  sub,
  accentColor,
}: {
  label: string
  value: string
  sub?: string
  accentColor: string
}) {
  return (
    <div
      className="metric-pill-responsive"
      style={{
        flex: '1 1 0',
        minWidth: '130px',
        padding: '1rem 1.125rem',
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: '0.875rem',
        borderTop: `2.5px solid ${accentColor}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.15s ease',
      }}
    >
      <p
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#0d1f35',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          marginBottom: '0.25rem',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: '0.725rem', fontWeight: 600, color: '#5d667a', lineHeight: 1.3 }}>
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: '0.65rem', color: '#b0bac8', marginTop: '0.15rem', lineHeight: 1.3 }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export default function WorkspaceMetrics({
  participationRate,
  ideasThisWeek,
  totalIdeas,
  memberCount,
  activeMembers,
  avgLikesPerIdea,
}: WorkspaceMetricsProps) {
  // Colour the participation accent based on health
  const participationAccent =
    participationRate >= 70
      ? '#10b981'
      : participationRate >= 40
        ? '#f97316'
        : '#ef4444'

  const weekSub =
    ideasThisWeek === 0
      ? 'None yet this week'
      : ideasThisWeek === 1
        ? '1 new idea posted'
        : `${ideasThisWeek} new ideas posted`

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
      }}
    >
      <MetricPill
        label="Team participation"
        value={`${participationRate}%`}
        sub={`${activeMembers} of ${memberCount} member${memberCount !== 1 ? 's' : ''} contributed`}
        accentColor={participationAccent}
      />
      <MetricPill
        label="Ideas this week"
        value={String(ideasThisWeek)}
        sub={weekSub}
        accentColor="rgba(249,115,22,0.6)"
      />
      <MetricPill
        label="Total ideas"
        value={String(totalIdeas)}
        sub={`${avgLikesPerIdea} avg likes per idea`}
        accentColor="rgba(26,107,191,0.45)"
      />
    </div>
  )
}
