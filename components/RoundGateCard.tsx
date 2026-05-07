'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'

interface RoundGateCardProps {
  status: Exclude<EffectiveRoundStatus, 'active'>
  isAdmin: boolean
  companyId?: string | null
  roundName?: string | null
}

export default function RoundGateCard({ status, isAdmin, companyId, roundName }: RoundGateCardProps) {
  const [opening, setOpening]       = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError]           = useState('')
  const router = useRouter()

  const isClosed = status === 'closed'

  const icon        = isClosed ? '🔴' : '⏳'
  const headline    = isClosed ? 'IdeaFlow is closed'         : 'IdeaFlow has not started yet'
  const subCopy     = isClosed ? 'Idea submission is not available right now.'
                               : 'Your admin is setting up this IdeaFlow.'
  const memberCopy  = 'Your admin will reopen IdeaFlow when it\'s time to collect new ideas.'

  const borderColor = isClosed ? 'rgba(239,68,68,0.12)'  : 'rgba(249,115,22,0.13)'
  const iconBg      = isClosed ? 'rgba(239,68,68,0.07)'  : 'rgba(249,115,22,0.07)'
  const iconBorder  = isClosed ? 'rgba(239,68,68,0.15)'  : 'rgba(249,115,22,0.15)'

  async function handleOpen() {
    setError('')
    setOpening(true)
    try {
      const res = await fetch('/api/company/round-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'open' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to open IdeaFlow')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setOpening(false)
    }
  }

  async function handleDelete() {
    if (!companyId) return
    setError('')
    setDeleting(true)
    try {
      const res = await fetch('/api/company/update-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, status: null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to delete IdeaFlow')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div style={{
      background: '#ffffff',
      border: `1px solid ${borderColor}`,
      borderRadius: '1.25rem',
      padding: '2.5rem 2rem',
      textAlign: 'center',
      boxShadow: '0 2px 12px rgba(6,14,38,0.04)',
    }}>
      {/* Icon */}
      <div style={{
        width: '3rem', height: '3rem',
        borderRadius: '0.875rem',
        background: iconBg,
        border: `1px solid ${iconBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.25rem',
        fontSize: '1.2rem',
      }}>
        {icon}
      </div>

      {/* Headline */}
      <h2 style={{
        fontSize: '1.05rem', fontWeight: 800,
        color: '#0d1f35', letterSpacing: '-0.02em',
        marginBottom: '0.4rem',
      }}>
        {headline}
      </h2>

      {/* Sub-copy */}
      <p style={{
        fontSize: '0.875rem', color: '#9ab0c8',
        lineHeight: 1.6, maxWidth: '24rem',
        margin: '0 auto',
      }}>
        {subCopy}
      </p>

      {/* Error message */}
      {error && (
        <p style={{
          marginTop: '1rem',
          borderRadius: '0.625rem',
          border: '1px solid rgba(220,38,38,0.15)',
          background: 'rgba(220,38,38,0.05)',
          padding: '0.5rem 0.75rem',
          fontSize: '0.825rem', color: '#dc2626',
          maxWidth: '24rem', margin: '1rem auto 0',
        }}>
          {error}
        </p>
      )}

      {/* Admin CTA or member message */}
      {isAdmin ? (
        <div style={{ marginTop: '1.75rem' }}>

          {/* ── Confirm delete panel ─────────────────────────────────────── */}
          {confirmDelete ? (
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: '0.875rem',
              border: '1px solid rgba(220,38,38,0.18)',
              background: 'rgba(220,38,38,0.04)',
              maxWidth: '22rem',
              margin: '0 auto',
              textAlign: 'left',
            }}>
              <p style={{
                fontSize: '0.875rem', fontWeight: 600,
                color: '#0d1f35', marginBottom: '0.35rem',
              }}>
                Delete this IdeaFlow and its ideas?
              </p>
              <p style={{
                fontSize: '0.825rem', color: '#9ab0c8',
                marginBottom: '1rem', lineHeight: 1.5,
              }}>
                This will permanently remove all ideas, likes, and comments for
                {roundName ? ` "${roundName}"` : ' this round'}. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setConfirmDelete(false); setError('') }}
                  disabled={deleting}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    fontSize: '0.8rem', padding: '0.45rem 1rem',
                    borderRadius: '0.6rem',
                    border: '1px solid rgba(220,38,38,0.25)',
                    background: deleting ? 'rgba(220,38,38,0.06)' : '#dc2626',
                    color: deleting ? '#dc2626' : '#ffffff',
                    fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
              </div>
            </div>
          ) : (
            /* ── Normal admin action row ──────────────────────────────────── */
            <div style={{
              display: 'flex', gap: '0.625rem',
              justifyContent: 'center', flexWrap: 'wrap',
            }}>
              {/* Open */}
              <button
                onClick={handleOpen}
                disabled={opening}
                className="btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
              >
                {opening ? 'Opening…' : 'Open IdeaFlow →'}
              </button>

              {/* Edit */}
              <a
                href="/dashboard/idea-flow"
                className="btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.55rem 1.25rem', textDecoration: 'none' }}
              >
                Edit
              </a>

              {/* Delete — only available when round is not active */}
              {companyId && (
                <button
                  onClick={() => { setConfirmDelete(true); setError('') }}
                  style={{
                    fontSize: '0.85rem', padding: '0.55rem 1.25rem',
                    borderRadius: '0.6rem',
                    border: '1px solid rgba(220,38,38,0.20)',
                    background: 'transparent',
                    color: '#dc2626',
                    fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <p style={{
          fontSize: '0.825rem', color: '#b0c4d8',
          lineHeight: 1.6, maxWidth: '24rem',
          margin: '0.75rem auto 0',
        }}>
          {memberCopy}
        </p>
      )}
    </div>
  )
}
