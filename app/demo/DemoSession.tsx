'use client'

/**
 * DemoSession — public, non-interactive Brainstorm Session showcase.
 *
 * Uses the same visual vocabulary as the real Sessions workspace (dark
 * canvas, step rail, guide panel) but with fixed mock data — no Supabase,
 * no drag, no edits. The goal is to communicate the value of Sessions at
 * a glance and convert toward Pro.
 *
 * Mock content:
 *   • Template: Startup Idea — Freelancer Marketplace
 *   • 7 example cards (Problem, Audience, Cause, Idea, Risk, Decision, Task)
 *   • Visible connections (Problem → Audience, Cause → Idea, Idea → Risk → Decision → Task)
 *   • Step rail with the first two steps marked complete
 *   • Right-side activity feed with realistic relative timestamps
 *   • Demo CTA pinned to the top-right: Start Free + Upgrade to Pro
 */

import Link from 'next/link'
import { useEffect, useState } from 'react'

// ── Visual tokens (match SessionWorkspace) ───────────────────────────────────
const CANVAS_BG      = '#0e1320'
const CANVAS_SURFACE = '#161c2e'
const CANVAS_BORDER  = 'rgba(255,255,255,0.07)'
const CANVAS_DOT     = 'rgba(255,255,255,0.05)'

const CARD_W = 220
const CARD_H = 110

// ── Mock data ────────────────────────────────────────────────────────────────
interface DemoCard {
  id:       string
  type:     'problem' | 'audience' | 'cause' | 'idea' | 'risk' | 'decision' | 'task'
  label:    string
  accent:   string
  ink:      string
  bg:       string
  title:    string
  detail:   string
  x:        number
  y:        number
  owner:    string
  ownerColor: string
  ownerRole:  'Admin' | 'Member'
  starred?: boolean
}

const C = {
  problem:  { accent: '#f97316', ink: '#fdba74', bg: 'rgba(249,115,22,0.10)',  label: 'PROBLEM'   },
  audience: { accent: '#3b82f6', ink: '#93c5fd', bg: 'rgba(59,130,246,0.10)',  label: 'AUDIENCE'  },
  cause:    { accent: '#a78bfa', ink: '#c4b5fd', bg: 'rgba(167,139,250,0.10)', label: 'CAUSE'     },
  idea:     { accent: '#10b981', ink: '#6ee7b7', bg: 'rgba(16,185,129,0.10)',  label: 'IDEA'      },
  risk:     { accent: '#f59e0b', ink: '#fcd34d', bg: 'rgba(245,158,11,0.10)',  label: 'RISK'      },
  decision: { accent: '#06b6d4', ink: '#67e8f9', bg: 'rgba(6,182,212,0.10)',   label: 'DECISION'  },
  task:     { accent: '#94a3b8', ink: '#cbd5e1', bg: 'rgba(148,163,184,0.10)', label: 'TASK'      },
} as const

const DEMO_CARDS: DemoCard[] = [
  {
    id: 'card-problem', type: 'problem', ...C.problem,
    title: 'Busy professionals waste time finding reliable help',
    detail: 'Hours lost vetting freelancers across half-a-dozen platforms.',
    x: 40, y: 30,
    owner: 'Sara Kim', ownerColor: 'rgba(249,115,22,0.45)', ownerRole: 'Admin', starred: true,
  },
  {
    id: 'card-audience', type: 'audience', ...C.audience,
    title: 'Busy professionals & small businesses',
    detail: 'Founders, ops leads, and indie agencies — $50k+/yr in freelance spend.',
    x: 304, y: 30,
    owner: 'James Ortiz', ownerColor: 'rgba(59,130,246,0.45)', ownerRole: 'Member',
  },
  {
    id: 'card-cause', type: 'cause', ...C.cause,
    title: 'Too many low-quality freelancers',
    detail: 'Open marketplaces favour volume over signal — vetting falls on the buyer.',
    x: 40, y: 180,
    owner: 'Priya Shah', ownerColor: 'rgba(167,139,250,0.45)', ownerRole: 'Member',
  },
  {
    id: 'card-idea', type: 'idea', ...C.idea,
    title: 'Vetted marketplace with reviews',
    detail: 'Curated supply + structured reviews + verified past work.',
    x: 304, y: 180,
    owner: 'Sara Kim', ownerColor: 'rgba(249,115,22,0.45)', ownerRole: 'Admin', starred: true,
  },
  {
    id: 'card-risk', type: 'risk', ...C.risk,
    title: 'Chicken-and-egg problem',
    detail: 'No demand → no supply → no demand. Need a side to seed first.',
    x: 568, y: 100,
    owner: 'Marcus Lin', ownerColor: 'rgba(16,185,129,0.45)', ownerRole: 'Member',
  },
  {
    id: 'card-decision', type: 'decision', ...C.decision,
    title: 'Start with a niche market',
    detail: 'Pilot in B2B legal admin work — defined buyers, repeatable scope.',
    x: 568, y: 252,
    owner: 'Sara Kim', ownerColor: 'rgba(249,115,22,0.45)', ownerRole: 'Admin', starred: true,
  },
  {
    id: 'card-task', type: 'task', ...C.task,
    title: 'Interview 10 users',
    detail: 'Talk to 10 legal-ops leads next week — confirm pain + price ceiling.',
    x: 304, y: 354,
    owner: 'James Ortiz', ownerColor: 'rgba(59,130,246,0.45)', ownerRole: 'Member',
  },
]

