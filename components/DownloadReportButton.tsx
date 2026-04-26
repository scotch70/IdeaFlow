'use client'

/**
 * DownloadReportButton
 *
 * Pro admins: opens /api/reports/summary in a new tab. The page is a
 * print-ready HTML document that auto-triggers window.print(), so the
 * user can Save as PDF from the browser's print dialog.
 *
 * Free admins: shows a disabled button with an upgrade tooltip/message.
 */

import { useState } from 'react'

interface Props {
  isPro: boolean
}

export default function DownloadReportButton({ isPro }: Props) {
  const [showUpgradeHint, setShowUpgradeHint] = useState(false)

  if (isPro) {
    return (
      <a
        href="/api/reports/summary"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.825rem',
          padding: '0.5rem 1rem',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download PDF report
      </a>
    )
  }

  // Free plan — show disabled button + tooltip
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setShowUpgradeHint(h => !h)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.825rem',
          padding: '0.5rem 1rem',
          borderRadius: '0.625rem',
          border: '1px solid rgba(249,115,22,0.25)',
          background: 'rgba(249,115,22,0.06)',
          color: '#c2540a',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          fontWeight: 600,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Download PDF report
        <span style={{
          fontSize: '0.6rem', fontWeight: 800,
          background: '#f97316', color: '#fff',
          borderRadius: '999px', padding: '1px 6px',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>Pro</span>
      </button>

      {showUpgradeHint && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '220px',
            background: '#fff',
            border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: '0.875rem',
            padding: '1rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 50,
          }}
        >
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.35rem' }}>
            Pro feature
          </p>
          <p style={{ fontSize: '0.75rem', color: '#5a7fa8', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            Download a branded PDF report with your workspace stats, top ideas, and team analytics.
          </p>
          <a
            href="/dashboard?upgrade=true"
            className="btn-primary"
            style={{ display: 'block', textAlign: 'center', fontSize: '0.775rem', padding: '0.45rem 0.75rem', textDecoration: 'none' }}
          >
            Upgrade to Pro →
          </a>
        </div>
      )}
    </div>
  )
}
