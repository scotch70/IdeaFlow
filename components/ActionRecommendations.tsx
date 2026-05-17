'use client'

// ─────────────────────────────────────────────────────────────────────────────
// ActionRecommendations — smart manager suggestions derived from idea data.
//
// Positions IdeaFlow as an "AI-powered insight platform" by generating
// actionable next steps — not just displaying raw data.
//
// Algorithm: rule-based signal detection across engagement, participation,
// status distribution, and sentiment keywords. Max 4 recommendations.
//
// Free plan: returns null (no gate UI — the AI summary card already handles that).
// When ideas.length === 0: returns null.
//
// Future: replace rule engine with /api/ai/recommendations (OpenAI / Anthropic)
// without changing this component's interface.
// ─────────────────────────────────────────────────────────────────────────────

interface RecoIdea {
  title: string
  description?: string | null
  likes_count: number
  status: string | null
}

interface ActionRecommendationsProps {
  ideas: RecoIdea[]
  participationRate: number
  memberCount: number
  activeMembers: number
  /** @deprecated use isProPlan — kept for backward compat */
  isPaidPlan?: boolean
  isProPlan: boolean
  roundName?: string | null
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  emoji: string
  text: string
  detail?: string
}

// ── Concern-signal words ──────────────────────────────────────────────────────
const CONCERN_SIGNALS = [
  'slow', 'broken', 'missing', 'confusing', 'unclear', 'hard', 'difficult',
  'problem', 'issue', 'painful', 'frustrating', 'annoying', 'wrong', 'bad',
  'fail', 'terrible', 'useless', 'poor', 'lack', 'lacks', 'lacking',
]

function generateRecommendations(
  ideas: RecoIdea[],
  participationRate: number,
  memberCount: number,
  activeMembers: number,
): Recommendation[] {
  const recs: Recommendation[] = []
  if (ideas.length === 0) return recs

  // ── 1. Participation health ─────────────────────────────────────────────
  if (participationRate < 30 && memberCount > 3) {
    recs.push({
      priority: 'high',
      emoji: '📣',
      text: `Only ${participationRate}% of the team has contributed — send a reminder`,
      detail: `${memberCount - activeMembers} team member${memberCount - activeMembers !== 1 ? 's' : ''} haven't shared an idea yet.`,
    })
  } else if (participationRate >= 80) {
    recs.push({
      priority: 'low',
      emoji: '🎉',
      text: `${participationRate}% participation — excellent team engagement`,
    })
  }

  // ── 2. Top-voted ideas deserve explicit action ─────────────────────────
  const stronglyLiked = ideas.filter(i => (i.likes_count ?? 0) >= 3 && i.status === 'open')
  if (stronglyLiked.length > 0) {
    const top = stronglyLiked[0]
    recs.push({
      priority: 'high',
      emoji: '⚡',
      text: `${stronglyLiked.length} highly-supported idea${stronglyLiked.length !== 1 ? 's' : ''} waiting for a decision`,
      detail: `"${top.title.length > 58 ? top.title.slice(0, 55) + '…' : top.title}" has ${top.likes_count} votes. Consider marking it as planned.`,
    })
  }

  // ── 3. Many unreviewed open ideas ──────────────────────────────────────
  const openCount = ideas.filter(i => !i.status || i.status === 'open').length
  if (openCount >= 6 && recs.length < 4) {
    recs.push({
      priority: 'medium',
      emoji: '📋',
      text: `${openCount} ideas are still open — a brief review session would build trust`,
      detail: 'Closing the loop shows your team that their input leads to real decisions.',
    })
  }

  // ── 4. Low engagement / no likes ───────────────────────────────────────
  const totalLikes = ideas.reduce((s, i) => s + (i.likes_count ?? 0), 0)
  const avgLikes = totalLikes / ideas.length
  if (ideas.length >= 4 && avgLikes < 0.5 && recs.length < 4) {
    recs.push({
      priority: 'medium',
      emoji: '💬',
      text: 'Low voting activity — encourage the team to support ideas they agree with',
      detail: 'Likes help surface signal from noise, making prioritization much easier.',
    })
  }

  // ── 5. Friction / pain-point signals ──────────────────────────────────
  const concernIdeas = ideas.filter(idea => {
    const text = (idea.title + ' ' + (idea.description ?? '')).toLowerCase()
    return CONCERN_SIGNALS.some(w => text.includes(w))
  })
  if (concernIdeas.length >= 2 && recs.length < 4) {
    recs.push({
      priority: 'high',
      emoji: '⚠️',
      text: `${concernIdeas.length} ideas describe friction or problems`,
      detail: 'These may point to workflow issues worth a focused follow-up conversation.',
    })
  }

  // ── 6. Good momentum positive signal ──────────────────────────────────
  if (recs.length === 0 && ideas.length >= 3) {
    recs.push({
      priority: 'low',
      emoji: '✨',
      text: 'Your team is actively sharing — keep the conversation going',
    })
  }

  return recs.slice(0, 4)
}

