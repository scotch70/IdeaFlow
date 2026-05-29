'use client'

import { useState, useEffect } from 'react'
import { DEMO_FLOWS, type DemoIdea } from './demoData'

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:           '#f8fafc',
  surface:      '#ffffff',
  ink:          '#0d1f35',
  slate:        '#64748b',
  muted:        '#9ab0c8',
  border:       'rgba(26,107,191,0.09)',
  orange:       '#f97316',
  orangeBg:     'rgba(249,115,22,0.08)',
  orangeBorder: 'rgba(249,115,22,0.18)',
}

const SIDEBAR_W = 200
const DETAIL_W  = 300
const MOBILE_BP = 768

// ── Responsive hook ──────────────────────────────────────────────────────────
function useIsMobile(breakpoint: number = MOBILE_BP) {
  // Default to false so SSR matches desktop layout; updates on mount.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    // Older Safari support
    if (mq.addEventListener) mq.addEventListener('change', update)
    else mq.addListener(update)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update)
      else mq.removeListener(update)
    }
  }, [breakpoint])
  return isMobile
}

// ── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#f97316','#10b981','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#f59e0b','#ef4444']

function Avatar({ initials, size = 26, seed = 0 }: { initials: string; size?: number; seed?: number }) {
  const color = AVATAR_COLORS[seed % AVATAR_COLORS.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: '#fff',
      flexShrink: 0, letterSpacing: '-0.01em',
    }}>
      {initials}
    </div>
  )
}

// ── Vote button ──────────────────────────────────────────────────────────────
function VoteButton({ count, voted, onVote, size = 'md' }: {
  count: number; voted: boolean; onVote: () => void; size?: 'sm' | 'md'
}) {
  const [floatKey, setFloatKey] = useState(0)
  const [showFloat, setShowFloat] = useState(false)

  function handleClick() {
    if (voted) return
    onVote()
    setShowFloat(true)
    setFloatKey(k => k + 1)
    setTimeout(() => setShowFloat(false), 900)
  }

  const h  = size === 'sm' ? '1.75rem' : '2rem'
  const fs = size === 'sm' ? '0.7rem'  : '0.76rem'

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={handleClick}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          height: h, padding: '0 0.6rem',
          background: voted ? C.orangeBg : 'transparent',
          border: `1.5px solid ${voted ? C.orange : 'rgba(26,107,191,0.14)'}`,
          borderRadius: '8px',
          cursor: voted ? 'default' : 'pointer',
          fontSize: fs, fontWeight: 700,
          color: voted ? C.orange : C.slate,
          transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        }}
      >
        <svg width={size === 'sm' ? 11 : 13} height={size === 'sm' ? 11 : 13} viewBox="0 0 24 24" fill={voted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {count}
      </button>
      {showFloat && (
        <span
          key={floatKey}
          style={{
            position: 'absolute', bottom: '100%', left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.7rem', fontWeight: 800, color: C.orange,
            pointerEvents: 'none',
            animation: 'demoFloatUp 0.9s ease forwards',
          }}
        >
          +1
        </span>
      )}
    </div>
  )
}

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS: Record<string, { bg: string; color: string; border: string; label: string; dot: string }> = {
  open:    { bg: 'rgba(26,107,191,0.06)',  color: '#1a6bbf', border: 'rgba(26,107,191,0.18)', label: 'Open',    dot: '#3b82f6' },
  planned: { bg: 'rgba(249,115,22,0.07)',  color: '#c2540a', border: 'rgba(249,115,22,0.20)', label: 'Planned', dot: '#f97316' },
  done:    { bg: 'rgba(16,185,129,0.07)',  color: '#065f46', border: 'rgba(16,185,129,0.20)', label: 'Done',    dot: '#10b981' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.open
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.28rem',
      fontSize: '0.62rem', fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: '999px', padding: '0.18rem 0.5rem', flexShrink: 0,
    }}>
      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  )
}

