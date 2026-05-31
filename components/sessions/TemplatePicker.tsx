'use client'

/**
 * TemplatePicker — choose a thinking framework before starting a Session.
 *
 * Each framework card shows: icon, name, description, sample outcome, and
 * estimated time so the user knows exactly what they'll get and how long
 * it'll take. The flagship framework (Starbursting) is visually featured.
 *
 * On pick:
 *   • Creates the session via the Supabase store.
 *   • For Starbursting, also seeds the canvas with a Topic card at the
 *     centre and 6 spoke cards (Who / What / When / Where / Why / How)
 *     connected back to the topic, so the user lands on a structured
 *     starting point instead of a blank canvas.
 *   • Redirects to /dashboard/sessions/[id].
 */

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { TEMPLATES } from '@/lib/sessions/templates'
import {
  createCard, createConnection, createSession,
} from '@/lib/sessions/store'
import { trackSessionEvent } from '@/lib/analytics/sessions'
import type { CardType, SessionCard, TemplateType } from '@/types/sessions'

interface Props {
  userId:    string
  companyId: string
}

// ── Starbursting seed layout ─────────────────────────────────────────────────
// Positions arranged radially so the spokes read like a 6-petal flower around
// a central Topic card.
//
//                 WHY
//      WHO                HOW
//                Topic
//      WHERE              WHAT
//                 WHEN
//
// Numbers are absolute pixels in the canvas's pixel space — the workspace's
// clamp-on-resize effect adjusts anything that falls outside the visible area.
interface SpokeSeed {
  question:  string  // shown as the card title
  hint:      string  // shown as the card content
  type:      CardType
  x:         number
  y:         number
}

const STARBURSTING_SPOKES: SpokeSeed[] = [
  { question: 'WHY?',   hint: 'Why does this matter right now?',          type: 'cause',    x: 410, y:  30 },
  { question: 'WHO?',   hint: 'Who is this for? Who is affected?',         type: 'audience', x: 130, y: 160 },
  { question: 'HOW?',   hint: 'How will we approach it?',                  type: 'idea',     x: 690, y: 160 },
  { question: 'WHERE?', hint: 'Where does this happen? Which markets?',    type: 'idea',     x: 130, y: 380 },
  { question: 'WHAT?',  hint: 'What exactly are we building or deciding?', type: 'idea',     x: 690, y: 380 },
  { question: 'WHEN?',  hint: 'When does this happen? What\'s the deadline?', type: 'task',  x: 410, y: 500 },
]

const STARBURSTING_TOPIC = { x: 410, y: 270 }   // dead centre

// ─────────────────────────────────────────────────────────────────────────────

