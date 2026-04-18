'use client'

/**
 * ProductDemo — animated light-theme hero mockup for the IdeaFlow landing page.
 * Requires: npm install framer-motion
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Data ──────────────────────────────────────────────────────────────────────

const IDEAS = [
  {
    id: 1,
    title: 'Let employees suggest improvements anonymously',
    category: 'People & HR',
    finalVotes: 31,
    color: '#f97316',
  },
  {
    id: 2,
    title: 'Better shift handover between teams',
    category: 'Operations',
    finalVotes: 24,
    color: '#94a3b8',
  },
  {
    id: 3,
    title: 'Show which ideas leadership has acted on',
    category: 'Leadership',
    finalVotes: 18,
    color: '#94a3b8',
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function HeartIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CategoryPill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.6rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: '#64748b',
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        borderRadius: '999px',
        padding: '0.15rem 0.5rem',
      }}
    >
      {label}
    </span>
  )
}

interface IdeaCardProps {
  title: string
  category: string
  votes: number
  highlighted: boolean
  color: string
  filled: boolean
}

function IdeaCard({ title, category, votes, highlighted, color, filled }: IdeaCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.75rem 0.875rem',
        borderRadius: '10px',
        background: highlighted ? 'rgba(249,115,22,0.04)' : '#ffffff',
        border: `1px solid ${highlighted ? 'rgba(249,115,22,0.22)' : '#e8ecf0'}`,
        boxShadow: highlighted
          ? '0 2px 12px rgba(249,115,22,0.10)'
          : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease',
      }}
    >
      {/* Vote button */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.15rem',
          minWidth: '1.75rem',
          paddingTop: '0.05rem',
        }}
      >
        <div
          style={{
            width: '1.625rem',
            height: '1.625rem',
            borderRadius: '7px',
            background: filled ? 'rgba(249,115,22,0.08)' : '#f8fafc',
            border: `1px solid ${filled ? 'rgba(249,115,22,0.20)' : '#e8ecf0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          <HeartIcon filled={filled} color={filled ? color : '#cbd5e1'} />
        </div>
        <span
          style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: filled ? color : '#94a3b8',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            transition: 'color 0.3s ease',
            minWidth: '1.5rem',
            textAlign: 'center',
          }}
        >
          {votes}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#0f172a',
            lineHeight: 1.45,
            marginBottom: '0.35rem',
          }}
        >
          {title}
        </p>
        <CategoryPill label={category} />
      </div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProductDemo() {
  const [showCard1, setShowCard1] = useState(false)
  const [showCard2, setShowCard2] = useState(false)
  const [showCard3, setShowCard3] = useState(false)
  const [card1Votes, setCard1Votes] = useState(0)
  const [card1Highlighted, setCard1Highlighted] = useState(false)
  const [showFooter, setShowFooter] = useState(false)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const raf = useRef<number | null>(null)

  function clearAll() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (raf.current !== null) cancelAnimationFrame(raf.current)
  }

  function push(fn: () => void, delay: number) {
    timers.current.push(setTimeout(fn, delay))
  }

  function countUp(target: number, duration: number, setter: (v: number) => void) {
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out-cubic
      setter(Math.round(eased * target))
      if (p < 1) {
        raf.current = requestAnimationFrame(tick)
      }
    }
    raf.current = requestAnimationFrame(tick)
  }

  function runSequence() {
    clearAll()
    setShowCard1(false)
    setShowCard2(false)
    setShowCard3(false)
    setCard1Votes(0)
    setCard1Highlighted(false)
    setShowFooter(false)

    // Card 1 slides in + votes count up
    push(() => {
      setShowCard1(true)
      push(() => countUp(31, 1100, setCard1Votes), 150)
    }, 700)

    // Card 2
    push(() => setShowCard2(true), 1900)

    // Card 3
    push(() => setShowCard3(true), 2700)

    // Card 1 gets highlighted (selected state)
    push(() => setCard1Highlighted(true), 3700)

    // Footer appears
    push(() => setShowFooter(true), 4600)

    // Loop
    push(() => runSequence(), 11000)
  }

  useEffect(() => {
    runSequence()
    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: '100%', maxWidth: '26rem', margin: '0 auto' }}
    >
      {/* Browser window shell */}
      <div
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow:
            '0 0 0 1px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.04), 0 24px 56px rgba(0,0,0,0.12)',
        }}
      >

        {/* ── Browser chrome ── */}
        <div
          style={{
            background: '#f8f9fb',
            borderBottom: '1px solid #e8ecf0',
            padding: '0.55rem 0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
            {['#fc5f57', '#fdbc2c', '#33c748'].map((c, i) => (
              <div
                key={i}
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  background: c,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>

          {/* URL bar */}
          <div
            style={{
              flex: 1,
              height: '1.25rem',
              borderRadius: '0.375rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
            }}
          >
            {/* Lock icon */}
            <svg width="8" height="9" viewBox="0 0 8 9" fill="none" style={{ opacity: 0.4 }}>
              <rect x="1" y="4" width="6" height="5" rx="1" stroke="#64748b" strokeWidth="1"/>
              <path d="M2.5 4V2.5a1.5 1.5 0 0 1 3 0V4" stroke="#64748b" strokeWidth="1"/>
            </svg>
            <span style={{ fontSize: '0.575rem', color: '#94a3b8', letterSpacing: '0.02em' }}>
              useideaflow.com/dashboard
            </span>
          </div>
        </div>

        {/* ── Dashboard panel ── */}
        <div style={{ padding: '1.125rem', background: '#f8f9fb', minHeight: '14rem' }}>

          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '0.1rem',
                }}
              >
                Company idea feed
              </p>
              <p style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 400 }}>
                Sorted by team support
              </p>
            </div>

            {/* Live badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#16a34a',
                background: 'rgba(22,163,74,0.08)',
                border: '1px solid rgba(22,163,74,0.16)',
                borderRadius: '999px',
                padding: '0.2rem 0.55rem',
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#16a34a',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              Live
            </span>
          </div>

          {/* Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <AnimatePresence>
              {showCard1 && (
                <IdeaCard
                  key="card1"
                  title={IDEAS[0].title}
                  category={IDEAS[0].category}
                  votes={card1Votes}
                  highlighted={card1Highlighted}
                  color={IDEAS[0].color}
                  filled={card1Votes > 0}
                />
              )}
              {showCard2 && (
                <IdeaCard
                  key="card2"
                  title={IDEAS[1].title}
                  category={IDEAS[1].category}
                  votes={IDEAS[1].finalVotes}
                  highlighted={false}
                  color={IDEAS[1].color}
                  filled={false}
                />
              )}
              {showCard3 && (
                <IdeaCard
                  key="card3"
                  title={IDEAS[2].title}
                  category={IDEAS[2].category}
                  votes={IDEAS[2].finalVotes}
                  highlighted={false}
                  color={IDEAS[2].color}
                  filled={false}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <AnimatePresence>
            {showFooter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  marginTop: '0.875rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #e8ecf0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <p style={{ fontSize: '0.6rem', color: '#94a3b8' }}>3 new ideas today</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#f97316',
                    }}
                  />
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#ea580c' }}>
                    12 active members
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  )
}