interface DemoConnection { from: string; to: string }
const DEMO_CONNECTIONS: DemoConnection[] = [
  { from: 'card-problem',  to: 'card-audience' },
  { from: 'card-problem',  to: 'card-cause'    },
  { from: 'card-cause',    to: 'card-idea'     },
  { from: 'card-idea',     to: 'card-risk'     },
  { from: 'card-idea',     to: 'card-decision' },
  { from: 'card-decision', to: 'card-task'     },
  { from: 'card-audience', to: 'card-idea'     },
]

const DEMO_STEPS = [
  { key: 'define',     label: 'Define',     done: true,  active: false },
  { key: 'explore',    label: 'Explore',    done: true,  active: false },
  { key: 'connect',    label: 'Connect',    done: false, active: true  },
  { key: 'prioritize', label: 'Prioritize', done: false, active: false },
  { key: 'action',     label: 'Action plan',done: false, active: false },
]

const STEP_HELPER: Record<string, string> = {
  define:     'Clarify what you are solving — the problem, the audience, the goal.',
  explore:    'Add many rough ideas without judging them.',
  connect:    'Link related thoughts together.',
  prioritize: 'Choose what matters most.',
  action:     'Turn the best ideas into next steps.',
}

const DEMO_ACTIVITY = [
  { who: 'Sara Kim',     initials: 'SK', color: 'rgba(249,115,22,0.45)', what: 'starred',     target: 'Vetted marketplace with reviews', when: 'just now'  },
  { who: 'James Ortiz',  initials: 'JO', color: 'rgba(59,130,246,0.45)', what: 'added',       target: 'Audience card',                    when: '2 min ago' },
  { who: 'Priya Shah',   initials: 'PS', color: 'rgba(167,139,250,0.45)', what: 'connected',  target: 'Cause → Idea',                     when: '8 min ago' },
  { who: 'Marcus Lin',   initials: 'ML', color: 'rgba(16,185,129,0.45)', what: 'added',       target: 'Risk card',                        when: '14 min ago' },
  { who: 'Sara Kim',     initials: 'SK', color: 'rgba(249,115,22,0.45)', what: 'completed',   target: 'Step 2 — Explore',                 when: '32 min ago' },
  { who: 'James Ortiz',  initials: 'JO', color: 'rgba(59,130,246,0.45)', what: 'added',       target: 'Task card — Interview 10 users',   when: '1h ago'    },
]

// ─────────────────────────────────────────────────────────────────────────────

