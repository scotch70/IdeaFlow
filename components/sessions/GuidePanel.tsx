'use client'

/**
 * GuidePanel — right rail. Two modes:
 *
 *   mode="step"  — default. Shows the prompt + tips for the current step,
 *                  the Add Card grid, and the subtle AI helpers.
 *   mode="card"  — visible when a card on the canvas is selected. Shows
 *                  inline editor for Type / Title / Details / Priority,
 *                  plus subtle metadata (Created by, Last edited).
 *
 * The "subtle AI" promise: helpers live at the bottom under a small label,
 * never the headline. Headline is always the human prompt or the selected
 * card's title.
 */

import { CARD_TYPES_ORDERED, CARD_TYPE_META } from '@/lib/sessions/cardTypes'
import type { StepGuide } from '@/lib/sessions/templates'
import type { CardType, SessionCard, SessionMember, StepKey } from '@/types/sessions'

interface Props {
  mode:    'step' | 'card'
  stepKey: StepKey
  guide:   StepGuide

  // Card-mode props
  selectedCard:    SessionCard | null
  members:         Record<string, SessionMember>
  onDeselect:      () => void
  onChangeCardType: (id: string, type: CardType) => void
  onChangeCardText: (id: string, patch: { title?: string; content?: string }) => void
  onTogglePriority: (id: string) => void
  onDuplicateCard:  (id: string) => void
  onDeleteCard:     (id: string) => void

  // Step-mode props
  onAddCard:        (type: CardType) => void
  onSuggestAngles:  () => void
  onFindDuplicates: () => void
  onSummarize:      () => void
}

export default function GuidePanel(props: Props) {
  return (
    <aside
      style={{
        background: '#fff',
        borderLeft: '1px solid rgba(0,0,0,0.06)',
        padding: '0.95rem 0.95rem 1.1rem',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        minHeight: 0,
      }}
    >
      {/* Panel header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
        <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8' }}>
          Guide
        </p>
        {props.mode === 'card' && (
          <button
            type="button"
            onClick={props.onDeselect}
            aria-label="Close card editor"
            style={{
              fontSize: '0.7rem', fontWeight: 700,
              background: 'transparent', border: 'none',
              color: '#94a3b8', cursor: 'pointer',
              padding: '0.2rem 0.4rem', borderRadius: '0.35rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            ← Back to step
          </button>
        )}
      </div>

      {props.mode === 'card' && props.selectedCard
        ? <CardEditor {...props} selectedCard={props.selectedCard} />
        : <StepGuideView {...props} />}
    </aside>
  )
}

// ─── Step guide mode ─────────────────────────────────────────────────────────
function StepGuideView({
  stepKey, guide, onAddCard, onSuggestAngles, onFindDuplicates, onSummarize,
}: Props) {
  const suggested = new Set<CardType>(guide.suggested)
  const orderedTypes: CardType[] = [
    ...CARD_TYPES_ORDERED.filter(t => suggested.has(t)),
    ...CARD_TYPES_ORDERED.filter(t => !suggested.has(t)),
  ]

  return (
    <>
      <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8', marginBottom: '0.3rem' }}>
        Step · {stepKey}
      </p>
      <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.01em', marginBottom: '0.45rem', lineHeight: 1.3 }}>
        {guide.title}
      </h2>
      <p style={{ fontSize: '0.85rem', color: '#3d4758', lineHeight: 1.55, marginBottom: '0.95rem' }}>
        {guide.prompt}
      </p>

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

      {/* AI helpers — subtle, bottom */}
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
    </>
  )
}

