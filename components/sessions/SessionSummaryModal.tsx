'use client'

/**
 * SessionSummaryModal — shown on Finish Session and on the "Export" button.
 *
 * Assembles a clean read-only summary from the cards in the session:
 *   • Problem(s)
 *   • Top idea (highest priority)
 *   • Decisions
 *   • Risks
 *   • Action plan (Task cards)
 *
 * The user can Copy the summary as Markdown (good for pasting into a doc
 * or Slack), or Mark the session as Finished which closes the modal and
 * routes back to the list.
 */

import { useMemo, useState } from 'react'
import type { Session, SessionCard } from '@/types/sessions'
import { getTemplate } from '@/lib/sessions/templates'

interface Props {
  session:        Session
  problems:       SessionCard[]
  topIdea:        SessionCard | null
  decisions:      SessionCard[]
  risks:          SessionCard[]
  tasks:          SessionCard[]
  onClose:        () => void
  /** Receives the generated markdown so the parent can persist it alongside status='finished'. */
  onMarkFinished: (summaryMarkdown: string) => void
}

export default function SessionSummaryModal({
  session, problems, topIdea, decisions, risks, tasks, onClose, onMarkFinished,
}: Props) {
  const template = getTemplate(session.template_type)
  const [copied, setCopied] = useState(false)

  const markdown = useMemo(() => {
    const lines: string[] = []
    lines.push(`# ${session.title}`)
    lines.push(`_${template.emoji} ${template.name} session — ${new Date(session.updated_at).toLocaleDateString()}_`)
    lines.push('')
    if (problems.length > 0) {
      lines.push('## Problem')
      problems.forEach(p => lines.push(`- ${formatCard(p)}`))
      lines.push('')
    }
    if (topIdea) {
      lines.push('## Best idea')
      lines.push(`- ${formatCard(topIdea)}`)
      lines.push('')
    }
    if (decisions.length > 0) {
      lines.push('## Key decisions')
      decisions.forEach(d => lines.push(`- ${formatCard(d)}`))
      lines.push('')
    }
    if (risks.length > 0) {
      lines.push('## Risks')
      risks.forEach(r => lines.push(`- ${formatCard(r)}`))
      lines.push('')
    }
    if (tasks.length > 0) {
      lines.push('## Next actions')
      tasks.forEach(t => lines.push(`- [ ] ${formatCard(t)}`))
      lines.push('')
    }
    return lines.join('\n').trim()
  }, [session, template, problems, topIdea, decisions, risks, tasks])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* ignore */ }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(6,14,38,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '40rem',
          maxHeight: '85vh',
          background: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 18px 60px rgba(6,14,38,0.32)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.15rem 1.25rem 1rem', borderBottom: '1px solid rgba(15,23,42,0.07)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8', marginBottom: '0.18rem' }}>
              Session summary
            </p>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.01em' }}>
              {session.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '2rem', height: '2rem', borderRadius: '999px',
              border: 'none', background: 'rgba(15,23,42,0.05)',
              fontSize: '1.1rem', color: '#5d667a', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '1.1rem 1.25rem 0.5rem' }}>
          <SummarySection title="Problem" cards={problems} emptyHint="No Problem cards yet." />
          <SummarySection
            title="Best idea"
            cards={topIdea ? [topIdea] : []}
            emptyHint="Star an Idea card to feature it here."
            accent
          />
          <SummarySection title="Key decisions" cards={decisions} emptyHint="No decisions captured." />
          <SummarySection title="Risks"         cards={risks}     emptyHint="No risks flagged." />
          <SummarySection title="Next actions"  cards={tasks}     emptyHint="No tasks yet — add some in the Action step." checklist />
        </div>

        {/* Footer */}
        <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid rgba(15,23,42,0.07)', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopy}
            style={footerSecondary()}
          >
            {copied ? 'Copied ✓' : 'Copy as Markdown'}
          </button>
          <span style={{ flex: 1 }} />
          <button onClick={onClose} style={footerSecondary()}>
            Keep editing
          </button>
          <button
            onClick={() => onMarkFinished(markdown)}
            style={{
              ...footerSecondary(),
              background: '#0d1f35', color: '#fff', borderColor: '#0d1f35',
            }}
          >
            Mark finished
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Bits ────────────────────────────────────────────────────────────────────

function SummarySection({
  title, cards, emptyHint, accent = false, checklist = false,
}: {
  title:      string
  cards:      SessionCard[]
  emptyHint:  string
  accent?:    boolean
  checklist?: boolean
}) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <p
        style={{
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: accent ? '#c2540a' : '#9faab8',
          marginBottom: '0.4rem',
        }}
      >
        {title}
      </p>
      {cards.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: '#9faab8', fontStyle: 'italic' }}>{emptyHint}</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {cards.map(c => (
            <li
              key={c.id}
              style={{
                background: accent ? 'rgba(249,115,22,0.06)' : 'rgba(15,23,42,0.03)',
                border: accent ? '1px solid rgba(249,115,22,0.18)' : '1px solid rgba(15,23,42,0.06)',
                borderRadius: '0.5rem',
                padding: '0.55rem 0.7rem',
                display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
              }}
            >
              {checklist && (
                <span
                  style={{
                    flexShrink: 0, marginTop: '0.15rem',
                    width: '1rem', height: '1rem',
                    border: '1px solid rgba(15,23,42,0.2)',
                    borderRadius: '0.25rem',
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1f35', lineHeight: 1.4 }}>
                  {c.title || '(untitled)'}
                </p>
                {c.content && (
                  <p style={{ fontSize: '0.77rem', color: '#5d667a', lineHeight: 1.5, marginTop: '0.18rem' }}>
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

function footerSecondary(): React.CSSProperties {
  return {
    fontSize: '0.8rem', fontWeight: 700,
    padding: '0.5rem 0.95rem',
    borderRadius: '0.5rem',
    background: '#fff', color: '#0d1f35',
    border: '1px solid rgba(15,23,42,0.12)',
    cursor: 'pointer', fontFamily: 'inherit',
  }
}

function formatCard(c: SessionCard) {
  if (!c.title && !c.content) return '(untitled)'
  if (!c.content) return c.title
  return `**${c.title}** — ${c.content}`
}
