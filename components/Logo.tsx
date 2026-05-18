/**
 * IdeaFlow logo system — SVG-based, no image dependency.
 *
 * The mark: three ascending nodes on a diagonal flow path.
 *
 * Concept: multiple employee ideas (bottom) rise through collective
 * intelligence (middle) into a single focused leadership insight (top).
 * The bezier connector makes the flow direction explicit.
 *
 * Scales cleanly from 12 px (favicon — three dots visible) to large
 * display sizes (full mark with flow path).
 */

import Link from 'next/link'
import React from 'react'

// ── Mark — the abstract icon ──────────────────────────────────────────────────

interface MarkProps {
  /** Rendered width in px. Mark is square (1:1). */
  width?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

export function IdeaFlowMark({ width = 22, color = '#1f2330', className, style }: MarkProps) {
  return (
    <svg
      width={width}
      height={width}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Flow connector — subtle bezier linking all three nodes */}
      <path
        d="M 4 16 C 8 12 12 8 16 4"
        stroke={color}
        strokeOpacity={0.14}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Node A — bottom: entry point (many employee ideas) */}
      <circle cx="4"  cy="16" r="2"   fill={color} fillOpacity="0.28" />
      {/* Node B — middle: aggregation layer */}
      <circle cx="10" cy="10" r="2.5" fill={color} fillOpacity="0.60" />
      {/* Node C — top: focused leadership insight */}
      <circle cx="16" cy="4"  r="3"   fill={color} />
    </svg>
  )
}

// ── Wordmark — mark + logotype ────────────────────────────────────────────────

interface WordmarkProps {
  href?: string
  markWidth?: number
  fontSize?: string | number
  color?: string
  gap?: string
  style?: React.CSSProperties
  /** When true, renders a <span> instead of a <Link> */
  static?: boolean
}

export function IdeaFlowWordmark({
  href = '/',
  markWidth = 20,
  fontSize = '1rem',
  color = '#1f2330',
  gap = '0.5rem',
  style,
  static: isStatic = false,
}: WordmarkProps) {
  const inner = (
    <>
      <IdeaFlowMark width={markWidth} color={color} />
      <span style={{
        fontSize,
        fontWeight: 700,
        color,
        letterSpacing: '-0.03em',
        fontFamily: "'DM Sans', sans-serif",
        lineHeight: 1,
        userSelect: 'none',
      }}>
        IdeaFlow
      </span>
    </>
  )

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap,
    textDecoration: 'none',
    flexShrink: 0,
    ...style,
  }

  if (isStatic) {
    return <div style={containerStyle}>{inner}</div>
  }

  return (
    <Link href={href} style={containerStyle}>
      {inner}
    </Link>
  )
}
