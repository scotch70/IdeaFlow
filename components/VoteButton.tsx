'use client'

/**
 * VoteButton
 *
 * Shared upvote button used across the real dashboard (IdeaCard,
 * FlowWorkspaceClient) and the demo workspace.
 *
 * Renders as: [ ▲  {count} ]
 *   — orange when voted, subtle blue-border when not
 *   — optional floating "+1" animation on vote
 *
 * The parent owns the state and async logic; this component is purely
 * presentational + fires `onVote` on click.
 */

import { useState } from 'react'

interface VoteButtonProps {
  count:      number
  voted:      boolean
  onVote:     () => void
  loading?:   boolean
  disabled?:  boolean
  size?:      'sm' | 'md'
  /** Show a floating "+1" animation when the user votes (good for demo). */
  animated?:  boolean
}

export default function VoteButton({
  count,
  voted,
  onVote,
  loading  = false,
  disabled = false,
  size     = 'md',
  animated = false,
}: VoteButtonProps) {
  const [floatKey,   setFloatKey]   = useState(0)
  const [showFloat,  setShowFloat]  = useState(false)

  const h       = size === 'sm' ? '1.75rem' : '2rem'
  const fs      = size === 'sm' ? '0.7rem'  : '0.76rem'
  const arrowFs = size === 'sm' ? '0.62rem' : '0.68rem'

  function handleClick() {
    if (loading || disabled) return
    onVote()
    if (animated && !voted) {
      setShowFloat(true)
      setFloatKey(k => k + 1)
      setTimeout(() => setShowFloat(false), 900)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        title={voted ? 'Remove vote' : 'Vote for this idea'}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          height: h, padding: '0 0.6rem',
          background: voted ? 'rgba(249,115,22,0.08)' : 'transparent',
          border: `1.5px solid ${voted ? '#f97316' : 'rgba(26,107,191,0.14)'}`,
          borderRadius: '8px',
          cursor: (loading || disabled) ? 'default' : 'pointer',
          fontSize: fs, fontWeight: 700,
          color: voted ? '#f97316' : '#64748b',
          transition: 'background 0.15s, border-color 0.15s, color 0.15s',
          fontFamily: 'inherit',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <span style={{ fontSize: arrowFs, lineHeight: 1 }}>▲</span>
        {count}
      </button>

      {/* Floating "+1" — only shown when animated=true */}
      {animated && showFloat && (
        <span
          key={floatKey}
          className="float-up-vote"
          style={{
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.7rem', fontWeight: 800, color: '#f97316',
            pointerEvents: 'none',
          }}
        >
          +1
        </span>
      )}
    </div>
  )
}
