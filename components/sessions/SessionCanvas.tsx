'use client'

/**
 * SessionCanvas — the dark drawing surface.
 *
 * Holds:
 *   • A subtle dot grid background (CSS gradient) for visual depth without
 *     drawing too much attention to itself.
 *   • An absolutely positioned SVG layer that draws cubic-bezier connections
 *     between card centers. Connections are interactive — clicking a path
 *     shows a small × to delete the link.
 *   • Cards rendered on top, each with framer-motion's `drag` prop so the
 *     user can reposition them freely. On drag end we capture the final x/y
 *     and persist via the Supabase store.
 *
 * Empty state and a small floating helper bar live here too.
 */

import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { CardType, SessionCard, SessionConnection } from '@/types/sessions'
import { CARD_TYPE_META } from '@/lib/sessions/cardTypes'
import { CANVAS_BG, CANVAS_BORDER, CANVAS_DOT, CANVAS_SURFACE } from './SessionWorkspace'

const CARD_W = 220
const CARD_MIN_H = 96

interface Props {
  cards:            SessionCard[]
  connections:      SessionConnection[]
  connectingFrom:   string | null

  onPositionEnd:      (id: string, x: number, y: number) => void
  onChangeText:       (id: string, patch: { title?: string; content?: string }) => void
  onTogglePriority:   (id: string) => void
  onDelete:           (id: string) => void
  onStartConnect:     (id: string) => void
  onFinishConnect:    (id: string) => void
  onDeleteConnection: (id: string) => void
  onCancelConnect:    () => void
}

export default function SessionCanvas({
  cards, connections, connectingFrom,
  onPositionEnd, onChangeText, onTogglePriority, onDelete,
  onStartConnect, onFinishConnect, onDeleteConnection, onCancelConnect,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })

  // Track canvas size for the SVG layer (must match the visible area exactly).
  useLayoutEffect(() => {
    if (!canvasRef.current) return
    const ro = new ResizeObserver(() => {
      const r = canvasRef.current!.getBoundingClientRect()
      setCanvasSize({ w: r.width, h: r.height })
    })
    ro.observe(canvasRef.current)
    return () => ro.disconnect()
  }, [])

  const cardById = new Map(cards.map(c => [c.id, c]))

  return (
    <div
      ref={canvasRef}
      onClick={e => { if (e.currentTarget === e.target) onCancelConnect() }}
      style={{
        position: 'relative',
        background: CANVAS_BG,
        backgroundImage: `radial-gradient(${CANVAS_DOT} 1px, transparent 1px)`,
        backgroundSize: '22px 22px',
        backgroundPosition: '-1px -1px',
        overflow: 'auto',
        minHeight: 0,
      }}
    >
      {/* SVG connection layer */}
      <svg
        width={canvasSize.w}
        height={canvasSize.h}
        style={{
          position: 'absolute', top: 0, left: 0,
          pointerEvents: 'none',
        }}
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
              id={c.id}
              ax={a.x + CARD_W / 2} ay={a.y + CARD_MIN_H / 2}
              bx={b.x + CARD_W / 2} by={b.y + CARD_MIN_H / 2}
              onDelete={() => onDeleteConnection(c.id)}
            />
          )
        })}
      </svg>

      {/* Cards */}
      {cards.map(card => (
        <CardOnCanvas
          key={card.id}
          card={card}
          isConnectSource={connectingFrom === card.id}
          isConnectTarget={connectingFrom !== null && connectingFrom !== card.id}
          onPositionEnd={onPositionEnd}
          onChangeText={onChangeText}
          onTogglePriority={onTogglePriority}
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
              Use the panel on the right to add a card — Problem, Idea, Risk, whatever’s in your head.
            </p>
          </div>
        </div>
      )}

      {/* Connect-mode hint */}
      {connectingFrom && (
        <div
          style={{
            position: 'sticky',
            bottom: 14, left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
            pointerEvents: 'none',
            marginTop: '-2.5rem',
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              background: 'rgba(15,23,42,0.92)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '999px',
              padding: '0.4rem 0.85rem',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Click another card to connect</span>
            <button
              type="button"
              onClick={onCancelConnect}
              style={{
                background: 'transparent', border: 'none',
                color: '#cbd5e1', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 700,
              }}
            >Cancel (Esc)</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────

interface CardProps {
  card:              SessionCard
  isConnectSource:   boolean
  isConnectTarget:   boolean
  onPositionEnd:     (id: string, x: number, y: number) => void
  onChangeText:      (id: string, patch: { title?: string; content?: string }) => void
  onTogglePriority:  (id: string) => void
  onDelete:          (id: string) => void
  onStartConnect:    (id: string) => void
  onFinishConnect:   (id: string) => void
}

function CardOnCanvas({
  card, isConnectSource, isConnectTarget,
  onPositionEnd, onChangeText, onTogglePriority, onDelete,
  onStartConnect, onFinishConnect,
}: CardProps) {
  const meta = CARD_TYPE_META[card.type]
  const [pos, setPos] = useState({ x: card.x, y: card.y })

  // Keep local position in sync if external updates (e.g. AI suggest spawn)
  // re-set x/y while we're not dragging.
  useLayoutEffect(() => { setPos({ x: card.x, y: card.y }) }, [card.id, card.x, card.y])

  const starred = card.priority > 0

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_, info) => {
        const next = { x: Math.max(0, pos.x + info.offset.x), y: Math.max(0, pos.y + info.offset.y) }
        setPos(next)
        onPositionEnd(card.id, next.x, next.y)
      }}
      onClick={(e) => {
        // If we're in connect mode and this card isn't the source, finish.
        if (isConnectTarget) {
          e.stopPropagation()
          onFinishConnect(card.id)
        }
      }}
      style={{
        position: 'absolute',
        top:  pos.y,
        left: pos.x,
        width: CARD_W,
        minHeight: CARD_MIN_H,
        background: CANVAS_SURFACE,
        backgroundImage: `linear-gradient(180deg, ${meta.bg}, transparent 65%)`,
        border: isConnectSource
          ? '1px solid rgba(249,115,22,0.55)'
          : isConnectTarget
            ? '1px dashed rgba(99,179,237,0.55)'
            : `1px solid ${CANVAS_BORDER}`,
        borderRadius: '0.7rem',
        padding: '0.65rem 0.7rem 0.7rem 0.85rem',
        color: '#e6ecf5',
        cursor: 'grab',
        userSelect: 'text',
        boxShadow: isConnectSource
          ? '0 0 0 4px rgba(249,115,22,0.18), 0 6px 18px rgba(0,0,0,0.45)'
          : '0 4px 18px rgba(0,0,0,0.32)',
        zIndex: isConnectSource ? 5 : 2,
      }}
      whileDrag={{ scale: 1.02, cursor: 'grabbing', zIndex: 10 }}
    >
      {/* Accent stripe */}
      <div
        style={{
          position: 'absolute', top: '0.7rem', bottom: '0.7rem', left: '0.3rem',
          width: '3px', borderRadius: '999px', background: meta.accent,
          opacity: 0.85,
        }}
      />

      {/* Header row: type chip + actions */}
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
        <CardIconButton
          ariaLabel={starred ? 'Lower priority' : 'Mark priority'}
          active={starred}
          onClick={() => onTogglePriority(card.id)}
        >
          <svg width="11" height="11" viewBox="0 0 24 24"
               fill={starred ? '#fbbf24' : 'none'}
               stroke={starred ? '#fbbf24' : 'currentColor'}
               strokeWidth="2" strokeLinejoin="round">
            <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" />
          </svg>
        </CardIconButton>
        <CardIconButton
          ariaLabel="Connect to another card"
          active={isConnectSource}
          onClick={() => onStartConnect(card.id)}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07l-1.5 1.5" />
            <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
          </svg>
        </CardIconButton>
        <CardIconButton
          ariaLabel="Delete card"
          danger
          onClick={() => onDelete(card.id)}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </CardIconButton>
      </div>

      {/* Title input */}
      <input
        value={card.title}
        placeholder={meta.hint}
        onChange={e => onChangeText(card.id, { title: e.target.value })}
        onMouseDown={e => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none', outline: 'none',
          color: '#f4f7fb',
          fontSize: '0.85rem', fontWeight: 700,
          letterSpacing: '-0.01em',
          padding: '0.05rem 0',
          fontFamily: 'inherit',
        }}
      />

      {/* Optional content textarea */}
      <textarea
        value={card.content ?? ''}
        placeholder="Add detail (optional)"
        onChange={e => onChangeText(card.id, { content: e.target.value })}
        onMouseDown={e => e.stopPropagation()}
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
        }}
      />
    </motion.div>
  )
}

