import type { EffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'

interface RoundGateCardProps {
  status: Exclude<EffectiveRoundStatus, 'active'>
  isAdmin: boolean
}

export default function RoundGateCard({ status, isAdmin }: RoundGateCardProps) {
  const isClosed = status === 'closed'

  const icon        = isClosed ? '🔴' : '⏳'
  const headline    = isClosed ? 'IdeaFlow is closed'         : 'IdeaFlow has not started yet'
  const subCopy     = isClosed ? 'Idea submission is not available right now.'
                               : 'Your admin is setting up this IdeaFlow.'
  const memberCopy  = isClosed ? 'Your admin will reopen IdeaFlow when it\'s time to collect new ideas.'
                               : 'You\'ll be able to submit ideas once IdeaFlow opens.'

  const borderColor = isClosed ? 'rgba(239,68,68,0.12)'       : 'rgba(249,115,22,0.13)'
  const iconBg      = isClosed ? 'rgba(239,68,68,0.07)'       : 'rgba(249,115,22,0.07)'
  const iconBorder  = isClosed ? 'rgba(239,68,68,0.15)'       : 'rgba(249,115,22,0.15)'

  return (
    <div style={{
      background: '#ffffff',
      border: `1px solid ${borderColor}`,
      borderRadius: '1.25rem',
      padding: '2.5rem 2rem',
      textAlign: 'center',
      boxShadow: '0 2px 12px rgba(6,14,38,0.04)',
    }}>
      {/* Icon */}
      <div style={{
        width: '3rem', height: '3rem',
        borderRadius: '0.875rem',
        background: iconBg,
        border: `1px solid ${iconBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.25rem',
        fontSize: '1.2rem',
      }}>
        {icon}
      </div>

      {/* Headline */}
      <h2 style={{
        fontSize: '1.05rem', fontWeight: 800,
        color: '#0d1f35', letterSpacing: '-0.02em',
        marginBottom: '0.4rem',
      }}>
        {headline}
      </h2>

      {/* Sub-copy */}
      <p style={{
        fontSize: '0.875rem', color: '#9ab0c8',
        lineHeight: 1.6, maxWidth: '24rem',
        margin: '0 auto',
      }}>
        {subCopy}
      </p>

      {/* Admin CTA or member message */}
      {isAdmin ? (
        <div style={{ marginTop: '1.5rem' }}>
          <a
            href="/dashboard/idea-flow"
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem', textDecoration: 'none' }}
          >
            Open IdeaFlow →
          </a>
        </div>
      ) : (
        <p style={{
          fontSize: '0.825rem', color: '#b0c4d8',
          lineHeight: 1.6, maxWidth: '24rem',
          margin: '0.75rem auto 0',
        }}>
          {memberCopy}
        </p>
      )}
    </div>
  )
}
