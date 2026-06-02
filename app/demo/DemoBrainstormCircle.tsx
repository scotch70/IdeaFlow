'use client'

/**
 * DemoBrainstormCircle — public, non-interactive Brainstorm Circle demo.
 *
 * Mirrors the framework's visual language: a dark dotted canvas, an ivory
 * admin card in the centre, 8 fixed member cards on a radial layout, and a
 * heart pill on every member card with a realistic like count. Used as the
 * second tab on /demo (IdeaFlow Workspace stays as the primary tab).
 *
 * Mock content:
 *   Central admin topic: "Should we launch IdeaFlow Pro?"
 *   8 member cards with the brief's example copy + realistic counts.
 */

import Link from 'next/link'

const CANVAS_BG   = '#0e1320'
const CANVAS_DOT  = 'rgba(255,255,255,0.05)'

const VBX = 1000
const VBY = 600

// Layout inside the viewBox — admin centred, 8 members on a radial path.
const ADMIN_W = 240, ADMIN_H = 130
const CARD_W  = 188, CARD_H  = 88
const CX = VBX / 2, CY = VBY / 2
const R  = 230

interface Member {
  index:   number
  title:   string
  hearts:  number
  liked?:  boolean
}

// Member 1 (top) → clockwise.
const MEMBERS: Member[] = [
  { index: 1, title: 'Yes, but focus on teams.',             hearts: 14, liked: true  },
  { index: 2, title: 'Pricing needs to be simple.',           hearts: 9                 },
  { index: 3, title: 'Show Sessions in the demo.',            hearts: 12                },
  { index: 4, title: 'Avoid too much AI language.',           hearts: 8                 },
  { index: 5, title: 'Start with founders.',                  hearts: 6                 },
  { index: 6, title: 'Use Starbursting as a second option.',  hearts: 5                 },
  { index: 7, title: 'Export PDF is important.',              hearts: 11, liked: true   },
  { index: 8, title: 'Keep the workspace as the core product.', hearts: 7               },
]

// Returns the top-left position of the i-th (0-based) member.
function memberPos(i: number): { x: number; y: number } {
  const angle = -Math.PI / 2 + i * (Math.PI / 4)
  return {
    x: CX + Math.cos(angle) * R - CARD_W / 2,
    y: CY + Math.sin(angle) * R - CARD_H / 2,
  }
}

const ADMIN = { x: CX - ADMIN_W / 2, y: CY - ADMIN_H / 2 }