// ─── Card editor mode ────────────────────────────────────────────────────────
function CardEditor({
  selectedCard, members,
  onChangeCardType, onChangeCardText, onTogglePriority,
  onDuplicateCard, onDeleteCard,
}: Props & { selectedCard: SessionCard }) {
  const meta   = CARD_TYPE_META[selectedCard.type]
  const owner  = selectedCard.created_by ? members[selectedCard.created_by] : null
  const starred = selectedCard.priority > 0

  return (
    <>
      <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: meta.accent, marginBottom: '0.3rem' }}>
        Edit card
      </p>

      {/* Type selector */}
      <FieldLabel>Type</FieldLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', marginBottom: '0.85rem' }}>
        {CARD_TYPES_ORDERED.map(t => {
          const m = CARD_TYPE_META[t]
          const active = t === selectedCard.type
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChangeCardType(selectedCard.id, t)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.35rem 0.45rem',
                borderRadius: '0.4rem',
                border: active ? `1px solid ${m.accent}` : '1px solid rgba(15,23,42,0.08)',
                background: active ? `${m.accent}14` : '#fff',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.72rem', fontWeight: active ? 700 : 600,
                color: '#0d1f35', textAlign: 'left',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: m.accent, flexShrink: 0 }} />
              {m.label}
            </button>
          )
        })}
      </div>

      {/* Title */}
      <FieldLabel>Title</FieldLabel>
      <input
        value={selectedCard.title}
        onChange={e => onChangeCardText(selectedCard.id, { title: e.target.value })}
        placeholder={meta.hint}
        style={inputStyle}
      />

      {/* Details */}
      <FieldLabel style={{ marginTop: '0.65rem' }}>Details</FieldLabel>
      <textarea
        value={selectedCard.content ?? ''}
        onChange={e => onChangeCardText(selectedCard.id, { content: e.target.value })}
        placeholder="Add detail (optional)"
        rows={4}
        style={{ ...inputStyle, resize: 'vertical', minHeight: '4.5rem' }}
      />

      {/* Priority */}
      <FieldLabel style={{ marginTop: '0.65rem' }}>Priority</FieldLabel>
      <button
        type="button"
        onClick={() => onTogglePriority(selectedCard.id)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.78rem', fontWeight: 600,
          padding: '0.4rem 0.65rem', borderRadius: '0.4rem',
          background: starred ? 'rgba(251,191,36,0.12)' : '#fff',
          border: starred ? '1px solid rgba(251,191,36,0.45)' : '1px solid rgba(15,23,42,0.10)',
          color: starred ? '#b45309' : '#3d4758',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24"
          fill={starred ? '#f59e0b' : 'none'}
          stroke={starred ? '#f59e0b' : 'currentColor'}
          strokeWidth="2" strokeLinejoin="round">
          <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" />
        </svg>
        {starred ? 'Starred — high priority' : 'Mark as priority'}
      </button>

      {/* Created by + last edited — subtle metadata */}
      <div
        style={{
          marginTop: '1rem',
          padding: '0.6rem 0.7rem',
          borderRadius: '0.55rem',
          background: 'rgba(15,23,42,0.025)',
          border: '1px solid rgba(15,23,42,0.06)',
          fontSize: '0.7rem', color: '#5d667a', lineHeight: 1.5,
        }}
      >
        <MetaRow label="Created by" value={
          owner
            ? `${owner.fullName ?? 'Member'} · ${owner.role === 'admin' ? 'Admin' : 'Member'}`
            : 'Unknown'
        } />
        <MetaRow label="Created"    value={formatTime(selectedCard.created_at)} />
        <MetaRow label="Last edited" value={formatTime(selectedCard.updated_at)} />
      </div>

      {/* Bottom actions */}
      <div style={{ display: 'flex', gap: '0.45rem', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => onDuplicateCard(selectedCard.id)}
          style={smallButton()}
        >
          Duplicate
        </button>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => onDeleteCard(selectedCard.id)}
          style={{
            ...smallButton(),
            background: 'rgba(220,38,38,0.06)',
            color: '#b91c1c',
            border: '1px solid rgba(220,38,38,0.22)',
          }}
        >
          Delete
        </button>
      </div>
    </>
  )
}

// ─── Bits ────────────────────────────────────────────────────────────────────

function FieldLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p
      style={{
        fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#9faab8',
        marginBottom: '0.3rem',
        ...style,
      }}
    >
      {children}
    </p>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.15rem' }}>
      <span style={{ color: '#9faab8', fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#3d4758', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  fontSize: '0.85rem', color: '#0d1f35',
  background: '#fff',
  border: '1px solid rgba(15,23,42,0.12)',
  borderRadius: '0.45rem',
  padding: '0.5rem 0.6rem',
  outline: 'none', fontFamily: 'inherit',
  lineHeight: 1.4,
}

function smallButton(): React.CSSProperties {
  return {
    fontSize: '0.76rem', fontWeight: 700,
    background: '#fff', color: '#0d1f35',
    border: '1px solid rgba(15,23,42,0.12)',
    borderRadius: '0.4rem',
    padding: '0.42rem 0.7rem',
    cursor: 'pointer', fontFamily: 'inherit',
  }
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

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}
