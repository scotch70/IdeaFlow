'use client'

import { useState, useEffect } from 'react'

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:      '#fbfaf7',
  surface: '#ffffff',
  ink:     '#1f2330',
  slate:   '#5d667a',
  faint:   '#b8c0ce',
  border:  '#e7e2d8',
  chrome:  '#f3f0ea',
  accent:  '#c98b5f',
  green:   '#16a34a',
}

const IDEAS = [
  { text: 'Monthly team retrospective',    author: 'Priya N.',  status: 'Planned' as const },
  { text: 'Shorten release cycle to 2 wks', author: 'James R.', status: 'Open'    as const },
  { text: 'Better onboarding docs',         author: 'Alex T.',  status: 'Open'    as const },
]

const INITIAL_VOTES = [24, 17, 11]

export default function HeroAnimation() {
  const [topVotes, setTopVotes] = useState(INITIAL_VOTES[0])
  const [animKey,  setAnimKey]  = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setTopVotes(v => v + 1)
      setAnimKey(k => k + 1)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  const votes = [topVotes, INITIAL_VOTES[1], INITIAL_VOTES[2]]

  return (
    <div style={{
      borderRadius: '12px',
      overflow: 'hidden',
      background: C.surface,
      boxShadow: [
        `0 0 0 1px rgba(0,0,0,0.07)`,
        `0 12px 40px rgba(31,35,48,0.09)`,
        `0 2px 8px rgba(31,35,48,0.04)`,
      ].join(', '),
      width: '100%',
      maxWidth: '480px',
    }}>

      {/* ── Browser chrome ── */}
      <div style={{
        background: C.chrome,
        borderBottom: `1px solid ${C.border}`,
        padding: '0.5rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
          {['#dbd7d2', '#d0ccc7', '#c5c1bc'].map((c, i) => (
            <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{
          flex: 1, height: '1.125rem', borderRadius: '4px',
          background: C.surface, border: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '0.52rem', color: C.faint, letterSpacing: '0.01em' }}>
            app.useideaflow.com/flows/q1-retro
          </span>
        </div>
        <div style={{ width: '1.5rem' }} />
      </div>

      {/* ── Content ── */}
      <div style={{ background: C.bg, padding: '1rem 1.125rem' }}>

        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '0.875rem',
        }}>
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: C.ink, marginBottom: '0.1rem' }}>
              Q1 Retrospective
            </p>
            <p style={{ fontSize: '0.62rem', color: C.faint }}>Sorted by team votes</p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.22rem',
            fontSize: '0.58rem', fontWeight: 600, color: C.green,
            background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.14)',
            borderRadius: '999px', padding: '0.18rem 0.5rem',
          }}>
            <span style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: C.green, display: 'inline-block',
            }} />
            Active
          </span>
        </div>

        {/* Idea rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {IDEAS.map((idea, i) => {
            const isTop = i === 0
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                padding: '0.625rem 0.75rem', borderRadius: '8px',
                background: isTop ? `rgba(201,139,95,0.05)` : C.surface,
                border: `1px solid ${isTop ? 'rgba(201,139,95,0.22)' : C.border}`,
                transition: 'border-color 0.4s ease',
              }}>

                {/* Vote column */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  minWidth: '1.75rem', position: 'relative',
                }}>
                  {/* +1 float */}
                  {isTop && animKey > 0 && (
                    <span
                      key={animKey}
                      className="float-up-vote"
                      style={{
                        position: 'absolute', top: '-14px', left: '50%',
                        fontSize: '0.6rem', fontWeight: 700, color: C.accent,
                        pointerEvents: 'none', whiteSpace: 'nowrap',
                      }}
                    >
                      +1
                    </span>
                  )}

                  {/* Upvote button */}
                  <div style={{
                    width: '1.5rem', height: '1.5rem', borderRadius: '6px',
                    background: isTop ? C.ink : '#f0ede8',
                    border: `1px solid ${isTop ? 'transparent' : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '0.15rem', flexShrink: 0,
                  }}>
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M4 0.5L7.5 5.5H0.5L4 0.5Z" fill={isTop ? '#fff' : C.faint} />
                    </svg>
                  </div>

                  {/* Vote count */}
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700,
                    color: isTop ? C.ink : C.faint,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}>
                    {votes[i]}
                  </span>
                </div>

                {/* Text content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.72rem', fontWeight: 600, color: C.ink,
                    lineHeight: 1.4, marginBottom: '0.22rem',
                  }}>
                    {idea.text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ fontSize: '0.57rem', color: C.faint }}>{idea.author}</span>
                    <span style={{ fontSize: '0.57rem', color: C.border }}>·</span>
                    <span style={{
                      fontSize: '0.56rem', fontWeight: 600,
                      color: idea.status === 'Planned' ? C.green : C.faint,
                      background: idea.status === 'Planned' ? 'rgba(22,163,74,0.07)' : 'transparent',
                      borderRadius: '999px',
                      padding: idea.status === 'Planned' ? '0.08rem 0.4rem' : '0',
                    }}>
                      {idea.status}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <p style={{
          fontSize: '0.58rem', color: C.faint,
          marginTop: '0.75rem', paddingTop: '0.5rem',
          borderTop: `1px solid ${C.border}`,
        }}>
          3 ideas · 14 team members voted
        </p>
      </div>
    </div>
  )
}
