/**
 * SessionSummaryCard — the "I know what to do next" surface.
 *
 * Given a session's cards, this component derives four outcomes that always
 * make sense to the reader, even if some are empty:
 *   • Top Insight   — highest-priority Idea (or first Idea if none starred)
 *   • Key Decision  — first Decision card
 *   • Biggest Risk  — first Risk card (or worst Pain Point if no Risk)
 *   • Next Actions  — every Task card, in card order
 *
 * Each section has a graceful empty state so a freeform session that didn't
 * use a particular card type doesn't render a broken block.
 *
 * Two visual variants:
 *   • `mode="full"`     used inside the Finish modal and exports — full sections
 *   • `mode="compact"`  used in the session list — a single line per outcome
 *
 * Server-component-safe: no hooks, no state, just data → JSX.
 *
 * The corresponding markdown is exported by `summaryMarkdown()` so callers can
 * Copy-to-clipboard or persist a snapshot to sessions.summary on Finish.
 */

import type { SessionCard } from '@/types/sessions'

export interface SessionOutcomes {
  topInsight:   SessionCard | null
  keyDecision:  SessionCard | null
  biggestRisk:  SessionCard | null
  nextActions:  SessionCard[]
}

/** Derive the four outcomes from a raw card list. Deterministic + pure. */
export function deriveOutcomes(cards: SessionCard[]): SessionOutcomes {
  const ideas      = cards.filter(c => c.type === 'idea')
  const decisions  = cards.filter(c => c.type === 'decision')
  const risks      = cards.filter(c => c.type === 'risk')
  const pains      = cards.filter(c => c.type === 'pain')
  const tasks      = cards.filter(c => c.type === 'task')

  // Highest priority Idea, falling back to the first idea added.
  const topInsight = ideas.length === 0
    ? null
    : ([...ideas].sort((a, b) => b.priority - a.priority)[0] ?? null)

  // Risks take precedence; if none, surface the worst pain so the user still
  // sees a "watch out" signal.
  const biggestRisk = risks[0] ?? pains[0] ?? null

  return {
    topInsight,
    keyDecision: decisions[0] ?? null,
    biggestRisk,
    nextActions: tasks,
  }
}

/** Markdown export — used by Copy-as-Markdown and persisted on Finish. */
export function summaryMarkdown(args: { title: string; templateName: string; cards: SessionCard[] }): string {
  const { topInsight, keyDecision, biggestRisk, nextActions } = deriveOutcomes(args.cards)
  const lines: string[] = []
  lines.push(`# ${args.title}`)
  lines.push(`_${args.templateName} session_`)
  lines.push('')
  lines.push('## Top insight')
  lines.push(topInsight ? formatCard(topInsight) : '_No ideas captured._')
  lines.push('')
  lines.push('## Key decision')
  lines.push(keyDecision ? formatCard(keyDecision) : '_No decision yet._')
  lines.push('')
  lines.push('## Biggest risk')
  lines.push(biggestRisk ? formatCard(biggestRisk) : '_No risks flagged._')
  lines.push('')
  lines.push('## Next actions')
  if (nextActions.length === 0) {
    lines.push('_No tasks yet._')
  } else {
    nextActions.forEach(t => lines.push(`- [ ] ${formatCard(t)}`))
  }
  return lines.join('\n').trim()
}

function formatCard(c: SessionCard) {
  if (!c.title && !c.content) return '(untitled)'
  if (!c.content) return c.title
  return `**${c.title}** — ${c.content}`
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  cards:        SessionCard[]
  mode?:        'full' | 'compact'
  /** Show a brand header at the top (used in the Finish modal). */
  showHeader?:  boolean
}

