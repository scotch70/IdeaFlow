'use client'

import { useState, useEffect } from 'react'
import { DEMO_FLOWS, type DemoIdea } from './demoData'
import VoteButton from '@/components/VoteButton'

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

// ── Match real DashboardSidebar width exactly ─────────────────────────────────
const SIDEBAR_W = 240
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
        <VoteButton count={idea.votes} voted={voted} onVote={onVote} size="sm" animated disabled={voted} />
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
          <VoteButton count={idea.votes} voted={voted} onVote={onVote} animated disabled={voted} />
          {voted && <span style={{ fontSize: '0.7rem', color: C.orange, fontWeight: 600 }}>Voted</span>}
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
        .demo-flow-btn:hover { background: rgba(249,115,22,0.05) !important; }
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

          {/* ── Sidebar — matches DashboardSidebar structure exactly ─────── */}
          <aside style={{
            width: SIDEBAR_W, flexShrink: 0,
            background: C.surface,
            borderRight: `1px solid #e8ecf0`,
            display: 'flex', flexDirection: 'column',
            padding: '0.5rem 0.625rem 0.875rem',
            overflowY: 'auto', overflowX: 'hidden',
          }}>

            {/* ── WORKSPACE section ─────────────────────────────────── */}
            <p style={{
              fontSize: '0.575rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#94a3b8',
              padding: '0 0.5rem', marginBottom: '0.25rem',
            }}>Workspace</p>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.25rem' }}>

              {/* Dashboard — inactive in demo */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.375rem 0.5rem',
                borderRadius: '7px',
                color: '#475569',
                borderLeft: '2px solid transparent',
                opacity: 0.55,
                cursor: 'default',
              }}>
                <span style={{ color: '#94a3b8', display: 'flex', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
                  </svg>
                </span>
                <span style={{ fontSize: '0.775rem', fontWeight: 500, letterSpacing: '-0.01em' }}>Dashboard</span>
              </div>

              {/* IdeaFlows — active parent */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                paddingTop: '0.375rem', paddingBottom: '0.375rem',
                paddingRight: '0.5rem', paddingLeft: 'calc(0.5rem - 2px)',
                borderRadius: '7px',
                background: 'rgba(249,115,22,0.09)',
                color: '#c2540a',
                borderLeft: '2px solid #f97316',
                cursor: 'default',
              }}>
                <span style={{ color: '#ea580c', display: 'flex', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 12l10 5 10-5M2 17l10 5 10-5" />
                  </svg>
                </span>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, flex: 1, letterSpacing: '-0.01em' }}>IdeaFlows</span>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
              </div>

              {/* Flow sub-items */}
              <div style={{ paddingLeft: '0.875rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                        padding: '0.3rem 0.5rem',
                        paddingLeft: active ? 'calc(0.5rem - 2px)' : '0.5rem',
                        borderRadius: '7px', border: 'none',
                        background: active ? 'rgba(249,115,22,0.07)' : 'transparent',
                        color: active ? '#c2540a' : '#64748b',
                        borderLeft: `2px solid ${active ? '#f97316' : 'transparent'}`,
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'background 0.12s, color 0.12s',
                      }}
                    >
                      <span style={{ flex: 1, fontSize: '0.725rem', fontWeight: active ? 700 : 500, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {flow.name}
                      </span>
                      {flow.status === 'draft' && (
                        <span style={{ fontSize: '0.52rem', fontWeight: 700, background: 'rgba(249,115,22,0.1)', color: '#c2540a', borderRadius: '999px', padding: '0.1rem 0.3rem', flexShrink: 0 }}>Draft</span>
                      )}
                      {active && (
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Ideas — inactive */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.375rem 0.5rem',
                borderRadius: '7px',
                color: '#475569',
                borderLeft: '2px solid transparent',
                opacity: 0.55,
                cursor: 'default',
              }}>
                <span style={{ color: '#94a3b8', display: 'flex', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
                    <path d="M9 21h6" />
                  </svg>
                </span>
                <span style={{ fontSize: '0.775rem', fontWeight: 500, letterSpacing: '-0.01em' }}>Ideas</span>
              </div>
            </nav>

            {/* ── divider ───────────────────────────────────────────── */}
            <div style={{ height: '1px', background: '#e8ecf0', margin: '0.5rem 0' }} />

            {/* ── TEAM section ──────────────────────────────────────── */}
            <p style={{
              fontSize: '0.575rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#94a3b8',
              padding: '0 0.5rem', marginBottom: '0.25rem',
            }}>Team</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {/* Members — inactive */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.375rem 0.5rem',
                borderRadius: '7px',
                color: '#475569',
                borderLeft: '2px solid transparent',
                opacity: 0.55,
                cursor: 'default',
              }}>
                <span style={{ color: '#94a3b8', display: 'flex', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0c1.66 0 3-1.34 3-3s-1.34-3-3-3m3 13v-2a4 4 0 0 0-3-3.87" />
                  </svg>
                </span>
                <span style={{ fontSize: '0.775rem', fontWeight: 500, letterSpacing: '-0.01em' }}>Members</span>
              </div>
            </nav>

            {/* ── Spacer ────────────────────────────────────────────── */}
            <div style={{ flex: 1 }} />

            {/* ── Bottom ────────────────────────────────────────────── */}
            <div>
              <div style={{ height: '1px', background: '#e8ecf0', margin: '0.5rem 0' }} />

              {/* Demo user card — matches real user card style */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e8ecf0',
                marginBottom: '0.5rem',
              }}>
                <div style={{
                  width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '0.6rem', fontWeight: 800, color: '#fff',
                }}>AC</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Alex
                  </p>
                  <p style={{ fontSize: '0.575rem', color: '#94a3b8' }}>Admin · demo</p>
                </div>
              </div>

              {/* CTA button — styled like a nav action */}
              <a
                href="/auth?mode=signup"
                onMouseEnter={() => setCtaHover(true)}
                onMouseLeave={() => setCtaHover(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', padding: '0.45rem 0.5rem',
                  background: ctaHover ? '#1a2844' : '#1f2330',
                  color: '#fff', borderRadius: '7px',
                  fontSize: '0.7rem', fontWeight: 700,
                  textDecoration: 'none', textAlign: 'center',
                  transition: 'background 0.15s',
                  boxSizing: 'border-box',
                }}
              >
                Create your workspace →
              </a>
              <p style={{ fontSize: '0.575rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.3rem' }}>
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
