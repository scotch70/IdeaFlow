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

// Match the real workspace card dimensions so the demo reads as accurate.
const CARD_W = 236
const CARD_H = 118

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

// Positions are picked so the eye reads top→bottom-left→right (Problem
// anchors the top-left, Idea sits beneath it, Risk + Decision flank to the
// right, Task closes at the bottom). Hand-tuned for the new wider canvas.
// Six cards laid out in a clean three-column flow (Problem/Audience on top,
// Cause/Idea in the middle, Decision/Task at the bottom). Titles are short
// noun phrases, details are one short sentence — the eye should read each
// card in under two seconds. Risk was removed for clarity; the user can see
// the same scenario without it.
const DEMO_CARDS: DemoCard[] = [
  {
    id: 'card-problem', type: 'problem', ...C.problem,
    title: 'Finding reliable freelancers',
    detail: 'Hours lost vetting across many platforms.',
    x: 64, y: 56,
    owner: 'Sara Kim', ownerColor: 'rgba(249,115,22,0.45)', ownerRole: 'Admin', starred: true,
  },
  {
    id: 'card-audience', type: 'audience', ...C.audience,
    title: 'Busy professionals',
    detail: 'Founders and small-business ops leads.',
    x: 412, y: 56,
    owner: 'James Ortiz', ownerColor: 'rgba(59,130,246,0.45)', ownerRole: 'Member',
  },
  {
    id: 'card-cause', type: 'cause', ...C.cause,
    title: 'Volume over quality',
    detail: 'Open marketplaces leave vetting to the buyer.',
    x: 64, y: 240,
    owner: 'Priya Shah', ownerColor: 'rgba(167,139,250,0.45)', ownerRole: 'Member',
  },
  {
    id: 'card-idea', type: 'idea', ...C.idea,
    title: 'Vetted marketplace',
    detail: 'Curated supply with verified past work.',
    x: 412, y: 240,
    owner: 'Sara Kim', ownerColor: 'rgba(249,115,22,0.45)', ownerRole: 'Admin', starred: true,
  },
  {
    id: 'card-decision', type: 'decision', ...C.decision,
    title: 'Start with a niche',
    detail: 'Pilot in B2B legal admin work.',
    x: 760, y: 240,
    owner: 'Sara Kim', ownerColor: 'rgba(249,115,22,0.45)', ownerRole: 'Admin', starred: true,
  },
  {
    id: 'card-task', type: 'task', ...C.task,
    title: 'Interview 10 users',
    detail: 'Confirm pain + price ceiling this week.',
    x: 412, y: 424,
    owner: 'James Ortiz', ownerColor: 'rgba(59,130,246,0.45)', ownerRole: 'Member',
  },
]

