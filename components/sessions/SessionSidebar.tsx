'use client'

/**
 * SessionSidebar — left rail showing the 5 guided steps.
 *
 * Clicking a step selects it (which updates the right-hand GuidePanel).
 * Clicking the check toggles "completed" state. Visual cues: active step
 * gets an orange accent, completed steps fade to a softer color.
 */

import type { StepKey } from '@/types/sessions'

interface Props {
  steps:            readonly StepKey[]
  stepLabels:       Record<StepKey, string>
  currentStep:      StepKey
  completed:        Set<StepKey>
  onSelect:         (key: StepKey) => void
  onToggleComplete: (key: StepKey) => void
}

export default function SessionSidebar({
  steps, stepLabels, currentStep, completed, onSelect, onToggleComplete,
}: Props) {
  return (
    <aside
      style={{
        background: '#faf9f7',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        padding: '1rem 0.75rem',
        overflowY: 'auto',
        minHeight: 0,
      }}
    >
      <p
        style={{
          fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#9faab8',
          padding: '0 0.5rem', marginBottom: '0.55rem',
        }}
      >
        Guided steps
      </p>

      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {steps.map((key, idx) => {
          const isActive = key === currentStep
          const isDone   = completed.has(key)
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onSelect(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.55rem',
                  width: '100%', textAlign: 'left',
                  padding: '0.55rem 0.55rem',
                  paddingLeft: isActive ? 'calc(0.55rem - 2px)' : '0.55rem',
                  borderRadius: '0.55rem',
                  border: 'none',
                  background: isActive ? 'rgba(249,115,22,0.08)' : 'transparent',
                  borderLeft: isActive ? '2px solid rgba(249,115,22,0.65)' : '2px solid transparent',
                  color: isActive ? '#b84a09' : isDone ? '#9faab8' : '#3d4758',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.12s, color 0.12s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.035)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'      }}
              >
                {/* Number / check */}
                <span
                  onClick={(e) => { e.stopPropagation(); onToggleComplete(key) }}
                  style={{
                    flexShrink: 0,
                    width: '1.45rem', height: '1.45rem', borderRadius: '999px',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800,
                    background: isDone
                      ? 'rgba(16,185,129,0.14)'
                      : isActive
                        ? 'rgba(249,115,22,0.16)'
                        : 'rgba(15,23,42,0.05)',
                    color: isDone
                      ? '#059669'
                      : isActive
                        ? '#b84a09'
                        : '#64748b',
                    border: isDone ? '1px solid rgba(16,185,129,0.30)' : '1px solid transparent',
                  }}
                  aria-label={isDone ? `Mark ${stepLabels[key]} incomplete` : `Mark ${stepLabels[key]} complete`}
                  role="button"
                >
                  {isDone ? '✓' : idx + 1}
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 700 : 600,
                    letterSpacing: '-0.01em',
                    textDecoration: isDone && !isActive ? 'line-through' : 'none',
                    flex: 1,
                  }}
                >
                  {stepLabels[key]}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.7rem 0.7rem 0.75rem',
          borderRadius: '0.55rem',
          background: 'rgba(15,23,42,0.03)',
          border: '1px solid rgba(15,23,42,0.06)',
        }}
      >
        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#5d667a', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          Tip
        </p>
        <p style={{ fontSize: '0.78rem', color: '#3d4758', lineHeight: 1.5 }}>
          Press <kbd style={kbd}>i</kbd> to add an idea card without leaving the canvas.
        </p>
      </div>
    </aside>
  )
}

const kbd: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.7rem',
  background: '#fff',
  border: '1px solid rgba(15,23,42,0.12)',
  borderRadius: '0.3rem',
  padding: '0.05rem 0.35rem',
  color: '#3d4758',
  fontWeight: 700,
  boxShadow: '0 1px 0 rgba(15,23,42,0.06)',
}