export default function DemoSession() {
  // Pulse animation key — pulses connected lines slowly so the canvas feels
  // alive without being chaotic.
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 1_000_000), 2200)
    return () => clearInterval(id)
  }, [])

  const cardById = new Map(DEMO_CARDS.map(c => [c.id, c]))
  function center(card: DemoCard) { return { cx: card.x + CARD_W / 2, cy: card.y + CARD_H / 2 } }
  function curve(a: DemoCard, b: DemoCard) {
    const p = center(a), q = center(b)
    const dx = (q.cx - p.cx) * 0.45
    return `M ${p.cx} ${p.cy} C ${p.cx + dx} ${p.cy}, ${q.cx - dx} ${q.cy}, ${q.cx} ${q.cy}`
  }

  return (
    <div style={{ height: 'calc(100vh - 3.625rem - 4rem)', minHeight: 640, display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid rgba(26,107,191,0.09)',
          padding: '0.625rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.85rem',
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '0.95rem', fontWeight: 800, color: '#0d1f35',
            letterSpacing: '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            Startup Idea — Freelancer Marketplace
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.05rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#9faab8' }}>🚀 Startup Idea template</span>
            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cdd5e0' }} />
            <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 500 }}>Saved</span>
            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cdd5e0' }} />
            <span style={{ fontSize: '0.7rem', color: '#9faab8' }}>4 collaborators</span>
          </div>
        </div>

        {/* Demo CTA — pinned to top right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#5d667a', fontWeight: 500, display: 'none' }} className="demo-cta-label">
            Try your own Brainstorm Session
          </span>
          <Link
            href="/auth?mode=signup"
            style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: '0.78rem', fontWeight: 700,
              padding: '0.45rem 0.8rem', borderRadius: '0.5rem',
              background: '#fff', color: '#0d1f35',
              border: '1px solid rgba(26,107,191,0.18)',
              textDecoration: 'none',
            }}
          >
            Start Free
          </Link>
          <Link
            href="/settings#billing"
            style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: '0.78rem', fontWeight: 700,
              padding: '0.45rem 0.8rem', borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #1a2035 0%, #0f1726 100%)',
              color: '#fff',
              border: '1px solid rgba(99,179,237,0.24)',
              textDecoration: 'none',
              boxShadow: '0 2px 14px rgba(9,13,30,0.22)',
            }}
          >
            ✦ Upgrade to Pro
          </Link>
        </div>
      </div>

      {/* ── Three-pane workspace ───────────────────────────────────────────── */}
      <div
        style={{
          flex: 1, minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '15rem minmax(0, 1fr) 17rem',
        }}
        className="demo-session-grid"
      >
        {/* Left: step rail */}
        <aside
          style={{
            background: '#faf9f7',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            padding: '0.85rem 0.75rem',
            overflowY: 'auto',
          }}
        >
          <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8', padding: '0 0.4rem', marginBottom: '0.55rem' }}>
            Session steps
          </p>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {DEMO_STEPS.map((s, idx) => (
              <li key={s.key}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.55rem 0.6rem',
                    paddingLeft: s.active ? 'calc(0.6rem - 2px)' : '0.6rem',
                    borderRadius: '0.55rem',
                    background: s.active ? 'rgba(249,115,22,0.08)' : 'transparent',
                    borderLeft: s.active ? '2px solid rgba(249,115,22,0.65)' : '2px solid transparent',
                    color: s.active ? '#b84a09' : s.done ? '#9faab8' : '#3d4758',
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: '1.45rem', height: '1.45rem', borderRadius: '999px',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 800,
                      background: s.done
                        ? 'rgba(16,185,129,0.14)'
                        : s.active
                          ? 'rgba(249,115,22,0.16)'
                          : 'rgba(15,23,42,0.05)',
                      color: s.done ? '#059669' : s.active ? '#b84a09' : '#64748b',
                      border: s.done ? '1px solid rgba(16,185,129,0.30)' : '1px solid transparent',
                    }}
                  >
                    {s.done ? '✓' : idx + 1}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: s.active ? 700 : 600, letterSpacing: '-0.01em', flex: 1, textDecoration: s.done && !s.active ? 'line-through' : 'none' }}>
                    Step {idx + 1} — {s.label}
                  </span>
                </div>
                {s.active && (
                  <p style={{ padding: '0 0.7rem 0.7rem', paddingLeft: 'calc(0.6rem + 1.45rem + 0.6rem - 2px)', fontSize: '0.74rem', color: '#5d667a', lineHeight: 1.5 }}>
                    {STEP_HELPER[s.key]}
                  </p>
                )}
              </li>
            ))}
          </ol>

          <div style={{ marginTop: '1.2rem', padding: '0.7rem 0.7rem 0.75rem', borderRadius: '0.55rem', background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.06)' }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, color: '#5d667a', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Tip
            </p>
            <p style={{ fontSize: '0.76rem', color: '#3d4758', lineHeight: 1.5 }}>
              Sessions work best with 2–5 people. Invite teammates from the workspace settings.
            </p>
          </div>
        </aside>

        {/* Center: dark canvas */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: CANVAS_BG,
            backgroundImage: `radial-gradient(${CANVAS_DOT} 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
            backgroundPosition: '-1px -1px',
            minHeight: 0,
          }}
        >
          {/* Connection layer */}
          <svg width="100%" height="100%" viewBox="0 0 760 480" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <marker id="demo-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(148,163,184,0.7)" />
              </marker>
            </defs>
            {DEMO_CONNECTIONS.map((conn, i) => {
              const a = cardById.get(conn.from); const b = cardById.get(conn.to)
              if (!a || !b) return null
              return (
                <path
                  key={`${conn.from}-${conn.to}`}
                  d={curve(a, b)}
                  fill="none"
                  stroke="rgba(148,163,184,0.55)"
                  strokeWidth={(tick + i) % 5 === 0 ? 1.8 : 1.4}
                  markerEnd="url(#demo-arrow)"
                  style={{ transition: 'stroke-width 0.6s ease' }}
                />
              )
            })}
          </svg>

          {/* Cards */}
          {DEMO_CARDS.map(card => (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                left: card.x, top: card.y,
                width: CARD_W, minHeight: CARD_H,
                background: CANVAS_SURFACE,
                backgroundImage: `linear-gradient(180deg, ${card.bg}, transparent 65%)`,
                border: `1px solid ${CANVAS_BORDER}`,
                borderRadius: '0.65rem',
                padding: '0.55rem 0.7rem 0.65rem 0.85rem',
                color: '#e6ecf5',
                boxShadow: card.starred
                  ? `0 0 0 2px ${card.accent}33, 0 4px 18px rgba(0,0,0,0.32)`
                  : '0 4px 18px rgba(0,0,0,0.32)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                cursor: 'default',
              }}
              className="demo-card-hover"
            >
              <div
                style={{
                  position: 'absolute', top: '0.6rem', bottom: '0.6rem', left: '0.3rem',
                  width: '3px', borderRadius: '999px', background: card.accent, opacity: 0.85,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                <span style={{
                  fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: card.ink, background: card.bg,
                  border: `1px solid ${card.accent}33`,
                  padding: '0.1rem 0.4rem', borderRadius: '999px',
                }}>
                  {card.label}
                </span>
                {card.starred && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinejoin="round">
                    <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" />
                  </svg>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f4f7fb', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                {card.title}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(230,236,245,0.62)', lineHeight: 1.4, marginTop: '0.25rem' }}>
                {card.detail}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem' }}>
                <span style={{
                  width: '1rem', height: '1rem', borderRadius: '999px',
                  background: card.ownerColor,
                  border: '1px solid rgba(255,255,255,0.10)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5rem', fontWeight: 800, color: '#fff',
                }}>
                  {card.owner.split(' ').map(p => p[0]).join('').slice(0, 2)}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.42)' }}>
                  {card.owner.split(' ')[0]} · <span style={{ color: 'rgba(255,255,255,0.32)' }}>{card.ownerRole}</span>
                </span>
              </div>
            </div>
          ))}

          {/* Helper strip */}
          <div
            style={{
              position: 'absolute', bottom: 12, left: 0, right: 0,
              display: 'flex', justifyContent: 'center', pointerEvents: 'none',
              padding: '0 1rem',
            }}
          >
            <div
              style={{
                pointerEvents: 'auto',
                background: 'rgba(15,23,42,0.78)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '999px',
                padding: '0.4rem 0.95rem',
                color: 'rgba(255,255,255,0.78)',
                fontSize: '0.72rem',
                fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '0.55rem',
                boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>Demo session — preview only.</span>
              <Link
                href="/auth?mode=signup"
                style={{ color: '#fbd5b5', textDecoration: 'underline', textUnderlineOffset: '2px', fontWeight: 700 }}
              >
                Start your own
              </Link>
            </div>
          </div>
        </div>

        {/* Right: team activity */}
        <aside
          style={{
            background: '#fff',
            borderLeft: '1px solid rgba(0,0,0,0.06)',
            padding: '0.95rem 0.95rem 1.1rem',
            overflowY: 'auto',
          }}
        >
          <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8', marginBottom: '0.65rem' }}>
            Team activity
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {DEMO_ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: '1.4rem', height: '1.4rem', borderRadius: '999px',
                    background: a.color, color: '#fff',
                    fontSize: '0.55rem', fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {a.initials}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.78rem', color: '#3d4758', lineHeight: 1.45 }}>
                    <strong style={{ color: '#0d1f35', fontWeight: 700 }}>{a.who}</strong>{' '}
                    <span style={{ color: '#5d667a' }}>{a.what}</span>{' '}
                    <span style={{ color: '#0d1f35', fontWeight: 600 }}>{a.target}</span>
                  </p>
                  <p style={{ fontSize: '0.68rem', color: '#9faab8', marginTop: '0.1rem' }}>{a.when}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '1.3rem',
              padding: '0.85rem',
              borderRadius: '0.6rem',
              border: '1px solid rgba(249,115,22,0.22)',
              background: 'rgba(249,115,22,0.04)',
            }}
          >
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c2540a', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              ✦ Pro feature
            </p>
            <p style={{ fontSize: '0.78rem', color: '#3d4758', lineHeight: 1.5, marginBottom: '0.65rem' }}>
              Sessions are part of IdeaFlow Pro. Run unlimited brainstorming sessions with your team.
            </p>
            <Link
              href="/settings#billing"
              style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: '0.76rem', fontWeight: 700,
                background: '#0d1f35', color: '#fff',
                padding: '0.45rem 0.8rem', borderRadius: '0.45rem',
                textDecoration: 'none',
              }}
            >
              Upgrade to Pro →
            </Link>
          </div>
        </aside>
      </div>

      <style>{`
        .demo-card-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.10), 0 8px 24px rgba(0,0,0,0.42) !important;
        }
        @media (max-width: 1100px) {
          .demo-session-grid { grid-template-columns: 13rem minmax(0, 1fr) 15rem !important; }
        }
        @media (max-width: 880px) {
          .demo-session-grid { grid-template-columns: 3.5rem minmax(0, 1fr) 0 !important; }
        }
      `}</style>
    </div>
  )
}