interface DemoConnection { from: string; to: string }
// Four clean lines so the flow reads left→right, top→bottom without crossings.
// Problem → Audience (top row), Problem → Cause → Idea → Decision → Task.
const DEMO_CONNECTIONS: DemoConnection[] = [
  { from: 'card-problem',  to: 'card-audience' },
  { from: 'card-problem',  to: 'card-cause'    },
  { from: 'card-cause',    to: 'card-idea'     },
  { from: 'card-idea',     to: 'card-decision' },
  { from: 'card-decision', to: 'card-task'     },
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

// "How this session works" — the new right-panel explainer. Lives above the
// activity feed so first-time users get the framing before the social proof.
const HOW_IT_WORKS = [
  'Start with a Problem — make the question concrete.',
  'Add Idea cards, then link the related ones together.',
  'Star the best ideas and turn them into Tasks.',
]

// Activity trimmed to 3 items — premium feel without overwhelming a new user.
const DEMO_ACTIVITY = [
  { who: 'Sara Kim',    initials: 'SK', color: 'rgba(249,115,22,0.45)',  what: 'starred',     target: 'Vetted marketplace',         when: 'just now'  },
  { who: 'Priya Shah',  initials: 'PS', color: 'rgba(167,139,250,0.45)', what: 'connected',   target: 'Cause → Idea',               when: '8 min ago' },
  { who: 'James Ortiz', initials: 'JO', color: 'rgba(59,130,246,0.45)',  what: 'added',       target: 'Task — Interview 10 users',  when: '1h ago'    },
]

// Friendly numbered steps shown in the intro strip above the workspace.
// Reads in under 5 seconds — exactly the user-comprehension target.
const SESSION_INTRO_STEPS = [
  'Define the problem',
  'Add ideas',
  'Connect related thoughts',
  'Choose priorities',
  'Turn them into tasks',
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
    <div
      // Cinematic outer frame — wider max-width than the IdeaFlow demo so the
      // Session demo visually dominates. Centred with breathing room and a
      // soft drop shadow so the dark canvas reads as a premium surface.
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: 'clamp(0.75rem, 1.5vw, 1.4rem) clamp(0.75rem, 2vw, 1.75rem) 2.25rem',
        fontFamily: 'inherit',
      }}
    >
      {/* ── Intro strip — explains what a Session is in one sentence + 5 steps ── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid rgba(15,23,42,0.08)',
          borderRadius: '0.75rem',
          padding: '0.8rem 1rem 0.85rem',
          marginBottom: '0.75rem',
          boxShadow: '0 1px 3px rgba(6,14,38,0.04)',
          display: 'flex',
          alignItems: 'center', gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 16rem', minWidth: 0 }}>
          <p style={{ fontSize: '0.58rem', fontWeight: 700, color: '#c2540a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            ✦ How Sessions work
          </p>
          <p style={{ fontSize: '0.875rem', color: '#0d1f35', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
            A Session guides your team from a rough idea to clear next steps.
          </p>
        </div>
        <ol
          style={{
            listStyle: 'none', padding: 0, margin: 0,
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            flexWrap: 'wrap', flex: '2 1 32rem', minWidth: 0,
          }}
        >
          {SESSION_INTRO_STEPS.map((step, i) => (
            <li
              key={step}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.78rem', color: '#3d4758',
                background: 'rgba(15,23,42,0.04)',
                border: '1px solid rgba(15,23,42,0.06)',
                borderRadius: '999px',
                padding: '0.3rem 0.65rem 0.3rem 0.3rem',
              }}
            >
              <span
                style={{
                  width: '1.2rem', height: '1.2rem', borderRadius: '999px',
                  background: '#0d1f35', color: '#fff',
                  fontSize: '0.62rem', fontWeight: 800,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div
        style={{
          height: 'calc(100vh - 3.625rem - 2.4rem - 3.5rem - 1.4rem - 4.5rem)',
          minHeight: 560,
          borderRadius: '1rem',
          border: '1px solid rgba(15,23,42,0.10)',
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 12px 48px rgba(6,14,38,0.10), 0 1px 4px rgba(6,14,38,0.05)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >

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

      {/* ── Three-pane workspace — narrower rails, dominant centre canvas ── */}
      <div
        style={{
          flex: 1, minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '12.5rem minmax(0, 1fr) 15rem',
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
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {DEMO_STEPS.map((s, idx) => (
              <li key={s.key}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: s.active ? '0.65rem 0.6rem' : '0.55rem 0.6rem',
                    paddingLeft: s.active ? 'calc(0.6rem - 3px)' : '0.6rem',
                    borderRadius: '0.55rem',
                    background: s.active ? 'rgba(249,115,22,0.12)' : 'transparent',
                    borderLeft: s.active ? '3px solid #f97316' : '3px solid transparent',
                    color: s.active ? '#b84a09' : s.done ? '#9faab8' : '#3d4758',
                    boxShadow: s.active ? '0 1px 0 rgba(249,115,22,0.10)' : 'none',
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: '1.6rem', height: '1.6rem', borderRadius: '999px',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 800,
                      background: s.done
                        ? 'rgba(16,185,129,0.14)'
                        : s.active
                          ? '#f97316'
                          : 'rgba(15,23,42,0.05)',
                      color: s.done ? '#059669' : s.active ? '#fff' : '#64748b',
                      border: s.done ? '1px solid rgba(16,185,129,0.30)' : '1px solid transparent',
                      boxShadow: s.active ? '0 4px 12px rgba(249,115,22,0.30)' : 'none',
                    }}
                  >
                    {s.done ? '✓' : idx + 1}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: s.active ? 700 : 600, letterSpacing: '-0.01em', flex: 1, textDecoration: s.done && !s.active ? 'line-through' : 'none' }}>
                    Step {idx + 1} — {s.label}
                  </span>
                  {s.active && (
                    <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', background: '#f97316', borderRadius: '999px', padding: '0.12rem 0.4rem' }}>
                      Now
                    </span>
                  )}
                </div>
                {s.active && (
                  <p style={{ padding: '0 0.7rem 0.7rem', paddingLeft: 'calc(0.6rem + 1.6rem + 0.6rem - 3px)', fontSize: '0.74rem', color: '#5d667a', lineHeight: 1.5, marginTop: '0.15rem' }}>
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
          {/* Connection layer — no viewBox so SVG user-units render as actual
              CSS pixels and the bezier paths land on the same coordinate
              system the cards are positioned in. */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
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

        {/* Right: explainer + slim activity feed */}
        <aside
          style={{
            background: '#fff',
            borderLeft: '1px solid rgba(0,0,0,0.06)',
            padding: '0.95rem 0.95rem 1.1rem',
            overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* How this session works — leads the panel so newcomers get the
              framing before any social-proof signals. */}
          <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8', marginBottom: '0.5rem' }}>
            How this session works
          </p>
          <ol
            style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column', gap: '0.55rem',
              marginBottom: '1.25rem',
            }}
          >
            {HOW_IT_WORKS.map((step, i) => (
              <li
                key={step}
                style={{
                  display: 'flex', gap: '0.55rem', alignItems: 'flex-start',
                  fontSize: '0.8rem', color: '#3d4758', lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    flexShrink: 0, marginTop: '0.1rem',
                    width: '1.25rem', height: '1.25rem', borderRadius: '999px',
                    background: 'rgba(249,115,22,0.10)', color: '#c2540a',
                    fontSize: '0.62rem', fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(249,115,22,0.20)',
                  }}
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {/* Slim activity feed — three items, sized down so it reads as
              "the team is moving" without competing with the explainer. */}
          <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8', marginBottom: '0.5rem' }}>
            Recent activity
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {DEMO_ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span
                  style={{
                    width: '1.25rem', height: '1.25rem', borderRadius: '999px',
                    background: a.color, color: '#fff',
                    fontSize: '0.52rem', fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {a.initials}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.72rem', color: '#3d4758', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong style={{ color: '#0d1f35', fontWeight: 700 }}>{a.who.split(' ')[0]}</strong>{' '}
                    <span style={{ color: '#5d667a' }}>{a.what}</span>{' '}
                    <span style={{ color: '#0d1f35', fontWeight: 600 }}>{a.target}</span>
                  </p>
                  <p style={{ fontSize: '0.62rem', color: '#9faab8', marginTop: '0.05rem' }}>{a.when}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pro upsell — kept at the very bottom of the panel. */}
          <div style={{ flex: 1 }} />
          <div
            style={{
              marginTop: '1.1rem',
              padding: '0.75rem 0.85rem 0.85rem',
              borderRadius: '0.6rem',
              border: '1px solid rgba(249,115,22,0.22)',
              background: 'rgba(249,115,22,0.04)',
            }}
          >
            <p style={{ fontSize: '0.62rem', fontWeight: 700, color: '#c2540a', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              ✦ Pro feature
            </p>
            <p style={{ fontSize: '0.76rem', color: '#3d4758', lineHeight: 1.5, marginBottom: '0.65rem' }}>
              Run unlimited Sessions with your team.
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
          .demo-session-grid { grid-template-columns: 11rem minmax(0, 1fr) 13.5rem !important; }
        }
        @media (max-width: 880px) {
          .demo-session-grid { grid-template-columns: 3.5rem minmax(0, 1fr) 0 !important; }
        }
      `}</style>
      </div>{/* close the framed inner card */}
    </div>
  )
}
