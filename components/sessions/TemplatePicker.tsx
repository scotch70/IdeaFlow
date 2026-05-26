'use client'

/**
 * TemplatePicker — grid of the 7 IdeaFlow Session templates.
 *
 * Clicking a template creates the session in the mock store and redirects
 * to /dashboard/sessions/[id]. The title is generated from the template
 * name plus a date suffix so the user can rename it inside the workspace.
 */

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { TEMPLATES } from '@/lib/sessions/templates'
import { createSession } from '@/lib/sessions/store'

interface Props {
  userId:    string
  companyId: string
}

export default function TemplatePicker({ userId, companyId }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function pick(templateType: typeof TEMPLATES[number]['type'], name: string) {
    if (busy) return
    setBusy(templateType)
    try {
      const today = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      const session = await createSession({
        userId, companyId,
        title:        `${name} — ${today}`,
        templateType,
      })
      router.push(`/dashboard/sessions/${session.id}`)
    } catch {
      setBusy(null)
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
        gap: '0.875rem',
      }}
    >
      {TEMPLATES.map(t => {
        const isBusy = busy === t.type
        return (
          <button
            key={t.type}
            type="button"
            onClick={() => pick(t.type, t.name)}
            disabled={!!busy}
            style={{
              textAlign: 'left',
              background: '#fff',
              border: '1px solid rgba(26,107,191,0.10)',
              borderRadius: '0.875rem',
              padding: '1.05rem 1.1rem 1rem',
              cursor: busy ? 'wait' : 'pointer',
              opacity: busy && !isBusy ? 0.5 : 1,
              transition: 'border-color 0.12s, transform 0.12s, box-shadow 0.12s',
              fontFamily: 'inherit',
              boxShadow: '0 1px 4px rgba(6,14,38,0.03)',
            }}
            onMouseEnter={e => {
              if (busy) return
              e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'
              e.currentTarget.style.boxShadow = '0 6px 22px rgba(6,14,38,0.07)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(26,107,191,0.10)'
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(6,14,38,0.03)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.55rem' }}>
              <span
                style={{
                  fontSize: '1.15rem',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '2rem', height: '2rem', borderRadius: '0.5rem',
                  background: 'rgba(249,115,22,0.07)',
                  border: '1px solid rgba(249,115,22,0.16)',
                }}
                aria-hidden
              >
                {t.emoji}
              </span>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.01em' }}>
                {t.name}
              </p>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#5d667a', lineHeight: 1.5 }}>
              {t.description}
            </p>
            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <p style={{ fontSize: '0.65rem', color: '#9faab8', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                5 guided steps
              </p>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isBusy ? '#9faab8' : '#0d1f35' }}>
                {isBusy ? 'Creating…' : 'Start →'}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
