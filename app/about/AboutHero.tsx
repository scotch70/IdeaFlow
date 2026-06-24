'use client'

/**
 * AboutHero — client component so we can animate on mount.
 * The rest of the About page is a server component.
 *
 * Animation intent: each element fades up with a tiny stagger,
 * making the headline feel considered rather than static.
 * Duration is short (≤ 0.5 s) so it never feels like waiting.
 */

import Link from 'next/link'
import { motion } from 'framer-motion'

const ease = [0.25, 0.1, 0.25, 1] as const

function fadeUp(delay: number) {
  return {
    initial:    { opacity: 0, y: 14 },
    animate:    { opacity: 1, y: 0  },
    transition: { duration: 0.45, delay, ease },
  }
}

export default function AboutHero() {
  return (
    <div style={{ maxWidth: '40rem' }}>
      <motion.p
        {...fadeUp(0)}
        style={{
          fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#6b7799', opacity: 0.75,
          marginBottom: '0.625rem',
        }}
      >
        About
      </motion.p>

      <motion.h1
        {...fadeUp(0.08)}
        style={{
          fontFamily: "'Instrument Serif', serif", fontStyle: 'italic',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          letterSpacing: '-0.025em', color: '#1c1f2e',
          lineHeight: 1.12, marginBottom: '1.25rem',
        }}
      >
        Good ideas deserve better than a Slack thread
      </motion.h1>

      <motion.p
        {...fadeUp(0.16)}
        style={{
          fontSize: '1.0625rem', lineHeight: 1.75, color: '#6b7799',
          marginBottom: '2rem',
        }}
      >
        IdeaFlow exists because too many good ideas quietly disappear — buried in a
        message thread, lost after a workshop, or ignored because there was no clear
        way to act on them. We built a focused tool to fix that.
      </motion.p>

      <motion.div
        {...fadeUp(0.24)}
        style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
      >
        <Link href="/auth?mode=signup" style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '0.625rem 1.25rem',
          background: '#1c1f2e', color: '#ffffff',
          borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600,
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          Try IdeaFlow free
        </Link>
        <Link href="/demo" style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '0.625rem 1.25rem',
          border: '1px solid rgba(0,0,0,0.12)', color: '#1c1f2e',
          borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600,
          textDecoration: 'none', whiteSpace: 'nowrap',
          background: 'transparent',
        }}>
          See the demo
        </Link>
      </motion.div>
    </div>
  )
}
