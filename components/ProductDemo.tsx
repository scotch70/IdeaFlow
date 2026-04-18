'use client'

/**
 * ProductDemo — animated hero mockup for the IdeaFlow landing page.
 *
 * Requires: npm install framer-motion
 *
 * Drop into any page: <ProductDemo />
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

type BadgeLabel = 'Under Review' | 'Planned' | 'Implemented' | null

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg: '#0d1117',
  chrome: '#161b22',
  border: 'rgba(255,255,255,0.08)',
  borderFaint: 'rgba(255,255,255,0.05)',
  text: 'rgba(255,255,255,0.88)',
  textMid: 'rgba(255,255,255,0.5)',
  textFaint: 'rgba(255,255,255,0.28)',
  card: 'rgba(255,255,255,0.04)',
  orange: '#f97316',
} as const

const BADGE: Record<string, { bg: string; color: string }> = {
  'Under Review': { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  'Planned':      { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa' },
  'Implemented':  { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80' },
}

const ease = [0.25, 0.46, 0.45, 0.94] as const

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ label }: { label: string }) {
  const s = BADGE[label]
  if (!s) return null
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.75 }}
      transition={{ duration: 0.3, ease }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.18rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.03em',
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}28`,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {label}
    </motion.span>
  )
}

function IdeaCard({
  title,
  category,
  votes,
  badge,
}: {
  title: string
  category: string
  votes: number | string
  badge: BadgeLabel
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        borderRadius: '0.75rem',
        border: `1px solid ${C.border}`,
        background: C.card,
      }}
    >
      {/* Upvote column */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          minWidth: '1.75rem',
          paddingTop: '2px',
        }}
      >
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M5 0.5L9.5 7.5H0.5L5 0.5Z" fill="rgba(255,255,255,0.35)" />
        </svg>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            lineHeight: 1,
            color: C.text,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {votes}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.375rem',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: C.textFaint,
              flexShrink: 0,
            }}
          >
            {category}
          </span>

          <AnimatePresence mode="wait">
            {badge && <StatusBadge key={badge} label={badge} />}
          </AnimatePresence>
        </div>

        <p
          style={{
            fontSize: '12.5px',
            lineHeight: 1.55,
            color: C.text,
            margin: 0,
          }}
        >
          {title}
        </p>
      </div>
    </div>
  )
}

function SidebarItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.625rem',
        borderRadius: '0.5rem',
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
        color: active ? C.orange : C.textFaint,
        background: active ? 'rgba(249,115,22,0.10)' : 'transparent',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: 'currentColor',
          opacity: active ? 0.8 : 0.5,
          flexShrink: 0,
        }}
      />
      {label}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProductDemo() {
  const [showCard1, setShowCard1] = useState(false)
  const [showCard2, setShowCard2] = useState(false)
  const [showCard3, setShowCard3] = useState(false)
  const [badge1, setBadge1] = useState<BadgeLabel>(null)
  const [badge2, setBadge2] = useState<BadgeLabel>(null)
  const [card1Votes, setCard1Votes] = useState(0)
  const [showFooter, setShowFooter] = useState(false)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const raf = useRef<number>(0)

  function clearAll() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    cancelAnimationFrame(raf.current)
  }

  function schedule(fn: () => void, ms: number) {
    timers.current.push(setTimeout(fn, ms))
  }

  function countUp(to: number, durationMs: number) {
    const t0 = Date.now()
    function tick() {
      const p = Math.min((Date.now() - t0) / durationMs, 1)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out-cubic
      setCard1Votes(Math.round(to * eased))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    function run() {
      // ── Reset ────────────────────────────────────────────────────────────
      setShowCard1(false)
      setShowCard2(false)
      setShowCard3(false)
      setBadge1(null)
      setBadge2(null)
      setCard1Votes(0)
      setShowFooter(false)

      // ── Sequence ─────────────────────────────────────────────────────────
      schedule(() => {
        setShowCard1(true)
        countUp(31, 1400)
      }, 600)

      schedule(() => setShowCard2(true), 2700)
      schedule(() => setShowCard3(true), 4200)
      schedule(() => setBadge1('Under Review'), 5400)
      schedule(() => setBadge2('Planned'), 6600)
      schedule(() => setShowFooter(true), 7700)

      // ── Loop ─────────────────────────────────────────────────────────────
      schedule(() => {
        clearAll()
        run()
      }, 11000)
    }

    run()
    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    /* Floating wrapper */
    <motion.div
      style={{ position: 'relative', width: '100%' }}
      animate={{ y: [0, -7, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Ambient glow beneath the panel */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '1.5rem',
          background:
            'radial-gradient(ellipse 70% 40% at 50% 110%, rgba(249,115,22,0.18) 0%, transparent 70%)',
          filter: 'blur(24px)',
          transform: 'translateY(8px) scaleX(0.92)',
          zIndex: 0,
        }}
      />

      {/* Browser window */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease }}
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: '1.125rem',
          overflow: 'hidden',
          background: C.bg,
          border: `1px solid ${C.border}`,
          boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >

        {/* ── Browser chrome ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 1rem',
            background: C.chrome,
            borderBottom: `1px solid ${C.borderFaint}`,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
              <div
                key={color}
                style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }}
              />
            ))}
          </div>

          {/* URL bar */}
          <div
            style={{
              flex: 1,
              borderRadius: '0.375rem',
              padding: '0.25rem 0.75rem',
              background: 'rgba(255,255,255,0.05)',
              fontSize: '11px',
              fontFamily: 'ui-monospace, monospace',
              color: C.textFaint,
              textAlign: 'center',
              letterSpacing: '0.01em',
            }}
          >
            app.useideaflow.com/ideas
          </div>

          {/* Spacer to balance traffic lights */}
          <div style={{ width: '3rem', flexShrink: 0 }} />
        </div>

        {/* ── App layout ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', minHeight: '340px' }}>

          {/* Sidebar */}
          <div
            style={{
              width: '148px',
              flexShrink: 0,
              padding: '1rem 0.625rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              borderRight: `1px solid ${C.borderFaint}`,
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '5px',
                  background: C.orange,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 800, color: C.text }}>
                IdeaFlow
              </span>
            </div>

            <SidebarItem label="Dashboard" active={false} />
            <SidebarItem label="Ideas" active={true} />
            <SidebarItem label="Roadmap" active={false} />
            <SidebarItem label="Members" active={false} />
            <SidebarItem label="Settings" active={false} />
          </div>

          {/* Main panel */}
          <div
            style={{
              flex: 1,
              padding: '1.125rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minWidth: 0,
            }}
          >
            {/* Page header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: C.textFaint,
                    marginBottom: '0.2rem',
                  }}
                >
                  Workspace
                </p>
                <h2
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: C.text,
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  Ideas
                </h2>
              </div>

              <div
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: C.orange,
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#fff',
                  cursor: 'default',
                  userSelect: 'none',
                }}
              >
                + Submit idea
              </div>
            </div>

            {/* Tab strip */}
            <div style={{ display: 'flex', gap: '0.125rem' }}>
              {['All', 'New', 'Under Review', 'Planned'].map((tab) => (
                <div
                  key={tab}
                  style={{
                    padding: '0.25rem 0.625rem',
                    borderRadius: '0.375rem',
                    fontSize: '11px',
                    fontWeight: tab === 'All' ? 600 : 400,
                    color: tab === 'All' ? C.textMid : C.textFaint,
                    background: tab === 'All' ? 'rgba(255,255,255,0.06)' : 'transparent',
                    cursor: 'default',
                    userSelect: 'none',
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <AnimatePresence>
                {showCard1 && (
                  <motion.div
                    key="card1"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    <IdeaCard
                      title="Let employees suggest improvements anonymously"
                      category="Process"
                      votes={card1Votes}
                      badge={badge1}
                    />
                  </motion.div>
                )}

                {showCard2 && (
                  <motion.div
                    key="card2"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    <IdeaCard
                      title="Better shift handover between teams"
                      category="Operations"
                      votes={24}
                      badge={badge2}
                    />
                  </motion.div>
                )}

                {showCard3 && (
                  <motion.div
                    key="card3"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    <IdeaCard
                      title="Show which ideas leadership has acted on"
                      category="Transparency"
                      votes={18}
                      badge={null}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer stat */}
            <AnimatePresence>
              {showFooter && (
                <motion.div
                  key="footer"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease }}
                  style={{
                    marginTop: 'auto',
                    paddingTop: '0.75rem',
                    borderTop: `1px solid ${C.borderFaint}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#4ade80',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#4ade80' }}>
                    3 ideas implemented this month
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
