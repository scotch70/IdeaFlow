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
function IdeaRow({ idea, selected, onSelect, onVote, voted }: {
  idea: DemoIdea; selected: boolean; onSelect: () => void;
  onVote: () => void; voted: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
        padding: '0.75rem 0.875rem',
        borderBottom: `1px solid ${C.border}`,
        background: selected ? 'rgba(249,115,22,0.025)' : C.surface,
        borderLeft: `2px solid ${selected ? C.orange : 'transparent'}`,
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ paddingTop: '0.1rem', flexShrink: 0 }}>
        <VoteButton count={idea.votes} voted={voted} onVote={onVote} size="sm" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: C.ink, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {idea.title}
          </p>
          <StatusBadge status={idea.status} />
        </div>
        <p style={{
          fontSize: '0.71rem', color: C.slate, lineHeight: 1.4,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
          marginBottom: '0.3rem',
        }}>
          {idea.body}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Avatar initials={idea.avatar} size={14} seed={idea.author.charCodeAt(0)} />
          <span style={{ fontSize: '0.65rem', color: C.muted }}>{idea.author}</span>
          {idea.comments.length > 0 && (
            <span style={{ fontSize: '0.65rem', color: C.muted }}>· 💬 {idea.comments.length}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Idea detail panel ────────────────────────────────────────────────────────
function IdeaDetail({ idea, voted, onVote, onClose }: {
  idea: DemoIdea; voted: boolean; onVote: () => void; onClose: () => void;
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
      width: DETAIL_W, flexShrink: 0,
      borderLeft: `1px solid ${C.border}`,
      background: C.surface,
      display: 'flex', flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '0.875rem 1rem 0.625rem',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            <StatusBadge status={idea.status} />
          </div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            {idea.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1.1rem', padding: 0, lineHeight: 1, flexShrink: 0 }}
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
          fontSize: '0.8rem', color: C.slate, lineHeight: 1.6,
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
              rows={2}
              style={{
                width: '100%', resize: 'none', boxSizing: 'border-box',
                fontSize: '0.76rem', color: C.ink, lineHeight: 1.5,
                background: '#f8fafc', border: `1px solid ${C.border}`,
                borderRadius: '7px', padding: '0.45rem 0.55rem',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handlePost}
              onMouseEnter={() => setPostHover(true)}
              onMouseLeave={() => setPostHover(false)}
              style={{
                marginTop: '0.3rem', fontSize: '0.7rem', fontWeight: 600,
                background: postHover ? '#ea580c' : C.orange,
                color: '#fff', border: 'none', borderRadius: '6px',
                padding: '0.3rem 0.65rem', cursor: 'pointer',
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

// ── Main workspace ────────────────────────────────────────────────────────────
export default function DemoWorkspace() {
  const [flows]         = useState(DEMO_FLOWS)
  const [activeFlowId, setActiveFlowId]     = useState(flows[0].id)
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(flows[0].ideas[0].id)
  const [votedIds, setVotedIds]             = useState<Set<string>>(new Set())
  const [localVotes, setLocalVotes]         = useState<Record<string, number>>({})
  const [ctaHover, setCtaHover]             = useState(false)

  const activeFlow = flows.find(f => f.id === activeFlowId)!
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

  // Show top 4 ideas by vote count
  const displayIdeas = activeFlow.ideas
    .map(idea => ({ ...idea, votes: getVotes(idea) }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 4)

  const selectedIdeaWithVotes = selectedIdea
    ? { ...selectedIdea, votes: getVotes(selectedIdea) }
    : null

  return (
    <>
      <style>{`
        @keyframes demoFloatUp {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-18px); }
        }
        .demo-flow-btn:hover { background: rgba(249,115,22,0.04) !important; }
      `}</style>

      {/* ── Constrained container ───────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.25rem 1.5rem 2.5rem', fontFamily: 'inherit' }}>

        {/* ── Framed workspace app ────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          height: 'calc(100vh - 3.625rem - 2.4rem - 3.75rem)',
          minHeight: 480,
          borderRadius: '1rem',
          border: '1px solid rgba(26,107,191,0.12)',
          overflow: 'hidden',
          boxShadow: '0 4px 32px rgba(6,14,38,0.07), 0 1px 4px rgba(6,14,38,0.04)',
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
                <div style={{
                  width: '1.375rem', height: '1.375rem', borderRadius: '5px',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>M</div>
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
                    onClick={() => {
                      setActiveFlowId(flow.id)
                      setSelectedIdeaId(flow.ideas[0]?.id ?? null)
                    }}
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
                  <span style={{
                    fontSize: '0.58rem', fontWeight: 700,
                    background: activeFlow.status === 'active' ? 'rgba(16,185,129,0.07)' : 'rgba(249,115,22,0.06)',
                    color:      activeFlow.status === 'active' ? '#065f46' : '#92400e',
                    border:     `1px solid ${activeFlow.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(249,115,22,0.16)'}`,
                    borderRadius: '999px', padding: '0.15rem 0.45rem',
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: activeFlow.status === 'active' ? '#10b981' : '#f97316' }} />
                    {activeFlow.status === 'active' ? 'Active' : 'Draft'}
                  </span>
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
                    onSelect={() => setSelectedIdeaId(idea.id)}
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
                  onClose={() => setSelectedIdeaId(null)}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
