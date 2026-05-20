'use client'

/**
 * Small client-only link used inside the dashboard <summary>.
 *
 * Must be a client component because it needs onClick to stop the click from
 * bubbling up to the <summary>, which would otherwise toggle the <details>
 * open/closed when the user just wanted to navigate.
 */

import Link from 'next/link'

export default function AnalyticsSummaryLink() {
  return (
    <Link
      href="/dashboard/analytics"
      onClick={(e) => e.stopPropagation()}
      style={{
        marginLeft: 'auto',
        fontSize: '0.75rem',
        fontWeight: 500,
        color: '#1a6bbf',
        textDecoration: 'none',
      }}
    >
      Full analytics →
    </Link>
  )
}
