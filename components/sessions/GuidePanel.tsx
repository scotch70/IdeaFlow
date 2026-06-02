'use client'

/**
 * GuidePanel — the right rail.
 *
 * Three visible states:
 *   1. Collapsed (~56px)  — vertical icon strip with the chevron + Add Card
 *      + Selected Card icons. Tooltips name each control. Click any icon to
 *      expand back to the matching mode.
 *   2. Expanded, no card selected — "Add a card" form:
 *      Step 1 — pick a type (chips + Custom)
 *      Step 2 — fill in Title / Details (and a Type name when Custom)
 *      One "Add card" button creates the card on the canvas.
 *   3. Expanded, card selected — Edit mode: Type / Custom label / Title /
 *      Details / Priority + Duplicate + Delete + "Back to guide".
 *
 * Collapsed state is persisted to localStorage by the parent workspace
 * (key: ideaflow:sessionsGuideCollapsed) and passed in as a prop.
 *
 * The previous "click a type → card pops onto canvas" pattern is gone. Now
 * card creation is a deliberate two-step act, but type chips remember the
 * last pick so power users still feel fast.
 */

import { useEffect, useState } from 'react'
import { cardChipLabel, CARD_TYPES_ORDERED, CARD_TYPE_META } from '@/lib/sessions/cardTypes'
import type { SessionTemplate, StepGuide } from '@/lib/sessions/templates'
import type { CardType, SessionCard, SessionMember, StepKey } from '@/types/sessions'

interface Props {
  mode:       'step' | 'card'
  collapsed:  boolean
  stepKey:    StepKey
  guide:      StepGuide
  /** Used to read template-level flags like `hideAddCardForm` (Brainstorm Circle). */
  template:   SessionTemplate

  // Card-mode props
  selectedCard:    SessionCard | null
  members:         Record<string, SessionMember>
  onDeselect:      () => void
  onChangeCardType:        (id: string, type: CardType, customLabel?: string | null) => void
  onChangeCardCustomLabel: (id: string, label: string) => void
  onChangeCardText:        (id: string, patch: { title?: string; content?: string }) => void
  onTogglePriority:        (id: string) => void
  onDuplicateCard:         (id: string) => void
  onDeleteCard:            (id: string) => void

  // Add-form
  onCreateCard:     (args: { type: CardType; title: string; content: string; customLabel?: string }) => void

  // Panel controls
  onToggleCollapse: () => void
}

// ─────────────────────────────────────────────────────────────────────────────