export default function DemoBrainstormCircle() {
  return (
    <div
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: 'clamp(0.75rem, 1.5vw, 1.4rem) clamp(0.75rem, 2vw, 1.75rem) 2.25rem',
        fontFamily: 'inherit',
      }}
    >
      {/* Intro strip */}
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
            ○ Brainstorm Circle
          </p>
          <p style={{ fontSize: '0.875rem', color: '#0d1f35', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 }}>
            One central topic, up to eight team members, hearts to surface the favourites.
          </p>
        </div>
      </div>

      {/* Workspace shell */}
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
              Should we launch IdeaFlow Pro?
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.05rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#9faab8' }}>○ Brainstorm Circle</span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cdd5e0' }} />
              <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 500 }}>Saved</span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cdd5e0' }} />
              <span style={{ fontSize: '0.7rem', color: '#9faab8' }}>8 members · 72 hearts</span>
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

        {/* Canvas */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: CANVAS_BG,
            backgroundImage: `radial-gradient(${CANVAS_DOT} 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
            backgroundPosition: '-1px -1px',
            flex: 1, minHeight: 0,
          }}
        >
          <svg
            viewBox={`0 0 ${VBX} ${VBY}`}
            preserveAspectRatio="xMidYMid meet"
            width="100%" height="100%"
            style={{ position: 'absolute', inset: 0 }}
          >
            {/* Subtle radial glow behind the admin card */}
            <radialGradient id="adminGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="rgba(249,115,22,0.18)" />
              <stop offset="100%" stopColor="rgba(249,115,22,0)" />
            </radialGradient>
            <circle cx={CX} cy={CY} r={160} fill="url(#adminGlow)" />

            {/* Spoke lines from admin centre to each member centre */}
            {MEMBERS.map((_, i) => {
              const p = memberPos(i)
              const mc = { x: p.x + CARD_W / 2, y: p.y + CARD_H / 2 }
              return (
                <line
                  key={`spoke-${i}`}
                  x1={CX} y1={CY} x2={mc.x} y2={mc.y}
                  stroke="rgba(148,163,184,0.40)"
                  strokeWidth={1.3}
                />
              )
            })}

            {/* Admin card — ivory with an orange accent so it reads as "the topic" */}
            <g>
              <rect
                x={ADMIN.x} y={ADMIN.y} width={ADMIN_W} height={ADMIN_H}
                rx={14} ry={14}
                fill="#fbfaf7"
                stroke="#f97316" strokeWidth={1.6}
              />
              <text
                x={CX} y={ADMIN.y + 26}
                textAnchor="middle"
                fontSize={10} fontWeight={800}
                letterSpacing="2"
                fill="#c2540a"
              >ADMIN TOPIC</text>
              <text
                x={CX} y={ADMIN.y + 52}
                textAnchor="middle"
                fontSize={15} fontWeight={800}
                fill="#0d1f35"
              >Should we launch</text>
              <text
                x={CX} y={ADMIN.y + 72}
                textAnchor="middle"
                fontSize={15} fontWeight={800}
                fill="#0d1f35"
              >IdeaFlow Pro?</text>
              <text
                x={CX} y={ADMIN.y + 100}
                textAnchor="middle"
                fontSize={10}
                fill="#5d667a"
              >Members vote with hearts.</text>
            </g>

            {/* Member cards */}
            {MEMBERS.map((m, i) => {
              const p = memberPos(i)
              return (
                <g key={m.index}>
                  <rect
                    x={p.x} y={p.y} width={CARD_W} height={CARD_H}
                    rx={10} ry={10}
                    fill="#161c2e"
                    stroke="rgba(255,255,255,0.10)" strokeWidth={1}
                  />
                  {/* Member chip */}
                  <rect
                    x={p.x + 10} y={p.y + 10} width={62} height={14}
                    rx={7} ry={7}
                    fill="rgba(148,163,184,0.12)"
                    stroke="rgba(148,163,184,0.30)" strokeWidth={0.6}
                  />
                  <text
                    x={p.x + 41} y={p.y + 20}
                    textAnchor="middle"
                    fontSize={8} fontWeight={800}
                    letterSpacing="1"
                    fill="#cbd5e1"
                  >MEMBER {m.index}</text>

                  {/* Title — wrapped via foreignObject so multi-line works */}
                  <foreignObject x={p.x + 10} y={p.y + 30} width={CARD_W - 20} height={CARD_H - 56}>
                    <div
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      {...({ xmlns: 'http://www.w3.org/1999/xhtml' } as any)}
                      style={{
                        fontFamily: 'inherit',
                        fontSize: '11px',
                        color: '#f4f7fb',
                        fontWeight: 600,
                        lineHeight: 1.35,
                      }}
                    >
                      {m.title}
                    </div>
                  </foreignObject>

                  {/* Heart pill — bottom-right of the card */}
                  <g transform={`translate(${p.x + CARD_W - 50}, ${p.y + CARD_H - 22})`}>
                    <rect
                      width={42} height={16} rx={8} ry={8}
                      fill={m.liked ? 'rgba(249,115,22,0.18)' : 'rgba(255,255,255,0.06)'}
                      stroke={m.liked ? 'rgba(249,115,22,0.40)' : 'rgba(255,255,255,0.10)'}
                      strokeWidth={0.8}
                    />
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      fill={m.liked ? '#f97316' : 'none'}
                      stroke={m.liked ? '#f97316' : 'rgba(255,255,255,0.72)'}
                      strokeWidth={1.4}
                      transform="translate(7, 3) scale(0.42)"
                    />
                    <text
                      x={28} y={11}
                      fontSize={9} fontWeight={800}
                      fill={m.liked ? '#fdba74' : 'rgba(255,255,255,0.85)'}
                    >{m.hearts}</text>
                  </g>
                </g>
              )
            })}
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
      </div>
    </div>
  )
}
