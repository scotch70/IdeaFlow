'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function InviteMembers() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [joinUrl, setJoinUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleGenerateInvite() {
    if (!name.trim()) {
      setError('Name is required')
      setSuccess('')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setJoinUrl('')
    setCopied(false)

    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
        }),
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create invite')
      }

      setJoinUrl(data?.joinUrl || '')

      if (email.trim()) {
        setSuccess(`Invite sent to ${email.trim()}`)
      } else {
        setSuccess('Invite link created')
      }

      setName('')
      setEmail('')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${joinUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
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
          Invite team members
        </p>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--ink)',
          }}
        >
          Generate an invite link
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input
          className="input"
          placeholder="Employee name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerateInvite()}
        />

        <input
          className="input"
          placeholder="Email address (optional)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerateInvite()}
        />
      </div>

      <button
        onClick={handleGenerateInvite}
        disabled={loading}
        className="btn-primary"
        style={{ alignSelf: 'flex-start' }}
      >
        {loading ? 'Creating…' : 'Generate invite'}
      </button>

      {error && (
        <p style={{ fontSize: '0.8rem', color: '#dc2626' }}>
          {error}
        </p>
      )}

      {success && (
        <p
          style={{
            fontSize: '0.8rem',
            color: '#15803d',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.18)',
            borderRadius: '0.75rem',
            padding: '0.65rem 0.8rem',
          }}
        >
          {success}
        </p>
      )}

      {joinUrl && (
        <div
          style={{
            borderRadius: '0.75rem',
            border: '1px solid var(--tint-border)',
            background: 'var(--tint-bg)',
            padding: '0.75rem 0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--sky-zenith)',
                marginBottom: '0.2rem',
              }}
            >
              Invite link ready
            </p>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'var(--ink-mid)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {joinUrl}
            </p>
          </div>

          <button
            onClick={handleCopy}
            style={{
              flexShrink: 0,
              borderRadius: '0.5rem',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: '1px solid var(--border-mid)',
              background: copied ? 'rgba(16,185,129,0.10)' : 'var(--surface)',
              color: copied ? '#059669' : 'var(--ink-mid)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}