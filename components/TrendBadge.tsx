// ─────────────────────────────────────────────────────────────────────────────
// TrendBadge — tiny inline badge showing directional trend.
// Usage: <TrendBadge value={18} /> → "+18% ↑" (green)
//        <TrendBadge value={-5} />  → "↓ 5%"  (red / orange)
//        <TrendBadge value={0} />   → "—"      (muted)
// ─────────────────────────────────────────────────────────────────────────────

interface TrendBadgeProps {
  /** Delta percentage. Positive = up, negative = down, 0 = flat. */
  value: number
  /** Show the % symbol (default true) */
  showPercent?: boolean
  /** Override font size (default '0.72rem') */
  fontSize?: string
}

export default function TrendBadge({
  value,
  showPercent = true,
  fontSize = '0.72rem',
}: TrendBadgeProps) {
  if (value === 0) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize,
          fontWeight: 600,
          color: '#b0bac8',
          letterSpacing: '0.01em',
        }}
      >
        —
      </span>
    )
  }

  const isUp = value > 0
  const abs  = Math.abs(value)

  const color  = isUp ? '#059669' : '#f97316'
  const bg     = isUp ? 'rgba(5,150,105,0.08)' : 'rgba(249,115,22,0.09)'
  const arrow  = isUp ? '↑' : '↓'
  const sign   = isUp ? '+' : '−'

  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            '0.15em',
        fontSize,
        fontWeight:     700,
        color,
        background:     bg,
        borderRadius:   '999px',
        padding:        '1px 6px',
        letterSpacing:  '0.01em',
        whiteSpace:     'nowrap',
      }}
    >
      {arrow} {sign}{abs}{showPercent ? '%' : ''}
    </span>
  )
}
