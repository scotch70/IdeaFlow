'use client'

/**
 * FlowCard — a single card in the IdeaFlow management list.
 * Shows name, status badge, prompt preview, idea count, audience, dates, and CTA.
 */

import Link from 'next/link'
import type { IdeaRoundWithStatus } from '@/types/database'

interface FlowCardProps {
  flow:    IdeaRoundWithStatus
  isAdmin: boolean
}

const STATUS_BADGE: Record<string, { bg: string; color: string; border: string; label: string; dot: string }> = {
  active: { bg: 'rgba(16,185,129,0.07)', color: '#065f46', border: 'rgba(16,185,129,0.22)', label: 'Active',  dot: '#10b981' },
  draft:  { bg: 'rgba(249,115,22,0.06)', color: '#92400e', border: 'rgba(249,115,22,0.18)', label: 'Draft',   dot: '#f97316' },
  closed: { bg: 'rgba(0,0,0,0.04)',      color: '#475569', border: 'rgba(0,0,0,0.10)',      label: 'Closed',  dot: '#94a3b8' },
}

const CARD_BORDER: Record<string, string> = {
  active: 'rgba(16,185,129,0.18)',
  draft:  'rgba(249,115,22,0.14)',
  closed: 'rgba(26,107,191,0.08)',
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function FlowCard({ flow, isAdmin: _isAdmin }: FlowCardProps) {
  const badge  = STATUS_BADGE[flow.effectiveStatus] ?? STATUS_BADGE.closed
  const border = CARD_BORDER[flow.effectiveStatus]  ?? CARD_BORDER.closed

  const opensAt  = flow.starts_at ? formatDate(flow.starts_at) : null
  const closesAt = flow.ends_at   ? formatDate(flow.ends_at)   : null

  return (
    <div style={{
      background: '#ffffff',
      border: `1px solid ${border}`,
      borderRadius: '1rem',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      boxShadow: '0 2px 10px rgba(6,14,38,0.04)',
    }}>

      {/* ── Name + status ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.625rem' }}>
        <p style={{
          fontSize: '0.95rem', fontWeight: 800, color: '#0d1f35',
          letterSpacing: '-0.01em', lineHeight: 1.3,
          flex: 1, minWidth: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {flow.name || 'Unnamed IdeaFlow'}
        </p>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.65rem', fontWeight: 700,
          background: badge.bg, color: badge.color,
          border: `1px solid ${badge.border}`,
          borderRadius: '999px',
          padding: '0.2rem 0.55rem',
          flexShrink: 0,
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: badge.dot }} />
          {badge.label}
        </span>
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
            height: '2.125rem',
            fontSize: '0.8rem', fontWeight: 600,
            color: flow.effectiveStatus === 'active' ? '#c2540a' : '#475569',
            background: flow.effectiveStatus === 'active' ? 'rgba(249,115,22,0.07)' : 'rgba(0,0,0,0.03)',
            border: flow.effectiveStatus === 'active' ? '1px solid rgba(249,115,22,0.18)' : '1px solid rgba(0,0,0,0.07)',
            borderRadius: '0.45rem',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          {flow.effectiveStatus === 'active' ? 'Open IdeaFlow →' : 'Manage →'}
        </Link>
      </div>
    </div>
  )
}
