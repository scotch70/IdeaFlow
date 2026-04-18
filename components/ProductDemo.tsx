'use client'

/**
 * ProductDemo — animated light-theme hero mockup for the IdeaFlow landing page.
 * Requires: npm install framer-motion
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV = [
  {
    label: 'Dashboard',
    active: false,
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Ideas',
    active: true,
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6l-.7 3H9l-.7-3A7 7 0 0 1 12 2z"/>
        <path d="M9 18h6M10 21h4"/>
      </svg>
    ),
  },
  {
    label: 'Roadmap',
    active: false,
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5h4l3 14h8"/><path d="M7 5l3 14"/>
      </svg>
    ),
  },
  {
    label: 'Members',
    active: false,
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
      </svg>
    ),
  },
  {
    label: 'Settings',
    active: false,
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <div
      style={{
        width: '148px',
        flexShrink: 0,
        background: '#f8fafc',
        borderRight: '1px solid #e8ecf0',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem 0.75rem',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          marginBottom: '1.5rem',
          paddingLeft: '0.25rem',
        }}
      >
        <div
          style={{
            width: '1.375rem',
            height: '1.375rem',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6l-.7 3H9l-.7-3A7 7 0 0 1 12 2z"/>
          </svg>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Idea<span style={{ color: '#f97316' }}>Flow</span>
        </span>
      </div>

      {/* Section label */}
      <p
        style={{
          fontSize: '0.55rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          marginBottom: '0.375rem',
          paddingLeft: '0.375rem',
        }}
      >
        Workspace
      </p>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        {NAV.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.5rem',
              borderRadius: '7px',
              background: item.active ? 'rgba(249,115,22,0.09)' : 'transparent',
              cursor: 'default',
            }}
          >
            {/* Active dot */}
            <span
              style={{
                color: item.active ? '#f97316' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </span>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: item.active ? 700 : 500,
                color: item.active ? '#ea580c' : '#64748b',
                flex: 1,
              }}
            >
              {item.label}
            </span>

            {/* Active indicator pill */}
            {item.active && (
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: '#f97316',
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        ))}
      </nav>

      {/* Bottom: workspace badge */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <div
          style={{
            padding: '0.5rem 0.625rem',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #e8ecf0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.1rem' }}>
            Acme Corp
          </p>
          <p style={{ fontSize: '0.55rem', color: '#94a3b8' }}>Pro · 12 members</p>
        </div>
      </div>
    </div>
  )
}

// ── Idea card ─────────────────────────────────────────────────────────────────

interface IdeaCardProps {
  title: string
  category: string
  votes: number
  highlighted: boolean
  filled: boolean
}

function IdeaCard({ title, category, votes, highlighted, filled }: IdeaCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.75rem 0.875rem',
        borderRadius: '10px',
        background: highlighted ? 'rgba(249,115,22,0.04)' : '#ffffff',
        border: `1px solid ${highlighted ? 'rgba(249,115,22,0.22)' : '#e8ecf0'}`,
        boxShadow: highlighted
          ? '0 2px 10px rgba(249,115,22,0.09)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.35s ease, border-color 0.35s ease, background 0.35s ease',
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
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill={filled ? '#f97316' : 'none'}
            stroke={filled ? '#f97316' : '#cbd5e1'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            color: filled ? '#f97316' : '#94a3b8',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            minWidth: '1.5rem',
            textAlign: 'center',
            transition: 'color 0.3s ease',
          }}
        >
          {votes}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.76rem',
            fontWeight: 600,
            color: '#0f172a',
            lineHeight: 1.45,
            marginBottom: '0.35rem',
          }}
        >
          {title}
        </p>
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.58rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
            color: '#64748b',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '999px',
            padding: '0.15rem 0.5rem',
          }}
        >
          {category}
        </span>
      </div>

      {/* Right arrow */}
      <div style={{ paddingTop: '0.1rem', flexShrink: 0, opacity: highlighted ? 0.6 : 0.2 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const IDEAS = [
  { title: 'Let employees suggest improvements anonymously', category: 'People & HR', finalVotes: 31 },
  { title: 'Better shift handover between teams', category: 'Operations', finalVotes: 24 },
  { title: 'Show which ideas leadership has acted on', category: 'Leadership', finalVotes: 18 },
]

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
      const eased = 1 - Math.pow(1 - p, 3)
      setter(Math.round(eased * target))
      if (p < 1) raf.current = requestAnimationFrame(tick)
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

    push(() => {
      setShowCard1(true)
      push(() => countUp(31, 1100, setCard1Votes), 180)
    }, 700)

    push(() => setShowCard2(true), 1950)
    push(() => setShowCard3(true), 2800)
    push(() => setCard1Highlighted(true), 3800)
    push(() => setShowFooter(true), 4700)
    push(() => runSequence(), 11500)
  }

  useEffect(() => {
    runSequence()
    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: '100%', maxWidth: '42rem', margin: '0 auto' }}
    >
      {/* Browser window */}
      <div
        style={{
          borderRadius: '14px',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow:
            '0 0 0 1px rgba(0,0,0,0.07), 0 4px 6px rgba(0,0,0,0.03), 0 20px 48px rgba(0,0,0,0.11)',
        }}
      >
        {/* ── Browser chrome ── */}
        <div
          style={{
            background: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            padding: '0.5rem 0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
            {['#fc5f57', '#fdbc2c', '#33c748'].map((c, i) => (
              <div
                key={i}
                style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', background: c, opacity: 0.85 }}
              />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              height: '1.2rem',
              borderRadius: '6px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
            }}
          >
            <svg width="7" height="8" viewBox="0 0 8 9" fill="none" style={{ opacity: 0.35 }}>
              <rect x="1" y="4" width="6" height="5" rx="1" stroke="#64748b" strokeWidth="1"/>
              <path d="M2.5 4V2.5a1.5 1.5 0 0 1 3 0V4" stroke="#64748b" strokeWidth="1"/>
            </svg>
            <span style={{ fontSize: '0.56rem', color: '#94a3b8', letterSpacing: '0.02em' }}>
              useideaflow.com/dashboard
            </span>
          </div>
          {/* Window controls placeholder */}
          <div style={{ width: '2rem', flexShrink: 0 }} />
        </div>

        {/* ── Dashboard body ── */}
        <div style={{ display: 'flex', height: '100%' }}>

          {/* Left sidebar */}
          <Sidebar />

          {/* Main content */}
          <div style={{ flex: 1, padding: '1.125rem 1.25rem', background: '#f8fafc', minHeight: '16rem' }}>

            {/* Top bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
              }}
            >
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.1rem' }}>
                  Company idea feed
                </p>
                <p style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Sorted by team support</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Filter pill */}
                <span
                  style={{
                    fontSize: '0.58rem',
                    fontWeight: 600,
                    color: '#64748b',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '999px',
                    padding: '0.2rem 0.55rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  All ideas
                </span>
                {/* Live badge */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    color: '#16a34a',
                    background: 'rgba(22,163,74,0.07)',
                    border: '1px solid rgba(22,163,74,0.15)',
                    borderRadius: '999px',
                    padding: '0.2rem 0.5rem',
                  }}
                >
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                  Live
                </span>
              </div>
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
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  style={{
                    marginTop: '0.875rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <p style={{ fontSize: '0.58rem', color: '#94a3b8' }}>3 new ideas today</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.58rem', fontWeight: 600, color: '#ea580c' }}>12 active members</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </motion.div>
  )
}
