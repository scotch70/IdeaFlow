'use client'

/**
 * SessionSummaryModal — shown on Finish Session and on the "Export" button.
 *
 * Delegates the actual summary rendering to SessionSummaryCard so the same
 * "Top insight / Key decision / Biggest risk / Next actions" outcome shape
 * appears here, in the sessions list, and in the markdown export — one
 * source of truth.
 *
 * Receives the full cards array and lets SessionSummaryCard derive the
 * outcomes. Callers no longer need to pre-compute problems/topIdea/etc.
 */

import { useMemo, useState } from 'react'
import type { Session, SessionCard } from '@/types/sessions'
import { getTemplate } from '@/lib/sessions/templates'
import SessionSummaryCard, { summaryMarkdown } from './SessionSummaryCard'

interface Props {
  session:        Session
  cards:          SessionCard[]
  onClose:        () => void
  /** Receives the generated markdown so the parent can persist it alongside status='finished'. */
  onMarkFinished: (summaryMarkdown: string) => void
}

export default function SessionSummaryModal({
  session, cards, onClose, onMarkFinished,
}: Props) {
  const template = getTemplate(session.template_type)
  const [copied, setCopied] = useState(false)

  const markdown = useMemo(
    () => summaryMarkdown({ title: session.title, templateName: template.name, cards }),
    [session.title, template.name, cards],
  )

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
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c2540a', marginBottom: '0.18rem' }}>
              Session outcome · {template.emoji} {template.name}
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
          <p style={{ fontSize: '0.82rem', color: '#5d667a', lineHeight: 1.55, marginBottom: '1rem' }}>
            What you should leave with — the answer to <em>“what do we do next?”</em>
          </p>
          <SessionSummaryCard cards={cards} mode="full" />
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

// ─── Bits ────────────────────────────────────────────────────────────────────

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
