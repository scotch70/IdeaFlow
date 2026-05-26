'use client'

/**
 * GuidePanel — right rail with prompt + tips + Add Card + subtle AI helpers.
 *
 * "Subtle AI" means: secondary styling, lives at the bottom under a small
 * label, not the headline of the panel. The headline is the human prompt.
 */

import { CARD_TYPES_ORDERED, CARD_TYPE_META } from '@/lib/sessions/cardTypes'
import type { StepGuide } from '@/lib/sessions/templates'
import type { CardType, StepKey } from '@/types/sessions'

interface Props {
  stepKey:          StepKey
  guide:            StepGuide
  onAddCard:        (type: CardType) => void
  onSuggestAngles:  () => void
  onFindDuplicates: () => void
  onSummarize:      () => void
}

export default function GuidePanel({
  stepKey, guide, onAddCard, onSuggestAngles, onFindDuplicates, onSummarize,
}: Props) {
  const suggested = new Set<CardType>(guide.suggested)
  // Sort: suggested types first, then the rest in default order.
  const orderedTypes: CardType[] = [
    ...CARD_TYPES_ORDERED.filter(t => suggested.has(t)),
    ...CARD_TYPES_ORDERED.filter(t => !suggested.has(t)),
  ]

  return (
    <aside
      style={{
        background: '#fff',
        borderLeft: '1px solid rgba(0,0,0,0.06)',
        padding: '1rem 0.95rem 1.25rem',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        minHeight: 0,
      }}
    >
      {/* Step header */}
      <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8', marginBottom: '0.3rem' }}>
        Step · {stepKey}
      </p>
      <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.01em', marginBottom: '0.45rem', lineHeight: 1.3 }}>
        {guide.title}
      </h2>
      <p style={{ fontSize: '0.85rem', color: '#3d4758', lineHeight: 1.55, marginBottom: '0.95rem' }}>
        {guide.prompt}
      </p>

      {/* Tips */}
      {guide.tips.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {guide.tips.map(t => (
            <li
              key={t}
              style={{
                display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                fontSize: '0.78rem', color: '#5d667a', lineHeight: 1.5,
              }}
            >
              <span style={{ flexShrink: 0, marginTop: '0.45rem', width: '4px', height: '4px', borderRadius: '50%', background: '#c8d6e5' }} />
              {t}
            </li>
          ))}
        </ul>
      )}

      {/* Add Card section */}
      <div
        style={{
          padding: '0.85rem 0.85rem 0.95rem',
          borderRadius: '0.7rem',
          background: 'rgba(15,23,42,0.025)',
          border: '1px solid rgba(15,23,42,0.06)',
          marginBottom: '1.1rem',
        }}
      >
        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#5d667a', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.55rem' }}>
          Add a card
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
          {orderedTypes.map(t => {
            const meta = CARD_TYPE_META[t]
            const isSuggested = suggested.has(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => onAddCard(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.5rem',
                  borderRadius: '0.45rem',
                  border: isSuggested
                    ? `1px solid ${meta.accent}55`
                    : '1px solid rgba(15,23,42,0.08)',
                  background: isSuggested ? `${meta.accent}10` : '#fff',
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.74rem', fontWeight: 600,
                  color: '#0d1f35', textAlign: 'left',
                  transition: 'background 0.1s, border-color 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${meta.accent}18` }}
                onMouseLeave={e => { e.currentTarget.style.background = isSuggested ? `${meta.accent}10` : '#fff' }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: meta.accent, flexShrink: 0 }} />
                {meta.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* AI helpers — subtle. Bottom, smaller text, secondary styling. */}
      <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
        <p style={{ fontSize: '0.58rem', fontWeight: 700, color: '#9faab8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#c2540a' }}>✦</span>
          AI helpers — optional
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
          <AIHelperButton onClick={onSuggestAngles}>Suggest 3 angles</AIHelperButton>
          <AIHelperButton onClick={onFindDuplicates}>Find duplicates</AIHelperButton>
          <AIHelperButton onClick={onSummarize}>Summarize session</AIHelperButton>
        </div>
      </div>
    </aside>
  )
}

function AIHelperButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        width: '100%', textAlign: 'left',
        padding: '0.42rem 0.55rem',
        borderRadius: '0.45rem',
        background: 'transparent',
        border: '1px solid rgba(15,23,42,0.08)',
        color: '#5d667a',
        fontSize: '0.76rem', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'background 0.1s, color 0.1s, border-color 0.1s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(249,115,22,0.05)'
        e.currentTarget.style.color = '#0d1f35'
        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = '#5d667a'
        e.currentTarget.style.borderColor = 'rgba(15,23,42,0.08)'
      }}
    >
      <span style={{ fontSize: '0.7rem', color: '#c2540a' }}>✦</span>
      {children}
    </button>
  )
}
