'use client'

/**
 * DemoStarbursting — public, non-interactive Starbursting Session demo.
 *
 * Visualises the flagship framework: a central Topic with 6 question spokes
 * (Who / What / When / Where / Why / How), each pre-populated with realistic
 * answers. Mirrors the actual product's seeded layout so what users see in
 * the demo matches what they get when they click "Start a Session".
 *
 * Mock content:
 *   Topic: Launch IdeaFlow Pro
 *   WHY  → Why would customers pay?
 *   WHO  → Who is the ideal customer?
 *   HOW  → How will we launch it?
 *   WHERE→ Where will we launch first?
 *   WHAT → What problem does this solve?
 *   WHEN → What's the launch timeline?
 *
 * Visual language matches the real Sessions workspace (dark canvas, dot grid)
 * but the layout is fundamentally calmer than the freeform card graph —
 * structure first, exploration second.
 */

import Link from 'next/link'

// Canvas tokens (match SessionWorkspace)
const CANVAS_BG      = '#0e1320'
const CANVAS_SURFACE = '#161c2e'
const CANVAS_DOT     = 'rgba(255,255,255,0.05)'

// Logical viewBox size — cards positioned in this coordinate space, scaled
// to whatever physical size the canvas renders at.
const VBX = 1000
const VBY = 600
const CARD_W = 200
const CARD_H = 92
const TOPIC_W = 240
const TOPIC_H = 80
const CX = VBX / 2
const CY = VBY / 2

interface Spoke {
  label:    string  // WHY / WHO / etc.
  question: string  // sample sub-question
  answer:   string  // sample answer
  accent:   string  // outline + chip colour
  ink:      string  // chip text colour
  bg:       string  // card body tint
  x:        number  // card top-left in logical coords
  y:        number
}

// Hand-placed positions for the 6 petals around the centre — keeps the
// "starburst" silhouette readable at any rendered size.
const SPOKES: Spoke[] = [
  // WHY (top)
  { label: 'WHY',
    question: 'Why would customers pay?',
    answer:   'Sessions turn fuzzy brainstorming into concrete next steps in 20 min.',
    accent: '#f97316', ink: '#fdba74', bg: 'rgba(249,115,22,0.10)',
    x: CX - CARD_W / 2, y: 30 },
  // WHO (upper-left)
  { label: 'WHO',
    question: 'Who is the ideal customer?',
    answer:   'Product + ops teams (10–50 people) running weekly planning rituals.',
    accent: '#3b82f6', ink: '#93c5fd', bg: 'rgba(59,130,246,0.10)',
    x: 60, y: 180 },
  // HOW (upper-right)
  { label: 'HOW',
    question: 'How will we launch it?',
    answer:   'Soft launch to 50 design partners, then ProductHunt + Linkedin push.',
    accent: '#10b981', ink: '#6ee7b7', bg: 'rgba(16,185,129,0.10)',
    x: VBX - CARD_W - 60, y: 180 },
  // WHERE (lower-left)
  { label: 'WHERE',
    question: 'Where will we launch first?',
    answer:   'EU and UK — closer to our existing free users and easier billing.',
    accent: '#a78bfa', ink: '#c4b5fd', bg: 'rgba(167,139,250,0.10)',
    x: 60, y: 408 },
  // WHAT (lower-right)
  { label: 'WHAT',
    question: 'What problem does it solve?',
    answer:   'Blank-page paralysis when teams sit down to brainstorm together.',
    accent: '#06b6d4', ink: '#67e8f9', bg: 'rgba(6,182,212,0.10)',
    x: VBX - CARD_W - 60, y: 408 },
  // WHEN (bottom)
  { label: 'WHEN',
    question: "What's the launch timeline?",
    answer:   'Beta in 3 weeks, public launch first Tuesday of next month.',
    accent: '#f59e0b', ink: '#fcd34d', bg: 'rgba(245,158,11,0.10)',
    x: CX - CARD_W / 2, y: VBY - CARD_H - 30 },
]

// Topic sits dead-centre.
const TOPIC = { x: CX - TOPIC_W / 2, y: CY - TOPIC_H / 2 }

// Convert a card's top-left to its centre for spoke-line endpoints.
const cardCentre = (x: number, y: number, w: number, h: number) => ({ cx: x + w / 2, cy: y + h / 2 })

