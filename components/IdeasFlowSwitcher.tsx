'use client'

/**
 * IdeasFlowSwitcher — header dropdown for the /dashboard/ideas overview.
 *
 * Same shape as AnalyticsFlowSwitcher, but adds an "All IdeaFlows" option at
 * the top so the user can browse ideas across every flow they can access.
 * Navigates to /dashboard/ideas?flow=<id|all>.
 */

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export type SwitchableIdeasFlow = {
  id:     string
  name:   string
  status: 'active' | 'draft' | 'closed'
}

interface Props {
  flows:     SwitchableIdeasFlow[]
  currentId: string | 'all'
}

const STATUS_DOT: Record<SwitchableIdeasFlow['status'], string> = {
  active: '#10b981',
  draft:  '#f97316',
  closed: '#94a3b8',
}

const STATUS_LABEL: Record<SwitchableIdeasFlow['status'], string> = {
  active: 'Active',
  draft:  'Draft',
  closed: 'Closed',
}

export default function IdeasFlowSwitcher({ flows, currentId }: Props) {
  const router            = useRouter()
  const [pending, startTransition] = useTransition()

  const current = currentId === 'all'
    ? null
    : flows.find(f => f.id === currentId) ?? null

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    if (!next || next === currentId) return
    startTransition(() => {
      router.push(`/dashboard/ideas?flow=${encodeURIComponent(next)}`)
    })
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.55rem',
      background: '#ffffff',
      border: '1px solid rgba(26,107,191,0.16)',
      borderRadius: '0.625rem',
      padding: '0.32rem 0.55rem 0.32rem 0.7rem',
      maxWidth: '100%',
    }}>
      <span aria-hidden style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: current ? STATUS_DOT[current.status] : '#94a3b8',
        flexShrink: 0,
      }} />
      <p style={{
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color: '#9ab0c8',
        flexShrink: 0,
      }}>
        IdeaFlow
      </p>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', minWidth: 0 }}>
        <select
          aria-label="Switch IdeaFlow"
          value={current ? current.id : 'all'}
          onChange={onChange}
          disabled={pending}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            background: 'transparent',
            border: 'none',
            paddingRight: '1.25rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#0d1f35',
            cursor: pending ? 'wait' : 'pointer',
            maxWidth: '20rem',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <option value="all">All IdeaFlows</option>
          {flows.map(f => (
            <option key={f.id} value={f.id}>
              {f.name}  ·  {STATUS_LABEL[f.status]}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: '0.15rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            fontSize: '0.6rem',
            pointerEvents: 'none',
          }}
        >
          ▾
        </span>
      </div>
    </div>
  )
}
