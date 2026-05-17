'use client'

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

const PRO_FEATURES = [
  'Everything in Standard',
  '✦ AI workspace summaries',
  '✦ Executive AI reports',
  '✦ AI action recommendations',
  '✦ PDF executive exports',
  '✦ Workspace Pulse & trends',
  'Up to 100 members',
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
            ✦ Pro AI — €99/yr
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

      {/* ── Pro card (dark, premium) ── */}
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
        {/* Top-right glow */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '65%', height: '55%',
          background: 'radial-gradient(ellipse at top right, rgba(99,179,237,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <p style={{
              fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
            }}>Pro</p>
            <span style={{
              fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color:      'rgba(249,115,22,0.95)',
              background: 'rgba(249,115,22,0.14)',
              borderRadius: '999px', padding: '0.15rem 0.55rem',
              border: '1px solid rgba(249,115,22,0.25)',
            }}>
              ✦ AI-powered
            </span>
          </div>
          <p style={{
            fontSize: '1.5rem', fontWeight: 800,
            color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            €99<span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'rgba(255,255,255,0.3)' }}>/yr</span>
          </p>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>Smart AI workspace</p>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', position: 'relative' }}>
          {PRO_FEATURES.map((f, i) => {
            const isAI    = f.startsWith('✦')
            const isFirst = i === 0
            const label   = isAI ? f.slice(2) : f
            return (
              <li key={f} style={{
                fontSize: '0.8rem',
                color: isFirst ? 'rgba(255,255,255,0.28)' : isAI ? 'rgba(186,230,253,0.85)' : 'rgba(255,255,255,0.62)',
                display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
                fontStyle: isFirst ? 'italic' : 'normal',
              }}>
                <span style={{ color: isAI ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.2)', fontSize: '0.72rem', marginTop: '0.05rem', flexShrink: 0 }}>
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
              background:   'linear-gradient(135deg, rgba(99,179,237,0.18) 0%, rgba(56,189,248,0.12) 100%)',
              color:        'rgba(186,230,253,0.95)',
              padding:      '0.55rem 0.75rem',
              borderRadius: '0.6rem',
              fontSize:     '0.8125rem',
              fontWeight:   700,
              cursor:       'pointer',
              border:       '1px solid rgba(99,179,237,0.24)',
              boxShadow:    '0 0 20px rgba(99,179,237,0.07)',
              position:     'relative',
            }}
          >
            Upgrade to Pro AI →
          </button>
        )}
      </div>

    </div>
  )
}
