'use client'

/**
 * UpgradePlans — the Standard + Pro plan cards.
 *
 * Pro is positioned around Brainstorm Sessions — the team-focused, guided
 * brainstorming workspace. Standard remains the "professional team
 * collaboration" tier for admins who don't need Sessions but want full
 * analytics and member management.
 *
 * Pro card carries:
 *   • A "Most popular for teams" badge
 *   • A canvas thumbnail preview (small SVG mock of a session) so the value
 *     prop is visual, not just bullets
 *   • Feature bullets that lead with Brainstorm Sessions, not AI
 *   • AI helpers are listed but explicitly secondary ("optional")
 */

interface UpgradePlansProps {
  /** Compact mode: two inline buttons instead of full cards */
  compact?: boolean
  /** Current plan slug — hides upgrade button for plans already held */
  currentPlan?: string
}

const STANDARD_FEATURES = [
  'Up to 50 members',
  'Unlimited IdeaFlows',
  'Full analytics dashboard',
  'Member management & roles',
  'Participation reports',
]

// Ordered so the headline value (Sessions) reads first. AI lives near the
// bottom and is labelled "optional" to honour the product direction.
const PRO_FEATURES = [
  'Everything in Standard',
  'Unlimited Brainstorm Sessions',
  'Collaborative idea canvases',
  'Guided thinking workflows',
  'Team brainstorming',
  'Visual idea mapping',
  'Session summaries & action plans',
  '✦ AI helpers (optional)',
  'Priority support',
]

