'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Always use the canonical production domain for invite links.
// NEXT_PUBLIC_ variables are inlined at build time in client components.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://useideaflow.com'
import type { Invite } from '@/types/database'
import { QRCodeSVG } from 'qrcode.react'



interface ActiveInvite extends Invite {
  profiles?: { full_name: string | null } | null
}

interface ActiveInvitesProps {
  invites: ActiveInvite[]
}

function isExpired(invite: ActiveInvite) {
  if (!invite.expires_at) return false
  return new Date(invite.expires_at) < new Date()
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export default function ActiveInvites({ invites }: ActiveInvitesProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [openQrId, setOpenQrId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setError('')
    setDeletingId(id)

    try {
      const res = await fetch(`/api/invites/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to revoke invite')
      }

      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleCopy(inviteCode: string, id: string) {
    try {
      await navigator.clipboard.writeText(
        `${APP_URL}/join?code=${inviteCode}`
      )
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      setError('Failed to copy')
    }
  }

  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <div>
        <p
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ink-light)',
            marginBottom: '0.2rem',
          }}
        >
          Active invites
        </p>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--ink)',
          }}
        >
          Pending &amp; used invites
        </h2>
      </div>

      {error && (
        <p
          style={{
            borderRadius: '0.625rem',
            border: '1px solid rgba(220,38,38,0.15)',
            background: 'rgba(220,38,38,0.05)',
            padding: '0.5rem 0.75rem',
            fontSize: '0.825rem',
            color: '#dc2626',
          }}
        >
          {error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {invites.length === 0 ? (
          <div style={{ border: '1.5px dashed rgba(26,107,191,0.20)', borderRadius: '0.875rem', padding: '2rem 1.5rem', textAlign: 'center', background: 'rgba(248,250,255,0.5)' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2c4a6e', marginBottom: '0.3rem' }}>No invites sent yet</p>
            <p style={{ fontSize: '0.8rem', color: '#9ab0c8' }}>Use the form above to invite your first team member.</p>
          </div>
        ) : (
          invites.map(invite => {
            const showQr = openQrId === invite.id
            
            const qrValue = `${APP_URL}/join?code=${invite.invite_code}`

              const expired = isExpired(invite)

const statusLabel = invite.used_at
  ? 'Joined'
  : expired
  ? 'Expired'
  : 'Pending'

const statusBg = invite.used_at
  ? 'var(--badge-member-bg)'
  : expired
  ? 'rgba(220,38,38,0.10)'
  : 'rgba(16,185,129,0.10)'

const statusColor = invite.used_at
  ? 'var(--sky-zenith)'
  : expired
  ? '#dc2626'
  : '#059669'

            return (
              <div
                key={invite.id}
                style={{
                  borderRadius: '0.75rem',
                  border: '1px solid var(--border)',
                  padding: '0.625rem 0.75rem',
                  background: invite.used_at
  ? 'transparent'
  : 'rgba(249,115,22,0.02)',
opacity: expired && !invite.used_at ? 0.65 : 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {invite.name || 'Unnamed'}
                    </p>

                    {invite.email && (
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--ink-light)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {invite.email}
                      </p>
                    )}

                    <p
  style={{
    fontSize: '0.68rem',
    color: 'var(--ink-faint)',
    marginTop: '0.1rem',
  }}
>
  Invited {formatDate(invite.created_at)}
</p>

{invite.expires_at && !invite.used_at && (
  <p
    style={{
      fontSize: '0.68rem',
      color: 'var(--ink-faint)',
      marginTop: '0.1rem',
    }}
  >
    Expires {formatDate(invite.expires_at)}
  </p>
)}

{invite.used_at && (
  <p
    style={{
      fontSize: '0.68rem',
      color: 'var(--ink-faint)',
      marginTop: '0.1rem',
    }}
  >
    Joined by {invite.profiles?.full_name || 'a team member'} on {formatDate(invite.used_at)}
  </p>
)}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexShrink: 0,
                    }}
                  >
                    <span
  style={{
    borderRadius: '9999px',
    padding: '0.2rem 0.625rem',
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    background: statusBg,
    color: statusColor,
  }}
>
  {statusLabel}
</span>

                    {!invite.used_at && !expired && (
                      
                      <>
                        <button
                          onClick={() => handleCopy(invite.invite_code, invite.id)}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            color:
                              copiedId === invite.id ? '#059669' : 'var(--ink-mid)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          {copiedId === invite.id ? '✓ Copied' : 'Copy link'}
                        </button>

                        <button
                          onClick={() =>
                            setOpenQrId(showQr ? null : invite.id)
                          }
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            color: 'var(--ink-mid)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          {showQr ? 'Hide QR' : 'QR'}
                        </button>

                        <button
                          onClick={() => handleDelete(invite.id)}
                          disabled={deletingId === invite.id}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            color: '#dc2626',
                            background: 'none',
                            border: 'none',
                            cursor: deletingId === invite.id ? 'default' : 'pointer',
                            padding: 0,
                            opacity: deletingId === invite.id ? 0.5 : 1,
                          }}
                        >
                          {deletingId === invite.id ? '…' : 'Revoke'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {showQr && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      borderTop: '1px solid var(--border)',
                      paddingTop: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        borderRadius: '0.75rem',
                        border: '1px solid var(--border)',
                        background: '#fff',
                        padding: '0.5rem',
                      }}
                    >
                      <QRCodeSVG value={qrValue} size={88} />
                    </div>

                    <div>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--ink)',
                        }}
                      >
                        Scan to join
                      </p>
                      <p
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--ink-light)',
                          marginTop: '0.2rem',
                        }}
                      >
                        Employees can scan this code to open the join page directly.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}