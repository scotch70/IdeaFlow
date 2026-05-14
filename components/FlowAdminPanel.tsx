'use client'

/**
 * FlowAdminPanel — minimal, premium, Linear-style
 *
 * No outer border. Sections separated by hairlines.
 * Member picker logic inlined (FlowMemberPicker removed as dep).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

// ── Utilities ─────────────────────────────────────────────────────────────────

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}

function fromDatetimeLocal(v: string): string | null {
  return v ? new Date(v).toISOString() : null
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  const p = name.trim().split(/\s+/)
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SECTION_LABEL: React.CSSProperties = {
  fontSize: '0.675rem',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: '#94a3b8',
  marginBottom: '0.875rem',
}

const HAIRLINE: React.CSSProperties = {
  borderTop: '1px solid rgba(0,0,0,0.06)',
  marginTop: '1.75rem',
  paddingTop: '1.75rem',
}

function TextBtn({
  children, onClick, disabled, color = '#64748b',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        fontSize: '0.8rem',
        fontWeight: 500,
        color,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.45 : 1,
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

  // Settings
  const [name,     setName]     = useState(initialName)
  const [prompt,   setPrompt]   = useState(initialPrompt ?? '')
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(initialStartsAt))
  const [endsAt,   setEndsAt]   = useState(toDatetimeLocal(initialEndsAt))
  const [saving,   setSaving]   = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveDone,  setSaveDone]  = useState(false)

  // Status
  const [currentStatus,   setCurrentStatus]   = useState<RoundStatus>(initialStatus)
  const [currentOverride, setCurrentOverride] = useState<'open' | 'closed' | null>(initialManualOverride)
  const [statusSaving,    setStatusSaving]    = useState(false)

  // Members (inlined from FlowMemberPicker)
  const [assigned,       setAssigned]       = useState<Set<string>>(new Set(assignedUserIds))
  const [memberLoading,  setMemberLoading]  = useState<string | null>(null)
  const [memberError,    setMemberError]    = useState('')

  // Email invite
  const [inviteName,         setInviteName]         = useState('')
  const [inviteEmail,        setInviteEmail]         = useState('')
  const [emailInviteLoading, setEmailInviteLoading] = useState(false)
  const [emailInviteError,   setEmailInviteError]   = useState('')
  const [emailInviteSuccess, setEmailInviteSuccess] = useState('')
  const [flowInvites,        setFlowInvites]        = useState<FlowInvite[]>(initialFlowInvites)
  const [revokingId,         setRevokingId]         = useState<string | null>(null)
  const [copiedInvId,        setCopiedInvId]        = useState<string | null>(null)

  // Reusable join link
  const [inviteCode,    setInviteCode]    = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError,   setInviteError]   = useState('')
  const [copied,        setCopied]        = useState(false)

  // Delete
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [deleteError,   setDeleteError]   = useState('')

  // ── API helpers ───────────────────────────────────────────────────────────

  async function patchRound(body: Record<string, unknown>, { silent = false } = {}) {
    if (!silent) setSaving(true)
    setSaveError('')
    setSaveDone(false)
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
      if (!silent) setSaveDone(true)
      router.refresh()
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      if (!silent) setSaving(false)
    }
  }

  async function handleSave() {
    await patchRound({
      name:      name.trim() || 'IdeaFlow',
      prompt:    prompt.trim() || null,
      starts_at: fromDatetimeLocal(startsAt),
      ends_at:   fromDatetimeLocal(endsAt),
    })
  }

  async function handleStatusChange(status: RoundStatus) {
    setStatusSaving(true)
    try {
      const res = await fetch(`/api/rounds/${roundId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed')
      setCurrentStatus(status)
      router.refresh()
    } finally {
      setStatusSaving(false)
    }
  }

  async function handleOverride(action: 'open' | 'closed' | null) {
    setStatusSaving(true)
    try {
      const res = await fetch(`/api/rounds/${roundId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ manual_override: action }),
      })
      if (!res.ok) throw new Error('Failed')
      setCurrentOverride(action)
      router.refresh()
    } finally {
      setStatusSaving(false)
    }
  }

  async function toggleMember(userId: string) {
    if (memberLoading) return
    setMemberLoading(userId)
    setMemberError('')
    const isAssigned = assigned.has(userId)
    try {
      const res = await fetch(`/api/rounds/${roundId}/members`, {
        method:  isAssigned ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed')
      }
      setAssigned(prev => {
        const next = new Set(prev)
        isAssigned ? next.delete(userId) : next.add(userId)
        return next
      })
    } catch (err: unknown) {
      setMemberError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setMemberLoading(null)
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
        body:    JSON.stringify({ name: inviteName.trim(), email: inviteEmail.trim(), idea_round_id: roundId }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Failed to send invite')
      setEmailInviteSuccess(`Invite sent to ${inviteEmail.trim()}`)
      setInviteName('')
      setInviteEmail('')
      if (d.invite) setFlowInvites(prev => [d.invite, ...prev])
      router.refresh()
    } catch (err: unknown) {
      setEmailInviteError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setEmailInviteLoading(false)
    }
  }

  async function handleRevokeInvite(invId: string) {
    setRevokingId(invId)
    try {
      const res = await fetch(`/api/invites/${invId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setFlowInvites(prev => prev.filter(inv => inv.id !== invId))
      router.refresh()
    } finally {
      setRevokingId(null)
    }
  }

  function handleCopyInvite(code: string, id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/join?code=${code}`).then(() => {
      setCopiedInvId(id)
      setTimeout(() => setCopiedInvId(null), 2000)
    })
  }

  async function handleGenerateLink() {
    setInviteLoading(true)
    setInviteError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}/invite`, { method: 'POST' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? 'Failed')
      setInviteCode(d.code)
      setCopied(false)
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setInviteLoading(false)
    }
  }

  function handleCopyLink() {
    if (!inviteCode) return
    navigator.clipboard.writeText(`${window.location.origin}/flow-invite/${inviteCode}`).then(() => {
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
      router.push('/dashboard/idea-flow')
      router.refresh()
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong')
      setDeleting(false)
    }
  }

  const isAll = assigned.size === 0

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>

      {/* ── Settings ──────────────────────────────────────────────────────── */}
      <p style={SECTION_LABEL}>Settings</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Flow name"
          maxLength={60}
          disabled={saving}
          style={{ fontSize: '0.875rem' }}
        />
        <input
          className="input"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Question shown to members (optional)"
          maxLength={120}
          disabled={saving}
          style={{ fontSize: '0.875rem' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <input
            type="datetime-local"
            className="input"
            value={startsAt}
            onChange={e => setStartsAt(e.target.value)}
            disabled={saving}
            style={{ fontSize: '0.775rem' }}
            title="Opens at"
          />
          <input
            type="datetime-local"
            className="input"
            value={endsAt}
            onChange={e => setEndsAt(e.target.value)}
            disabled={saving}
            style={{ fontSize: '0.775rem' }}
            title="Closes at"
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'inline-flex', alignItems: 'center',
            height: '2rem', padding: '0 0.875rem',
            borderRadius: '0.4rem',
            fontSize: '0.8rem', fontWeight: 600,
            background: 'var(--orange)', color: '#fff',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saveDone && !saving && (
          <span style={{ fontSize: '0.775rem', color: '#059669', fontWeight: 500 }}>✓ Saved</span>
        )}
        {saveError && (
          <span style={{ fontSize: '0.775rem', color: '#dc2626' }}>{saveError}</span>
        )}
      </div>

      {/* ── Status ────────────────────────────────────────────────────────── */}
      <div style={HAIRLINE}>
        <p style={SECTION_LABEL}>Status</p>

        {/* Segmented pill control */}
        <div style={{
          display: 'inline-flex',
          background: 'rgba(0,0,0,0.04)',
          borderRadius: '0.6rem',
          padding: '0.2rem',
          gap: '0.125rem',
          marginBottom: '0.875rem',
        }}>
          {(['draft', 'active', 'closed'] as RoundStatus[]).map(s => {
            const isSelected = currentStatus === s
            const COLORS: Record<RoundStatus, { bg: string; color: string }> = {
              draft:  { bg: 'rgba(249,115,22,0.12)',  color: '#92400e' },
              active: { bg: 'rgba(16,185,129,0.14)',  color: '#065f46' },
              closed: { bg: 'rgba(0,0,0,0.08)',       color: '#475569' },
            }
            return (
              <button
                key={s}
                type="button"
                onClick={() => !isSelected && handleStatusChange(s)}
                disabled={statusSaving}
                style={{
                  height: '1.75rem', padding: '0 0.875rem',
                  borderRadius: '0.4rem',
                  fontSize: '0.775rem', fontWeight: isSelected ? 700 : 500,
                  border: 'none',
                  background: isSelected ? (s === 'active' ? 'rgba(16,185,129,0.15)' : s === 'draft' ? 'rgba(249,115,22,0.12)' : 'rgba(0,0,0,0.08)') : 'transparent',
                  color: isSelected ? COLORS[s].color : '#64748b',
                  cursor: isSelected || statusSaving ? 'default' : 'pointer',
                  opacity: statusSaving && !isSelected ? 0.5 : 1,
                  transition: 'background 0.12s, color 0.12s',
                  textTransform: 'capitalize' as const,
                }}
              >
                {s}
              </button>
            )
          })}
        </div>

        {/* Manual override */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Override:</span>
          <TextBtn
            onClick={() => currentOverride !== 'open' && handleOverride('open')}
            disabled={statusSaving || currentOverride === 'open'}
            color={currentOverride === 'open' ? '#059669' : '#64748b'}
          >
            {currentOverride === 'open' ? '● Force open' : 'Force open'}
          </TextBtn>
          <TextBtn
            onClick={() => currentOverride !== 'closed' && handleOverride('closed')}
            disabled={statusSaving || currentOverride === 'closed'}
            color={currentOverride === 'closed' ? '#dc2626' : '#64748b'}
          >
            {currentOverride === 'closed' ? '● Force closed' : 'Force closed'}
          </TextBtn>
          {currentOverride !== null && (
            <TextBtn onClick={() => handleOverride(null)} disabled={statusSaving} color='#9ab0c8'>
              ↩ Use schedule
            </TextBtn>
          )}
        </div>
      </div>

      {/* ── Members ───────────────────────────────────────────────────────── */}
      <div style={HAIRLINE}>
        <p style={SECTION_LABEL}>Members</p>

        {/* Audience summary */}
        <p style={{ fontSize: '0.775rem', color: isAll ? '#059669' : '#0e52a8', marginBottom: '0.875rem', fontWeight: 500 }}>
          {isAll
            ? 'Open to all workspace members'
            : `${assigned.size} member${assigned.size !== 1 ? 's' : ''} assigned — restricted access`}
        </p>

        {memberError && (
          <p style={{ fontSize: '0.775rem', color: '#dc2626', marginBottom: '0.5rem' }}>{memberError}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {companyMembers.map((member, i) => {
            const isAssigned = assigned.has(member.id)
            const isLoading  = memberLoading === member.id
            const isLast     = i === companyMembers.length - 1
            return (
              <div
                key={member.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0',
                  borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.045)',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '1.875rem', height: '1.875rem', borderRadius: '50%',
                  background: isAssigned ? 'rgba(16,185,129,0.12)' : 'rgba(26,107,191,0.08)',
                  color: isAssigned ? '#059669' : '#0e52a8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.62rem', fontWeight: 700, flexShrink: 0,
                  transition: 'background 0.15s, color 0.15s',
                }}>
                  {getInitials(member.full_name)}
                </div>

                {/* Name + role */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0d1f35', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.full_name || 'Unnamed'}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                    {member.role}
                  </p>
                </div>

                {/* Text action */}
                <TextBtn
                  onClick={() => toggleMember(member.id)}
                  disabled={isLoading}
                  color={isAssigned ? '#dc2626' : '#059669'}
                >
                  {isLoading ? '…' : isAssigned ? 'Remove' : 'Add'}
                </TextBtn>
              </div>
            )
          })}

          {companyMembers.length === 0 && (
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', padding: '0.5rem 0' }}>
              No other members in this workspace yet.
            </p>
          )}
        </div>
      </div>

      {/* ── Invite & access ───────────────────────────────────────────────── */}
      <div style={HAIRLINE}>
        <p style={SECTION_LABEL}>Invite & access</p>

        {/* Inline invite form */}
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.625rem' }}>
          <input
            className="input"
            placeholder="Name"
            value={inviteName}
            onChange={e => setInviteName(e.target.value)}
            disabled={emailInviteLoading}
            onKeyDown={e => e.key === 'Enter' && handleEmailInvite()}
            style={{ flex: '0 0 30%', fontSize: '0.825rem' }}
          />
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            disabled={emailInviteLoading}
            onKeyDown={e => e.key === 'Enter' && handleEmailInvite()}
            style={{ flex: 1, fontSize: '0.825rem' }}
          />
          <button
            type="button"
            onClick={handleEmailInvite}
            disabled={emailInviteLoading}
            style={{
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center',
              height: '2.25rem', padding: '0 0.875rem',
              borderRadius: '0.4rem',
              fontSize: '0.8rem', fontWeight: 600,
              background: 'var(--orange)', color: '#fff', border: 'none',
              cursor: emailInviteLoading ? 'not-allowed' : 'pointer',
              opacity: emailInviteLoading ? 0.6 : 1,
              whiteSpace: 'nowrap' as const,
            }}
          >
            {emailInviteLoading ? '…' : 'Invite →'}
          </button>
        </div>

        {emailInviteError && (
          <p style={{ fontSize: '0.775rem', color: '#dc2626', marginBottom: '0.5rem' }}>{emailInviteError}</p>
        )}
        {emailInviteSuccess && (
          <p style={{ fontSize: '0.775rem', color: '#059669', marginBottom: '0.5rem' }}>✓ {emailInviteSuccess}</p>
        )}

        {/* Pending invites */}
        {flowInvites.length > 0 && (
          <div style={{ marginTop: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
            {flowInvites.map((inv, i) => {
              const isUsed    = !!inv.used_at
              const isExpired = !isUsed && !!inv.expires_at && new Date(inv.expires_at) < new Date()
              const statusLabel = isUsed ? 'Joined' : isExpired ? 'Expired' : 'Pending'
              const statusColor = isUsed ? '#0e52a8' : isExpired ? '#94a3b8' : '#059669'
              const isLast = i === flowInvites.length - 1
              return (
                <div key={inv.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.5rem 0',
                  borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.045)',
                  opacity: isExpired ? 0.55 : 1,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0d1f35' }}>
                      {inv.name || 'Unnamed'}
                    </span>
                    {inv.email && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.375rem' }}>
                        {inv.email}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: statusColor, flexShrink: 0 }}>
                    {statusLabel}
                  </span>
                  {!isUsed && !isExpired && (
                    <>
                      <TextBtn onClick={() => handleCopyInvite(inv.invite_code, inv.id)} color={copiedInvId === inv.id ? '#059669' : '#94a3b8'}>
                        {copiedInvId === inv.id ? '✓' : 'Copy'}
                      </TextBtn>
                      <TextBtn onClick={() => handleRevokeInvite(inv.id)} disabled={revokingId === inv.id} color="#dc2626">
                        {revokingId === inv.id ? '…' : 'Revoke'}
                      </TextBtn>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Reusable join link */}
        <div style={{ marginTop: flowInvites.length > 0 ? '1rem' : '0.25rem' }}>
          {!inviteCode ? (
            <div>
              <TextBtn onClick={handleGenerateLink} disabled={inviteLoading} color="#64748b">
                {inviteLoading ? 'Generating…' : '+ Generate join link'}
              </TextBtn>
              {inviteError && (
                <p style={{ fontSize: '0.775rem', color: '#dc2626', marginTop: '0.25rem' }}>{inviteError}</p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                flex: 1, minWidth: 0,
                fontSize: '0.775rem', color: '#64748b', fontFamily: 'monospace',
                whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {typeof window !== 'undefined' ? `${window.location.origin}/flow-invite/${inviteCode}` : `/flow-invite/${inviteCode}`}
              </span>
              <TextBtn onClick={handleCopyLink} color={copied ? '#059669' : '#64748b'}>
                {copied ? '✓ Copied' : 'Copy'}
              </TextBtn>
              <TextBtn onClick={handleGenerateLink} disabled={inviteLoading} color="#94a3b8">
                ↻
              </TextBtn>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete ────────────────────────────────────────────────────────── */}
      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        {confirmDelete ? (
          <div>
            <p style={{ fontSize: '0.825rem', color: '#7f1d1d', fontWeight: 600, marginBottom: '0.25rem' }}>
              Delete this IdeaFlow?
            </p>
            <p style={{ fontSize: '0.775rem', color: '#991b1b', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Permanently removes all ideas, likes, and comments. Cannot be undone.
            </p>
            {deleteError && (
              <p style={{ fontSize: '0.775rem', color: '#dc2626', marginBottom: '0.5rem' }}>{deleteError}</p>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <TextBtn onClick={() => { setConfirmDelete(false); setDeleteError('') }} color="#64748b">
                Cancel
              </TextBtn>
              <TextBtn onClick={handleDelete} disabled={deleting} color="#dc2626">
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </TextBtn>
            </div>
          </div>
        ) : (
          <TextBtn onClick={() => setConfirmDelete(true)} color="#94a3b8">
            Delete IdeaFlow
          </TextBtn>
        )}
      </div>

    </div>
  )
}
