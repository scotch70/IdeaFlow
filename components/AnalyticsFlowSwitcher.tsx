'use client'

/**
 * AnalyticsFlowSwitcher — header dropdown that scopes the Analytics view to
 * a specific IdeaFlow. Navigates to /dashboard/analytics?flow=<id>; the
 * server component re-fetches with the new scope on each change.
 *
 * Why a native <select> rather than a custom popover:
 *   - Mobile-friendly out of the box (uses the OS picker).
 *   - Zero focus-trap / portal complexity.
 *   - Matches the visual weight of the other small header controls.
 */

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export type SwitchableFlow = {
  id:     string
  name:   string
  status: 'active' | 'draft' | 'closed'
}

interface Props {
  flows:     SwitchableFlow[]
  currentId: string | null
}

const STATUS_DOT: Record<SwitchableFlow['status'], string> = {
  active: '#10b981',
  draft:  '#f97316',
  closed: '#94a3b8',
}

const STATUS_LABEL: Record<SwitchableFlow['status'], string> = {
  active: 'Active',
  draft:  'Draft',
  closed: 'Closed',
}

export default function AnalyticsFlowSwitcher({ flows, currentId }: Props) {
  const router            = useRouter()
  const [pending, startTransition] = useTransition()

  // The component is only rendered by the parent when there is at least one
  // flow, so this is safe.
  const current = flows.find(f => f.id === currentId) ?? flows[0]

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    if (!id || id === currentId) return
    startTransition(() => {
      router.push(`/dashboard/analytics?flow=${encodeURIComponent(id)}`)
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
        background: STATUS_DOT[current.status],
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
          value={current.id}
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