export default function UpgradePlans({ compact = false, currentPlan }: UpgradePlansProps) {
  async function handleUpgrade(plan: 'standard' | 'pro') {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan }),
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) throw new Error(data?.error || 'Failed to start checkout')
      if (!data?.url) throw new Error('No checkout URL returned')
      window.location.href = data.url
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Something went wrong')
    }
  }

  // ── Compact mode: two inline buttons ──────────────────────────────────────
  if (compact) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {currentPlan !== 'standard' && currentPlan !== 'pro' && (
          <button
            onClick={() => handleUpgrade('standard')}
            style={{
              background:    'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color:         '#fff',
              padding:       '0.5rem 0.9rem',
              borderRadius:  '0.6rem',
              fontSize:      '0.8125rem',
              fontWeight:    700,
              cursor:        'pointer',
              border:        'none',
              letterSpacing: '0.01em',
              boxShadow:     '0 2px 10px rgba(240,104,0,0.25)',
              whiteSpace:    'nowrap',
            }}
          >
            Standard — €49/yr
          </button>
        )}
        {currentPlan !== 'pro' && (
          <button
            onClick={() => handleUpgrade('pro')}
            style={{
              background:    'linear-gradient(135deg, #1a2035 0%, #0f1726 100%)',
              color:         '#fff',
              padding:       '0.5rem 0.9rem',
              borderRadius:  '0.6rem',
              fontSize:      '0.8125rem',
              fontWeight:    700,
              cursor:        'pointer',
              border:        '1px solid rgba(99,179,237,0.2)',
              letterSpacing: '0.01em',
              boxShadow:     '0 2px 14px rgba(9,13,30,0.28)',
              whiteSpace:    'nowrap',
            }}
          >
            Pro — Sessions — €99/yr
          </button>
        )}
      </div>
    )
  }

  // ── Full card mode ─────────────────────────────────────────────────────────
  return (
    <div className="upgrade-plans-grid">

      {/* ── Standard card ── */}
      <div
        style={{
          borderRadius:  '1rem',
          border:        currentPlan === 'standard'
            ? '1.5px solid rgba(249,115,22,0.25)'
            : '1px solid rgba(0,0,0,0.08)',
          background:    currentPlan === 'standard' ? 'rgba(249,115,22,0.02)' : '#fff',
          padding:       '1.375rem',
          display:       'flex',
          flexDirection: 'column',
          gap:           '0.875rem',
        }}
      >
        <div>
          <p style={{
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#8b96a8', marginBottom: '0.5rem',
          }}>
            Standard
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.03em', lineHeight: 1 }}>
            €49<span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#8b96a8' }}>/yr</span>
          </p>
          <p style={{ fontSize: '0.7rem', color: '#b0bac8', marginTop: '0.25rem' }}>Professional team collaboration</p>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {STANDARD_FEATURES.map(f => (
            <li key={f} style={{
              fontSize: '0.8rem', color: '#5d667a',
              display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
            }}>
              <span style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.05rem', flexShrink: 0 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {currentPlan === 'standard' ? (
          <span style={{
            fontSize: '0.75rem', fontWeight: 700, color: '#f97316',
            padding: '0.35rem 0.6rem', borderRadius: '0.4rem',
            background: 'rgba(249,115,22,0.07)', textAlign: 'center',
            border: '1px solid rgba(249,115,22,0.15)',
          }}>
            Current plan
          </span>
        ) : currentPlan === 'pro' ? (
          <span style={{ fontSize: '0.75rem', color: '#b0bac8', textAlign: 'center', padding: '0.35rem 0' }}>
            You&apos;re on a higher plan
          </span>
        ) : (
          <button
            onClick={() => handleUpgrade('standard')}
            style={{
              background:   'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color:        '#fff',
              padding:      '0.55rem 0.75rem',
              borderRadius: '0.6rem',
              fontSize:     '0.8125rem',
              fontWeight:   700,
              cursor:       'pointer',
              border:       'none',
              boxShadow:    '0 2px 8px rgba(249,115,22,0.3)',
            }}
          >
            Upgrade to Standard →
          </button>
        )}
      </div>

      {/* ── Pro card (dark, premium, leads with Sessions) ── */}
      <div
        style={{
          borderRadius:  '1rem',
          background:    'linear-gradient(160deg, #1a2035 0%, #0f1726 100%)',
          padding:       '1.375rem',
          display:       'flex',
          flexDirection: 'column',
          gap:           '0.875rem',
          position:      'relative',
          overflow:      'hidden',
          boxShadow:     currentPlan === 'pro'
            ? 'none'
            : '0 4px 28px rgba(9,13,30,0.22), 0 0 0 1px rgba(99,179,237,0.12)',
        }}
      >
        {/* "Most popular for teams" badge — pins to the top-right corner */}
        {currentPlan !== 'pro' && (
          <div
            style={{
              position: 'absolute', top: '0.85rem', right: '0.85rem',
              fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#fdba74',
              background: 'rgba(249,115,22,0.16)',
              border: '1px solid rgba(249,115,22,0.32)',
              borderRadius: '999px',
              padding: '0.2rem 0.55rem',
              zIndex: 2,
            }}
          >
            ★ Most popular for teams
          </div>
        )}

        {/* Top-right glow */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '65%', height: '55%',
          background: 'radial-gradient(ellipse at top right, rgba(99,179,237,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', paddingTop: currentPlan === 'pro' ? 0 : '0.6rem' }}>
          <p style={{
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
            marginBottom: '0.45rem',
          }}>
            IdeaFlow Pro
          </p>
          <p style={{
            fontSize: '1.5rem', fontWeight: 800,
            color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            €99<span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>/yr</span>
          </p>
          <p
            style={{
              fontSize: '0.8rem', color: 'rgba(255,255,255,0.62)',
              marginTop: '0.5rem', lineHeight: 1.5,
              maxWidth: '20rem',
            }}
          >
            Guided brainstorming for teams that turn messy thoughts into clear direction.
          </p>
        </div>

        {/* Mini canvas preview */}
        <SessionThumbnail />

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', position: 'relative' }}>
          {PRO_FEATURES.map((f, i) => {
            const isAI    = f.startsWith('✦')
            const isFirst = i === 0
            const label   = isAI ? f.slice(2) : f
            return (
              <li key={f} style={{
                fontSize: '0.8rem',
                color: isFirst
                  ? 'rgba(255,255,255,0.32)'
                  : isAI
                    ? 'rgba(186,230,253,0.78)'
                    : 'rgba(255,255,255,0.78)',
                display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
                fontStyle: isFirst ? 'italic' : 'normal',
                lineHeight: 1.5,
              }}>
                <span style={{
                  color: isAI ? 'rgba(249,115,22,0.7)' : 'rgba(99,179,237,0.7)',
                  fontSize: '0.72rem', marginTop: '0.1rem', flexShrink: 0,
                }}>
                  {isAI ? '✦' : '✓'}
                </span>
                {label}
              </li>
            )
          })}
        </ul>

        {currentPlan === 'pro' ? (
          <span style={{
            fontSize: '0.75rem', fontWeight: 700,
            color: 'rgba(186,230,253,0.75)',
            padding: '0.35rem 0.6rem', borderRadius: '0.4rem',
            background: 'rgba(99,179,237,0.08)', textAlign: 'center',
            border: '1px solid rgba(99,179,237,0.18)',
          }}>
            Current plan
          </span>
        ) : (
          <button
            onClick={() => handleUpgrade('pro')}
            style={{
              background:   'linear-gradient(135deg, rgba(99,179,237,0.22) 0%, rgba(56,189,248,0.14) 100%)',
              color:        'rgba(220,235,255,0.97)',
              padding:      '0.6rem 0.85rem',
              borderRadius: '0.6rem',
              fontSize:     '0.8125rem',
              fontWeight:   700,
              cursor:       'pointer',
              border:       '1px solid rgba(99,179,237,0.32)',
              boxShadow:    '0 0 24px rgba(99,179,237,0.12)',
              position:     'relative',
            }}
          >
            Upgrade to Pro — Sessions →
          </button>
        )}
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SessionThumbnail — small SVG mock of the dark canvas with three coloured
// cards and connectors. Communicates "visual brainstorming surface" at a
// glance, well below the price + headline so the eye reads top-down.
// ─────────────────────────────────────────────────────────────────────────────
function SessionThumbnail() {
  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        height: '88px',
        borderRadius: '0.6rem',
        background: '#0e1320',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '12px 12px',
        backgroundPosition: '-1px -1px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <svg viewBox="0 0 240 88" width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        {/* Connection lines */}
        <path d="M 56 28 C 80 28, 100 56, 124 56" fill="none" stroke="rgba(148,163,184,0.45)" strokeWidth="1" />
        <path d="M 56 28 C 100 28, 140 28, 184 32" fill="none" stroke="rgba(148,163,184,0.45)" strokeWidth="1" />
        <path d="M 124 56 C 150 56, 170 56, 184 56" fill="none" stroke="rgba(148,163,184,0.45)" strokeWidth="1" />

        {/* Cards */}
        <g>
          <rect x="16" y="18" width="46" height="22" rx="4" fill="rgba(249,115,22,0.10)" stroke="rgba(249,115,22,0.55)" strokeWidth="0.8" />
          <rect x="20" y="22" width="14" height="3" rx="1.5" fill="rgba(253,186,116,0.85)" />
          <rect x="20" y="28" width="34" height="2" rx="1" fill="rgba(255,255,255,0.45)" />
          <rect x="20" y="32" width="24" height="2" rx="1" fill="rgba(255,255,255,0.30)" />
        </g>
        <g>
          <rect x="100" y="46" width="46" height="22" rx="4" fill="rgba(16,185,129,0.10)" stroke="rgba(16,185,129,0.55)" strokeWidth="0.8" />
          <rect x="104" y="50" width="14" height="3" rx="1.5" fill="rgba(110,231,183,0.85)" />
          <rect x="104" y="56" width="34" height="2" rx="1" fill="rgba(255,255,255,0.45)" />
          <rect x="104" y="60" width="22" height="2" rx="1" fill="rgba(255,255,255,0.30)" />
        </g>
        <g>
          <rect x="178" y="22" width="46" height="22" rx="4" fill="rgba(167,139,250,0.10)" stroke="rgba(167,139,250,0.55)" strokeWidth="0.8" />
          <rect x="182" y="26" width="14" height="3" rx="1.5" fill="rgba(196,181,253,0.85)" />
          <rect x="182" y="32" width="34" height="2" rx="1" fill="rgba(255,255,255,0.45)" />
          <rect x="182" y="36" width="20" height="2" rx="1" fill="rgba(255,255,255,0.30)" />
        </g>
      </svg>
    </div>
  )
}
