'use client'

/**
 * UpgradePlans — the Standard + Pro plan cards.
 *
 * Pro is positioned around Brainstorm Sessions — Brainstorm Circle +
 * Starbursting + the collaboration surface that surrounds them. Standard
 * remains the "professional team collaboration" tier for admins who don't
 * need sessions but want full analytics and member management.
 *
 * The Pro card lists session-related capabilities first; AI lives as one
 * muted line below the bullets so the card never reads as an AI product.
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

// Pro is positioned around Brainstorm Sessions — Brainstorm Circle +
// Starbursting + the team workflow that surrounds them.
type ProFeature = { icon: '✦' | '✓'; text: string }
const PRO_FEATURES: ProFeature[] = [
  { icon: '✓', text: 'Everything in Standard' },
  { icon: '✦', text: 'Brainstorm Circle' },
  { icon: '✦', text: 'Starbursting Sessions' },
  { icon: '✦', text: 'Team collaboration' },
  { icon: '✦', text: 'Session summaries' },
  { icon: '✦', text: 'PDF exports' },
  { icon: '✓', text: 'Up to 100 members' },
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
        {/* "Most popular for teams" — secondary, top-right badge */}
        {currentPlan !== 'pro' && (
          <div
            style={{
              position: 'absolute', top: '0.85rem', right: '0.85rem',
              fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '999px',
              padding: '0.2rem 0.55rem',
              zIndex: 2,
            }}
          >
            ★ Most popular for teams
          </div>
        )}

        {/* Soft top-right glow — keeps the card feeling premium without
            reading as "AI sparkle". */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '65%', height: '55%',
          background: 'radial-gradient(ellipse at top right, rgba(249,115,22,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', paddingTop: currentPlan === 'pro' ? 0 : '0.6rem' }}>
          {/* Headline badge — names the Pro promise: guided thinking, not AI. */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#fdba74',
              background: 'rgba(249,115,22,0.14)',
              border: '1px solid rgba(249,115,22,0.32)',
              borderRadius: '999px',
              padding: '0.22rem 0.6rem',
              marginBottom: '0.5rem',
            }}
          >
            <span>✦</span> Brainstorm Sessions
          </div>
          <p style={{
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
            marginBottom: '0.4rem',
          }}>
            IdeaFlow Pro
          </p>
          <p style={{
            fontSize: '1.5rem', fontWeight: 800,
            color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            €99<span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>/yr</span>
          </p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.4rem', lineHeight: 1.5 }}>
            Structured brainstorming and team decision-making.
          </p>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', position: 'relative' }}>
          {PRO_FEATURES.map((f, i) => {
            const isFirst = i === 0  // "Everything in Standard" — render slightly muted
            const isSessions = f.icon === '✦'
            return (
              <li key={f.text} style={{
                fontSize: '0.8rem',
                color: isFirst
                  ? 'rgba(255,255,255,0.45)'
                  : 'rgba(255,255,255,0.82)',
                display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
                fontStyle: isFirst ? 'italic' : 'normal',
                lineHeight: 1.5,
              }}>
                <span style={{
                  color: isSessions ? 'rgba(253,186,116,0.85)' : 'rgba(99,179,237,0.7)',
                  fontSize: '0.72rem', marginTop: '0.1rem', flexShrink: 0,
                }}>
                  {f.icon}
                </span>
                {f.text}
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

