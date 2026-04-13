/**
 * PageContainer — canonical layout wrapper for all pages.
 *
 * Uses the exact same Tailwind classes as SiteHeader so content edges
 * always align perfectly with the navbar logo and nav links.
 *
 * Usage:
 *   <PageContainer>…</PageContainer>               // wide (max-w-7xl) — dashboards, marketing
 *   <PageContainer size="narrow">…</PageContainer>  // narrow (max-w-3xl) — settings, forms
 *
 * Never add horizontal padding via the style prop — let Tailwind's px-6/lg:px-10 handle it.
 */

import React from 'react'

interface PageContainerProps {
  /** 'wide'   = max-w-7xl (80rem) — default, matches SiteHeader exactly
   *  'narrow' = max-w-3xl (48rem) — settings, single-column forms */
  size?: 'wide' | 'narrow'
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

// Both variants use px-6 lg:px-10 to mirror SiteHeader's container to the pixel
const TAILWIND_CLASSES: Record<NonNullable<PageContainerProps['size']>, string> = {
  wide:   'mx-auto w-full max-w-7xl px-6 lg:px-10',
  narrow: 'mx-auto w-full max-w-3xl px-6 lg:px-10',
}

export default function PageContainer({
  size = 'wide',
  className,
  style,
  children,
}: PageContainerProps) {
  return (
    <div
      className={[TAILWIND_CLASSES[size], className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </div>
  )
}
