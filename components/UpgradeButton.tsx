'use client'

import { useState } from 'react'

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    try {
      setLoading(true)

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to start checkout')
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned')
      }

      window.location.href = data.url
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      style={{
        background: '#111827',
        color: '#fff',
        padding: '0.5rem 0.9rem',
        borderRadius: '0.6rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: loading ? 'default' : 'pointer',
        border: 'none',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? 'Redirecting…' : 'Upgrade to Pro'}
    </button>
  )
}