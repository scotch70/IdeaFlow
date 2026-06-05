'use client'

/**
 * SessionCanvas — the dark drawing surface.
 *
 *   • Fixed-size container (position: relative, overflow: hidden). No scroll
 *     bars — cards are clamped to the visible rectangle.
 *   • A ResizeObserver reports the live size up to SessionWorkspace via
 *     `onMeasure`, which drives card spawn positions and the "Reset view" grid.
 *   • Cards are absolutely positioned inside this canvas. Each card uses
 *     framer-motion's `drag` prop; its visual movement happens inside
 *     framer-motion via a transform — no React rerender per frame.
 *   • A `liveDrag` state on the canvas tracks the current drag offset of the
 *     one card being moved. The SVG connection layer reads from `liveDrag` so
 *     lines follow the card in real time. Other cards do NOT rerender during
 *     drag (CardOnCanvas is memoised on its inputs).
 *   • Persisted position writes happen once, on drag end (fire-and-forget so
 *     the UI never pauses).
 *
 * The canvas is also responsible for displaying cards at clamped positions
 * even before the parent's auto-correct effect catches up — saved positions
 * outside the visible area are visually re-anchored at the inset corner so
 * nothing ever renders out of bounds.
 */

import { memo, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { SessionCard, SessionConnection, SessionMember } from '@/types/sessions'
import { cardChipLabel, CARD_TYPE_META } from '@/lib/sessions/cardTypes'
import {
  CANVAS_INSET, CARD_H, CARD_W, CanvasSize, clampToCanvas, isCanvasMeasured,
} from '@/lib/sessions/layout'
import { ADMIN_CARD_H, ADMIN_CARD_W } from '@/lib/sessions/circleLayout'
import { CANVAS_BG, CANVAS_BORDER, CANVAS_DOT, CANVAS_SURFACE } from './SessionWorkspace'

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  cards:            SessionCard[]
  connections:      SessionConnection[]
  members:          Record<string, SessionMember>
  connectingFrom:   string | null
  selectedCardId:   string | null
  editingCardId:    string | null
  canvasSize:       CanvasSize
  guideCollapsed:   boolean

  /** Disable drag + hide some action-bar buttons. Used by Brainstorm Circle
   *  where cards are fixed in their radial positions. */
  lockedLayout?:    boolean
  /** Render heart button + count on every card. Likes data flows in via
   *  `likeCounts` and `myLikes`. */
  showHearts?:      boolean
  likeCounts?:      Record<string, number>
  myLikes?:         Set<string>
  onToggleLike?:    (cardId: string, currentlyLiked: boolean) => void

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

// ─────────────────────────────────────────────────────────────────────────────

export default function SessionCanvas({
  cards, connections, members,
  connectingFrom, selectedCardId, editingCardId,
  canvasSize, guideCollapsed,
  lockedLayout = false, showHearts = false,
  likeCounts, myLikes, onToggleLike,
  onMeasure,
  onSelectCard, onEditCard,
  onPositionEnd, onChangeText, onTogglePriority,
  onDuplicate, onDelete,
  onStartConnect, onFinishConnect, onDeleteConnection, onCancelConnect,
  onResetView,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)

  // ── Resize observer surfaces the live size up to the workspace ──────────
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

  // ── Live drag offset for ONE card at a time ─────────────────────────────
  // Updated on framer-motion's onDrag handler (~60 fps). Cleared on drag end.
  // Drives the SVG connection-line endpoints so lines follow the card in
  // real time without forcing the dragging card itself to rerender — motion
  // handles the visual translate internally.
  const [liveDrag, setLiveDrag] = useState<{ id: string; dx: number; dy: number } | null>(null)

  // Clicking the empty canvas deselects + cancels any connect-in-progress.
  function handleCanvasMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return
    onSelectCard(null)
    onCancelConnect()
  }

  // ── Helpers used by both the cards and the line layer ───────────────────
  const measured = isCanvasMeasured(canvasSize)

  // Render-time clamp — guarantees nothing visually shows out of bounds even
  // before the parent's auto-correct effect persists the fix.
  function safePos(card: SessionCard): { x: number; y: number } {
    if (!measured) return { x: card.x, y: card.y }
    return clampToCanvas(card.x, card.y, canvasSize)
  }

  /** Effective top-left of a card, accounting for live drag offset. */
  function effectivePos(card: SessionCard): { x: number; y: number } {
    const base = safePos(card)
    if (liveDrag && liveDrag.id === card.id) {
      return { x: base.x + liveDrag.dx, y: base.y + liveDrag.dy }
    }
    return base
  }

  // Build a quick lookup so the connection layer doesn't pay O(n²).
  const cardById = new Map(cards.map(c => [c.id, c]))

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
      {/* ── SVG connection layer — sits below cards via z-order in the DOM ── */}
      <svg
        width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
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
          const ap = effectivePos(a)
          const bp = effectivePos(b)
          return (
            <ConnectionPath
              key={c.id}
              ax={ap.x + CARD_W / 2} ay={ap.y + CARD_H / 2}
              bx={bp.x + CARD_W / 2} by={bp.y + CARD_H / 2}
              onDelete={() => onDeleteConnection(c.id)}
            />
          )
        })}
      </svg>

      {/* ── Cards — only rendered after the canvas has measured at least once.
            Each gets clamped pos so we never paint out of bounds. ─────────── */}
      {measured && cards.map(card => {
        const safe = safePos(card)
        const likeCount   = likeCounts?.[card.id] ?? 0
        const likedByMe   = myLikes?.has(card.id) ?? false
        return (
          <CardOnCanvas
            key={card.id}
            card={card}
            safeX={safe.x}
            safeY={safe.y}
            canvasSize={canvasSize}
            owner={card.created_by ? members[card.created_by] ?? null : null}
            isConnectSource={connectingFrom === card.id}
            isConnectTarget={connectingFrom !== null && connectingFrom !== card.id}
            isSelected={selectedCardId === card.id}
            isEditing={editingCardId === card.id}
            lockedLayout={lockedLayout}
            showHeart={showHearts}
            likeCount={likeCount}
            likedByMe={likedByMe}
            onToggleLike={onToggleLike}
            onSelect={onSelectCard}
            onEnterEdit={onEditCard}
            onLiveDrag={setLiveDrag}
            onPositionEnd={onPositionEnd}
            onChangeText={onChangeText}
            onTogglePriority={onTogglePriority}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onStartConnect={onStartConnect}
            onFinishConnect={onFinishConnect}
          />
        )
      })}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {cards.length === 0 && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
            padding: '0 1.5rem',
          }}
        >
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)', maxWidth: '24rem' }}>
            <div
              aria-hidden
              style={{
                width: '2.5rem', height: '2.5rem',
                borderRadius: '999px',
                background: 'rgba(249,115,22,0.16)',
                border: '1px solid rgba(249,115,22,0.32)',
                color: '#fdba74',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.05rem',
                marginBottom: '0.75rem',
              }}
            >
              ✦
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.92)', marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
              {guideCollapsed
                ? 'Expand the guide panel to add a card.'
                : 'Choose a card type on the right and add your first idea.'}
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.55 }}>
              Pick a type, write a title, hit <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Add card</strong>. Your session starts the moment you do.
            </p>
          </div>
        </div>
      )}

      {/* ── Bottom helper strip ─────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute', bottom: 12, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', padding: '0 1rem',
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
  /** Clamped persisted position — what we render the card at when not dragging. */
  safeX:             number
  safeY:             number
  isConnectSource:   boolean
  isConnectTarget:   boolean
  isSelected:        boolean
  isEditing:         boolean
  /** Disable drag, hide the Connect / Duplicate / Delete buttons. */
  lockedLayout:      boolean
  /** Show a heart pill in the corner with the like count. */
  showHeart:         boolean
  likeCount:         number
  likedByMe:         boolean
  onToggleLike?:     (cardId: string, currentlyLiked: boolean) => void
  onSelect:          (id: string) => void
  onEnterEdit:       (id: string | null) => void
  /** Reports the live drag offset to the canvas while a drag is in progress. */
  onLiveDrag:        (drag: { id: string; dx: number; dy: number } | null) => void
  onPositionEnd:     (id: string, x: number, y: number) => void
  onChangeText:      (id: string, patch: { title?: string; content?: string }) => void
  onTogglePriority:  (id: string) => void
  onDuplicate:       (id: string) => void
  onDelete:          (id: string) => void
  onStartConnect:    (id: string) => void
  onFinishConnect:   (id: string) => void
}

