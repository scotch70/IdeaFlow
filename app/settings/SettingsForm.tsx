'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import InnerPageHeader from '@/components/InnerPageHeader'
import PageContainer from '@/components/PageContainer'
import DeleteAccountButton from '@/components/DeleteAccountButton'
import UpgradeButton from '@/components/UpgradeButton'

interface Props {
  userId: string
  email: string
  initialFirstName: string
  initialLastName: string
  initialJobFunction: string
  initialAvatarUrl: string
  role: string
  companyPlan: string
}

function Initials({ first, last, size = 72 }: { first: string; last: string; size?: number }) {
  const a = (first[0] ?? '').toUpperCase()
  const b = (last[0] ?? first[1] ?? '').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 800, color: '#fff',
      letterSpacing: '-0.02em', userSelect: 'none', flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {a}{b}
    </div>
  )
}

export default function SettingsForm({
  userId, email,
  initialFirstName, initialLastName, initialJobFunction, initialAvatarUrl, role,
  companyPlan,
}: Props) {
  const [firstName, setFirstName]       = useState(initialFirstName)
  const [lastName, setLastName]         = useState(initialLastName)
  const [jobFunction, setJobFunction]   = useState(initialJobFunction)
  const [avatarUrl, setAvatarUrl]       = useState(initialAvatarUrl)
  const [avatarPreview, setAvatarPreview] = useState(initialAvatarUrl)
  const [pendingFile, setPendingFile]   = useState<File | null>(null)
  const [saving, setSaving]             = useState(false)
  const [toast, setToast]               = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router  = useRouter()
  const supabase = createClient()

  function showToast(type: 'ok' | 'err', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      let finalAvatarUrl = avatarUrl

      // Upload new avatar if one was selected
      if (pendingFile) {
        const ext  = pendingFile.name.split('.').pop() ?? 'jpg'
        const path = `${userId}/avatar.${ext}`
        const { error: upErr } = await supabase.storage
          .from('avatars')
          .upload(path, pendingFile, { upsert: true, contentType: pendingFile.type })
        if (upErr) throw new Error(upErr.message ?? 'Avatar upload failed')

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        finalAvatarUrl = `${publicUrl}?t=${Date.now()}`
        setAvatarUrl(finalAvatarUrl)
        setPendingFile(null)
      }

      const { data: updatedRows, error } = await (supabase as any)
        .from('profiles')
        .update({
          full_name:    firstName.trim(),
          last_name:    lastName.trim(),
          job_function: jobFunction.trim(),
          avatar_url:   finalAvatarUrl || null,
        })
        .eq('id', userId)
        .select('id')

      if (error) throw new Error(error.message ?? 'Database error')
      if (!updatedRows?.length) throw new Error('Profile not found or permission denied')
      showToast('ok', 'Profile saved!')
      router.refresh()
    } catch (err: unknown) {
      showToast('err', err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || email

  return (
    <main style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .settings-name-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.875rem;
          margin-bottom: 0.875rem;
        }
        @media (max-width: 480px) {
          .settings-name-grid {
            grid-template-columns: 1fr;
          }
        }
        .settings-card {
          background: #fff;
          border-radius: 1.25rem;
          border: 1px solid rgba(26,107,191,0.10);
          padding: 2rem;
          box-shadow: 0 2px 12px rgba(6,14,38,0.05);
        }
        @media (max-width: 480px) {
          .settings-card {
            padding: 1.25rem;
            border-radius: 0.875rem;
          }
        }
        .settings-save-row {
          display: flex;
          justify-content: flex-end;
        }
        @media (max-width: 480px) {
          .settings-save-row {
            justify-content: stretch;
          }
          .settings-save-row button {
            width: 100%;
          }
        }
        .settings-account-footer {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(26,107,191,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.25rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, borderRadius: '0.75rem', padding: '0.7rem 1.25rem',
          background: toast.type === 'ok' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${toast.type === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: toast.type === 'ok' ? '#065f46' : '#991b1b',
          fontSize: '0.875rem', fontWeight: 600,
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        }}>
          {toast.type === 'ok' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      {/* Top bar */}
      <InnerPageHeader
        title="Account settings"
        backHref="/dashboard"
        backLabel="Dashboard"
        size="narrow"
      />

      <PageContainer size="narrow" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>

        {/* Page heading */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.025em', marginBottom: '0.3rem' }}>
            Account settings
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#5a7fa8' }}>Manage your profile and personal details.</p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── Profile card ── */}
          <div className="settings-card">
            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '1.5rem' }}>Profile</p>

            {/* Avatar row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={displayName}
                    style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}
                  />
                ) : (
                  <Initials first={firstName} last={lastName} size={72} />
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: '1.625rem', height: '1.625rem', borderRadius: '50%',
                    background: '#0d1f35', border: '2px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Change photo"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.2rem' }}>{displayName}</p>
                <p style={{ fontSize: '0.78rem', color: '#9ab0c8', marginBottom: '0.6rem' }}>{jobFunction || 'No function set'}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {avatarPreview ? 'Change photo' : 'Upload photo'}
                </button>
                {avatarPreview && (
                  <>
                    {' · '}
                    <button
                      type="button"
                      onClick={() => { setAvatarPreview(''); setAvatarUrl(''); setPendingFile(null) }}
                      style={{ fontSize: '0.78rem', fontWeight: 600, color: '#9ab0c8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>

            {/* Name row */}
            <div className="settings-name-grid">
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5a7fa8' }}>First name</span>
                <input
                  className="input"
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Lars"
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5a7fa8' }}>Last name</span>
                <input
                  className="input"
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Neeft"
                />
              </label>
            </div>

            {/* Job function */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5a7fa8' }}>Job function</span>
              <input
                className="input"
                type="text"
                value={jobFunction}
                onChange={e => setJobFunction(e.target.value)}
                placeholder="e.g. Product Manager, Engineer, HR Lead…"
              />
            </label>
          </div>

          {/* ── Account card ── */}
          <div className="settings-card">
            <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '1.5rem' }}>Account</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#5a7fa8' }}>Email address</span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  disabled
                  style={{ opacity: 0.55, cursor: 'not-allowed' }}
                />
              </label>
              <p style={{ fontSize: '0.75rem', color: '#9ab0c8' }}>Email address cannot be changed here.</p>
            </div>

            <div className="settings-account-footer">
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d1f35', marginBottom: '0.1rem' }}>Role</p>
                <p style={{ fontSize: '0.78rem', color: '#9ab0c8', textTransform: 'capitalize' }}>{role}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                style={{ fontSize: '0.825rem', fontWeight: 600, color: '#ef4444', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Save button */}
          <div className="settings-save-row">
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ minWidth: '9rem' }}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>

        </form>

        {/* ── Plan & billing ── */}
        <div className="settings-card">
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '1.5rem' }}>
            Plan &amp; billing
          </p>

          {companyPlan === 'pro' ? (
            /* ── Pro plan state ─────────────────────────────────────── */
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0d1f35' }}>Pro</span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f97316', color: '#fff', borderRadius: '999px', padding: '2px 7px' }}>
                    Active
                  </span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {[
                    'Up to 50 workspace members',
                    'Unlimited IdeaFlows',
                    'Full analytics dashboard',
                    'PDF report export',
                    'Admin controls & roles',
                  ].map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#2c4a6e' }}>
                      <svg width="12" height="12" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, color: '#10b981' }}>
                        <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#065f46' }}>Pro plan active</span>
              </div>
            </div>
          ) : (
            /* ── Free plan state ────────────────────────────────────── */
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0d1f35', marginBottom: '0.5rem' }}>
                  Free plan
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                  {[
                    'Up to 10 workspace members',
                    'Up to 2 active IdeaFlows',
                    'Idea collection, voting & comments',
                    'Basic analytics',
                  ].map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#5a7fa8' }}>
                      <svg width="12" height="12" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, color: '#9ab0c8' }}>
                        <path d="M12.5 3.5L6 10 3 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <p style={{ fontSize: '0.775rem', color: '#9ab0c8', lineHeight: 1.5 }}>
                  Upgrade to Pro for up to 50 members, unlimited IdeaFlows, PDF exports, and full analytics.
                </p>
              </div>
              {role === 'admin' && (
                <div style={{ flexShrink: 0 }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.375rem' }}>
                    Pro — €49<span style={{ fontWeight: 400, color: '#9ab0c8' }}>/year</span>
                  </p>
                  <UpgradeButton />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Danger zone ── */}
        <div
          className="settings-card"
          style={{
            marginTop: '2rem',
            border: '1px solid rgba(220,38,38,0.15)',
          }}
        >
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#dc2626', marginBottom: '1rem' }}>
            Danger zone
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d1f35', marginBottom: '0.2rem' }}>
                Delete my account
              </p>
              <p style={{ fontSize: '0.78rem', color: '#9ab0c8', lineHeight: 1.5, maxWidth: '28rem' }}>
                Permanently removes your account and personal profile. Your ideas and comments remain in the workspace but will display as &ldquo;Deleted user&rdquo;. This cannot be undone.
              </p>
            </div>
            <DeleteAccountButton />
          </div>
        </div>

      </PageContainer>
    </main>
  )
}
