'use client'

// ─────────────────────────────────────────────────────────────────────────────
// ExecutiveReport — premium narrative insight card for paid plans.
//
// Visible when: isPaidPlan && ideas.length >= 5
//
// Produces a boardroom-quality summary section algorithmically:
//   • A 2-3 sentence narrative paragraph about the workspace health
//   • A structured "Action plan" with 3 prioritised bullets
//   • Top 3 ideas highlighted by vote count
//   • Key metrics in a compact stat row
//   • "Download PDF report" button (links to /api/reports/summary)
// ─────────────────────────────────────────────────────────────────────────────

import TrendBadge from '@/components/TrendBadge'

interface ReportIdea {
  id:          string
  title:       string
  description?: string | null
  likes_count: number
  status:      string
  created_at:  string
}

interface ExecutiveReportProps {
  ideas:            ReportIdea[]
  participationRate: number        // 0–100
  memberCount:      number
  activeMembers:    number
  ideasThisWeek:    number
  roundName?:       string | null
  isProPlan:        boolean
}

// ── Theme extraction (word frequency, weighted by likes) ──────────────────────
const STOP_WORDS = new Set([
  'the','and','for','that','this','with','from','have','been','are','was','were',
  'not','but','they','will','would','could','should','more','also','some','into',
  'when','how','what','just','like','very','can','make','need','want','use','add',
  'get','has','than','our','their','its','about','which','out','new','all','each',
  'both','such','here','there','give','take','used','good','better','best','work',
  'team','idea','ideas','think','feel','help','way','time','thing','really',
])

function extractThemes(ideas: ReportIdea[], topN = 3): string[] {
  const freq: Record<string, number> = {}
  for (const idea of ideas) {
    const text = (idea.title + ' ' + (idea.description ?? ''))
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
    const weight = 1 + Math.min(idea.likes_count, 5) * 0.4
    for (const word of text.split(/\s+/)) {
      if (word.length >= 5 && !STOP_WORDS.has(word)) {
        freq[word] = (freq[word] ?? 0) + weight
      }
    }
  }
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1))
}

// ── Engagement classification ─────────────────────────────────────────────────
function classifyEngagement(rate: number): { label: string; color: string; bg: string } {
  if (rate >= 70) return { label: 'Strong',  color: '#059669', bg: 'rgba(5,150,105,0.08)'  }
  if (rate >= 45) return { label: 'Good',    color: '#1a6bbf', bg: 'rgba(26,107,191,0.07)' }
  if (rate >= 20) return { label: 'Building',color: '#d97706', bg: 'rgba(217,119,6,0.08)'  }
  return              { label: 'Early',   color: '#f97316', bg: 'rgba(249,115,22,0.08)' }
}

// ── Narrative generator ───────────────────────────────────────────────────────
function buildNarrative(
  ideas:             ReportIdea[],
  participationRate: number,
  memberCount:       number,
  activeMembers:     number,
  ideasThisWeek:     number,
  roundName:         string | null | undefined,
  themes:            string[],
): string {
  const flowLabel = roundName ? `"${roundName}"` : 'this IdeaFlow'
  const totalVotes = ideas.reduce((s, i) => s + i.likes_count, 0)
  const avgVotes = ideas.length > 0 ? (totalVotes / ideas.length).toFixed(1) : '0'

  const engagementWord =
    participationRate >= 70 ? 'strong'   :
    participationRate >= 45 ? 'healthy'  :
    participationRate >= 20 ? 'moderate' : 'early-stage'

  const themeLine = themes.length >= 2
    ? ` Key themes emerging from the submissions centre around ${themes.slice(0, 2).join(' and ').toLowerCase()}.`
    : ''

  const weekLine = ideasThisWeek > 0
    ? ` Momentum remains active with ${ideasThisWeek} new idea${ideasThisWeek > 1 ? 's' : ''} posted this week.`
    : ' New idea submissions have slowed — consider nudging the team to contribute.'

  return (
    `${activeMembers} of ${memberCount} team member${memberCount !== 1 ? 's' : ''} contributed to ${flowLabel}, ` +
    `reflecting ${engagementWord} engagement at ${participationRate}% participation. ` +
    `${ideas.length} idea${ideas.length !== 1 ? 's' : ''} have been collected, generating ${totalVotes} vote${totalVotes !== 1 ? 's' : ''} (${avgVotes} avg per idea).` +
    themeLine +
    weekLine
  )
}

