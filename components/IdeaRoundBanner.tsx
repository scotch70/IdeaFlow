/**
 * IdeaRoundBanner — shown to ALL users when a round is active or closed.
 *
 * Draft rounds are invisible to non-admins (handled in dashboard/page.tsx
 * by only rendering the banner when status !== 'draft').
 */

type RoundStatus = 'draft' | 'active' | 'closed'

interface IdeaRoundBannerProps {
  name: string | null
  status: RoundStatus
  /** Pass true if the end date has passed while status is still 'active' */
  autoExpired?: boolean
  endsAt?: string | null
}

export default function IdeaRoundBanner({
  name,
  status,
  autoExpired = false,
  endsAt,
}: IdeaRoundBannerProps) {
  const displayName = name?.trim() || 'IdeaFlow'
  const effectivelyClosed = status === 'closed' || autoExpired

  // ── Closed / expired ──────────────────────────────────────────────────────
  if (effectivelyClosed) {
    return (
      <div style={{
        marginBottom: '1.5rem',
        borderRadius: '1rem',
        padding: '0.875rem 1.25rem',
        background: 'rgba(239,68,68,0.04)',
        border: '1px solid rgba(239,68,68,0.15)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔒</span>
        <div>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7f1d1d', lineHeight: 1.3 }}>
            {displayName} is closed
          </p>
          <p style={{ fontSize: '0.775rem', color: '#b91c1c', marginTop: '0.125rem' }}>
            Idea submission has ended for this IdeaFlow.
          </p>
        </div>
      </div>
    )
  }

  // ── Active ────────────────────────────────────────────────────────────────
  const closingDate = endsAt ? new Date(endsAt) : null
  const daysLeft = closingDate
    ? Math.ceil((closingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div style={{
      marginBottom: '1.5rem',
      borderRadius: '1rem',
      padding: '0.875rem 1.25rem',
      background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(16,185,129,0.02))',
      border: '1px solid rgba(16,185,129,0.22)',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
    }}>
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>📢</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b', lineHeight: 1.3 }}>
          {displayName} is open
        </p>
        <p style={{ fontSize: '0.775rem', color: '#065f46', marginTop: '0.125rem' }}>
          {daysLeft !== null
            ? daysLeft > 0
              ? `Share your ideas — IdeaFlow closes in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`
              : 'IdeaFlow closes today.'
            : 'Share your ideas — IdeaFlow is now open.'}
        </p>
      </div>
      {/* Pulsing active indicator */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        fontSize: '0.68rem', fontWeight: 700,
        color: '#065f46',
        background: 'rgba(16,185,129,0.10)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '999px',
        padding: '0.2rem 0.6rem',
        flexShrink: 0,
      }}>
        <span className="pulse-dot" style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: '#10b981', display: 'inline-block', flexShrink: 0,
        }} />
        Active
      </span>
    </div>
  )
}
