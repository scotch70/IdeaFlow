/**
 * InnerPageHeader — standardised white top bar for inner / secondary pages.
 *
 * Used by the Review inbox, Settings, and any future admin pages.
 * Provides a consistent back link, page title, and an optional right-side slot.
 *
 * Usage:
 *   <InnerPageHeader title="Review inbox" backHref="/dashboard" />
 *   <InnerPageHeader title="Settings" backHref="/dashboard" right={<SomeButton />} />
 */

'use client'

import Link from 'next/link'
import PageContainer from './PageContainer'

interface InnerPageHeaderProps {
  title: string
  /** Where the ← back arrow links to */
  backHref?: string
  /** Optional label for the back link (defaults to "Back") */
  backLabel?: string
  /** Optional slot rendered on the right side of the header */
  right?: React.ReactNode
  /** Container width — mirrors PageContainer's size prop (default: 'wide') */
  size?: 'wide' | 'narrow'
}

export default function InnerPageHeader({
  title,
  backHref,
  backLabel = 'Back',
  right,
  size = 'wide',
}: InnerPageHeaderProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,                   // sticky within the overflow-y:auto content column
        zIndex: 40,
        background: 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid rgba(26,107,191,0.10)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <PageContainer size={size}>
        <div
          style={{
            height: '3.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {backHref && (
            <Link
              href={backHref}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#64748b',
                fontSize: '0.8rem',
                fontWeight: 500,
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 2.5L4.5 7 9 11.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {backLabel}
            </Link>
          )}

          {backHref && (
            <div
              style={{
                width: '1px',
                height: '1.125rem',
                background: 'rgba(26,107,191,0.15)',
                flexShrink: 0,
              }}
            />
          )}

          <h1
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#0d1f35',
              margin: 0,
              flex: 1,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h1>

          {right && (
            <div style={{ flexShrink: 0 }}>
              {right}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  )
}
