'use client'

/**
 * FlowAdminPanel
 *
 * Admin-only management panel shown at the bottom of /dashboard/flows/[id].
 * Handles: edit name/prompt/dates, open/close/draft toggle, member assignment,
 * and delete with inline confirmation.
 *
 * All mutations call /api/rounds/[id] (PATCH | DELETE) or
 * /api/rounds/[id]/members (POST | DELETE).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FlowMemberPicker from './FlowMemberPicker'
import type { SlimProfile } from '@/types/database'

type RoundStatus = 'draft' | 'active' | 'closed'

export type FlowInvite = {
  id:           string
  name:         string | null
  email:        string | null
  invite_code:  string
  used_at:      string | null
  expires_at:   string | null
  created_at:   string
  profiles?:    { full_name: string | null } | null
}

interface FlowAdminPanelProps {
  roundId:               string
  initialName:           string
  initialPrompt:         string | null
  initialStatus:         RoundStatus
  initialStartsAt:       string | null
  initialEndsAt:         string | null
  initialManualOverride: 'open' | 'closed' | null
  effectiveStatus:       'active' | 'closed' | 'draft'
  companyMembers:        SlimProfile[]
  assignedUserIds:       string[]
  flowInvites:           FlowInvite[]
}

// ── Helper ────────────────────────────────────────────────────────────────────

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}
function fromDatetimeLocal(v: string): string | null {
  return v ? new Date(v).toISOString() : null
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.75rem' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-light)', marginBottom: '0.3rem' }}>
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: '0.7rem', color: 'var(--ink-light)', marginTop: '0.25rem' }}>{hint}</p>
      )}
    </div>
  )
}

function ActionBtn({
  children, onClick, disabled = false, variant = 'secondary',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'green'
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--orange)',           color: '#fff',    border: 'none' },
    secondary: { background: '#fff',                    color: '#475569', border: '1px solid var(--border-mid)' },
    danger:    { background: 'rgba(239,68,68,0.07)',    color: '#991b1b', border: '1px solid rgba(239,68,68,0.20)' },
    ghost:     { background: 'transparent',             color: '#64748b', border: '1px solid var(--tint-border)' },
    green:     { background: 'rgba(16,185,129,0.09)',   color: '#065f46', border: '1px solid rgba(16,185,129,0.25)' },
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        height: '2.125rem', padding: '0 1rem',
        borderRadius: '0.45rem',
        fontSize: '0.8rem', fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FlowAdminPanel({
  roundId,
  initialName,
  initialPrompt,
  initialStatus,
  initialStartsAt,
  initialEndsAt,
  initialManualOverride,
  companyMembers,
  assignedUserIds,
  flowInvites: initialFlowInvites,
}: FlowAdminPanelProps) {
  const router = useRouter()

  const [name,     setName]     = useState(initialName)
  const [prompt,   setPrompt]   = useState(initialPrompt ?? '')
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(initialStartsAt))
  const [endsAt,   setEndsAt]   = useState(toDatetimeLocal(initialEndsAt))

  const [saving,         setSaving]         = useState(false)
  const [saveError,      setSaveError]      = useState('')
  const [confirmDelete,  setConfirmDelete]  = useState(false)
  const [deleting,       setDeleting]       = useState(false)
  const [deleteError,    setDeleteError]    = useState('')
  const [overrideSaving, setOverrideSaving] = useState(false)

  // Reusable share-link state
  const [inviteCode,    setInviteCode]    = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError,   setInviteError]   = useState('')
  const [copied,        setCopied]        = useState(false)

  // Email invite state
  const [inviteName,       setInviteName]       = useState('')
  const [inviteEmail,      setInviteEmail]       = useState('')
  const [emailInviteLoading, setEmailInviteLoading] = useState(false)
  const [emailInviteError,   setEmailInviteError]   = useState('')
  const [emailInviteSuccess, setEmailInviteSuccess] = useState('')

  // Pending invites list
  const [flowInvites,   setFlowInvites]   = useState<FlowInvite[]>(initialFlowInvites)
  const [revokingId,    setRevokingId]    = useState<string | null>(null)
  const [revokeError,   setRevokeError]   = useState('')
  const [copiedInvId,   setCopiedInvId]   = useState<string | null>(null)

  async function patch(body: Record<string, unknown>) {
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to save')
      }
      router.refresh()
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleSave() {
    await patch({
      name:      name.trim() || 'IdeaFlow',
      prompt:    prompt.trim() || null,
      starts_at: fromDatetimeLocal(startsAt),
      ends_at:   fromDatetimeLocal(endsAt),
    })
  }

  async function handleStatusChange(status: RoundStatus) {
    await patch({ status })
  }

  async function handleOverride(action: 'open' | 'closed' | null) {
    setOverrideSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ manual_override: action }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed')
      }
      router.refresh()
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setOverrideSaving(false)
    }
  }

  async function handleEmailInvite() {
    if (!inviteName.trim()) { setEmailInviteError('Name is required'); return }
    if (!inviteEmail.trim()) { setEmailInviteError('Email is required'); return }
    setEmailInviteLoading(true)
    setEmailInviteError('')
    setEmailInviteSuccess('')
    try {
      const res = await fetch('/api/invites', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:          inviteName.trim(),
          email:         inviteEmail.trim(),
          idea_round_id: roundId,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Failed to send invite')
      setEmailInviteSuccess(`Invite sent to ${inviteEmail.trim()}`)
      setInviteName('')
      setInviteEmail('')
      // Refresh invite list
      router.refresh()
      // Optimistically add to list
      if (d.invite) setFlowInvites(prev => [d.invite, ...prev])
    } catch (err: unknown) {
      setEmailInviteError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setEmailInviteLoading(false)
    }
  }

  async function handleRevokeInvite(invId: string) {
    setRevokingId(invId)
    setRevokeError('')
    try {
      const res = await fetch(`/api/invites/${invId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to revoke')
      }
      setFlowInvites(prev => prev.filter(inv => inv.id !== invId))
      router.refresh()
    } catch (err: unknown) {
      setRevokeError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setRevokingId(null)
    }
  }

  function handleCopyInvite(code: string, id: string) {
    const url = `${window.location.origin}/join?code=${code}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedInvId(id)
      setTimeout(() => setCopiedInvId(null), 2000)
    })
  }

  function formatDate(iso: string) {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
  }

  async function handleGenerateInvite() {
    setInviteLoading(true)
    setInviteError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}/invite`, { method: 'POST' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Failed to generate link')
      setInviteCode(d.code)
      setCopied(false)
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setInviteLoading(false)
    }
  }

  function handleCopy() {
    if (!inviteCode) return
    const url = `${window.location.origin}/flow-invite/${inviteCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to delete')
      }
      // Return to the admin management page after deletion
      router.push('/dashboard/idea-flow')
      router.refresh()
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  return (
    <div style={{
      borderRadius: '1rem',
      border: '1px solid rgba(26,107,191,0.12)',
      background: 'rgba(248,250,255,0.8)',
      padding: '1.375rem',
    }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '1.25rem' }}>
        Admin controls
      </p>

      {/* ── Settings ── */}
      <Section title="Settings">
        <Field label="Name">
          <input
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={60}
            disabled={saving}
          />
        </Field>
        <Field
          label="Question / prompt"
          hint="Shown to members when they submit an idea."
        >
          <input
            className="input"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="What should your team improve?"
            maxLength={120}
            disabled={saving}
          />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1rem' }}>
          <Field label="Opens (optional)">
            <input
              type="datetime-local"
              className="input"
              value={startsAt}
              onChange={e => setStartsAt(e.target.value)}
              disabled={saving}
              style={{ fontSize: '0.775rem' }}
            />
          </Field>
          <Field label="Closes (optional)">
            <input
              type="datetime-local"
              className="input"
              value={endsAt}
              onChange={e => setEndsAt(e.target.value)}
              disabled={saving}
              style={{ fontSize: '0.775rem' }}
            />
          </Field>
        </div>

        {saveError && (
          <p style={{ fontSize: '0.775rem', color: '#dc2626', marginBottom: '0.625rem' }}>{saveError}</p>
        )}
        <ActionBtn onClick={handleSave} disabled={saving} variant="secondary">
          {saving ? 'Saving…' : 'Save changes'}
        </ActionBtn>
      </Section>

      {/* ── Status control ── */}
      <Section title="Status">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          <ActionBtn
            onClick={() => handleStatusChange('draft')}
            disabled={saving || initialStatus === 'draft'}
            variant={initialStatus === 'draft' ? 'ghost' : 'secondary'}
          >
            Set draft
          </ActionBtn>
          <ActionBtn
            onClick={() => handleStatusChange('active')}
            disabled={saving || initialStatus === 'active'}
            variant={initialStatus === 'active' ? 'ghost' : 'green'}
          >
            Set active
          </ActionBtn>
          <ActionBtn
            onClick={() => handleStatusChange('closed')}
            disabled={saving || initialStatus === 'closed'}
            variant={initialStatus === 'closed' ? 'ghost' : 'danger'}
          >
            Set closed
          </ActionBtn>
        </div>

        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.5rem' }}>
          Manual override
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <ActionBtn
            onClick={() => handleOverride('open')}
            disabled={overrideSaving || initialManualOverride === 'open'}
            variant={initialManualOverride === 'open' ? 'ghost' : 'green'}
          >
            Force open
          </ActionBtn>
          <ActionBtn
            onClick={() => handleOverride('closed')}
            disabled={overrideSaving || initialManualOverride === 'closed'}
            variant={initialManualOverride === 'closed' ? 'ghost' : 'danger'}
          >
            Force close
          </ActionBtn>
          {initialManualOverride !== null && (
            <ActionBtn
              onClick={() => handleOverride(null)}
              disabled={overrideSaving}
              variant="ghost"
            >
              ↩ Use schedule
            </ActionBtn>
          )}
        </div>
      </Section>

      {/* ── Members & Invites ── */}
      <Section title="Members & invites">

        {/* — Assign existing workspace members — */}
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.5rem' }}>
          Assign from workspace
        </p>
        <FlowMemberPicker
          roundId={roundId}
          companyMembers={companyMembers}
          assignedUserIds={assignedUserIds}
        />

        {/* — Invite someone new by email — */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: '1.125rem', paddingTop: '1.125rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.5rem' }}>
            Invite new member by email
          </p>
          <p style={{ fontSize: '0.775rem', color: 'var(--ink-light)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            Creates a workspace invite linked to this IdeaFlow. They'll be added directly to this flow when they join.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <input
              className="input"
              placeholder="Name"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              disabled={emailInviteLoading}
              onKeyDown={e => e.key === 'Enter' && handleEmailInvite()}
            />
            <input
              className="input"
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              disabled={emailInviteLoading}
              onKeyDown={e => e.key === 'Enter' && handleEmailInvite()}
            />
          </div>
          <ActionBtn onClick={handleEmailInvite} disabled={emailInviteLoading} variant="secondary">
            {emailInviteLoading ? 'Sending…' : 'Send invite'}
          </ActionBtn>
          {emailInviteError && (
            <p style={{ fontSize: '0.775rem', color: '#dc2626', marginTop: '0.5rem' }}>{emailInviteError}</p>
          )}
          {emailInviteSuccess && (
            <p style={{ fontSize: '0.775rem', color: '#059669', marginTop: '0.5rem' }}>✓ {emailInviteSuccess}</p>
          )}
        </div>

        {/* — Pending invites for this flow — */}
        {flowInvites.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: '1.125rem', paddingTop: '1.125rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.625rem' }}>
              Sent invites
            </p>
            {revokeError && (
              <p style={{ fontSize: '0.775rem', color: '#dc2626', marginBottom: '0.5rem' }}>{revokeError}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {flowInvites.map(inv => {
                const isUsed    = !!inv.used_at
                const isExpired = !isUsed && !!inv.expires_at && new Date(inv.expires_at) < new Date()
                const statusLabel = isUsed ? 'Joined' : isExpired ? 'Expired' : 'Pending'
                const statusColor = isUsed ? '#0e52a8' : isExpired ? '#dc2626' : '#059669'
                const statusBg    = isUsed ? 'rgba(26,107,191,0.07)' : isExpired ? 'rgba(220,38,38,0.07)' : 'rgba(16,185,129,0.07)'
                return (
                  <div key={inv.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                    padding: '0.5rem 0.625rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    background: isUsed ? 'transparent' : 'rgba(249,115,22,0.02)',
                    opacity: isExpired ? 0.65 : 1,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0d1f35', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inv.name || 'Unnamed'}
                      </p>
                      {inv.email && (
                        <p style={{ fontSize: '0.7rem', color: '#9ab0c8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inv.email}
                        </p>
                      )}
                      {isUsed && inv.profiles?.full_name && (
                        <p style={{ fontSize: '0.68rem', color: '#9ab0c8' }}>
                          Joined as {inv.profiles.full_name}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700,
                        padding: '0.18rem 0.5rem', borderRadius: '999px',
                        background: statusBg, color: statusColor,
                      }}>
                        {statusLabel}
                      </span>
                      {!isUsed && !isExpired && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleCopyInvite(inv.invite_code, inv.id)}
                            style={{ fontSize: '0.7rem', fontWeight: 500, color: copiedInvId === inv.id ? '#059669' : '#9ab0c8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            {copiedInvId === inv.id ? '✓ Copied' : 'Copy'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeInvite(inv.id)}
                            disabled={revokingId === inv.id}
                            style={{ fontSize: '0.7rem', fontWeight: 500, color: '#dc2626', background: 'none', border: 'none', cursor: revokingId === inv.id ? 'default' : 'pointer', padding: 0, opacity: revokingId === inv.id ? 0.5 : 1 }}
                          >
                            {revokingId === inv.id ? '…' : 'Revoke'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* — Reusable share link (for existing workspace members) — */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: '1.125rem', paddingTop: '1.125rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.5rem' }}>
            Reusable join link
          </p>
          <p style={{ fontSize: '0.775rem', color: 'var(--ink-light)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            Share this link with anyone already in the workspace to add them to this IdeaFlow instantly.
          </p>
          {!inviteCode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <ActionBtn onClick={handleGenerateInvite} disabled={inviteLoading} variant="secondary">
                {inviteLoading ? 'Generating…' : 'Generate link'}
              </ActionBtn>
              {inviteError && (
                <p style={{ fontSize: '0.775rem', color: '#dc2626' }}>{inviteError}</p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-mid)',
                background: '#fff',
                padding: '0.375rem 0.5rem 0.375rem 0.75rem',
              }}>
                <span style={{
                  flex: 1, minWidth: 0,
                  fontSize: '0.775rem', color: 'var(--ink)', fontFamily: 'monospace',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/flow-invite/${inviteCode}` : `/flow-invite/${inviteCode}`}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    flexShrink: 0,
                    height: '1.75rem', padding: '0 0.625rem',
                    borderRadius: '0.375rem',
                    border: copied ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border-mid)',
                    background: copied ? 'rgba(16,185,129,0.08)' : 'var(--tint)',
                    fontSize: '0.72rem', fontWeight: 600,
                    color: copied ? '#065f46' : 'var(--ink-light)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <ActionBtn onClick={handleGenerateInvite} disabled={inviteLoading} variant="ghost">
                {inviteLoading ? 'Generating…' : '↻ New link'}
              </ActionBtn>
              {inviteError && (
                <p style={{ fontSize: '0.775rem', color: '#dc2626' }}>{inviteError}</p>
              )}
            </div>
          )}
        </div>

      </Section>

      {/* ── Delete ── */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '1.25rem' }}>
        {confirmDelete ? (
          <div style={{
            borderRadius: '0.625rem',
            border: '1px solid rgba(239,68,68,0.25)',
            background: 'rgba(239,68,68,0.04)',
            padding: '0.875rem',
          }}>
            <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '0.25rem' }}>
              Delete this IdeaFlow?
            </p>
            <p style={{ fontSize: '0.775rem', color: '#991b1b', lineHeight: 1.5, marginBottom: '0.875rem' }}>
              This permanently removes all ideas, likes, and comments. Cannot be undone.
            </p>
            {deleteError && (
              <p style={{ fontSize: '0.775rem', color: '#dc2626', marginBottom: '0.5rem' }}>{deleteError}</p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ActionBtn
                onClick={() => { setConfirmDelete(false); setDeleteError('') }}
                variant="ghost"
                disabled={deleting}
              >
                Cancel
              </ActionBtn>
              <ActionBtn onClick={handleDelete} variant="danger" disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </ActionBtn>
            </div>
          </div>
        ) : (
          <ActionBtn onClick={() => setConfirmDelete(true)} variant="danger">
            Delete IdeaFlow
          </ActionBtn>
        )}
      </div>
    </div>
  )
}
