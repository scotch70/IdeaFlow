/**
 * IdeaFlow logo system — SVG-based, no image dependency.
 *
 * The mark: three horizontal bars of decreasing width and opacity.
 * Concept: ranked/prioritised ideas, structured flow.
 * Scales cleanly from 12 px (favicon) to large display sizes.
 */

import Link from 'next/link'
import React from 'react'

// ── Mark — the abstract icon ──────────────────────────────────────────────────

interface MarkProps {
  /** Rendered width in px. Height is auto-proportioned (17:24 ratio). */
  width?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

export function IdeaFlowMark({ width = 22, color = '#1f2330', className, style }: MarkProps) {
  const h = Math.round((width / 20) * 16)
  return (
    <svg
      width={width}
      height={h}
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Bar 1 — shortest, leftmost, faintest */}
      <rect x="0"   y="10" width="5" height="6"  rx="2.5" fill={color} fillOpacity="0.32" />
      {/* Bar 2 — medium height, center */}
      <rect x="7.5" y="5"  width="5" height="11" rx="2.5" fill={color} fillOpacity="0.62" />
      {/* Bar 3 — tallest, rightmost, full opacity */}
      <rect x="15"  y="0"  width="5" height="16" rx="2.5" fill={color} />
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
