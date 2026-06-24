'use client'

/**
 * AnimatedCard — thin motion wrapper for scroll-triggered stagger.
 *
 * Usage: wrap each card in a list/grid, passing `delay` as index * step.
 * viewport `once: true` means it fires once and stays; `margin` triggers
 * slightly before the element fully enters so it feels responsive.
 */

import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

interface Props {
  delay?: number
  style?: CSSProperties
  children: React.ReactNode
}

export default function AnimatedCard({ delay = 0, style, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-32px' }}
      transition={{ duration: 0.38, delay, ease: [0.25, 0.1, 0.25, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  )
}
