'use client'

// ─────────────────────────────────────────────────────────────────────────────
// AISummaryCard — workspace insight card derived from team idea data.
//
// Plan gating:
//   Pro plan → full insights: themes, top ideas, participation, PDF export
//   Free / Standard → aspirational Pro gate: blurred preview + lock overlay
//
// Theme extraction is algorithmic (word-frequency on idea titles/descriptions).
// ─────────────────────────────────────────────────────────────────────────────

interface Idea {
  title: string
  description?: string | null
  likes_count: number
}

interface AISummaryCardProps {
  ideas:             Idea[]
  isProPlan:         boolean
  roundName?:        string | null
  participationRate: number
  memberCount:       number
  activeMembers:     number
}

// ── Algorithmic theme extraction ──────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'been',
  'are', 'was', 'were', 'not', 'but', 'they', 'will', 'would', 'could',
  'should', 'more', 'also', 'some', 'into', 'when', 'how', 'what', 'just',
  'like', 'very', 'can', 'make', 'need', 'want', 'use', 'add', 'get', 'has',
  'than', 'our', 'their', 'its', 'about', 'which', 'out', 'new', 'all',
  'each', 'both', 'such', 'here', 'there', 'give', 'take', 'used',
])

function extractThemes(ideas: Idea[]): { theme: string; count: number }[] {
  const freq: Record<string, number> = {}
  for (const idea of ideas) {
    const text = (idea.title + ' ' + (idea.description ?? ''))
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
    for (const word of text.split(/\s+/)) {
      if (word.length >= 4 && !STOP_WORDS.has(word)) {
        freq[word] = (freq[word] ?? 0) + 1
      }
    }
  }
  return Object.entries(freq)
    .filter(([, c]) => c >= 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([theme, count]) => ({
      theme: theme.charAt(0).toUpperCase() + theme.slice(1),
      count,
    }))
}

function engagementLabel(ideas: Idea[]): { label: string; color: string } {
  if (ideas.length === 0) return { label: 'No data', color: '#b0bac8' }
  const avgLikes = ideas.reduce((s, i) => s + i.likes_count, 0) / ideas.length
  if (avgLikes >= 3) return { label: 'Strong engagement', color: '#10b981' }
  if (avgLikes >= 1.2) return { label: 'Good engagement', color: '#f97316' }
  return { label: 'Early stage', color: '#94a3b8' }
}

// ── Pro gate teaser (shown to Free & Standard users) ─────────────────────────