// Memo guard: only rerender if something the card actually displays changed.
// Crucially: nothing in this list changes during a drag of *another* card, so
// non-dragging cards stay stable while liveDrag updates at 60fps.
function cardPropsEqual(a: CardProps, b: CardProps): boolean {
  if (a.card !== b.card) return false
  if (a.safeX !== b.safeX || a.safeY !== b.safeY) return false
  if (a.isSelected !== b.isSelected) return false
  if (a.isEditing  !== b.isEditing)  return false
  if (a.isConnectSource !== b.isConnectSource) return false
  if (a.isConnectTarget !== b.isConnectTarget) return false
  if (a.canvasSize.w !== b.canvasSize.w || a.canvasSize.h !== b.canvasSize.h) return false
  if (a.owner !== b.owner) return false
  if (a.lockedLayout !== b.lockedLayout) return false
  if (a.showHeart    !== b.showHeart)    return false
  if (a.likeCount    !== b.likeCount)    return false
  if (a.likedByMe    !== b.likedByMe)    return false
  // Callbacks come from stable closures in the parent (SessionWorkspace
  // top-level functions); reference equality is enough.
  return true
}

const CardOnCanvas = memo(function CardOnCanvas({
  card, owner, canvasSize, safeX, safeY,
  isConnectSource, isConnectTarget, isSelected, isEditing,
  lockedLayout, showHeart, likeCount, likedByMe, onToggleLike,
  onSelect, onEnterEdit, onLiveDrag,
  onPositionEnd, onChangeText, onTogglePriority,
  onDuplicate, onDelete, onStartConnect, onFinishConnect,
}: CardProps) {
  const meta = CARD_TYPE_META[card.type]
  const [hover, setHover] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  // Focus title when entering edit mode.
  useLayoutEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [isEditing])

  const starred = card.priority > 0

  // ── Admin card detection ────────────────────────────────────────────────
  // The Brainstorm Circle admin topic is a regular `custom` card with the
  // label "Admin topic". When detected we render it bigger, ivory, with an
  // orange border + dark text so it reads as the focal point — matching the
  // demo's central card. lockedLayout guards us from misfiring on any other
  // freeform card a user might title that way.
  const isAdmin = lockedLayout
    && card.type === 'custom'
    && (card.custom_label ?? '').toLowerCase() === 'admin topic'

  const visualW = isAdmin ? ADMIN_CARD_W : CARD_W
  const visualH = isAdmin ? ADMIN_CARD_H : CARD_H

  // ── Drag constraints in motion-offset space (non-admin only) ────────────
  const dragLeft   = CANVAS_INSET - safeX
  const dragRight  = Math.max(0, canvasSize.w - visualW - CANVAS_INSET - safeX)
  const dragTop    = CANVAS_INSET - safeY
  const dragBottom = Math.max(0, canvasSize.h - visualH - CANVAS_INSET - safeY)

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

  // Locked-layout cards (Brainstorm Circle members + admin) skip framer-motion's
  // drag props entirely. The `drag` prop being literal false disables the
  // gesture cleanly without breaking the rest of the motion API.
  return (
    <motion.div
      drag={lockedLayout ? false : true}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={lockedLayout
        ? undefined
        : { left: dragLeft, right: dragRight, top: dragTop, bottom: dragBottom }}
      onDragStart={lockedLayout ? undefined : () => onLiveDrag({ id: card.id, dx: 0, dy: 0 })}
      onDrag={lockedLayout ? undefined : (_, info) => {
        onLiveDrag({ id: card.id, dx: info.offset.x, dy: info.offset.y })
      }}
      onDragEnd={lockedLayout ? undefined : (_, info) => {
        // Final clamp on top of dragConstraints — guards against tiny rounding
        // errors leaking outside the visible area. Then commit ONCE.
        const nx = safeX + info.offset.x
        const ny = safeY + info.offset.y
        const next = clampToCanvas(nx, ny, canvasSize)
        onLiveDrag(null)
        onPositionEnd(card.id, next.x, next.y)
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute',
        top: safeY,
        left: safeX,
        width: visualW,
        minHeight: visualH,
        background: isAdmin ? '#fbfaf7' : CANVAS_SURFACE,
        backgroundImage: isAdmin
          ? 'none'
          : `linear-gradient(180deg, ${meta.bg}, transparent 65%)`,
        border: isConnectSource
          ? '1px solid rgba(249,115,22,0.55)'
          : isAdmin
            ? '1.5px solid #f97316'
          : isSelected
            ? `1px solid ${meta.accent}`
            : isConnectTarget
              ? '1px dashed rgba(99,179,237,0.55)'
              : `1px solid ${CANVAS_BORDER}`,
        borderRadius: isAdmin ? '0.9rem' : '0.7rem',
        padding: isAdmin ? '1rem 1.15rem' : '0.65rem 0.75rem 0.7rem 0.9rem',
        color: isAdmin ? '#0d1f35' : '#e6ecf5',
        cursor: lockedLayout ? 'pointer' : 'grab',
        userSelect: isEditing ? 'text' : 'none',
        boxShadow: isAdmin
          ? '0 6px 28px rgba(249,115,22,0.18), 0 1px 4px rgba(6,14,38,0.06)'
          : isSelected
            ? `0 0 0 3px ${meta.accent}33, 0 6px 18px rgba(0,0,0,0.45)`
            : isConnectSource
              ? '0 0 0 4px rgba(249,115,22,0.18), 0 6px 18px rgba(0,0,0,0.45)'
              : '0 4px 18px rgba(0,0,0,0.32)',
        zIndex: isSelected ? 5 : isConnectSource ? 4 : 2,
        // Hint the compositor — drag transforms stay smooth.
        willChange: 'transform',
      }}
      whileDrag={{ scale: 1.02, cursor: 'grabbing', zIndex: 10 }}
    >
      <div
        style={{
          position: 'absolute', top: '0.7rem', bottom: '0.7rem', left: '0.35rem',
          width: '3px', borderRadius: '999px', background: meta.accent, opacity: 0.85,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: isAdmin ? '0.5rem' : '0.35rem' }}>
        <span
          style={{
            fontSize: isAdmin ? '0.58rem' : '0.55rem',
            fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: isAdmin ? '#c2540a' : meta.ink,
            background: isAdmin ? 'rgba(249,115,22,0.10)' : meta.bg,
            border: `1px solid ${isAdmin ? 'rgba(249,115,22,0.30)' : `${meta.accent}33`}`,
            padding: isAdmin ? '0.15rem 0.55rem' : '0.12rem 0.4rem', borderRadius: '999px',
            maxWidth: isAdmin ? 'none' : '8.5rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >{cardChipLabel(card)}</span>
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
            {/* Connect / Duplicate / Delete suppressed on locked layouts — the
                Brainstorm Circle topology is fixed at creation time. */}
            {!lockedLayout && (
              <>
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
              </>
            )}
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
            {!lockedLayout && (
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
            )}
          </div>
        )}
      </div>

      {/* Title */}
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
          color: isAdmin ? '#0d1f35' : '#f4f7fb',
          fontSize: isAdmin ? '1.05rem' : '0.86rem',
          fontWeight: isAdmin ? 800 : 700,
          letterSpacing: '-0.01em',
          padding: '0.05rem 0',
          fontFamily: 'inherit',
          cursor: isEditing ? 'text' : 'inherit',
        }}
      />

      {/* Detail */}
      <textarea
        value={card.content ?? ''}
        placeholder={isSelected ? 'Add detail (optional)' : ''}
        onChange={e => onChangeText(card.id, { content: e.target.value })}
        onMouseDown={e => e.stopPropagation()}
        onDoubleClick={e => e.stopPropagation()}
        readOnly={!isEditing && !isSelected}
        rows={isAdmin ? 3 : 2}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none', outline: 'none',
          resize: 'none',
          color: isAdmin ? '#5d667a' : 'rgba(230,236,245,0.78)',
          fontSize: isAdmin ? '0.85rem' : '0.76rem',
          lineHeight: 1.5,
          padding: '0.25rem 0 0',
          fontFamily: 'inherit',
          cursor: isEditing ? 'text' : 'inherit',
        }}
      />

      {/* Footer row — owner on the left, heart on the right (members only) */}
      {!isAdmin && (owner || showHeart) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.45rem' }}>
          {owner && (
            <>
              <OwnerAvatar member={owner} />
              <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                {firstName(owner.fullName) || 'Member'} · <span style={{ color: 'rgba(255,255,255,0.32)' }}>{owner.role === 'admin' ? 'Admin' : 'Member'}</span>
              </span>
            </>
          )}
          <span style={{ flex: 1 }} />
          {showHeart && onToggleLike && (
            <HeartPill
              count={likeCount}
              liked={likedByMe}
              onClick={() => onToggleLike(card.id, likedByMe)}
            />
          )}
        </div>
      )}
    </motion.div>
  )
}, cardPropsEqual)

// ── Heart pill ───────────────────────────────────────────────────────────────
function HeartPill({
  count, liked, onClick,
}: {
  count:   number
  liked:   boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={liked ? 'Remove like' : 'Like this card'}
      title={liked ? 'You liked this' : 'Like this card'}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onMouseDown={e => e.stopPropagation()}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: liked ? 'rgba(249,115,22,0.18)' : 'rgba(255,255,255,0.06)',
        border: liked ? '1px solid rgba(249,115,22,0.40)' : '1px solid rgba(255,255,255,0.10)',
        color: liked ? '#fdba74' : 'rgba(255,255,255,0.72)',
        borderRadius: '999px',
        padding: '0.15rem 0.5rem 0.15rem 0.4rem',
        fontSize: '0.7rem', fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'background 0.12s, color 0.12s, border-color 0.12s',
      }}
    >
      <svg
        width="11" height="11" viewBox="0 0 24 24"
        fill={liked ? '#f97316' : 'none'}
        stroke={liked ? '#f97316' : 'currentColor'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count > 0 ? count : ''}
    </button>
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
        stroke={hover ? 'rgba(252,165,165,0.85)' : 'rgba(190,205,225,0.50)'}
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