export default function TemplatePicker({ userId, companyId }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<TemplateType | null>(null)

  async function pick(templateType: TemplateType, name: string) {
    if (busy) return
    setBusy(templateType)
    try {
      const today = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      const session = await createSession({
        userId, companyId,
        title:        `${name} — ${today}`,
        templateType,
      })

      // Starbursting: pre-seed the canvas with a Topic card + 6 question
      // spokes connected back to it. Other frameworks land on a blank canvas
      // for now — they'll get their own seeds in future passes.
      if (templateType === 'starbursting') {
        await seedStarbursting(userId, session.id)
      }

      trackSessionEvent('session_created', {
        sessionId:    session.id,
        templateType: session.template_type,
      })

      router.push(`/dashboard/sessions/${session.id}`)
    } catch {
      setBusy(null)
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(17.5rem, 1fr))',
        gap: '0.95rem',
      }}
    >
      {TEMPLATES.map(t => {
        const isBusy     = busy === t.type
        const isFeatured = !!t.featured
        return (
          <button
            key={t.type}
            type="button"
            onClick={() => pick(t.type, t.name)}
            disabled={!!busy}
            style={{
              textAlign: 'left',
              position: 'relative',
              background: '#fff',
              border: isFeatured
                ? '1px solid rgba(249,115,22,0.30)'
                : '1px solid rgba(26,107,191,0.10)',
              borderRadius: '0.875rem',
              padding: '1.1rem 1.15rem 1rem',
              cursor: busy ? 'wait' : 'pointer',
              opacity: busy && !isBusy ? 0.5 : 1,
              transition: 'border-color 0.12s, transform 0.12s, box-shadow 0.12s',
              fontFamily: 'inherit',
              boxShadow: isFeatured
                ? '0 4px 18px rgba(249,115,22,0.10), 0 1px 3px rgba(6,14,38,0.04)'
                : '0 1px 4px rgba(6,14,38,0.03)',
            }}
            onMouseEnter={e => {
              if (busy) return
              e.currentTarget.style.borderColor = 'rgba(249,115,22,0.45)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,14,38,0.08)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = isFeatured ? 'rgba(249,115,22,0.30)' : 'rgba(26,107,191,0.10)'
              e.currentTarget.style.boxShadow = isFeatured
                ? '0 4px 18px rgba(249,115,22,0.10), 0 1px 3px rgba(6,14,38,0.04)'
                : '0 1px 4px rgba(6,14,38,0.03)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {isFeatured && (
              <span
                style={{
                  position: 'absolute', top: '0.7rem', right: '0.7rem',
                  fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#c2540a',
                  background: 'rgba(249,115,22,0.10)',
                  border: '1px solid rgba(249,115,22,0.25)',
                  borderRadius: '999px',
                  padding: '0.12rem 0.42rem',
                }}
              >
                ★ Featured
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span
                aria-hidden
                style={{
                  fontSize: '1.1rem', fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '2.1rem', height: '2.1rem', borderRadius: '0.55rem',
                  background: isFeatured ? 'rgba(249,115,22,0.10)' : 'rgba(15,23,42,0.05)',
                  border: isFeatured ? '1px solid rgba(249,115,22,0.22)' : '1px solid rgba(15,23,42,0.07)',
                  color: isFeatured ? '#c2540a' : '#3d4758',
                }}
              >
                {t.emoji}
              </span>
              <p style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.01em' }}>
                {t.name}
              </p>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#5d667a', lineHeight: 1.5, marginBottom: '0.8rem' }}>
              {t.description}
            </p>

            {/* Outcome + time — the two answers every new user needs:
                "What will I get?" and "How long will it take?"  */}
            <dl
              style={{
                margin: 0, marginBottom: '0.9rem',
                background: 'rgba(15,23,42,0.025)',
                border: '1px solid rgba(15,23,42,0.06)',
                borderRadius: '0.5rem',
                padding: '0.6rem 0.7rem 0.5rem',
                fontSize: '0.74rem', lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <dt style={{ flexShrink: 0, color: '#9faab8', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: '3.6rem', paddingTop: '0.18rem' }}>
                  Outcome
                </dt>
                <dd style={{ margin: 0, color: '#3d4758' }}>
                  {t.sampleOutcome}
                </dd>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <dt style={{ flexShrink: 0, color: '#9faab8', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: '3.6rem', paddingTop: '0.18rem' }}>
                  Time
                </dt>
                <dd style={{ margin: 0, color: '#3d4758', fontWeight: 600 }}>
                  {t.estimateMinutes > 0 ? `~${t.estimateMinutes} minutes` : 'Open-ended'}
                </dd>
              </div>
            </dl>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isBusy ? '#9faab8' : (isFeatured ? '#c2540a' : '#0d1f35') }}>
                {isBusy ? 'Creating…' : 'Start session →'}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Seed helpers ────────────────────────────────────────────────────────────

async function seedStarbursting(userId: string, sessionId: string) {
  // 1. Topic card in the centre
  const topic = await createCard({
    userId, sessionId,
    type:    'problem',
    title:   'Your topic',
    content: 'Rename this card to the topic you want to explore.',
    x:       STARBURSTING_TOPIC.x,
    y:       STARBURSTING_TOPIC.y,
  })

  // 2. 6 spoke cards
  const spokes: SessionCard[] = []
  for (const s of STARBURSTING_SPOKES) {
    // eslint-disable-next-line no-await-in-loop
    const card = await createCard({
      userId, sessionId,
      type:    s.type,
      title:   s.question,
      content: s.hint,
      x:       s.x,
      y:       s.y,
    })
    spokes.push(card)
  }

  // 3. Connect each spoke back to the topic
  for (const spoke of spokes) {
    // eslint-disable-next-line no-await-in-loop
    await createConnection({
      userId, sessionId,
      sourceId: topic.id,
      targetId: spoke.id,
    })
  }
}