export default function DemoStarbursting() {
  const topicCentre = cardCentre(TOPIC.x, TOPIC.y, TOPIC_W, TOPIC_H)

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: 'clamp(0.75rem, 1.5vw, 1.4rem) clamp(0.75rem, 2vw, 1.75rem) 2.25rem',
        fontFamily: 'inherit',
      }}
    >
      {/* ── Intro strip — one sentence + the 6 questions in chip form ────── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid rgba(15,23,42,0.08)',
          borderRadius: '0.75rem',
          padding: '0.85rem 1rem 0.9rem',
          marginBottom: '0.75rem',
          boxShadow: '0 1px 3px rgba(6,14,38,0.04)',
          display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 18rem', minWidth: 0 }}>
          <p style={{ fontSize: '0.58rem', fontWeight: 700, color: '#c2540a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            ✦ Starbursting framework
          </p>
          <p style={{ fontSize: '0.875rem', color: '#0d1f35', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
            Starbursting helps teams explore an idea from every angle before making decisions.
          </p>
        </div>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {['Who', 'What', 'When', 'Where', 'Why', 'How'].map(q => (
            <li
              key={q}
              style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: '#3d4758',
                background: 'rgba(15,23,42,0.04)',
                border: '1px solid rgba(15,23,42,0.06)',
                borderRadius: '999px',
                padding: '0.25rem 0.55rem',
              }}
            >
              {q}?
            </li>
          ))}
        </ol>
      </div>

      {/* ── Workspace shell — same framed look as the IdeaFlow demo ──────── */}
      <div
        style={{
          height: 'calc(100vh - 3.625rem - 2.4rem - 3.5rem - 1.4rem - 4.5rem)',
          minHeight: 560,
          borderRadius: '1rem',
          border: '1px solid rgba(15,23,42,0.10)',
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 12px 48px rgba(6,14,38,0.10), 0 1px 4px rgba(6,14,38,0.05)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Top bar */}
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
            <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.01em' }}>
              Launch IdeaFlow Pro
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.05rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#9faab8' }}>✦ Starbursting framework</span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cdd5e0' }} />
              <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 500 }}>Saved</span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cdd5e0' }} />
              <span style={{ fontSize: '0.7rem', color: '#9faab8' }}>3 collaborators</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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

        {/* Three-pane grid */}
        <div
          style={{
            flex: 1, minHeight: 0,
            display: 'grid',
            gridTemplateColumns: '13rem minmax(0, 1fr) 15.5rem',
          }}
          className="demo-starburst-grid"
        >
          {/* Left rail — 5 steps, "Explore" active because we're answering questions */}
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
              {[
                { idx: 1, label: 'Define',     done: true,  active: false },
                { idx: 2, label: 'Explore',    done: false, active: true  },
                { idx: 3, label: 'Connect',    done: false, active: false },
                { idx: 4, label: 'Prioritize', done: false, active: false },
                { idx: 5, label: 'Action plan',done: false, active: false },
              ].map(s => (
                <li
                  key={s.idx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.55rem',
                    padding: s.active ? '0.65rem 0.55rem' : '0.55rem 0.55rem',
                    paddingLeft: s.active ? 'calc(0.55rem - 3px)' : '0.55rem',
                    borderRadius: '0.55rem',
                    background: s.active ? 'rgba(249,115,22,0.12)' : 'transparent',
                    borderLeft: s.active ? '3px solid #f97316' : '3px solid transparent',
                    color: s.active ? '#b84a09' : s.done ? '#9faab8' : '#3d4758',
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: '1.5rem', height: '1.5rem', borderRadius: '999px',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.66rem', fontWeight: 800,
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
                    {s.done ? '✓' : s.idx}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: s.active ? 700 : 600, letterSpacing: '-0.01em', flex: 1, textDecoration: s.done && !s.active ? 'line-through' : 'none' }}>
                    Step {s.idx} — {s.label}
                  </span>
                  {s.active && (
                    <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', background: '#f97316', borderRadius: '999px', padding: '0.12rem 0.4rem' }}>
                      Now
                    </span>
                  )}
                </li>
              ))}
            </ol>

            <div style={{ marginTop: '1.2rem', padding: '0.7rem 0.7rem 0.75rem', borderRadius: '0.55rem', background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.06)' }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 700, color: '#5d667a', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Tip
              </p>
              <p style={{ fontSize: '0.76rem', color: '#3d4758', lineHeight: 1.5 }}>
                Aim for 1–3 answers per question. Quality beats quantity.
              </p>
            </div>
          </aside>

          {/* Canvas */}
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
            {/* Spokes + cards in a scaling viewBox so the layout looks the same at any width. */}
            <svg
              viewBox={`0 0 ${VBX} ${VBY}`}
              preserveAspectRatio="xMidYMid meet"
              width="100%" height="100%"
              style={{ position: 'absolute', inset: 0 }}
            >
              {/* Subtle radial halo behind the centre */}
              <radialGradient id="topicHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="rgba(249,115,22,0.18)" />
                <stop offset="100%" stopColor="rgba(249,115,22,0)" />
              </radialGradient>
              <circle cx={CX} cy={CY} r={160} fill="url(#topicHalo)" />

              {/* Spoke lines from topic centre to each spoke centre */}
              {SPOKES.map(s => {
                const sc = cardCentre(s.x, s.y, CARD_W, CARD_H)
                return (
                  <line
                    key={`line-${s.label}`}
                    x1={topicCentre.cx} y1={topicCentre.cy}
                    x2={sc.cx}          y2={sc.cy}
                    stroke="rgba(148,163,184,0.40)"
                    strokeWidth={1.4}
                  />
                )
              })}

              {/* Topic card */}
              <g>
                <rect
                  x={TOPIC.x} y={TOPIC.y} width={TOPIC_W} height={TOPIC_H}
                  rx={12} ry={12}
                  fill={CANVAS_SURFACE}
                  stroke="#f97316" strokeWidth={1.5}
                />
                <text
                  x={CX} y={CY - 4}
                  textAnchor="middle"
                  fontSize={11} fontWeight={800}
                  letterSpacing="2"
                  fill="#fdba74"
                >TOPIC</text>
                <text
                  x={CX} y={CY + 16}
                  textAnchor="middle"
                  fontSize={15} fontWeight={700}
                  fill="#f4f7fb"
                >Launch IdeaFlow Pro</text>
              </g>

              {/* Spoke cards */}
              {SPOKES.map(s => (
                <g key={s.label}>
                  <rect
                    x={s.x} y={s.y} width={CARD_W} height={CARD_H}
                    rx={10} ry={10}
                    fill={CANVAS_SURFACE}
                    stroke={`${s.accent}55`} strokeWidth={1}
                  />
                  {/* Accent stripe */}
                  <rect
                    x={s.x + 6} y={s.y + 12} width={2.5} height={CARD_H - 24}
                    rx={1.5} fill={s.accent} opacity={0.85}
                  />
                  {/* Label chip background */}
                  <rect
                    x={s.x + 14} y={s.y + 11} width={42} height={14}
                    rx={7} ry={7}
                    fill={s.bg} stroke={`${s.accent}55`} strokeWidth={0.6}
                  />
                  <text
                    x={s.x + 35} y={s.y + 21}
                    textAnchor="middle"
                    fontSize={8} fontWeight={800}
                    letterSpacing="1"
                    fill={s.ink}
                  >{s.label}</text>
                  {/* Question */}
                  <text
                    x={s.x + 14} y={s.y + 44}
                    fontSize={11} fontWeight={700}
                    fill="#f4f7fb"
                  >{s.question}</text>
                  {/* Answer (truncated visually by clip; SVG text doesn't wrap) */}
                  <foreignObject x={s.x + 14} y={s.y + 50} width={CARD_W - 28} height={CARD_H - 56}>
                    <div
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      {...({ xmlns: 'http://www.w3.org/1999/xhtml' } as any)}
                      style={{
                        fontFamily: 'inherit',
                        fontSize: '10px',
                        color: 'rgba(230,236,245,0.65)',
                        lineHeight: 1.4,
                      }}
                    >
                      {s.answer}
                    </div>
                  </foreignObject>
                </g>
              ))}
            </svg>

            {/* Bottom helper strip */}
            <div
              style={{
                position: 'absolute', bottom: 12, left: 0, right: 0,
                display: 'flex', justifyContent: 'center', padding: '0 1rem',
                pointerEvents: 'none',
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
                  fontSize: '0.72rem', fontWeight: 500,
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

          {/* Right panel — explainer first, then a slim activity feed */}
          <aside
            style={{
              background: '#fff',
              borderLeft: '1px solid rgba(0,0,0,0.06)',
              padding: '0.95rem 0.95rem 1.1rem',
              overflowY: 'auto',
              display: 'flex', flexDirection: 'column',
            }}
          >
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
              {[
                'Name the central Topic — one short phrase.',
                'Answer the six questions: Who, What, When, Where, Why, How.',
                'Star the strongest answers and turn them into Tasks.',
              ].map((step, i) => (
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

            <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9faab8', marginBottom: '0.5rem' }}>
              Recent activity
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                { who: 'Sara',  initials: 'SK', color: 'rgba(249,115,22,0.45)',  what: 'answered',    target: 'WHY', when: 'just now'  },
                { who: 'James', initials: 'JO', color: 'rgba(59,130,246,0.45)',  what: 'answered',    target: 'WHO', when: '6 min ago' },
                { who: 'Priya', initials: 'PS', color: 'rgba(167,139,250,0.45)', what: 'renamed',     target: 'Topic', when: '20 min ago' },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span
                    style={{
                      width: '1.25rem', height: '1.25rem', borderRadius: '999px',
                      background: a.color, color: '#fff',
                      fontSize: '0.52rem', fontWeight: 800,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >{a.initials}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.72rem', color: '#3d4758', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: '#0d1f35', fontWeight: 700 }}>{a.who}</strong>{' '}
                      <span style={{ color: '#5d667a' }}>{a.what}</span>{' '}
                      <span style={{ color: '#0d1f35', fontWeight: 600 }}>{a.target}</span>
                    </p>
                    <p style={{ fontSize: '0.62rem', color: '#9faab8', marginTop: '0.05rem' }}>{a.when}</p>
                  </div>
                </div>
              ))}
            </div>

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
                Run guided thinking frameworks with your team.
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
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .demo-starburst-grid { grid-template-columns: 11rem minmax(0, 1fr) 14rem !important; }
        }
        @media (max-width: 880px) {
          .demo-starburst-grid { grid-template-columns: 3.5rem minmax(0, 1fr) 0 !important; }
        }
      `}</style>
    </div>
  )
}
