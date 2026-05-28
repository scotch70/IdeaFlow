'use client'

/**
 * SessionSidebar — left rail showing the 5 guided steps.
 *
 * Two modes:
 *   • Expanded (~240px) — full step rows with the active step accordion-open
 *     showing its one-line helper. Click another step to swap which is open.
 *     Click the number circle to toggle its completed state.
 *   • Collapsed (~56px) — just the numbered/check circles in a vertical
 *     strip. Tooltips on each row carry the step label.
 *
 * The collapse toggle lives in the top-right of the panel.
 */

import { STEP_HELPER } from '@/lib/sessions/templates'
import type { StepKey } from '@/types/sessions'

interface Props {
  steps:            readonly StepKey[]
  stepLabels:       Record<StepKey, string>
  currentStep:      StepKey
  completed:        Set<StepKey>
  collapsed:        boolean
  onSelect:         (key: StepKey) => void
  onToggleComplete: (key: StepKey) => void
  onToggleCollapse: () => void
}

export default function SessionSidebar({
  steps, stepLabels, currentStep, completed, collapsed,
  onSelect, onToggleComplete, onToggleCollapse,
}: Props) {
  return (
    <aside
      style={{
        background: '#faf9f7',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        padding: collapsed ? '0.85rem 0.4rem' : '0.85rem 0.75rem',
        overflowY: 'auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'padding 0.18s ease',
      }}
    >
      {/* ── Header row: title + collapse toggle ───────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          marginBottom: '0.75rem',
          paddingLeft: collapsed ? 0 : '0.4rem',
        }}
      >
        {!collapsed && (
          <p
            style={{
              fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#9faab8',
            }}
          >
            Session steps
          </p>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand session steps' : 'Collapse session steps'}
          title={collapsed ? 'Expand' : 'Collapse'}
          style={{
            width: '1.6rem', height: '1.6rem', borderRadius: '0.4rem',
            border: 'none', background: 'transparent',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748b',
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          {/* Chevron: points right when collapsed, left when expanded */}
          <svg
            width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* ── Step list ─────────────────────────────────────────────────────── */}
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: collapsed ? '0.4rem' : '2px' }}>
        {steps.map((key, idx) => {
          const isActive = key === currentStep
          const isDone   = completed.has(key)
          return (
            <li key={key}>
              {collapsed ? (
                <CollapsedStepRow
                  index={idx + 1}
                  label={stepLabels[key]}
                  isActive={isActive}
                  isDone={isDone}
                  onSelect={() => onSelect(key)}
                  onToggleComplete={() => onToggleComplete(key)}
                />
              ) : (
                <ExpandedStepRow
                  index={idx + 1}
                  stepKey={key}
                  label={stepLabels[key]}
                  isActive={isActive}
                  isDone={isDone}
                  onSelect={() => onSelect(key)}
                  onToggleComplete={() => onToggleComplete(key)}
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* ── Tips — hidden when collapsed ──────────────────────────────────── */}
      {!collapsed && (
        <div
          style={{
            marginTop: '1.1rem',
            padding: '0.7rem 0.7rem 0.75rem',
            borderRadius: '0.55rem',
            background: 'rgba(15,23,42,0.03)',
            border: '1px solid rgba(15,23,42,0.06)',
          }}
        >
          <p style={{ fontSize: '0.62rem', fontWeight: 700, color: '#5d667a', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Tips
          </p>
          <p style={{ fontSize: '0.76rem', color: '#3d4758', lineHeight: 1.5, marginBottom: '0.5rem' }}>
            Press <kbd style={kbd}>i</kbd> to add an Idea card without leaving the canvas.
          </p>
          <p style={{ fontSize: '0.76rem', color: '#3d4758', lineHeight: 1.5 }}>
            Collapse the sidebars for more canvas space.
          </p>
        </div>
      )}
    </aside>
  )
}

// ── Expanded row ─────────────────────────────────────────────────────────────
function ExpandedStepRow({
  index, stepKey, label, isActive, isDone, onSelect, onToggleComplete,
}: {
  index: number
  stepKey: StepKey
  label: string
  isActive: boolean
  isDone: boolean
  onSelect: () => void
  onToggleComplete: () => void
}) {
  return (
    <div
      style={{
        background: isActive ? 'rgba(249,115,22,0.08)' : 'transparent',
        borderLeft: isActive ? '2px solid rgba(249,115,22,0.65)' : '2px solid transparent',
        borderRadius: '0.55rem',
        transition: 'background 0.12s',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          width: '100%', textAlign: 'left',
          padding: '0.55rem 0.6rem',
          paddingLeft: isActive ? 'calc(0.6rem - 2px)' : '0.6rem',
          background: 'transparent', border: 'none',
          color: isActive ? '#b84a09' : isDone ? '#9faab8' : '#3d4758',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.035)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'      }}
      >
        <StepNumberCircle
          index={index}
          label={label}
          isActive={isActive}
          isDone={isDone}
          onToggleComplete={onToggleComplete}
        />
        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: isActive ? 700 : 600,
            letterSpacing: '-0.01em',
            textDecoration: isDone && !isActive ? 'line-through' : 'none',
            flex: 1,
          }}
        >
          Step {index} — {label}
        </span>
        {/* Chevron — rotates when active to show "open" state */}
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          style={{
            color: '#94a3b8',
            transform: isActive ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.18s',
            flexShrink: 0,
          }}
          aria-hidden
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Accordion body — only rendered for the active step */}
      {isActive && (
        <div
          style={{
            padding: '0 0.7rem 0.7rem',
            paddingLeft: 'calc(0.6rem + 1.45rem + 0.6rem - 2px)',  // align under the label
            fontSize: '0.74rem',
            color: '#5d667a',
            lineHeight: 1.5,
          }}
        >
          {STEP_HELPER[stepKey]}
        </div>
      )}
    </div>
  )
}

// ── Collapsed row ────────────────────────────────────────────────────────────
function CollapsedStepRow({
  index, label, isActive, isDone, onSelect, onToggleComplete,
}: {
  index: number
  label: string
  isActive: boolean
  isDone: boolean
  onSelect: () => void
  onToggleComplete: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Step ${index} — ${label}`}
      title={`Step ${index} — ${label}${isDone ? ' (done)' : ''}`}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0.3rem',
        background: 'transparent', border: 'none',
        cursor: 'pointer', borderRadius: '0.5rem',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.045)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <StepNumberCircle
        index={index}
        label={label}
        isActive={isActive}
        isDone={isDone}
        onToggleComplete={onToggleComplete}
        size="lg"
      />
    </button>
  )
}

// ── Number / check circle ────────────────────────────────────────────────────
function StepNumberCircle({
  index, label, isActive, isDone, onToggleComplete, size = 'md',
}: {
  index: number
  label: string
  isActive: boolean
  isDone: boolean
  onToggleComplete: () => void
  size?: 'md' | 'lg'
}) {
  const dim = size === 'lg' ? '1.75rem' : '1.45rem'
  const fs  = size === 'lg' ? '0.75rem' : '0.65rem'
  return (
    <span
      role="button"
      aria-label={isDone ? `Mark ${label} incomplete` : `Mark ${label} complete`}
      onClick={(e) => { e.stopPropagation(); onToggleComplete() }}
      style={{
        flexShrink: 0,
        width: dim, height: dim, borderRadius: '999px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: fs, fontWeight: 800,
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
        border: isDone
          ? '1px solid rgba(16,185,129,0.30)'
          : isActive
            ? '1px solid rgba(249,115,22,0.30)'
            : '1px solid transparent',
        cursor: 'pointer',
      }}
    >
      {isDone ? '✓' : index}
    </span>
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
