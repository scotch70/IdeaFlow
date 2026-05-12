'use client'

/**
 * FlowCard — a single card in the /dashboard/flows selector list.
 * Shows icon, name, effective status, prompt preview, idea count,
 * participant count, and a CTA to open the flow.
 *
 * The optional `color` field drives the card accent — border, icon
 * background, and CTA button — so each IdeaFlow can feel distinct.
 */

import Link from 'next/link'
import type { IdeaRoundWithStatus } from '@/types/database'

interface FlowCardProps {
  flow:    IdeaRoundWithStatus
  isAdmin: boolean
}

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_ICON  = '💡'
const DEFAULT_COLOR = '#f97316'   // brand orange

/** Derive low-opacity tint tokens from the hex accent color. */
function accentTokens(hex: string) {
  return {
    bg:     `${hex}14`,   // ~8% opacity
    border: `${hex}38`,   // ~22% opacity
    text:   hex,
  }
}

// ── Status badge ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { bg: string; color: string; border: string; label: string; dot: string }> = {
  active: { bg: 'rgba(16,185,129,0.07)', color: '#065f46', border: 'rgba(16,185,129,0.22)', label: 'Active',  dot: '#10b981' },
  draft:  { bg: 'rgba(249,115,22,0.06)', color: '#92400e', border: 'rgba(249,115,22,0.18)', label: 'Draft',   dot: '#f97316' },
  closed: { bg: 'rgba(0,0,0,0.04)',      color: '#475569', border: 'rgba(0,0,0,0.10)',      label: 'Closed',  dot: '#94a3b8' },
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function FlowCard({ flow, isAdmin: _isAdmin }: FlowCardProps) {
  const badge  = STATUS_BADGE[flow.effectiveStatus] ?? STATUS_BADGE.closed
  const color  = flow.color ?? DEFAULT_COLOR
  const icon   = flow.icon  ?? DEFAULT_ICON
  const accent = accentTokens(color)

  const closesAt = flow.ends_at   ? formatDate(flow.ends_at)   : null
  const opensAt  = flow.starts_at ? formatDate(flow.starts_at) : null

  return (
    <div style={{
      background: '#ffffff',
      border: `1px solid ${accent.border}`,
      borderRadius: '1.125rem',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
      boxShadow: '0 2px 10px rgba(6,14,38,0.04)',
      transition: 'box-shadow 0.15s, border-color 0.15s',
    }}>

      {/* ── Header: icon + name + status badge ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>

        {/* Icon bubble */}
        <div style={{
          width: '2.5rem', height: '2.5rem', flexShrink: 0,
          borderRadius: '0.65rem',
          background: accent.bg,
          border: `1px solid ${accent.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', lineHeight: 1,
        }}>
          {icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '0.95rem', fontWeight: 800, color: '#0d1f35',
            letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: '0.3rem',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {flow.name || 'Unnamed IdeaFlow'}
          </p>

          {/* Status badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.65rem', fontWeight: 700,
            background: badge.bg, color: badge.color,
            border: `1px solid ${badge.border}`,
            borderRadius: '999px',
            padding: '0.18rem 0.55rem',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: badge.dot }} />
            {badge.label}
          </span>
        </div>
      </div>

      {/* ── Prompt preview ── */}
      {flow.prompt && (
        <p style={{
          fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {flow.prompt}
        </p>
      )}

      {/* ── Stats ── */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: '#9ab0c8' }}>
          <strong style={{ color: '#0d1f35' }}>{flow.ideaCount}</strong>
          {' '}idea{flow.ideaCount !== 1 ? 's' : ''}
        </span>
        {flow.memberCount > 0 ? (
          <span style={{ fontSize: '0.75rem', color: '#9ab0c8' }}>
            <strong style={{ color: '#0d1f35' }}>{flow.memberCount}</strong>
            {' '}participant{flow.memberCount !== 1 ? 's' : ''}
          </span>
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#9ab0c8' }}>All members</span>
        )}
      </div>

      {/* ── Dates ── */}
      {(opensAt || closesAt) && (
        <p style={{ fontSize: '0.72rem', color: '#9ab0c8', lineHeight: 1.5 }}>
          {opensAt  && <span>Opens {opensAt}</span>}
          {opensAt && closesAt && <span style={{ margin: '0 0.35rem', opacity: 0.4 }}>·</span>}
          {closesAt && <span>Closes {closesAt}</span>}
        </p>
      )}

      {/* ── CTA ── */}
      <div style={{ marginTop: 'auto' }}>
        <Link
          href={`/dashboard/flows/${flow.id}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '2.25rem',
            fontSize: '0.8rem', fontWeight: 700,
            color: flow.effectiveStatus === 'active' ? accent.text : '#475569',
            background: flow.effectiveStatus === 'active' ? accent.bg : 'rgba(0,0,0,0.03)',
            border: flow.effectiveStatus === 'active' ? `1px solid ${accent.border}` : '1px solid rgba(0,0,0,0.07)',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          {flow.effectiveStatus === 'active' ? 'Open IdeaFlow →' : 'View'}
        </Link>
      </div>
    </div>
  )
}