function ProGateTeaser() {
  return (
    <div
      style={{
        marginTop: '1.75rem',
        borderRadius: '1rem',
        border: '1px solid rgba(26,107,191,0.10)',
        background: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Blurred preview content ── */}
      <div
        aria-hidden="true"
        style={{
          padding: '1.25rem 1.375rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          filter: 'blur(5px)',
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: 0.35,
        }}
      >
        {/* Fake themes col */}
        <div>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b0bac8', marginBottom: '0.75rem' }}>Recurring themes</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {['Process', 'Communication', 'Onboarding', 'Tooling', 'Culture'].map(t => (
              <span key={t} style={{ fontSize: '0.75rem', background: 'rgba(26,107,191,0.07)', color: '#1a6bbf', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(26,107,191,0.12)' }}>{t}</span>
            ))}
          </div>
        </div>
        {/* Fake leading ideas col */}
        <div>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b0bac8', marginBottom: '0.75rem' }}>Leading ideas</p>
          {['Streamline the onboarding flow', 'Better async stand-ups', 'Weekly team retros'].map((t, i) => (
            <div key={i} style={{ fontSize: '0.8rem', color: '#0d1f35', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.6rem', color: '#c2540a', fontWeight: 800 }}>{String(i + 1).padStart(2, '0')}</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
        {/* Fake participation col */}
        <div>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b0bac8', marginBottom: '0.75rem' }}>Participation</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 800, color: '#10b981', letterSpacing: '-0.04em', lineHeight: 1 }}>73%</p>
          <p style={{ fontSize: '0.72rem', color: '#8b96a8', marginTop: '0.25rem' }}>of team</p>
          <div style={{ height: 5, background: 'rgba(0,0,0,0.06)', borderRadius: 999, marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '73%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: 999 }} />
          </div>
        </div>
      </div>

      {/* ── Dark overlay with lock + CTA ── */}
      <div
        style={{
          position:       'absolute',
          inset:          0,
          background:     'linear-gradient(180deg, rgba(13,31,53,0.55) 0%, rgba(13,31,53,0.82) 100%)',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '0.75rem',
          padding:        '2rem 1.5rem',
          textAlign:      'center',
          backdropFilter: 'blur(2px)',
        }}
      >
        {/* Lock icon */}
        <div
          style={{
            width:          '2.75rem',
            height:         '2.75rem',
            borderRadius:   '50%',
            background:     'rgba(255,255,255,0.08)',
            border:         '1px solid rgba(255,255,255,0.18)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            marginBottom:   '0.125rem',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        {/* Badge */}
        <span
          className="ai-pro-badge"
          style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '0.3rem',
            fontSize:      '0.6rem',
            fontWeight:    700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         'rgba(255,255,255,0.9)',
            background:    'rgba(249,115,22,0.3)',
            border:        '1px solid rgba(249,115,22,0.5)',
            borderRadius:  '999px',
            padding:       '0.25rem 0.7rem',
          }}
        >
          ✦ Pro feature
        </span>

        <p style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Unlock AI workspace insights
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, maxWidth: '22rem' }}>
          AI-powered summaries, recurring themes, engagement trends, and PDF executive exports.
          Available on the Pro plan.
        </p>

        <a
          href="/settings"
          className="upgrade-pro-cta"
          style={{
            marginTop:     '0.25rem',
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '0.4rem',
            padding:       '0.55rem 1.375rem',
            borderRadius:  '0.6rem',
            background:    'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color:         '#fff',
            fontSize:      '0.825rem',
            fontWeight:    700,
            textDecoration: 'none',
            letterSpacing: '0.01em',
            boxShadow:     '0 4px 20px rgba(249,115,22,0.45)',
          }}
        >
          Upgrade to Pro →
        </a>
      </div>
    </div>
  )
}

// ── Full insights card (Pro plan) ─────────────────────────────────────────────

export default function AISummaryCard({
  ideas,
  isProPlan,
  roundName,
  participationRate,
  memberCount,
  activeMembers,
}: AISummaryCardProps) {
  if (!isProPlan) return <ProGateTeaser />

  const themes = extractThemes(ideas)
  const { label: engLabel, color: engColor } = engagementLabel(ideas)
  const topIdeas = [...ideas]
    .sort((a, b) => b.likes_count - a.likes_count)
    .slice(0, 3)

  const partColor =
    participationRate >= 70 ? '#10b981' :
    participationRate >= 40 ? '#f97316' : '#94a3b8'

  return (
    <div
      style={{
        marginTop:    '1.75rem',
        borderRadius: '1rem',
        border:       '1px solid rgba(26,107,191,0.09)',
        background:   '#ffffff',
        overflow:     'hidden',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding:       '1rem 1.375rem',
          borderBottom:  '1px solid rgba(0,0,0,0.05)',
          display:       'flex',
          alignItems:    'center',
          gap:           '0.625rem',
        }}
      >
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>✨</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0d1f35' }}>
            {roundName ? `${roundName} — Insights` : 'AI Workspace Insights'}
          </p>
          <p style={{ fontSize: '0.72rem', color: '#8b96a8' }}>
            Derived from your team&apos;s ideas
          </p>
        </div>
        {/* Pro badge */}
        <span
          style={{
            flexShrink:    0,
            fontSize:      '0.6rem',
            fontWeight:    700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background:    'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.06))',
            color:         '#c2540a',
            padding:       '0.25rem 0.625rem',
            borderRadius:  '999px',
            border:        '1px solid rgba(249,115,22,0.2)',
          }}
        >
          ✦ Pro
        </span>
        {/* Engagement badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: engColor, display: 'inline-block' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: engColor }}>{engLabel}</span>
        </div>
      </div>

      {/* ── Body — three columns ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>

        {/* Themes */}
        <div className="ai-summary-col">
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b0bac8', marginBottom: '0.75rem' }}>
            Recurring themes
          </p>
          {themes.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#b0bac8' }}>Not enough data yet</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {themes.map(({ theme, count }) => (
                <span
                  key={theme}
                  title={`Mentioned ${count} time${count !== 1 ? 's' : ''}`}
                  style={{
                    fontSize:     '0.75rem',
                    fontWeight:   500,
                    background:   'rgba(26,107,191,0.06)',
                    color:        '#1a6bbf',
                    padding:      '0.25rem 0.7rem',
                    borderRadius: '999px',
                    border:       '1px solid rgba(26,107,191,0.12)',
                    display:      'inline-flex',
                    alignItems:   'center',
                    gap:          '0.3rem',
                  }}
                >
                  {theme}
                  {count > 1 && (
                    <span style={{ fontSize: '0.6rem', opacity: 0.55 }}>{count}×</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Top ideas */}
        <div className="ai-summary-col">
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b0bac8', marginBottom: '0.75rem' }}>
            Leading ideas
          </p>
          {topIdeas.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#b0bac8' }}>No ideas yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {topIdeas.map((idea, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: i === 0 ? '#c2540a' : '#c8d2de', fontVariantNumeric: 'tabular-nums', marginTop: '0.125rem', flexShrink: 0, minWidth: '1rem' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1e2533', lineHeight: 1.45 }}>
                      {idea.title.length > 64 ? idea.title.slice(0, 61) + '…' : idea.title}
                    </p>
                    {idea.likes_count > 0 && (
                      <p style={{ fontSize: '0.68rem', color: '#c2540a', marginTop: '0.1rem', fontVariantNumeric: 'tabular-nums' }}>
                        ♥ {idea.likes_count}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Participation + report CTA */}
        <div className="ai-summary-col">
          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b0bac8', marginBottom: '0.75rem' }}>
            Participation
          </p>

          <div style={{ marginBottom: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.4rem' }}>
              <p style={{ fontSize: '1.875rem', fontWeight: 800, color: partColor, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {participationRate}%
              </p>
              <p style={{ fontSize: '0.72rem', color: '#8b96a8' }}>of team</p>
            </div>
            <div style={{ height: '5px', background: 'rgba(0,0,0,0.05)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.35rem' }}>
              <div style={{
                height:       '100%',
                width:        `${participationRate}%`,
                background:   participationRate >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' :
                              participationRate >= 40 ? 'linear-gradient(90deg, #f97316, #ea580c)' :
                                                       'linear-gradient(90deg, #94a3b8, #64748b)',
                borderRadius: '9999px',
                transition:   'width 0.5s ease',
              }} />
            </div>
            <p style={{ fontSize: '0.67rem', color: '#b0bac8', lineHeight: 1.3 }}>
              {activeMembers} of {memberCount} member{memberCount !== 1 ? 's' : ''} contributed
            </p>
          </div>

          {/* PDF download — Pro only */}
          <a
            href="/api/reports/summary"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '0.375rem',
              height:         '1.875rem',
              padding:        '0 0.75rem',
              borderRadius:   '0.45rem',
              border:         '1px solid rgba(0,0,0,0.09)',
              background:     '#fff',
              fontSize:       '0.72rem',
              fontWeight:     600,
              color:          '#5d667a',
              textDecoration: 'none',
              marginTop:      '0.25rem',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Download PDF report
          </a>
        </div>
      </div>
    </div>
  )
}
