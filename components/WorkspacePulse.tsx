'use client'

// ─────────────────────────────────────────────────────────────────────────────
// WorkspacePulse — live intelligence strip shown to paid-plan admins.
//
// Surfaces four "alive" signals derived purely from idea data:
//   1. Momentum  — how active this week vs overall flow
//   2. Participation — % of team who contributed
//   3. Hot topic — most discussed keyword (frequency × likes weighted)
//   4. Top idea — highest-voted idea title
//
// Free plan: returns null (no teaser, no gate — kept clean).
// When ideas.length === 0: returns null (no ghost state).
//
// Future: swap algorithmic signals for AI-generated ones via /api/ai/pulse
// ─────────────────────────────────────────────────────────────────────────────

interface PulseIdea {
  title: string
  description?: string | null
  created_at: string
  likes_count: number
}

interface WorkspacePulseProps {
  ideas: PulseIdea[]
  ideasThisWeek: number
  activeMembers: number
  memberCount: number
  isPaidPlan: boolean
}

// ── Weighted hot-topic extraction ─────────────────────────────────────────────
const PULSE_STOP_WORDS = new Set([
  'the','and','for','that','this','with','from','have','been','are','was','were',
  'not','but','they','will','would','could','should','more','also','some','into',
  'when','how','what','just','like','very','can','make','need','want','use','add',
  'get','has','than','our','their','its','about','which','out','new','all','each',
  'both','such','here','there','give','take','used','good','better','best','work',
])

function getHotTopic(ideas: PulseIdea[]): string | null {
  if (ideas.length < 2) return null
  const freq: Record<string, number> = {}
  for (const idea of ideas) {
    const text = (idea.title + ' ' + (idea.description ?? ''))
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
    const weight = 1 + Math.min(idea.likes_count, 5) * 0.3
    for (const word of text.split(/\s+/)) {
      if (word.length >= 5 && !PULSE_STOP_WORDS.has(word)) {
        freq[word] = (freq[word] ?? 0) + weight
      }
    }
  }
  const entries = Object.entries(freq).sort(([, a], [, b]) => b - a)
  if (entries.length === 0) return null
  const [word] = entries[0]
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function getMomentum(ideasThisWeek: number): { text: string; positive: boolean } {
  if (ideasThisWeek >= 5) return { text: `${ideasThisWeek} ideas this week — high momentum`, positive: true }
  if (ideasThisWeek >= 2) return { text: `${ideasThisWeek} ideas this week`, positive: true }
  if (ideasThisWeek === 1) return { text: '1 idea this week — keep going', positive: true }
  return { text: 'No new ideas this week', positive: false }
}

// ── PulseItem ─────────────────────────────────────────────────────────────────

function PulseItem({
  icon,
  label,
  value,
  positive = true,
}: {
  icon: React.ReactNode
  label: string
  value: string
  positive?: boolean
}) {
  const accentColor = positive ? '#059669' : '#f97316'
  const bgColor     = positive ? 'rgba(16,185,129,0.07)' : 'rgba(249,115,22,0.07)'
  const borderColor = positive ? 'rgba(16,185,129,0.16)' : 'rgba(249,115,22,0.16)'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        minWidth: 0,
        flex: '1 1 180px',
      }}
    >
      <div
        style={{
          width: '2rem',
          height: '2rem',
          flexShrink: 0,
          borderRadius: '0.5rem',
          background: bgColor,
          border: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.68rem',
            color: '#8b96a8',
            lineHeight: 1,
            marginBottom: '0.175rem',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#0d1f35',
            lineHeight: 1.35,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '200px',
          }}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

// ── SVG icon helpers ──────────────────────────────────────────────────────────

const TrendUpIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
)

const TeamIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const TopicIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const HeartIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

// ── Main component ────────────────────────────────────────────────────────────

export default function WorkspacePulse({
  ideas,
  ideasThisWeek,
  activeMembers,
  memberCount,
  isPaidPlan,
}: WorkspacePulseProps) {
  if (!isPaidPlan || ideas.length === 0) return null

  const hotTopic = getHotTopic(ideas)
  const momentum = getMomentum(ideasThisWeek)
  const participationRate = Math.round((activeMembers / Math.max(memberCount, 1)) * 100)
  const topIdea = ideas.length > 0
    ? [...ideas].sort((a, b) => b.likes_count - a.likes_count)[0]
    : null

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        borderRadius: '0.875rem',
        border: '1px solid rgba(16,185,129,0.14)',
        background: 'rgba(16,185,129,0.025)',
        padding: '0.875rem 1.125rem',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.875rem',
        }}
      >
        <span
          className="pulse-dot"
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10b981',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <p
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: '#065f46',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Workspace Pulse
        </p>
      </div>

      {/* Pulse items */}
      <div className="workspace-pulse-items">
        {/* Momentum */}
        <PulseItem
          icon={TrendUpIcon}
          label="This week"
          value={momentum.text}
          positive={momentum.positive}
        />

        {/* Participation */}
        <PulseItem
          icon={TeamIcon}
          label="Team participation"
          value={`${participationRate}% · ${activeMembers} of ${memberCount} members`}
          positive={participationRate >= 50}
        />

        {/* Hot topic */}
        {hotTopic && (
          <PulseItem
            icon={TopicIcon}
            label="Hot topic"
            value={hotTopic}
            positive={true}
          />
        )}

        {/* Top idea */}
        {topIdea && topIdea.likes_count > 0 && (
          <PulseItem
            icon={HeartIcon}
            label={`Most liked · ${topIdea.likes_count} votes`}
            value={
              topIdea.title.length > 42
                ? topIdea.title.slice(0, 39) + '…'
                : topIdea.title
            }
            positive={true}
          />
        )}
      </div>
    </div>
  )
}
