'use client'

// ─────────────────────────────────────────────────────────────────────────────
// FlowTemplates — first-launch experience for empty workspaces.
//
// Shown ONLY when the workspace has zero IdeaFlows. Picking a template hits
// the canonical POST /api/rounds endpoint to create a real idea_rounds row
// (with audience_mode = 'workspace' by default), then navigates the admin
// straight to the new flow page. We deliberately do NOT call
// window.location.reload() — a soft router.push avoids a flash of the empty
// dashboard between request completion and re-render, and guarantees the
// admin lands on the right place even if some other listing cache is stale.
// ─────────────────────────────────────────────────────────────────────────────

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FlowTemplatesProps {
  // Reserved for parity with existing call sites that already pass companyId.
  // The API derives the company from the caller's session, so we don't send it.
  companyId?: string
  /** Called after a flow is successfully created, in case the parent wants to react. */
  onCreated?: (roundId: string) => void
}

interface Template {
  id:       string
  icon:     string
  name:     string
  tagline:  string
  prompt:   string
  color:    string
}

const TEMPLATES: Template[] = [
  {
    id:      'team-improvements',
    icon:    '🔧',
    name:    'Team improvements',
    tagline: 'What would make your work easier?',
    prompt:  'What is one change that would make your day-to-day work easier, faster, or more enjoyable?',
    color:   '#1a6bbf',
  },
  {
    id:      'product-feedback',
    icon:    '💡',
    name:    'Product feedback',
    tagline: 'What should we build next?',
    prompt:  'What feature, fix, or improvement would have the biggest positive impact on our product or customers?',
    color:   '#f97316',
  },
  {
    id:      'hiring-culture',
    icon:    '🤝',
    name:    'Hiring & culture',
    tagline: 'Build a great place to work',
    prompt:  'What would make this a better place to work — for you, your team, or future hires?',
    color:   '#8b5cf6',
  },
  {
    id:      'workflow-efficiency',
    icon:    '⚡',
    name:    'Workflow efficiency',
    tagline: 'Cut friction, move faster',
    prompt:  'Where do you feel the most friction in our current processes? What would you automate, remove, or simplify?',
    color:   '#059669',
  },
  {
    id:      'communication',
    icon:    '💬',
    name:    'Better communication',
    tagline: 'How should we stay aligned?',
    prompt:  'How could we communicate better as a team — across meetings, async updates, or cross-team collaboration?',
    color:   '#0891b2',
  },
  {
    id:      'remote-work',
    icon:    '🌍',
    name:    'Remote & hybrid',
    tagline: 'Make distributed work feel closer',
    prompt:  'What would make remote or hybrid work feel more connected, fair, or productive for you?',
    color:   '#d97706',
  },
  {
    id:      'quarterly-goals',
    icon:    '🎯',
    name:    'Quarterly priorities',
    tagline: 'What should we focus on?',
    prompt:  'Looking at the next quarter, what is the one initiative, investment, or change that would have the greatest impact?',
    color:   '#dc2626',
  },
]

export default function FlowTemplates({ onCreated }: FlowTemplatesProps) {
  const router = useRouter()
  const [launching, setLaunching] = useState<string | null>(null)
  const [error,     setError]     = useState<string | null>(null)

  async function launch(template: Template | null) {
    const id = template?.id ?? 'blank'
    try {
      setLaunching(id)
      setError(null)

      const body: Record<string, unknown> = {
        // /api/rounds defaults to 'draft'; templates are an explicit
        // "launch now" action so we pass 'active'.
        status: 'active',
      }
      if (template) {
        body.name   = template.name
        body.prompt = template.prompt
      } else {
        body.name   = 'New IdeaFlow'
      }

      const res = await fetch('/api/rounds', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to launch flow')
      }

      const roundId: string | null = (data && typeof data.id === 'string') ? data.id : null
      if (!roundId) {
        throw new Error('Flow created but no id returned')
      }

      onCreated?.(roundId)

      // Land on the new flow's page. router.push is enough — server components
      // along /dashboard/flows/[id] are force-dynamic and will fetch fresh.
      router.push(`/dashboard/flows/${roundId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLaunching(null)
    }
  }

  return (
    <div
      className="stagger-fade-2"
      style={{
        borderRadius: '1rem',
        border:       '1px solid rgba(0,0,0,0.07)',
        background:   '#ffffff',
        padding:      '1.5rem',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p
          style={{
            fontSize:      '1rem',
            fontWeight:    800,
            color:         '#0d1f35',
            letterSpacing: '-0.02em',
            marginBottom:  '0.3rem',
          }}
        >
          Launch an IdeaFlow
        </p>
        <p style={{ fontSize: '0.8125rem', color: '#8b96a8', lineHeight: 1.5 }}>
          Pick a template to get started instantly — or begin with a blank flow.
        </p>
      </div>

      {/* Template grid */}
      <div className="flow-templates-grid">
        {TEMPLATES.map((t) => {
          const isLaunching = launching === t.id
          return (
            <button
              key={t.id}
              onClick={() => launch(t)}
              disabled={launching !== null}
              className="flow-template-card"
              style={{
                background:    '#fff',
                border:        '1px solid rgba(0,0,0,0.07)',
                borderRadius:  '0.75rem',
                padding:       '0.875rem 1rem',
                textAlign:     'left',
                cursor:        launching !== null ? 'default' : 'pointer',
                opacity:       launching !== null && !isLaunching ? 0.5 : 1,
                transition:    'all 0.15s ease',
                display:       'flex',
                flexDirection: 'column',
                gap:           '0.3rem',
              }}
            >
              <span style={{ fontSize: '1.125rem', lineHeight: 1 }}>{t.icon}</span>
              <p
                style={{
                  fontSize:   '0.825rem',
                  fontWeight: 700,
                  color:      isLaunching ? t.color : '#0d1f35',
                  lineHeight: 1.3,
                }}
              >
                {isLaunching ? 'Launching…' : t.name}
              </p>
              <p style={{ fontSize: '0.72rem', color: '#8b96a8', lineHeight: 1.4 }}>
                {t.tagline}
              </p>
              <div
                style={{
                  marginTop:    '0.2rem',
                  height:       '2px',
                  width:        isLaunching ? '100%' : '0%',
                  background:   t.color,
                  borderRadius: '999px',
                  transition:   'width 0.6s ease',
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Blank start */}
      <div
        style={{
          marginTop:      '1rem',
          paddingTop:     '1rem',
          borderTop:      '1px solid rgba(0,0,0,0.06)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            '0.75rem',
          flexWrap:       'wrap',
        }}
      >
        <p style={{ fontSize: '0.775rem', color: '#b0bac8' }}>
          Prefer to write your own prompt?
        </p>
        <button
          onClick={() => launch(null)}
          disabled={launching !== null}
          style={{
            background:   'none',
            border:       '1px solid rgba(0,0,0,0.12)',
            borderRadius: '0.5rem',
            padding:      '0.4rem 0.875rem',
            fontSize:     '0.775rem',
            fontWeight:   600,
            color:        '#5d667a',
            cursor:       launching !== null ? 'default' : 'pointer',
            opacity:      launching !== null ? 0.5 : 1,
            transition:   'all 0.15s ease',
          }}
        >
          {launching === 'blank' ? 'Launching…' : 'Start blank →'}
        </button>
      </div>

      {error && (
        <p
          style={{
            marginTop:  '0.75rem',
            fontSize:   '0.775rem',
            color:      '#dc2626',
            fontWeight: 500,
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