export default function SessionSummaryCard({ cards, mode = 'full', showHeader = false }: Props) {
  const outcomes = deriveOutcomes(cards)

  if (mode === 'compact') {
    return (
      <div
        style={{
          display: 'flex', flexDirection: 'column', gap: '0.35rem',
          padding: '0.65rem 0.75rem',
          background: 'rgba(15,23,42,0.025)',
          border: '1px solid rgba(15,23,42,0.06)',
          borderRadius: '0.55rem',
          fontSize: '0.78rem',
        }}
      >
        <CompactRow label="Top insight"  card={outcomes.topInsight}  />
        <CompactRow label="Key decision" card={outcomes.keyDecision} />
        <CompactRow label="Biggest risk" card={outcomes.biggestRisk} />
        <CompactRow
          label="Next actions"
          fallback={outcomes.nextActions.length === 0 ? null : `${outcomes.nextActions.length} task${outcomes.nextActions.length === 1 ? '' : 's'}`}
        />
      </div>
    )
  }

  return (
    <div>
      {showHeader && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c2540a', marginBottom: '0.25rem' }}>
            Session outcome
          </p>
          <p style={{ fontSize: '0.85rem', color: '#5d667a', lineHeight: 1.55 }}>
            What you should leave with — the answer to <em>“what do we do next?”</em>
          </p>
        </div>
      )}

      <OutcomeSection
        label="Top insight"
        accent
        card={outcomes.topInsight}
        emptyHint="Star an Idea card to feature it here."
      />
      <OutcomeSection
        label="Key decision"
        card={outcomes.keyDecision}
        emptyHint="Add a Decision card to lock the path in."
      />
      <OutcomeSection
        label="Biggest risk"
        card={outcomes.biggestRisk}
        emptyHint="No risks flagged — consider adding one before shipping."
      />
      <OutcomeListSection
        label="Next actions"
        cards={outcomes.nextActions}
        emptyHint="No tasks yet — add some in the Action plan step."
      />
    </div>
  )
}

// ─── Section blocks ──────────────────────────────────────────────────────────

function OutcomeSection({
  label, card, emptyHint, accent = false,
}: {
  label:     string
  card:      SessionCard | null
  emptyHint: string
  accent?:   boolean
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p
        style={{
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: accent ? '#c2540a' : '#9faab8',
          marginBottom: '0.4rem',
        }}
      >
        {label}
      </p>
      {card ? (
        <div
          style={{
            background: accent ? 'rgba(249,115,22,0.06)' : 'rgba(15,23,42,0.03)',
            border: accent ? '1px solid rgba(249,115,22,0.18)' : '1px solid rgba(15,23,42,0.06)',
            borderRadius: '0.5rem',
            padding: '0.6rem 0.75rem',
          }}
        >
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1f35', lineHeight: 1.4 }}>
            {card.title || '(untitled)'}
          </p>
          {card.content && (
            <p style={{ fontSize: '0.78rem', color: '#5d667a', lineHeight: 1.5, marginTop: '0.18rem' }}>
              {card.content}
            </p>
          )}
        </div>
      ) : (
        <p style={{ fontSize: '0.78rem', color: '#9faab8', fontStyle: 'italic' }}>
          {emptyHint}
        </p>
      )}
    </div>
  )
}

function OutcomeListSection({
  label, cards, emptyHint,
}: {
  label:     string
  cards:     SessionCard[]
  emptyHint: string
}) {
  return (
    <div>
      <p
        style={{
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#9faab8', marginBottom: '0.4rem',
        }}
      >
        {label}
      </p>
      {cards.length === 0 ? (
        <p style={{ fontSize: '0.78rem', color: '#9faab8', fontStyle: 'italic' }}>{emptyHint}</p>
      ) : (
        <ul
          style={{
            listStyle: 'none', padding: 0, margin: 0,
            display: 'flex', flexDirection: 'column', gap: '0.4rem',
          }}
        >
          {cards.map(c => (
            <li
              key={c.id}
              style={{
                background: 'rgba(15,23,42,0.03)',
                border: '1px solid rgba(15,23,42,0.06)',
                borderRadius: '0.5rem',
                padding: '0.55rem 0.7rem',
                display: 'flex', gap: '0.55rem', alignItems: 'flex-start',
              }}
            >
              <span
                aria-hidden
                style={{
                  flexShrink: 0, marginTop: '0.18rem',
                  width: '1rem', height: '1rem',
                  border: '1px solid rgba(15,23,42,0.2)',
                  borderRadius: '0.25rem',
                }}
              />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0d1f35', lineHeight: 1.4 }}>
                  {c.title || '(untitled)'}
                </p>
                {c.content && (
                  <p style={{ fontSize: '0.78rem', color: '#5d667a', lineHeight: 1.5, marginTop: '0.18rem' }}>
                    {c.content}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CompactRow({
  label, card, fallback,
}: {
  label:     string
  card?:     SessionCard | null
  fallback?: string | null
}) {
  const value = card ? (card.title || '(untitled)') : (fallback ?? null)
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
      <span style={{ flexShrink: 0, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9faab8', minWidth: '6rem' }}>
        {label}
      </span>
      <span
        style={{
          flex: 1, minWidth: 0,
          color: value ? '#3d4758' : '#b8c0ce',
          fontStyle: value ? 'normal' : 'italic',
          fontSize: '0.78rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
      >
        {value ?? '—'}
      </span>
    </div>
  )
}
