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

export function IdeaFlowMark({ width = 22, color = '#1c1f2e', className, style }: MarkProps) {
  const h = Math.round((width / 24) * 17)
  return (
    <svg
      width={width}
      height={h}
      viewBox="0 0 24 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* Bar 1 — full width, full opacity */}
      <rect x="0" y="0"    width="24" height="5"   rx="2.5" fill={color} />
      {/* Bar 2 — 2/3 width, 62% opacity */}
      <rect x="0" y="7"    width="16" height="5"   rx="2.5" fill={color} fillOpacity="0.60" />
      {/* Bar 3 — 37.5% width, 32% opacity */}
      <rect x="0" y="13.5" width="9"  height="3.5" rx="1.75" fill={color} fillOpacity="0.32" />
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
  color = '#1c1f2e',
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