// ── Action plan generator ─────────────────────────────────────────────────────
function buildActionItems(
  ideas:             ReportIdea[],
  participationRate: number,
  ideasThisWeek:     number,
): Array<{ priority: 'high' | 'medium' | 'low'; text: string }> {
  const actions: Array<{ priority: 'high' | 'medium' | 'low'; text: string }> = []
  const topIdea = ideas.length > 0 ? [...ideas].sort((a, b) => b.likes_count - a.likes_count)[0] : null

  if (topIdea && topIdea.likes_count >= 3) {
    actions.push({
      priority: 'high',
      text: `Review and respond to the most-voted idea "${topIdea.title.slice(0, 60)}${topIdea.title.length > 60 ? '…' : ''}" (${topIdea.likes_count} votes) — high team signal.`,
    })
  }

  const openHighVote = ideas.filter((i) => i.status === 'open' && i.likes_count >= 2)
  if (openHighVote.length >= 2) {
    actions.push({
      priority: 'high',
      text: `${openHighVote.length} open ideas have 2+ votes. Consider marking the strongest ones as "Planned" to close the feedback loop.`,
    })
  }

  if (participationRate < 40) {
    actions.push({
      priority: 'medium',
      text: `Participation is at ${participationRate}%. A short team nudge or reminder message could meaningfully increase contributions.`,
    })
  }

  if (ideasThisWeek === 0) {
    actions.push({
      priority: 'medium',
      text: 'No ideas this week. Share the IdeaFlow link in your team channel to keep momentum going.',
    })
  }

  const openCount = ideas.filter((i) => i.status === 'open').length
  if (openCount >= 8) {
    actions.push({
      priority: 'low',
      text: `${openCount} ideas are still open. Consider a short review session to triage, close, or plan the backlog.`,
    })
  }

  // Always add a growth suggestion
  if (actions.length < 3) {
    actions.push({
      priority: 'low',
      text: 'Download the full PDF report and share it with leadership to drive action on team feedback.',
    })
  }

  return actions.slice(0, 3)
}