// ── Compact idea row ─────────────────────────────────────────────────────────
function IdeaRow({ idea, selected, onSelect, onVote, voted, isMobile = false }: {
  idea: DemoIdea; selected: boolean; onSelect: () => void;
  onVote: () => void; voted: boolean; isMobile?: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: isMobile ? '0.75rem' : '0.625rem',
        padding: isMobile ? '0.95rem 1rem' : '0.75rem 0.875rem',
        borderBottom: `1px solid ${C.border}`,
        background: selected ? 'rgba(249,115,22,0.025)' : C.surface,
        borderLeft: `2px solid ${selected ? C.orange : 'transparent'}`,
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ paddingTop: '0.1rem', flexShrink: 0 }}>
        <VoteButton count={idea.votes} voted={voted} onVote={onVote} size={isMobile ? 'md' : 'sm'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
          <p style={{ fontSize: isMobile ? '0.9rem' : '0.8rem', fontWeight: 700, color: C.ink, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {idea.title}
          </p>
          <StatusBadge status={idea.status} />
        </div>
        <p style={{
          fontSize: isMobile ? '0.8rem' : '0.71rem', color: C.slate, lineHeight: 1.45,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: isMobile ? 2 : 1, WebkitBoxOrient: 'vertical',
          marginBottom: '0.35rem',
        }}>
          {idea.body}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Avatar initials={idea.avatar} size={isMobile ? 16 : 14} seed={idea.author.charCodeAt(0)} />
          <span style={{ fontSize: isMobile ? '0.72rem' : '0.65rem', color: C.muted }}>{idea.author}</span>
          {idea.comments.length > 0 && (
            <span style={{ fontSize: isMobile ? '0.72rem' : '0.65rem', color: C.muted }}>· 💬 {idea.comments.length}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Idea detail panel ────────────────────────────────────────────────────────
function IdeaDetail({ idea, voted, onVote, onClose, isMobile = false }: {
  idea: DemoIdea; voted: boolean; onVote: () => void; onClose: () => void;
  isMobile?: boolean;
}) {
  const [comment, setComment] = useState('')
  const [localComments, setLocalComments] = useState(idea.comments)
  const [postHover, setPostHover] = useState(false)

  useEffect(() => { setLocalComments(idea.comments) }, [idea.id])

  function handlePost() {
    const text = comment.trim()
    if (!text) return
    setLocalComments(prev => [...prev, { id: `local-${Date.now()}`, author: 'You', avatar: 'YO', text, ago: 'just now' }])
    setComment('')
  }

  return (
    <div style={{
      width: isMobile ? '100%' : DETAIL_W, flexShrink: 0,
      borderLeft: isMobile ? 'none' : `1px solid ${C.border}`,
      background: C.surface,
      display: 'flex', flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: isMobile ? '0.875rem 1rem' : '0.875rem 1rem 0.625rem',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
        flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <StatusBadge status={idea.status} />
          </div>
          <h2 style={{ fontSize: isMobile ? '1.05rem' : '0.9rem', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            {idea.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: isMobile ? 'rgba(15,23,42,0.04)' : 'none',
            border: 'none', cursor: 'pointer', color: isMobile ? C.slate : C.muted,
            fontSize: isMobile ? '1.4rem' : '1.1rem',
            padding: 0, lineHeight: 1, flexShrink: 0,
            width: isMobile ? '2.25rem' : 'auto',
            height: isMobile ? '2.25rem' : 'auto',
            borderRadius: '999px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem 1rem' }}>
        {/* Vote */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
          <VoteButton count={idea.votes} voted={voted} onVote={onVote} />
          {voted && <span style={{ fontSize: '0.7rem', color: C.orange, fontWeight: 600 }}>Liked</span>}
        </div>

        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <Avatar initials={idea.avatar} size={20} seed={idea.author.charCodeAt(0)} />
          <span style={{ fontSize: '0.7rem', color: C.slate }}>{idea.author} · {idea.ago}</span>
        </div>

        {/* Body text */}
        <p style={{
          fontSize: isMobile ? '0.92rem' : '0.8rem', color: C.slate, lineHeight: 1.6,
          marginBottom: '1.25rem', paddingBottom: '1rem',
          borderBottom: `1px solid ${C.border}`,
        }}>
          {idea.body}
        </p>

        {/* Comments header */}
        <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: '0.625rem' }}>
          Comments · {localComments.length}
        </p>

        {localComments.length === 0 && (
          <p style={{ fontSize: '0.76rem', color: C.muted, fontStyle: 'italic', marginBottom: '0.875rem' }}>
            No comments yet.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {localComments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '0.4rem' }}>
              <Avatar initials={c.avatar} size={18} seed={c.author.charCodeAt(0)} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'baseline', marginBottom: '0.1rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.ink }}>{c.author}</span>
                  <span style={{ fontSize: '0.62rem', color: C.muted }}>{c.ago}</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: C.slate, lineHeight: 1.45 }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comment input */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-end' }}>
          <Avatar initials="YO" size={20} seed={89} />
          <div style={{ flex: 1 }}>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost() }}
              placeholder="Add a comment…"
              rows={isMobile ? 3 : 2}
              style={{
                width: '100%', resize: 'none', boxSizing: 'border-box',
                // 16px on mobile prevents iOS auto-zoom on focus.
                fontSize: isMobile ? '16px' : '0.76rem',
                color: C.ink, lineHeight: 1.5,
                background: '#f8fafc', border: `1px solid ${C.border}`,
                borderRadius: '7px', padding: isMobile ? '0.6rem 0.7rem' : '0.45rem 0.55rem',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handlePost}
              onMouseEnter={() => setPostHover(true)}
              onMouseLeave={() => setPostHover(false)}
              style={{
                marginTop: '0.4rem', fontSize: isMobile ? '0.85rem' : '0.7rem', fontWeight: 600,
                background: postHover ? '#ea580c' : C.orange,
                color: '#fff', border: 'none', borderRadius: '7px',
                padding: isMobile ? '0.55rem 0.95rem' : '0.3rem 0.65rem',
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Flow status pill (shared) ────────────────────────────────────────────────
function FlowStatusPill({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) {
  const active = status === 'active'
  const fs = size === 'sm' ? '0.55rem' : '0.58rem'
  return (
    <span style={{
      fontSize: fs, fontWeight: 700,
      background: active ? 'rgba(16,185,129,0.07)' : 'rgba(249,115,22,0.06)',
      color:      active ? '#065f46'              : '#92400e',
      border:     `1px solid ${active ? 'rgba(16,185,129,0.2)' : 'rgba(249,115,22,0.16)'}`,
      borderRadius: '999px', padding: '0.15rem 0.45rem',
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      flexShrink: 0,
    }}>
      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: active ? '#10b981' : '#f97316' }} />
      {active ? 'Active' : 'Draft'}
    </span>
  )
}

// ── Workspace badge (shared) ─────────────────────────────────────────────────
function WorkspaceBadge({ size = 22 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '5px',
      background: 'linear-gradient(135deg, #f97316, #ea580c)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, fontWeight: 800, color: '#fff', flexShrink: 0,
    }}>M</div>
  )
}

// ── Main workspace ────────────────────────────────────────────────────────────
export default function DemoWorkspace() {
  const isMobile = useIsMobile()

  const [flows]                             = useState(DEMO_FLOWS)
  const [activeFlowId, setActiveFlowId]     = useState(flows[0].id)
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(flows[0].ideas[0].id)
  const [votedIds, setVotedIds]             = useState<Set<string>>(new Set())
  const [localVotes, setLocalVotes]         = useState<Record<string, number>>({})
  const [ctaHover, setCtaHover]             = useState(false)

  // Mobile-only UI state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sheetOpen,  setSheetOpen]  = useState(false)

  // When switching from desktop → mobile, don't auto-show the detail sheet.
  useEffect(() => {
    if (!isMobile) setSheetOpen(false)
  }, [isMobile])

  // Lock body scroll while the mobile drawer or sheet is open.
  useEffect(() => {
    if (!isMobile) return
    const open = drawerOpen || sheetOpen
    const prev = document.body.style.overflow
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isMobile, drawerOpen, sheetOpen])

  const activeFlow   = flows.find(f => f.id === activeFlowId)!
  const selectedIdea = activeFlow.ideas.find(i => i.id === selectedIdeaId) ?? null

  function getVotes(idea: DemoIdea) {
    return localVotes[idea.id] ?? idea.votes
  }

  function handleVote(id: string) {
    if (votedIds.has(id)) return
    setVotedIds(prev => new Set(prev).add(id))
    setLocalVotes(prev => ({
      ...prev,
      [id]: (prev[id] ?? (activeFlow.ideas.find(i => i.id === id)?.votes ?? 0)) + 1,
    }))
  }

  function handleSelectIdea(id: string) {
    setSelectedIdeaId(id)
    if (isMobile) setSheetOpen(true)
  }

  function handleCloseDetail() {
    if (isMobile) setSheetOpen(false)
    else          setSelectedIdeaId(null)
  }

  function handlePickFlow(id: string) {
    const flow = flows.find(f => f.id === id)
    setActiveFlowId(id)
    setSelectedIdeaId(flow?.ideas[0]?.id ?? null)
    if (isMobile) {
      setDrawerOpen(false)
      setSheetOpen(false)
    }
  }

  // Show top 4 ideas by vote count (desktop); show all on mobile for a richer feed.
  const displayIdeas = activeFlow.ideas
    .map(idea => ({ ...idea, votes: getVotes(idea) }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, isMobile ? activeFlow.ideas.length : 4)

  const selectedIdeaWithVotes = selectedIdea
    ? { ...selectedIdea, votes: getVotes(selectedIdea) }
    : null

  // Shared <style> block — keyframes + hover styles for both layouts.
  const styleBlock = (
    <style>{`
      @keyframes demoFloatUp {
        0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-18px); }
      }
      @keyframes demoSheetUp {
        0%   { opacity: 0; transform: translateY(100%); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes demoDrawerIn {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(0); }
      }
      @keyframes demoFadeIn {
        0%   { opacity: 0; }
        100% { opacity: 1; }
      }
      .demo-flow-btn:hover { background: rgba(249,115,22,0.04) !important; }
    `}</style>
  )

  // ════════════════════════════════════════════════════════════════════════════
  //   MOBILE LAYOUT
  // ════════════════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <>
        {styleBlock}

        <div style={{
          minHeight: 'calc(100vh - 3.625rem - 2.4rem)',
          background: C.bg,
          fontFamily: 'inherit',
          paddingBottom: '4.5rem', // room for sticky CTA
        }}>

          {/* ── Sticky workspace + flow switcher ──────────────────────────── */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 5,
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            padding: '0.65rem 0.9rem',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
          }}>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open flows"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                background: 'rgba(15,23,42,0.04)',
                border: 'none', borderRadius: '8px',
                padding: '0.4rem 0.55rem',
                cursor: 'pointer', fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              <WorkspaceBadge size={20} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.slate}
                strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                flex: 1, minWidth: 0, textAlign: 'left',
                background: 'transparent', border: 'none', padding: 0,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <p style={{ fontSize: '0.6rem', color: C.muted, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Meridian Labs
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <p style={{
                  fontSize: '0.95rem', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
                }}>
                  {activeFlow.name}
                </p>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted}
                  strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>
          </div>

          {/* ── Flow meta (prompt + count) ────────────────────────────────── */}
          <div style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            padding: '0.7rem 0.95rem 0.85rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <FlowStatusPill status={activeFlow.status} />
              <span style={{ fontSize: '0.7rem', color: C.muted }}>
                · {activeFlow.ideas.length} ideas
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: C.slate, lineHeight: 1.45 }}>
              {activeFlow.prompt}
            </p>
          </div>

          {/* ── Idea list ─────────────────────────────────────────────────── */}
          <div>
            {displayIdeas.map(idea => (
              <IdeaRow
                key={idea.id}
                idea={idea}
                selected={false /* no selection highlight on mobile — tap opens sheet */}
                onSelect={() => handleSelectIdea(idea.id)}
                onVote={() => handleVote(idea.id)}
                voted={votedIds.has(idea.id)}
                isMobile
              />
            ))}
            {displayIdeas.length === 0 && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: C.muted }}>No ideas in this flow yet.</p>
              </div>
            )}
          </div>

          {/* ── Sticky bottom CTA ─────────────────────────────────────────── */}
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 4,
            background: C.surface,
            borderTop: `1px solid ${C.border}`,
            padding: '0.6rem 0.95rem calc(0.6rem + env(safe-area-inset-bottom))',
          }}>
            <a
              href="/auth?mode=signup"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', padding: '0.7rem',
                background: '#1f2330', color: '#fff',
                borderRadius: '9px',
                fontSize: '0.85rem', fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Create your workspace →
            </a>
          </div>
        </div>

        {/* ── Flow drawer (slide-in from left) ───────────────────────────── */}
        {drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 50,
                background: 'rgba(6,14,38,0.45)',
                animation: 'demoFadeIn 0.18s ease',
              }}
            />
            <aside style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 51,
              width: 'min(86vw, 320px)',
              background: C.surface,
              display: 'flex', flexDirection: 'column',
              animation: 'demoDrawerIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '4px 0 30px rgba(6,14,38,0.18)',
            }}>
              {/* Drawer header */}
              <div style={{
                padding: '0.9rem 1rem',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: '0.55rem',
              }}>
                <WorkspaceBadge size={26} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>
                    Meridian Labs
                  </p>
                  <p style={{ fontSize: '0.65rem', color: C.muted }}>Demo workspace</p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close"
                  style={{
                    background: 'rgba(15,23,42,0.04)', border: 'none',
                    width: '2.25rem', height: '2.25rem', borderRadius: '999px',
                    cursor: 'pointer', color: C.slate, fontSize: '1.4rem',
                    lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >×</button>
              </div>

              {/* Flow list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem' }}>
                <p style={{
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: C.muted,
                  padding: '0.4rem 0.5rem', marginBottom: '0.25rem',
                }}>IdeaFlows</p>

                {flows.map(flow => {
                  const active = flow.id === activeFlowId
                  return (
                    <button
                      key={flow.id}
                      className="demo-flow-btn"
                      onClick={() => handlePickFlow(flow.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        width: '100%', textAlign: 'left',
                        padding: '0.7rem 0.55rem',
                        paddingLeft: active ? 'calc(0.55rem - 2px)' : '0.55rem',
                        borderRadius: '8px', border: 'none',
                        background: active ? C.orangeBg : 'transparent',
                        color: active ? '#c2540a' : C.slate,
                        borderLeft: `2px solid ${active ? C.orange : 'transparent'}`,
                        cursor: 'pointer', fontFamily: 'inherit',
                        marginBottom: '0.15rem',
                      }}
                    >
                      <span style={{
                        flex: 1, fontSize: '0.9rem',
                        fontWeight: active ? 700 : 500,
                        letterSpacing: '-0.01em',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {flow.name}
                      </span>
                      {flow.status === 'draft' && (
                        <span style={{
                          fontSize: '0.58rem', fontWeight: 700,
                          background: 'rgba(249,115,22,0.1)', color: '#c2540a',
                          borderRadius: '999px', padding: '0.12rem 0.4rem', flexShrink: 0,
                        }}>Draft</span>
                      )}
                      {active && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.orange, flexShrink: 0 }} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Drawer CTA */}
              <div style={{ padding: '0.75rem', borderTop: `1px solid ${C.border}` }}>
                <a
                  href="/auth?mode=signup"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%', padding: '0.65rem',
                    background: '#1f2330', color: '#fff', borderRadius: '8px',
                    fontSize: '0.8rem', fontWeight: 700,
                    textDecoration: 'none', textAlign: 'center',
                  }}
                >
                  Create your workspace →
                </a>
                <p style={{ fontSize: '0.65rem', color: C.muted, textAlign: 'center', marginTop: '0.4rem' }}>
                  Free · no credit card
                </p>
              </div>
            </aside>
          </>
        )}

        {/* ── Idea detail bottom sheet ──────────────────────────────────── */}
        {sheetOpen && selectedIdeaWithVotes && (
          <>
            <div
              onClick={handleCloseDetail}
              style={{
                position: 'fixed', inset: 0, zIndex: 60,
                background: 'rgba(6,14,38,0.45)',
                animation: 'demoFadeIn 0.2s ease',
              }}
            />
            <div style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 61,
              height: '92vh',
              background: C.surface,
              borderTopLeftRadius: '14px',
              borderTopRightRadius: '14px',
              display: 'flex', flexDirection: 'column',
              animation: 'demoSheetUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 -8px 32px rgba(6,14,38,0.18)',
              overflow: 'hidden',
            }}>
              {/* Drag handle */}
              <div style={{
                padding: '0.5rem 0 0.25rem',
                display: 'flex', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{
                  width: '36px', height: '4px',
                  background: 'rgba(15,23,42,0.18)',
                  borderRadius: '999px',
                }} />
              </div>
              <IdeaDetail
                key={selectedIdeaWithVotes.id}
                idea={selectedIdeaWithVotes}
                voted={votedIds.has(selectedIdeaWithVotes.id)}
                onVote={() => handleVote(selectedIdeaWithVotes.id)}
                onClose={handleCloseDetail}
                isMobile
              />
            </div>
          </>
        )}
      </>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  //   DESKTOP LAYOUT
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      {styleBlock}

      {/* ── Constrained container — width + padding matched to DemoSession
            so the two /demo tabs render at identical visual size. ────────── */}
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: 'clamp(0.75rem, 1.5vw, 1.4rem) clamp(0.75rem, 2vw, 1.75rem) 2.25rem',
          fontFamily: 'inherit',
        }}
      >

        {/* ── Framed workspace app — height + framing matched to DemoSession ── */}
        <div style={{
          display: 'flex',
          height: 'calc(100vh - 3.625rem - 2.4rem - 3.5rem - 1.4rem)',
          minHeight: 620,
          borderRadius: '1rem',
          border: '1px solid rgba(15,23,42,0.10)',
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 12px 48px rgba(6,14,38,0.10), 0 1px 4px rgba(6,14,38,0.05)',
        }}>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside style={{
            width: SIDEBAR_W, flexShrink: 0,
            background: C.surface,
            borderRight: `1px solid ${C.border}`,
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}>
            {/* Workspace header */}
            <div style={{ padding: '0.875rem 0.75rem 0.5rem', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
                <WorkspaceBadge size={22} />
                <p style={{ fontSize: '0.775rem', fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>Meridian Labs</p>
              </div>
              <p style={{ fontSize: '0.6rem', color: C.muted, paddingLeft: '1.875rem' }}>Demo workspace</p>
            </div>

            {/* Flow nav */}
            <div style={{ padding: '0.5rem 0.5rem', flex: 1 }}>
              <p style={{
                fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: C.muted,
                padding: '0.25rem 0.375rem', marginBottom: '0.2rem',
              }}>IdeaFlows</p>

              {flows.map(flow => {
                const active = flow.id === activeFlowId
                return (
                  <button
                    key={flow.id}
                    className="demo-flow-btn"
                    onClick={() => handlePickFlow(flow.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      width: '100%', textAlign: 'left',
                      padding: '0.35rem 0.5rem',
                      paddingLeft: active ? 'calc(0.5rem - 2px)' : '0.5rem',
                      borderRadius: '7px', border: 'none',
                      background: active ? C.orangeBg : 'transparent',
                      color: active ? '#c2540a' : C.slate,
                      borderLeft: `2px solid ${active ? C.orange : 'transparent'}`,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'background 0.12s, color 0.12s',
                    }}
                  >
                    <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: active ? 700 : 500, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {flow.name}
                    </span>
                    {flow.status === 'draft' && (
                      <span style={{ fontSize: '0.53rem', fontWeight: 700, background: 'rgba(249,115,22,0.1)', color: '#c2540a', borderRadius: '999px', padding: '0.1rem 0.3rem', flexShrink: 0 }}>Draft</span>
                    )}
                    {active && (
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.orange, flexShrink: 0 }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* CTA */}
            <div style={{ padding: '0.75rem', borderTop: `1px solid ${C.border}` }}>
              <a
                href="/auth?mode=signup"
                onMouseEnter={() => setCtaHover(true)}
                onMouseLeave={() => setCtaHover(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', padding: '0.5rem',
                  background: ctaHover ? '#1a2844' : '#1f2330',
                  color: '#fff', borderRadius: '7px',
                  fontSize: '0.7rem', fontWeight: 700,
                  textDecoration: 'none', textAlign: 'center',
                  transition: 'background 0.15s',
                }}
              >
                Create your workspace →
              </a>
              <p style={{ fontSize: '0.58rem', color: C.muted, textAlign: 'center', marginTop: '0.35rem' }}>
                Free · no credit card
              </p>
            </div>
          </aside>

          {/* ── Main content ────────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: C.bg }}>

            {/* Flow header */}
            <div style={{
              background: C.surface,
              borderBottom: `1px solid ${C.border}`,
              padding: '0.75rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.1rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '0.925rem', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>
                    {activeFlow.name}
                  </h1>
                  <FlowStatusPill status={activeFlow.status} />
                </div>
                <p style={{ fontSize: '0.72rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                  {activeFlow.prompt}
                </p>
              </div>
              <p style={{ fontSize: '0.7rem', color: C.muted, flexShrink: 0 }}>
                {activeFlow.ideas.length} ideas
              </p>
            </div>

            {/* Ideas list + optional detail */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

              {/* Idea list */}
              <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
                {displayIdeas.map(idea => (
                  <IdeaRow
                    key={idea.id}
                    idea={idea}
                    selected={selectedIdeaId === idea.id}
                    onSelect={() => handleSelectIdea(idea.id)}
                    onVote={() => handleVote(idea.id)}
                    voted={votedIds.has(idea.id)}
                  />
                ))}

                {/* "More ideas" hint if there are more than 4 */}
                {activeFlow.ideas.length > 4 && (
                  <div style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', color: C.muted }}>
                      + {activeFlow.ideas.length - 4} more ideas in this flow
                    </p>
                  </div>
                )}
              </div>

              {/* Detail panel */}
              {selectedIdeaWithVotes && (
                <IdeaDetail
                  key={selectedIdeaWithVotes.id}
                  idea={selectedIdeaWithVotes}
                  voted={votedIds.has(selectedIdeaWithVotes.id)}
                  onVote={() => handleVote(selectedIdeaWithVotes.id)}
                  onClose={handleCloseDetail}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