function CardIconButton({
  children, onClick, ariaLabel, active = false, danger = false,
}: {
  children: React.ReactNode
  onClick:  () => void
  ariaLabel: string
  active?:   boolean
  danger?:   boolean
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onMouseDown={e => e.stopPropagation()}
      style={{
        width: '1.4rem', height: '1.4rem',
        borderRadius: '999px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: active
          ? 'rgba(249,115,22,0.18)'
          : 'rgba(255,255,255,0.04)',
        border: active
          ? '1px solid rgba(249,115,22,0.40)'
          : '1px solid rgba(255,255,255,0.06)',
        color: danger
          ? 'rgba(252,165,165,0.85)'
          : active
            ? '#fdba74'
            : 'rgba(255,255,255,0.55)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (active || danger) return
        e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
        e.currentTarget.style.color = '#fff'
      }}
      onMouseLeave={e => {
        if (active || danger) return
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
      }}
    >
      {children}
    </button>
  )
}

// ─── Connection path ─────────────────────────────────────────────────────────

function ConnectionPath({
  id, ax, ay, bx, by, onDelete,
}: {
  id: string; ax: number; ay: number; bx: number; by: number;
  onDelete: () => void
}) {
  const [hover, setHover] = useState(false)
  // Cubic bezier — control points pulled horizontally for a clean swoop.
  const dx = (bx - ax) * 0.45
  const path = `M ${ax} ${ay} C ${ax + dx} ${ay}, ${bx - dx} ${by}, ${bx} ${by}`
  const midX = (ax + bx) / 2
  const midY = (ay + by) / 2

  return (
    <g pointerEvents="visiblePainted">
      {/* Fat invisible hit area so the user can click thin lines */}
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

void CARD_TYPE_META // (referenced via meta inside CardOnCanvas; silence unused-import in some tsconfigs)
