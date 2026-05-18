'use client'

import { useState } from 'react'
import React from 'react'

interface UpgradeButtonProps {
  /** Which plan to check out. Required. */
  plan: 'standard' | 'pro'
  /** Override button styles (merged with the default style) */
  style?: React.CSSProperties
  /** Override button label */
  label?: string
}

export default function UpgradeButton({ plan, style: styleProp, label }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    try {
      setLoading(true)

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
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

  const defaultStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    color: '#fff',
    padding: '0.5rem 0.9rem',
    borderRadius: '0.6rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: loading ? 'default' : 'pointer',
    border: 'none',
    opacity: loading ? 0.7 : 1,
    letterSpacing: '0.01em',
    boxShadow: loading ? 'none' : '0 2px 10px rgba(240,104,0,0.25)',
    transition: 'opacity 0.15s',
  }

  const defaultLabel = plan === 'pro' ? 'Upgrade to Pro' : 'Upgrade to Standard'

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      style={{ ...defaultStyle, ...styleProp }}
    >
      {loading ? 'Redirecting…' : (label ?? defaultLabel)}
    </button>
  )
}
