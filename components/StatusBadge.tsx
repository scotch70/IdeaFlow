export const IDEA_STATUSES = [
  'open',
  'planned',
] as const

export type IdeaStatus = (typeof IDEA_STATUSES)[number]

interface StatusConfig {
  label: string
  bg: string
  color: string
}

export const STATUS_CONFIG: Record<IdeaStatus, StatusConfig> = {
  open:    { label: 'Open',    bg: 'rgba(0,0,0,0.05)',      color: '#6b7280' },
  planned: { label: 'Planned', bg: 'rgba(99,102,241,0.09)', color: '#4338ca' },
}

export function isValidStatus(s: string): s is IdeaStatus {
  return IDEA_STATUSES.includes(s as IdeaStatus)
}

export default function StatusBadge({ status }: { status: string }) {
  const cfg = isValidStatus(status) ? STATUS_CONFIG[status] : STATUS_CONFIG.open
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '0.375rem',
        padding: '0.2rem 0.5rem',
        fontSize: '0.68rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      {cfg.label}
    </span>
  )
}
