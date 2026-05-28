'use client'

/**
 * SessionCanvas — the dark drawing surface.
 *
 *   • Fixed-size container (position: relative, overflow: hidden). No scroll
 *     bars — cards are clamped to the visible rectangle by the workspace.
 *   • A ResizeObserver reports the live size up to SessionWorkspace via
 *     `onMeasure`, which drives card spawn positions, drag clamping and the
 *     "Reset view" grid layout.
 *   • Cards are absolutely positioned inside this canvas (not the page).
 *     framer-motion's `dragConstraints` keeps each card inside the box on
 *     every frame; `onPositionEnd` clamps as a final safety net.
 *   • SVG connection layer sits below cards, fat invisible hit area lets
 *     you click thin lines, hover reveals an × to delete.
 *   • A floating helper strip at the bottom explains the interactions.
 */

import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { SessionCard, SessionConnection, SessionMember } from '@/types/sessions'
import { CARD_TYPE_META } from '@/lib/sessions/cardTypes'
import { CANVAS_INSET, CARD_MIN_H, CARD_W, CanvasSize, isCanvasMeasured } from '@/lib/sessions/layout'
import { CANVAS_BG, CANVAS_BORDER, CANVAS_DOT, CANVAS_SURFACE } from './SessionWorkspace'

interface Props {
  cards:            SessionCard[]
  connections:      SessionConnection[]
  members:          Record<string, SessionMember>
  connectingFrom:   string | null
  selectedCardId:   string | null
  editingCardId:    string | null
  canvasSize:       CanvasSize

  onMeasure:          (size: CanvasSize) => void
  onSelectCard:       (id: string | null) => void
  onEditCard:         (id: string | null) => void
  onPositionEnd:      (id: string, x: number, y: number) => void
  onChangeText:       (id: string, patch: { title?: string; content?: string }) => void
  onTogglePriority:   (id: string) => void
  onDuplicate:        (id: string) => void
  onDelete:           (id: string) => void
  onStartConnect:     (id: string) => void
  onFinishConnect:    (id: string) => void
  onDeleteConnection: (id: string) => void
  onCancelConnect:    () => void
  onResetView:        () => void
}

