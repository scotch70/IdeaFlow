'use client'

/**
 * DemoSwitcher — top-level switch on /demo between the new Brainstorm
 * Sessions showcase (default) and the legacy IdeaFlow workspace demo.
 *
 * Sessions is positioned first because it's the headline Pro feature; the
 * IdeaFlow demo stays one click away for users curious about the rest of
 * the product.
 */

import { useState } from 'react'
import DemoStarbursting from './DemoStarbursting'
import DemoWorkspace from './DemoWorkspace'

type Tab = 'session' | 'ideaflow'

export default function DemoSwitcher() {
  // IdeaFlow remains the core product, so the workspace demo is the default
  // tab. The Guided Thinking Session is the premium layer one click away.
  const [tab, setTab] = useState<Tab>('ideaflow')

  return (
    <>
      <div
        style={{
          background: '#fbfaf7',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '0.55rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.45rem',
        }}
      >
        <TabButton active={tab === 'ideaflow'} onClick={() => setTab('ideaflow')}>
          IdeaFlow Workspace
        </TabButton>
        <TabButton
          active={tab === 'session'}
          onClick={() => setTab('session')}
          chip="Pro"
        >
          ✦ Guided Thinking Session
        </TabButton>
      </div>

      {tab === 'session' ? <DemoStarbursting /> : <DemoWorkspace />}
    </>
  )
}

function TabButton({
  active, onClick, children, chip,
}: {
  active:   boolean
  onClick:  () => void
  children: React.ReactNode
  chip?:    string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        fontSize: '0.78rem', fontWeight: 700,
        padding: '0.42rem 0.9rem',
        borderRadius: '999px',
        background: active ? '#0d1f35' : 'transparent',
        color: active ? '#fff' : '#5d667a',
        border: active ? '1px solid #0d1f35' : '1px solid transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.12s, color 0.12s, border-color 0.12s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(15,23,42,0.05)'; e.currentTarget.style.color = '#0d1f35' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent';        e.currentTarget.style.color = '#5d667a' } }}
    >
      {children}
      {chip && (
        <span
          style={{
            fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: active ? '#fdba74' : '#c2540a',
            background: active ? 'rgba(249,115,22,0.18)' : 'rgba(249,115,22,0.10)',
            border: `1px solid ${active ? 'rgba(249,115,22,0.35)' : 'rgba(249,115,22,0.22)'}`,
            borderRadius: '999px',
            padding: '0.1rem 0.42rem',
          }}
        >
          {chip}
        </span>
      )}
    </button>
  )
}
