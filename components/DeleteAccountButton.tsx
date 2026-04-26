'use client'

/**
 * DeleteAccountButton
 *
 * Renders a "Delete my account" button that shows an inline confirmation
 * card before calling DELETE /api/account. On success, signs the user out
 * client-side and redirects to /auth.
 *
 * Uses inline confirmation (no browser confirm()) to stay consistent with
 * the rest of the app's UI conventions.
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Step = 'idle' | 'confirming' | 'deleting' | 'error'

export default function DeleteAccountButton() {
  const [step, setStep] = useState<Step>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setStep('deleting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong')
        setStep('error')
        return
      }
      // Auth user is gone — sign out client-side and redirect
      await supabase.auth.signOut()
      router.push('/auth')
    } catch {
      setErrorMsg('Network error — please try again.')
      setStep('error')
    }
  }

  if (step === 'idle') {
    return (
      <button
        type="button"
        onClick={() => setStep('confirming')}
        style={{
          fontSize: '0.825rem',
          fontWeight: 600,
          color: '#dc2626',
          background: 'rgba(220,38,38,0.07)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Delete account
      </button>
    )
  }

  if (step === 'confirming') {
    return (
      <div
        style={{
          borderRadius: '0.875rem',
          border: '1px solid rgba(220,38,38,0.2)',
          background: 'rgba(254,242,242,0.8)',
          padding: '1rem',
          maxWidth: '22rem',
          flexShrink: 0,
        }}
      >
        <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.35rem' }}>
          Are you sure?
        </p>
        <p style={{ fontSize: '0.775rem', color: '#b91c1c', lineHeight: 1.5, marginBottom: '0.875rem' }}>
          This will permanently delete your account. Your ideas stay in the workspace but will show as &ldquo;Deleted user&rdquo;. You cannot undo this.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleDelete}
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#fff',
              background: '#dc2626',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
            }}
          >
            Yes, delete my account
          </button>
          <button
            type="button"
            onClick={() => setStep('idle')}
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#6b7280',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.5rem 0.875rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (step === 'deleting') {
    return (
      <p style={{ fontSize: '0.825rem', color: '#9ab0c8', fontStyle: 'italic' }}>
        Deleting account…
      </p>
    )
  }

  // error
  return (
    <div style={{ maxWidth: '22rem', flexShrink: 0 }}>
      <p
        style={{
          borderRadius: '0.625rem',
          border: '1px solid rgba(220,38,38,0.15)',
          background: 'rgba(220,38,38,0.05)',
          padding: '0.5rem 0.75rem',
          fontSize: '0.825rem',
          color: '#dc2626',
          marginBottom: '0.5rem',
        }}
      >
        {errorMsg}
      </p>
      <button
        type="button"
        onClick={() => setStep('idle')}
        style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#6b7280',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        ← Go back
      </button>
    </div>
  )
}