export default function GuidePanel(props: Props) {
  // Collapsed = vertical icon strip. Clicking the Add or Selected icon
  // expands and switches to the relevant mode in one click.
  if (props.collapsed) {
    return <CollapsedRail {...props} />
  }

  return (
    <aside
      style={{
        background: '#fff',
        borderLeft: '1px solid rgba(0,0,0,0.06)',
        padding: '0.85rem 0.95rem 1.1rem',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        minHeight: 0,
      }}
    >
      {/* Panel header — title + collapse chevron + optional Back-to-guide */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
        <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8' }}>
          {props.mode === 'card' ? 'Edit card' : 'Add a card'}
        </p>
        <span style={{ flex: 1 }} />
        {props.mode === 'card' && (
          <button
            type="button"
            onClick={props.onDeselect}
            aria-label="Back to add a card"
            style={{
              fontSize: '0.68rem', fontWeight: 700,
              background: 'transparent', border: 'none',
              color: '#94a3b8', cursor: 'pointer',
              padding: '0.2rem 0.4rem', borderRadius: '0.35rem',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            ← Back
          </button>
        )}
        <CollapseButton onClick={props.onToggleCollapse} collapsed={false} />
      </div>

      {props.mode === 'card' && props.selectedCard
        ? <CardEditor {...props} selectedCard={props.selectedCard} />
        : props.template.hideAddCardForm
          ? <InstructionsView template={props.template} />
          : <AddCardForm {...props} />}
    </aside>
  )
}

// ─── Collapsed rail ──────────────────────────────────────────────────────────
function CollapsedRail(props: Props) {
  return (
    <aside
      style={{
        background: '#fff',
        borderLeft: '1px solid rgba(0,0,0,0.06)',
        padding: '0.85rem 0.4rem',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '0.5rem',
        overflowY: 'auto',
        minHeight: 0,
      }}
    >
      <CollapseButton onClick={props.onToggleCollapse} collapsed />
      <div style={{ height: '0.4rem' }} aria-hidden />

      <RailIconButton
        label={props.selectedCard ? 'Edit selected card' : 'Add a card'}
        active
        onClick={props.onToggleCollapse}
      >
        {props.selectedCard ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </RailIconButton>

      <div style={{ flex: 1 }} />

      <p
        style={{
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#b8c0ce',
          padding: '0.4rem 0',
        }}
      >
        Guide
      </p>
    </aside>
  )
}

// ─── Add card form (expanded, no card selected) ──────────────────────────────
function AddCardForm({
  stepKey, guide, onCreateCard,
}: Props) {
  // Remember the last type so power users don't have to re-pick every time.
  const [type, setType]               = useState<CardType>(guide.suggested[0] ?? 'idea')
  const [customLabel, setCustomLabel] = useState('')
  const [title, setTitle]             = useState('')
  const [content, setContent]         = useState('')
  const [error, setError]             = useState('')

  // When the user navigates to a step whose suggested types differ, prefer
  // the first suggested type — keeps the form aligned with the framework.
  // Don't override if they've already started typing.
  useEffect(() => {
    if (title.trim() || content.trim()) return
    const next = guide.suggested[0]
    if (next && next !== type) setType(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (type === 'custom' && !customLabel.trim()) {
      setError('Give your custom type a name first.')
      return
    }
    if (!title.trim()) {
      setError('Add a short title.')
      return
    }
    onCreateCard({
      type,
      title:       title.trim(),
      content:     content.trim(),
      customLabel: type === 'custom' ? customLabel.trim() : undefined,
    })
    // Reset the title + content; keep the type so the user can add another
    // similar card without re-picking.
    setTitle('')
    setContent('')
    setError('')
  }

  const suggested = new Set<CardType>(guide.suggested)
  const orderedTypes = CARD_TYPES_ORDERED   // 'custom' is appended at the end

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Step framing — keeps the user grounded in the framework's current step */}
      <div>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8', marginBottom: '0.25rem' }}>
          Step · {stepKey}
        </p>
        <p style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
          {guide.title}
        </p>
        <p style={{ fontSize: '0.8rem', color: '#5d667a', lineHeight: 1.55, marginTop: '0.25rem' }}>
          {guide.prompt}
        </p>
      </div>

      {/* Step 1 — type */}
      <div>
        <FieldLabel n={1}>Choose type</FieldLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
          {orderedTypes.map(t => {
            const m = CARD_TYPE_META[t]
            const active = t === type
            const isSuggested = suggested.has(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setError('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.5rem',
                  borderRadius: '0.45rem',
                  border: active
                    ? `1px solid ${m.accent}`
                    : isSuggested
                      ? `1px solid ${m.accent}55`
                      : '1px solid rgba(15,23,42,0.08)',
                  background: active ? `${m.accent}18` : (isSuggested ? `${m.accent}10` : '#fff'),
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.74rem', fontWeight: active ? 700 : 600,
                  color: '#0d1f35', textAlign: 'left',
                  transition: 'background 0.1s, border-color 0.1s',
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: m.accent, flexShrink: 0 }} />
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2 — details (custom name appears when type='custom') */}
      <div>
        <FieldLabel n={2}>Add details</FieldLabel>
        {type === 'custom' && (
          <div style={{ marginBottom: '0.55rem' }}>
            <SubLabel>Type name</SubLabel>
            <input
              value={customLabel}
              onChange={e => { setCustomLabel(e.target.value); setError('') }}
              placeholder="e.g. Opportunity, Competitor, Assumption…"
              maxLength={40}
              style={inputStyle}
            />
          </div>
        )}
        <SubLabel>Title</SubLabel>
        <input
          value={title}
          onChange={e => { setTitle(e.target.value); setError('') }}
          placeholder="Short headline for this card"
          style={inputStyle}
        />
        <SubLabel style={{ marginTop: '0.55rem' }}>Details (optional)</SubLabel>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="A line or two of context"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '4rem' }}
        />
      </div>

      {error && (
        <p style={{ fontSize: '0.75rem', color: '#b91c1c' }}>{error}</p>
      )}

      <button
        type="submit"
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
          background: '#0d1f35', color: '#fff',
          fontSize: '0.85rem', fontWeight: 700,
          padding: '0.6rem 0.95rem', borderRadius: '0.55rem',
          border: 'none', cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(13,31,53,0.18)',
        }}
      >
        + Add card
      </button>

      <p style={{ fontSize: '0.7rem', color: '#9faab8', textAlign: 'center', marginTop: '-0.25rem' }}>
        Collapse panels for more canvas space.
      </p>
    </form>
  )
}

// ─── Card editor (expanded, card selected) ───────────────────────────────────
function CardEditor({
  selectedCard, members,
  onChangeCardType, onChangeCardCustomLabel, onChangeCardText,
  onTogglePriority, onDuplicateCard, onDeleteCard,
}: Props & { selectedCard: SessionCard }) {
  const meta    = CARD_TYPE_META[selectedCard.type]
  const owner   = selectedCard.created_by ? members[selectedCard.created_by] : null
  const starred = selectedCard.priority > 0

  return (
    <div>
      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: meta.accent, letterSpacing: '-0.01em', marginBottom: '0.15rem' }}>
        {cardChipLabel(selectedCard)}
      </p>
      <p style={{ fontSize: '0.72rem', color: '#9faab8', marginBottom: '0.95rem' }}>
        Editing one card. Click empty canvas to deselect.
      </p>

      {/* Type */}
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

      {/* Custom label — only when type='custom' */}
      {selectedCard.type === 'custom' && (
        <>
          <FieldLabel>Custom label</FieldLabel>
          <input
            value={selectedCard.custom_label ?? ''}
            onChange={e => onChangeCardCustomLabel(selectedCard.id, e.target.value)}
            placeholder="Opportunity, Competitor, …"
            maxLength={40}
            style={{ ...inputStyle, marginBottom: '0.65rem' }}
          />
        </>
      )}

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

      {/* Subtle metadata */}
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

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.45rem', marginTop: '1rem' }}>
        <button type="button" onClick={() => onDuplicateCard(selectedCard.id)} style={smallButton()}>
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
    </div>
  )
}

// ─── Bits ────────────────────────────────────────────────────────────────────

function FieldLabel({ children, n, style }: { children: React.ReactNode; n?: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        marginBottom: '0.4rem',
        ...style,
      }}
    >
      {n !== undefined && (
        <span
          aria-hidden
          style={{
            width: '1.05rem', height: '1.05rem', borderRadius: '999px',
            background: 'rgba(249,115,22,0.10)',
            color: '#c2540a',
            fontSize: '0.62rem', fontWeight: 800,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(249,115,22,0.22)',
          }}
        >
          {n}
        </span>
      )}
      <p
        style={{
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#9faab8',
        }}
      >
        {children}
      </p>
    </div>
  )
}

function SubLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p
      style={{
        fontSize: '0.62rem', fontWeight: 700, color: '#9faab8',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        marginBottom: '0.25rem',
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

function CollapseButton({ onClick, collapsed }: { onClick: () => void; collapsed: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={collapsed ? 'Expand guide panel' : 'Collapse guide panel'}
      title={collapsed ? 'Expand' : 'Collapse'}
      style={{
        width: '1.65rem', height: '1.65rem', borderRadius: '0.4rem',
        border: 'none', background: 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#94a3b8',
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.06)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <svg
        width="13" height="13" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 0.18s' }}
        aria-hidden
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )
}

function RailIconButton({
  children, onClick, label, active = false,
}: {
  children: React.ReactNode
  onClick:  () => void
  label:    string
  active?:  boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(249,115,22,0.12)' : 'transparent',
        border: active ? '1px solid rgba(249,115,22,0.28)' : '1px solid rgba(15,23,42,0.08)',
        color: active ? '#c2540a' : '#5d667a',
        cursor: 'pointer',
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(15,23,42,0.05)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
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

// ─── Instructions view (Brainstorm Circle, no card selected) ─────────────────
// Replaces the Add Card form for templates whose card set is pre-seeded.
// The user shouldn't be adding arbitrary cards — they should be editing the
// admin topic, then asking members to fill in their cards.
function InstructionsView({ template }: { template: SessionTemplate }) {
  const STEPS = [
    'Edit the central admin topic.',
    'Ask members to add their input.',
    'Heart the strongest ideas.',
    'Finish and export the result.',
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <div>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8', marginBottom: '0.25rem' }}>
          {template.emoji} {template.name}
        </p>
        <p style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
          Edit the central topic, then let members add their input around it.
        </p>
        <p style={{ fontSize: '0.8rem', color: '#5d667a', lineHeight: 1.55, marginTop: '0.35rem' }}>
          {template.description}
        </p>
      </div>

      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {STEPS.map((step, i) => (
          <li
            key={step}
            style={{
              display: 'flex', gap: '0.55rem', alignItems: 'flex-start',
              fontSize: '0.82rem', color: '#3d4758', lineHeight: 1.5,
            }}
          >
            <span
              aria-hidden
              style={{
                flexShrink: 0, marginTop: '0.1rem',
                width: '1.3rem', height: '1.3rem', borderRadius: '999px',
                background: 'rgba(249,115,22,0.10)', color: '#c2540a',
                fontSize: '0.65rem', fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(249,115,22,0.22)',
              }}
            >
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <p
        style={{
          marginTop: '0.25rem',
          padding: '0.7rem 0.75rem',
          borderRadius: '0.55rem',
          background: 'rgba(15,23,42,0.03)',
          border: '1px solid rgba(15,23,42,0.06)',
          fontSize: '0.78rem', color: '#5d667a', lineHeight: 1.5,
        }}
      >
        Click any card on the canvas to edit it. Card positions are fixed —
        use <strong style={{ color: '#0d1f35' }}>Reset view</strong> in the canvas to restore the layout if needed.
      </p>
    </div>
  )
}