// ── Priority badge styles ─────────────────────────────────────────────────────
const PRIORITY: Record<Recommendation['priority'], { dot: string; bg: string; border: string }> = {
  high:   { dot: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.14)'   },
  medium: { dot: '#f97316', bg: 'rgba(249,115,22,0.05)',  border: 'rgba(249,115,22,0.14)'  },
  low:    { dot: '#10b981', bg: 'rgba(16,185,129,0.05)',  border: 'rgba(16,185,129,0.14)'  },
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ActionRecommendations({
  ideas,
  participationRate,
  memberCount,
  activeMembers,
  isProPlan,
  roundName,
}: ActionRecommendationsProps) {
  if (!isProPlan || ideas.length === 0) return null

  const recommendations = generateRecommendations(ideas, participationRate, memberCount, activeMembers)
  if (recommendations.length === 0) return null

  return (
    <div
      style={{
        borderRadius: '1rem',
        border: '1px solid rgba(0,0,0,0.06)',
        background: '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Card header ── */}
      <div
        style={{
          padding: '0.875rem 1.25rem',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f97316"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4l3 3"/>
        </svg>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0d1f35' }}>
            {roundName ? `${roundName} — Recommendations` : 'Action Recommendations'}
          </p>
          <p style={{ fontSize: '0.68rem', color: '#8b96a8', marginTop: '0.05rem' }}>
            Suggested next steps based on your team&apos;s ideas
          </p>
        </div>
        <span
          style={{
            flexShrink: 0,
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: 'rgba(249,115,22,0.08)',
            color: '#c2540a',
            padding: '0.2rem 0.55rem',
            borderRadius: '999px',
            border: '1px solid rgba(249,115,22,0.16)',
          }}
        >
          {recommendations.length} insight{recommendations.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Recommendations list ── */}
      <div>
        {recommendations.map((rec, i) => {
          const s = PRIORITY[rec.priority]
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                padding: '0.875rem 1.25rem',
                borderBottom:
                  i < recommendations.length - 1
                    ? '1px solid rgba(0,0,0,0.04)'
                    : 'none',
              }}
            >
              {/* Emoji icon in colored pill */}
              <div
                style={{
                  width: '2.125rem',
                  height: '2.125rem',
                  flexShrink: 0,
                  borderRadius: '0.5625rem',
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                }}
              >
                {rec.emoji}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 500,
                    color: '#0d1f35',
                    lineHeight: 1.55,
                  }}
                >
                  {rec.text}
                </p>
                {rec.detail && (
                  <p
                    style={{
                      fontSize: '0.72rem',
                      color: '#8b96a8',
                      lineHeight: 1.5,
                      marginTop: '0.2rem',
                    }}
                  >
                    {rec.detail}
                  </p>
                )}
              </div>

              {/* Priority indicator dot */}
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: s.dot,
                  flexShrink: 0,
                  marginTop: '0.4375rem',
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