export default function SessionCanvas({
  cards, connections, members,
  connectingFrom, selectedCardId, editingCardId,
  canvasSize, onMeasure,
  onSelectCard, onEditCard,
  onPositionEnd, onChangeText, onTogglePriority,
  onDuplicate, onDelete,
  onStartConnect, onFinishConnect, onDeleteConnection, onCancelConnect,
  onResetView,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)

  // Surface the live size up to the workspace. content-box dimensions only,
  // so the parent can clamp accurately.
  useLayoutEffect(() => {
    if (!canvasRef.current) return
    const el = canvasRef.current
    const measure = () => {
      const r = el.getBoundingClientRect()
      onMeasure({ w: r.width, h: r.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [onMeasure])

  // Clicking the empty canvas deselects + cancels any connect-in-progress.
  function handleCanvasMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return
    onSelectCard(null)
    onCancelConnect()
  }

  const cardById = new Map(cards.map(c => [c.id, c]))
  const measured = isCanvasMeasured(canvasSize)

  return (
    <div
      ref={canvasRef}
      onMouseDown={handleCanvasMouseDown}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: CANVAS_BG,
        backgroundImage: `radial-gradient(${CANVAS_DOT} 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
        backgroundPosition: '-1px -1px',
        minHeight: 0,
      }}
    >
      {/* SVG connection layer */}
      <svg
        width={canvasSize.w}
        height={canvasSize.h}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        <defs>
          <marker id="conn-arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(148,163,184,0.65)" />
          </marker>
        </defs>
        {connections.map(c => {
          const a = cardById.get(c.source_card_id)
          const b = cardById.get(c.target_card_id)
          if (!a || !b) return null
          return (
            <ConnectionPath
              key={c.id}
              ax={a.x + CARD_W / 2} ay={a.y + CARD_MIN_H / 2}
              bx={b.x + CARD_W / 2} by={b.y + CARD_MIN_H / 2}
              onDelete={() => onDeleteConnection(c.id)}
            />
          )
        })}
      </svg>

      {/* Cards. Only render after we've measured at least once — otherwise the
          dragConstraints would clamp to a zero-size box and the cards would
          all snap to (pad, pad). The empty-state placeholder still shows. */}
      {measured && cards.map(card => (
        <CardOnCanvas
          key={card.id}
          card={card}
          canvasSize={canvasSize}
          owner={card.created_by ? members[card.created_by] ?? null : null}
          isConnectSource={connectingFrom === card.id}
          isConnectTarget={connectingFrom !== null && connectingFrom !== card.id}
          isSelected={selectedCardId === card.id}
          isEditing={editingCardId === card.id}
          onSelect={onSelectCard}
          onEnterEdit={onEditCard}
          onPositionEnd={onPositionEnd}
          onChangeText={onChangeText}
          onTogglePriority={onTogglePriority}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onStartConnect={onStartConnect}
          onFinishConnect={onFinishConnect}
        />
      ))}

      {/* Empty state */}
      {cards.length === 0 && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
              Start by adding your first thought
            </p>
            <p style={{ fontSize: '0.85rem', maxWidth: '22rem' }}>
              Use the Guide panel on the right to add a card. Collapse the sidebars for more canvas space.
            </p>
          </div>
        </div>
      )}

      {/* Helper strip — always-visible interaction hint. Absolutely positioned
          so it overlays the bottom of the canvas without consuming layout. */}
      <div
        style={{
          position: 'absolute',
          bottom: 12, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          padding: '0 1rem',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15,23,42,0.78)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '999px',
            padding: '0.4rem 0.85rem',
            color: 'rgba(255,255,255,0.78)',
            fontSize: '0.72rem',
            fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '0.55rem',
            boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
            flexWrap: 'wrap', justifyContent: 'center',
            maxWidth: '100%',
          }}
        >
          {connectingFrom ? (
            <>
              <span style={{ color: '#fbd5b5' }}>Click another card to connect</span>
              <button
                type="button"
                onClick={onCancelConnect}
                style={{
                  background: 'transparent', border: 'none',
                  color: '#cbd5e1', cursor: 'pointer',
                  fontSize: '0.72rem', fontWeight: 700,
                }}
              >Cancel (Esc)</button>
            </>
          ) : (
            <>
              <span><strong style={{ color: '#fff' }}>Double-click</strong> to edit</span>
              <Dot />
              <span><strong style={{ color: '#fff' }}>Drag</strong> to move</span>
              <Dot />
              <span><strong style={{ color: '#fff' }}>Connect</strong> to link ideas</span>
              <Dot />
              <button
                type="button"
                onClick={onResetView}
                style={{
                  background: 'transparent', border: 'none',
                  color: '#fbd5b5', cursor: 'pointer',
                  fontSize: '0.72rem', fontWeight: 700,
                  padding: 0,
                  textDecoration: 'underline', textUnderlineOffset: '2px',
                }}
              >Reset view</button>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>if cards are missing</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Dot() {
  return <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
}

// ─── Card ────────────────────────────────────────────────────────────────────

interface CardProps {
  card:              SessionCard
  owner:             SessionMember | null
  canvasSize:        CanvasSize
  isConnectSource:   boolean
  isConnectTarget:   boolean
  isSelected:        boolean
  isEditing:         boolean
  onSelect:          (id: string) => void
  onEnterEdit:       (id: string | null) => void
  onPositionEnd:     (id: string, x: number, y: number) => void
  onChangeText:      (id: string, patch: { title?: string; content?: string }) => void
  onTogglePriority:  (id: string) => void
  onDuplicate:       (id: string) => void
  onDelete:          (id: string) => void
  onStartConnect:    (id: string) => void
  onFinishConnect:   (id: string) => void
}

function CardOnCanvas({
  card, owner, canvasSize,
  isConnectSource, isConnectTarget, isSelected, isEditing,
  onSelect, onEnterEdit,
  onPositionEnd, onChangeText, onTogglePriority,
  onDuplicate, onDelete, onStartConnect, onFinishConnect,
}: CardProps) {
  const meta = CARD_TYPE_META[card.type]
  const [pos, setPos] = useState({ x: card.x, y: card.y })
  const [hover, setHover] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  // Keep the local "drag origin" in sync whenever the card's persisted
  // position changes (e.g. after Reset view or the resize-clamp effect).
  useLayoutEffect(() => { setPos({ x: card.x, y: card.y }) }, [card.id, card.x, card.y])

  // Focus title when entering edit mode.
  useLayoutEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [isEditing])

  const starred = card.priority > 0

  // Constraints in drag-offset space (relative to pos). Keeps the card body
  // inside [pad, canvas - cardSize - pad] on every frame.
  const dragLeft   = CANVAS_INSET - pos.x
  const dragRight  = Math.max(0, canvasSize.w - CARD_W     - CANVAS_INSET - pos.x)
  const dragTop    = CANVAS_INSET - pos.y
  const dragBottom = Math.max(0, canvasSize.h - CARD_MIN_H - CANVAS_INSET - pos.y)

  function handleClick(e: React.MouseEvent) {
    if (isConnectTarget) {
      e.stopPropagation()
      onFinishConnect(card.id)
      return
    }
    e.stopPropagation()
    onSelect(card.id)
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation()
    onSelect(card.id)
    onEnterEdit(card.id)
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: dragLeft, right: dragRight, top: dragTop, bottom: dragBottom }}
      onDragEnd={(_, info) => {
        // Final safety clamp on top of dragConstraints — guards against tiny
        // rounding errors leaking outside the visible area.
        const nx = pos.x + info.offset.x
        const ny = pos.y + info.offset.y
        const next = {
          x: Math.min(Math.max(nx, CANVAS_INSET), Math.max(CANVAS_INSET, canvasSize.w - CARD_W     - CANVAS_INSET)),
          y: Math.min(Math.max(ny, CANVAS_INSET), Math.max(CANVAS_INSET, canvasSize.h - CARD_MIN_H - CANVAS_INSET)),
        }
        setPos(next)
        onPositionEnd(card.id, next.x, next.y)
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute',
        top: pos.y,
        left: pos.x,
        width: CARD_W,
        minHeight: CARD_MIN_H,
        background: CANVAS_SURFACE,
        backgroundImage: `linear-gradient(180deg, ${meta.bg}, transparent 65%)`,
        border: isConnectSource
          ? '1px solid rgba(249,115,22,0.55)'
          : isSelected
            ? `1px solid ${meta.accent}`
            : isConnectTarget
              ? '1px dashed rgba(99,179,237,0.55)'
              : `1px solid ${CANVAS_BORDER}`,
        borderRadius: '0.7rem',
        padding: '0.65rem 0.75rem 0.7rem 0.9rem',
        color: '#e6ecf5',
        cursor: 'grab',
        userSelect: isEditing ? 'text' : 'none',
        boxShadow: isSelected
          ? `0 0 0 3px ${meta.accent}33, 0 6px 18px rgba(0,0,0,0.45)`
          : isConnectSource
            ? '0 0 0 4px rgba(249,115,22,0.18), 0 6px 18px rgba(0,0,0,0.45)'
            : '0 4px 18px rgba(0,0,0,0.32)',
        zIndex: isSelected ? 5 : isConnectSource ? 4 : 2,
      }}
      whileDrag={{ scale: 1.02, cursor: 'grabbing', zIndex: 10 }}
    >
      {/* Accent stripe */}
      <div
        style={{
          position: 'absolute', top: '0.7rem', bottom: '0.7rem', left: '0.35rem',
          width: '3px', borderRadius: '999px', background: meta.accent,
          opacity: 0.85,
        }}
      />

      {/* Header row: type chip + (hover) action bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
        <span
          style={{
            fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: meta.ink, background: meta.bg,
            border: `1px solid ${meta.accent}33`,
            padding: '0.12rem 0.4rem', borderRadius: '999px',
          }}
        >{meta.label}</span>
        <span style={{ flex: 1 }} />

        {(hover || isSelected) && (
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              background: 'rgba(8,12,22,0.65)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0.45rem',
              padding: '0.15rem 0.2rem',
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            <ActionIconButton
              label="Edit (double-click)"
              onClick={() => { onSelect(card.id); onEnterEdit(card.id) }}
              icon={
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              }
            />
            <ActionIconButton
              label="Connect to another card"
              active={isConnectSource}
              onClick={() => onStartConnect(card.id)}
              icon={
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07l-1.5 1.5" />
                  <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
                </svg>
              }
            />
            <ActionIconButton
              label="Duplicate"
              onClick={() => onDuplicate(card.id)}
              icon={
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                </svg>
              }
            />
            <ActionIconButton
              label={starred ? 'Lower priority' : 'Mark priority'}
              active={starred}
              onClick={() => onTogglePriority(card.id)}
              icon={
                <svg width="11" height="11" viewBox="0 0 24 24"
                  fill={starred ? '#fbbf24' : 'none'}
                  stroke={starred ? '#fbbf24' : 'currentColor'}
                  strokeWidth="2" strokeLinejoin="round">
                  <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" />
                </svg>
              }
            />
            <ActionIconButton
              label="Delete card"
              danger
              onClick={() => onDelete(card.id)}
              icon={
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              }
            />
          </div>
        )}
      </div>

      {/* Title input */}
      <input
        ref={titleRef}
        value={card.title}
        placeholder={meta.hint}
        onChange={e => onChangeText(card.id, { title: e.target.value })}
        onBlur={() => onEnterEdit(null)}
        onKeyDown={e => {
          if (e.key === 'Enter')  { e.preventDefault(); (e.target as HTMLInputElement).blur() }
          if (e.key === 'Escape') {                       (e.target as HTMLInputElement).blur() }
        }}
        onMouseDown={e => e.stopPropagation()}
        onDoubleClick={e => e.stopPropagation()}
        readOnly={!isEditing && !isSelected}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none', outline: 'none',
          color: '#f4f7fb',
          fontSize: '0.86rem', fontWeight: 700,
          letterSpacing: '-0.01em',
          padding: '0.05rem 0',
          fontFamily: 'inherit',
          cursor: isEditing ? 'text' : 'inherit',
        }}
      />

      {/* Optional content textarea */}
      <textarea
        value={card.content ?? ''}
        placeholder={isSelected ? 'Add detail (optional)' : ''}
        onChange={e => onChangeText(card.id, { content: e.target.value })}
        onMouseDown={e => e.stopPropagation()}
        onDoubleClick={e => e.stopPropagation()}
        readOnly={!isEditing && !isSelected}
        rows={2}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none', outline: 'none',
          resize: 'none',
          color: 'rgba(230,236,245,0.78)',
          fontSize: '0.76rem',
          lineHeight: 1.45,
          padding: '0.15rem 0 0',
          fontFamily: 'inherit',
          cursor: isEditing ? 'text' : 'inherit',
        }}
      />

      {/* Owner avatar + subtle role hint */}
      {owner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.45rem' }}>
          <OwnerAvatar member={owner} />
          <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
            {firstName(owner.fullName) || 'Member'} · <span style={{ color: 'rgba(255,255,255,0.32)' }}>{owner.role === 'admin' ? 'Admin' : 'Member'}</span>
          </span>
        </div>
      )}
    </motion.div>
  )
}

function ActionIconButton({
  icon, onClick, label, active = false, danger = false,
}: {
  icon: React.ReactNode
  onClick: () => void
  label: string
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onMouseDown={e => e.stopPropagation()}
      style={{
        width: '1.5rem', height: '1.5rem',
        borderRadius: '0.35rem',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(249,115,22,0.20)' : 'transparent',
        border: active ? '1px solid rgba(249,115,22,0.35)' : '1px solid transparent',
        color: danger
          ? 'rgba(252,165,165,0.85)'
          : active
            ? '#fdba74'
            : 'rgba(255,255,255,0.65)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => {
        if (active || danger) return
        e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
        e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={e => {
        if (active || danger) return
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
      }}
    >
      {icon}
    </button>
  )
}

// ── Owner avatar ─────────────────────────────────────────────────────────────
function OwnerAvatar({ member }: { member: SessionMember }) {
  const initials = getInitials(member.fullName)
  const seed = (member.fullName ?? member.id).charCodeAt(0)
  const palette = [
    'rgba(249,115,22,0.45)', 'rgba(59,130,246,0.45)', 'rgba(16,185,129,0.45)',
    'rgba(167,139,250,0.45)', 'rgba(236,72,153,0.45)', 'rgba(6,182,212,0.45)',
  ]
  const bg = palette[seed % palette.length]
  return (
    <div
      title={member.fullName ?? 'Member'}
      style={{
        width: '1.1rem', height: '1.1rem', borderRadius: '999px',
        background: bg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.55rem', fontWeight: 800, color: '#fff',
        letterSpacing: '0.02em',
        border: '1px solid rgba(255,255,255,0.10)',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  const p = name.trim().split(/\s+/)
  return p.length === 1 ? p[0][0]!.toUpperCase() : (p[0][0]! + p[p.length - 1][0]!).toUpperCase()
}

function firstName(name: string | null): string {
  if (!name) return ''
  return name.trim().split(/\s+/)[0]!
}

// ─── Connection path ─────────────────────────────────────────────────────────

function ConnectionPath({
  ax, ay, bx, by, onDelete,
}: {
  ax: number; ay: number; bx: number; by: number;
  onDelete: () => void
}) {
  const [hover, setHover] = useState(false)
  const dx = (bx - ax) * 0.45
  const path = `M ${ax} ${ay} C ${ax + dx} ${ay}, ${bx - dx} ${by}, ${bx} ${by}`
  const midX = (ax + bx) / 2
  const midY = (ay + by) / 2

  return (
    <g pointerEvents="visiblePainted">
      <path
        d={path} fill="none" stroke="transparent" strokeWidth={14}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
      />
      <path
        d={path} fill="none"
        stroke={hover ? 'rgba(252,165,165,0.85)' : 'rgba(148,163,184,0.55)'}
        strokeWidth={hover ? 2 : 1.5}
        markerEnd="url(#conn-arrow)"
        style={{ pointerEvents: 'none', transition: 'stroke 0.12s, stroke-width 0.12s' }}
      />
      {hover && (
        <g
          transform={`translate(${midX - 10}, ${midY - 10})`}
          style={{ pointerEvents: 'all', cursor: 'pointer' }}
          onClick={onDelete}
        >
          <circle r={10} cx={10} cy={10} fill="rgba(15,23,42,0.92)" stroke="rgba(252,165,165,0.7)" />
          <line x1={6} y1={6} x2={14} y2={14} stroke="rgba(252,165,165,0.9)" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={14} y1={6} x2={6} y2={14} stroke="rgba(252,165,165,0.9)" strokeWidth={1.5} strokeLinecap="round" />
        </g>
      )}
    </g>
  )
}
