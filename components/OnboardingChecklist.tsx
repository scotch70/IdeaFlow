'use client'

// ─────────────────────────────────────────────────────────────────────────────
// OnboardingChecklist — shown to new admins when their workspace is fresh.
//
// Visible when: isAdmin && (memberCount <= 1 || !hasActiveFlow || ideaCount < 3)
//
// Steps:
//   1. ✓ Workspace created        — always complete
//   2.   Invite your team         — complete when memberCount > 1
//   3.   Launch an IdeaFlow       — complete when hasActiveFlow
//   4.   Collect 3+ ideas         — complete when ideaCount >= 3
//
// Dismissed permanently via localStorage key 'ideaflow_onboarding_dismissed'.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'

interface OnboardingChecklistProps {
  memberCount:   number
  hasActiveFlow: boolean
  ideaCount:     number
  companyId:     string
}

interface Step {
  id:       string
  label:    string
  detail:   string
  done:     boolean
  ctaLabel?:  string
  ctaHref?:   string
}

function CheckIcon({ done }: { done: boolean }) {
  return (
    <div
      style={{
        width:          '1.5rem',
        height:         '1.5rem',
        borderRadius:   '50%',
        flexShrink:     0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     done ? 'rgba(5,150,105,0.1)' : 'rgba(0,0,0,0.04)',
        border:         done ? '1.5px solid rgba(5,150,105,0.25)' : '1.5px dashed rgba(0,0,0,0.18)',
        transition:     'all 0.2s ease',
      }}
    >
      {done && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
    </div>
  )
}

export default function OnboardingChecklist({
  memberCount,
  hasActiveFlow,
  ideaCount,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false)
  const [mounted,   setMounted]   = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      if (localStorage.getItem('ideaflow_onboarding_dismissed') === '1') {
        setDismissed(true)
      }
    } catch { /* SSR safety */ }
  }, [])

  if (!mounted || dismissed) return null

  const steps: Step[] = [
    {
      id:     'workspace',
      label:  'Create your workspace',
      detail: 'Your IdeaFlow workspace is live and ready.',
      done:   true,
    },
    {
      id:       'invite',
      label:    'Invite your team',
      detail:   memberCount > 1
        ? `${memberCount} members have joined.`
        : 'Share the invite link so your team can participate.',
      done:     memberCount > 1,
      ctaLabel: 'Go to Members',
      ctaHref:  '/dashboard/members',
    },
    {
      id:       'flow',
      label:    'Launch an IdeaFlow',
      detail:   hasActiveFlow
        ? 'Your IdeaFlow is active — ideas are coming in.'
        : 'Open a round so your team can start submitting ideas.',
      done:     hasActiveFlow,
      ctaLabel: 'Manage flows',
      ctaHref:  '/dashboard/flows',
    },
    {
      id:       'ideas',
      label:    'Collect your first 3 ideas',
      detail:   ideaCount >= 3
        ? `${ideaCount} ideas in — you're off to a great start!`
        : `${ideaCount} of 3 so far. Ask your team to contribute.`,
      done:     ideaCount >= 3,
    },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const allDone        = completedCount === steps.length
  const progressPct    = Math.round((completedCount / steps.length) * 100)

  function dismiss() {
    try { localStorage.setItem('ideaflow_onboarding_dismissed', '1') } catch { /* noop */ }
    setDismissed(true)
  }

  return (
    <div
      className="stagger-fade-1"
      style={{
        borderRadius: '1rem',
        border:       '1px solid rgba(26,107,191,0.12)',
        background:   'linear-gradient(160deg, rgba(26,107,191,0.02) 0%, #ffffff 100%)',
        padding:      '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display:        'flex',
          alignItems:     'flex-start',
          justifyContent: 'space-between',
          marginBottom:   '1rem',
          gap:            '0.5rem',
        }}
      >
        <div>
          <p
            style={{
              fontSize:      '0.8125rem',
              fontWeight:    700,
              color:         '#0d1f35',
              letterSpacing: '-0.01em',
              marginBottom:  '0.2rem',
            }}
          >
            {allDone ? '🎉 You\'re all set!' : 'Getting started'}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#8b96a8' }}>
            {allDone
              ? 'Your workspace is fully configured. Dismiss this anytime.'
              : `${completedCount} of ${steps.length} steps complete`}
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss onboarding checklist"
          style={{
            background:  'none',
            border:      'none',
            cursor:      'pointer',
            color:       '#b0bac8',
            fontSize:    '1.1rem',
            lineHeight:  1,
            padding:     '0.1rem 0.2rem',
            flexShrink:  0,
          }}
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height:       '4px',
          borderRadius: '999px',
          background:   'rgba(0,0,0,0.06)',
          marginBottom: '1rem',
          overflow:     'hidden',
        }}
      >
        <div
          style={{
            height:     '100%',
            width:      `${progressPct}%`,
            borderRadius: '999px',
            background:   allDone
              ? 'linear-gradient(90deg, #059669, #10b981)'
              : 'linear-gradient(90deg, #1a6bbf, #3b82f6)',
            transition:   'width 0.5s ease',
          }}
        />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '0.75rem',
              opacity:    step.done ? 0.6 : 1,
            }}
          >
            <CheckIcon done={step.done} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize:       '0.8rem',
                  fontWeight:     step.done ? 500 : 600,
                  color:          step.done ? '#8b96a8' : '#0d1f35',
                  textDecoration: step.done ? 'line-through' : 'none',
                  marginBottom:   '0.05rem',
                }}
              >
                {step.label}
              </p>
              <p style={{ fontSize: '0.7rem', color: '#b0bac8', lineHeight: 1.4 }}>
                {step.detail}
              </p>
            </div>
            {!step.done && step.ctaHref && (
              <a
                href={step.ctaHref}
                style={{
                  flexShrink:    0,
                  fontSize:      '0.7rem',
                  fontWeight:    600,
                  color:         '#1a6bbf',
                  textDecoration: 'none',
                  whiteSpace:    'nowrap',
                  background:    'rgba(26,107,191,0.07)',
                  borderRadius:  '0.4rem',
                  padding:       '0.25rem 0.6rem',
                  border:        '1px solid rgba(26,107,191,0.12)',
                }}
              >
                {step.ctaLabel} →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