const PRIORITY_STYLES = {
  high:   { dot: '#dc2626', bg: 'rgba(220,38,38,0.07)',   border: 'rgba(220,38,38,0.15)',   label: 'High'   },
  medium: { dot: '#d97706', bg: 'rgba(217,119,6,0.07)',   border: 'rgba(217,119,6,0.15)',   label: 'Medium' },
  low:    { dot: '#059669', bg: 'rgba(5,150,105,0.07)',   border: 'rgba(5,150,105,0.15)',   label: 'Low'    },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExecutiveReport({
  ideas,
  participationRate,
  memberCount,
  activeMembers,
  ideasThisWeek,
  roundName,
  isProPlan,
}: ExecutiveReportProps) {
  if (!isProPlan || ideas.length < 5) return null

  const themes      = extractThemes(ideas)
  const narrative   = buildNarrative(ideas, participationRate, memberCount, activeMembers, ideasThisWeek, roundName, themes)
  const actionItems = buildActionItems(ideas, participationRate, ideasThisWeek)
  const topIdeas    = [...ideas].sort((a, b) => b.likes_count - a.likes_count).slice(0, 3)
  const engagement  = classifyEngagement(participationRate)
  const totalVotes  = ideas.reduce((s, i) => s + i.likes_count, 0)
  const plannedCount = ideas.filter((i) => i.status === 'planned').length

  // Week-on-week trend (rough proxy: ideas this week vs prior week avg)
  const weeksElapsed   = Math.max(1, Math.ceil(ideas.length / Math.max(ideasThisWeek || 1, 1)))
  const avgPerWeek     = ideas.length / weeksElapsed
  const trendDelta     = ideasThisWeek > 0
    ? Math.round(((ideasThisWeek - avgPerWeek) / Math.max(avgPerWeek, 1)) * 100)
    : 0

  return (
    <div
      className="stagger-fade-3"
      style={{
        borderRadius: '1rem',
        border:       '1px solid rgba(26,107,191,0.12)',
        background:   '#ffffff',
        overflow:     'hidden',
      }}
    >
      {/* ── Premium header band ── */}
      <div
        style={{
          background:    'linear-gradient(135deg, #0d1f35 0%, #1a3a5c 100%)',
          padding:       '1.125rem 1.375rem',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'space-between',
          gap:           '0.75rem',
          flexWrap:      'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width:          '1.75rem',
              height:         '1.75rem',
              borderRadius:   '0.4rem',
              background:     'linear-gradient(135deg, #f97316, #ea580c)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Executive Insight Report
            </p>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>
              {roundName ? `IdeaFlow: ${roundName}` : 'Current IdeaFlow'}
            </p>
          </div>
        </div>
        <a
          href="/api/reports/summary"
          target="_blank"
          rel="noreferrer"
          style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          '0.35rem',
            padding:      '0.4rem 0.875rem',
            borderRadius: '0.45rem',
            background:   'rgba(255,255,255,0.08)',
            border:       '1px solid rgba(255,255,255,0.14)',
            fontSize:     '0.75rem',
            fontWeight:   600,
            color:        '#fff',
            textDecoration: 'none',
            flexShrink:   0,
            transition:   'background 0.15s ease',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download PDF
        </a>
      </div>

      <div style={{ padding: '1.375rem' }}>

        {/* ── Metric strip ── */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap:                 '0.5rem',
            marginBottom:        '1.25rem',
          }}
          className="exec-stat-grid"
        >
          {[
            { label: 'Participation',  value: `${participationRate}%`, sub: engagement.label, subColor: engagement.color, subBg: engagement.bg },
            { label: 'Total ideas',    value: String(ideas.length),    sub: `+${ideasThisWeek} this week`, subColor: undefined, subBg: undefined, trend: trendDelta },
            { label: 'Total votes',    value: String(totalVotes),       sub: `${(totalVotes / Math.max(ideas.length, 1)).toFixed(1)} avg`, subColor: undefined, subBg: undefined },
            { label: 'Planned',        value: String(plannedCount),     sub: `${ideas.length - plannedCount} open`, subColor: undefined, subBg: undefined },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                padding:      '0.75rem 0.875rem',
                borderRadius: '0.75rem',
                background:   '#f8fafc',
                border:       '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <p
                style={{
                  fontSize:      '1.375rem',
                  fontWeight:    800,
                  color:         '#0d1f35',
                  letterSpacing: '-0.04em',
                  lineHeight:    1,
                  marginBottom:  '0.25rem',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {m.value}
              </p>
              <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8b96a8', marginBottom: '0.2rem' }}>
                {m.label}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                {m.sub && (
                  <span
                    style={{
                      fontSize:     '0.65rem',
                      color:        m.subColor ?? '#b0bac8',
                      background:   m.subBg,
                      borderRadius: '999px',
                      padding:      m.subBg ? '1px 5px' : undefined,
                      fontWeight:   m.subColor ? 600 : 400,
                    }}
                  >
                    {m.sub}
                  </span>
                )}
                {m.trend !== undefined && m.trend !== 0 && (
                  <TrendBadge value={m.trend} fontSize="0.65rem" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Narrative summary ── */}
        <div
          style={{
            marginBottom:  '1.25rem',
            padding:       '0.875rem 1rem',
            borderRadius:  '0.75rem',
            background:    'rgba(26,107,191,0.03)',
            border:        '1px solid rgba(26,107,191,0.08)',
            borderLeft:    '3px solid rgba(26,107,191,0.35)',
          }}
        >
          <p
            style={{
              fontSize:   '0.6875rem',
              fontWeight: 700,
              color:      '#1a6bbf',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}
          >
            Summary
          </p>
          <p style={{ fontSize: '0.825rem', color: '#374151', lineHeight: 1.7 }}>
            {narrative}
          </p>
          {themes.length > 0 && (
            <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
              {themes.map((theme) => (
                <span
                  key={theme}
                  style={{
                    fontSize:     '0.7rem',
                    fontWeight:   600,
                    color:        '#5d667a',
                    background:   'rgba(0,0,0,0.04)',
                    border:       '1px solid rgba(0,0,0,0.07)',
                    borderRadius: '999px',
                    padding:      '2px 8px',
                  }}
                >
                  #{theme.toLowerCase()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Action plan ── */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p
            style={{
              fontSize:     '0.6875rem',
              fontWeight:   700,
              color:        '#8b96a8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.625rem',
            }}
          >
            Recommended actions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {actionItems.map((item, i) => {
              const ps = PRIORITY_STYLES[item.priority]
              return (
                <div
                  key={i}
                  style={{
                    display:      'flex',
                    alignItems:   'flex-start',
                    gap:          '0.625rem',
                    padding:      '0.625rem 0.75rem',
                    borderRadius: '0.625rem',
                    background:   ps.bg,
                    border:       `1px solid ${ps.border}`,
                  }}
                >
                  <div
                    style={{
                      width:     '6px',
                      height:    '6px',
                      borderRadius: '50%',
                      background:  ps.dot,
                      flexShrink:  0,
                      marginTop:   '0.3rem',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize:   '0.625rem',
                        fontWeight: 700,
                        color:      ps.dot,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginRight: '0.4rem',
                      }}
                    >
                      {ps.label}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#374151', lineHeight: 1.55 }}>
                      {item.text}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Top ideas ── */}
        <div>
          <p
            style={{
              fontSize:     '0.6875rem',
              fontWeight:   700,
              color:        '#8b96a8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.625rem',
            }}
          >
            Top ideas by votes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {topIdeas.map((idea, i) => (
              <div
                key={idea.id}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '0.75rem',
                  padding:      '0.6rem 0.75rem',
                  borderRadius: '0.625rem',
                  background:   i === 0 ? 'rgba(249,115,22,0.04)' : '#f8fafc',
                  border:       `1px solid ${i === 0 ? 'rgba(249,115,22,0.12)' : 'rgba(0,0,0,0.05)'}`,
                }}
              >
                <span
                  style={{
                    fontSize:   '0.6875rem',
                    fontWeight: 800,
                    color:      '#0d1f35',
                    minWidth:   '1.5rem',
                    textAlign:  'center',
                    background: i === 0 ? 'rgba(249,115,22,0.12)' : 'rgba(0,0,0,0.06)',
                    borderRadius: '0.3rem',
                    padding:    '2px 5px',
                  }}
                >
                  #{i + 1}
                </span>
                <p
                  style={{
                    flex:       1,
                    fontSize:   '0.8125rem',
                    fontWeight: 600,
                    color:      '#0d1f35',
                    lineHeight: 1.4,
                    overflow:   'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {idea.title}
                </p>
                <span
                  style={{
                    flexShrink:   0,
                    fontSize:     '0.7rem',
                    fontWeight:   700,
                    color:        '#5d667a',
                    background:   'rgba(26,107,191,0.06)',
                    border:       '1px solid rgba(26,107,191,0.12)',
                    borderRadius: '0.375rem',
                    padding:      '2px 7px',
                    whiteSpace:   'nowrap',
                  }}
                >
                  ♥ {idea.likes_count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
