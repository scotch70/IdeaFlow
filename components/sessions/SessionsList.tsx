'use client'

/**
 * SessionsList — client component that reads the user's sessions from the
 * mock store and renders a grid of session cards plus the "New session" CTA.
 *
 * Will become a thin wrapper over a Supabase query once the migration runs.
 */

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { deleteSession, listSessions } from '@/lib/sessions/store'
import { TEMPLATE_BY_TYPE } from '@/lib/sessions/templates'
import type { Session } from '@/types/sessions'

interface Props {
  userId:    string
  companyId: string
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0)        return 'just now'
  const m = Math.floor(ms / 60_000)
  if (m < 1)         return 'just now'
  if (m < 60)        return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24)        return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)         return `${d}d ago`
  if (d < 30)        return `${Math.floor(d / 7)}w ago`
  return new Date(iso).toLocaleDateString()
}

export default function SessionsList({ userId, companyId }: Props) {
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    listSessions(userId, companyId).then(s => { if (alive) setSessions(s) })
    return () => { alive = false }
  }, [userId, companyId])

  async function handleDelete(id: string) {
    await deleteSession(userId, id)
    setSessions(s => (s ?? []).filter(x => x.id !== id))
    setConfirmId(null)
  }

  if (sessions === null) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: '#9faab8', fontSize: '0.825rem' }}>
        Loading…
      </div>
    )
  }

  return (
    <div>
      {/* Top action row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <p style={{ fontSize: '0.825rem', color: '#5d667a' }}>
          {sessions.length === 0
            ? 'No sessions yet. Start one to organize your thinking.'
            : `${sessions.length} session${sessions.length === 1 ? '' : 's'}`}
        </p>
        <Link
          href="/dashboard/sessions/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: '#0d1f35', color: '#fff',
            fontSize: '0.825rem', fontWeight: 700,
            padding: '0.55rem 0.95rem', borderRadius: '0.6rem',
            textDecoration: 'none',
            boxShadow: '0 2px 12px rgba(13,31,53,0.16)',
          }}
        >
          + New session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
            gap: '0.875rem',
          }}
        >
          {sessions.map(s => {
            const tpl = TEMPLATE_BY_TYPE[s.template_type] ?? TEMPLATE_BY_TYPE['freeform']
            return (
              <div
                key={s.id}
                style={{
                  position: 'relative',
                  background: '#ffffff',
                  border: '1px solid rgba(26,107,191,0.10)',
                  borderRadius: '0.875rem',
                  padding: '1rem 1.05rem 0.9rem',
                  boxShadow: '0 1px 4px rgba(6,14,38,0.03)',
                  transition: 'border-color 0.12s, transform 0.12s, box-shadow 0.12s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'
                  e.currentTarget.style.boxShadow = '0 6px 22px rgba(6,14,38,0.07)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(26,107,191,0.10)'
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(6,14,38,0.03)'
                }}
              >
                <Link href={`/dashboard/sessions/${s.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.05rem' }}>{tpl.emoji}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {tpl.name}
                    </span>
                    <span style={{ flex: 1 }} />
                    <StatusPill status={s.status} />
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1f35', letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: '0.65rem', minHeight: '1.2em' }}>
                    {s.title || 'Untitled session'}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#9faab8' }}>
                    Updated {relativeTime(s.updated_at)}
                  </p>
                </Link>
                {/* Delete (with inline confirm) */}
                <button
                  type="button"
                  onClick={() => setConfirmId(s.id)}
                  aria-label="Delete session"
                  style={{
                    position: 'absolute', top: '0.625rem', right: '0.625rem',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    width: '1.75rem', height: '1.75rem', borderRadius: '999px',
                    color: '#b0bac8', fontSize: '1.1rem', lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.05)'; e.currentTarget.style.color = '#5d667a' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent';        e.currentTarget.style.color = '#b0bac8' }}
                >×</button>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmId && (
        <div
          onClick={() => setConfirmId(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(6,14,38,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '0.875rem',
              padding: '1.5rem 1.5rem 1.25rem',
              maxWidth: '22rem', width: '100%',
              boxShadow: '0 12px 40px rgba(6,14,38,0.22)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0d1f35', marginBottom: '0.4rem' }}>
              Delete this session?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#5d667a', lineHeight: 1.45, marginBottom: '1.25rem' }}>
              The session and all its cards and connections will be permanently removed. This can’t be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setConfirmId(null)}
                style={{
                  fontSize: '0.825rem', fontWeight: 600, color: '#5d667a',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '0.5rem 0.85rem', borderRadius: '0.5rem',
                }}
              >Cancel</button>
              <button
                onClick={() => handleDelete(confirmId)}
                style={{
                  fontSize: '0.825rem', fontWeight: 700, color: '#fff',
                  background: '#dc2626', border: 'none', cursor: 'pointer',
                  padding: '0.5rem 0.95rem', borderRadius: '0.5rem',
                }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: Session['status'] }) {
  const meta = status === 'finished'
    ? { label: 'Finished',  bg: 'rgba(16,185,129,0.07)', color: '#065f46', border: 'rgba(16,185,129,0.22)' }
    : status === 'archived'
    ? { label: 'Archived',  bg: 'rgba(0,0,0,0.04)',       color: '#475569', border: 'rgba(0,0,0,0.10)' }
    :                       { label: 'In progress',       bg: 'rgba(59,130,246,0.07)', color: '#1d4ed8', border: 'rgba(59,130,246,0.22)' }
  return (
    <span style={{
      fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
      borderRadius: '999px', padding: '0.14rem 0.45rem',
    }}>{meta.label}</span>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px dashed rgba(26,107,191,0.20)',
        borderRadius: '1rem',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }} aria-hidden>✦</p>
      <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.35rem' }}>
        Start your first session
      </p>
      <p style={{ fontSize: '0.875rem', color: '#5d667a', maxWidth: '24rem', margin: '0 auto 1.25rem', lineHeight: 1.55 }}>
        Pick a template, jot down what’s in your head, and end with a clear action plan.
      </p>
      <Link
        href="/dashboard/sessions/new"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: '#0d1f35', color: '#fff',
          fontSize: '0.875rem', fontWeight: 700,
          padding: '0.65rem 1.15rem', borderRadius: '0.625rem',
          textDecoration: 'none',
        }}
      >
        + New session
      </Link>
    </div>
  )
}
