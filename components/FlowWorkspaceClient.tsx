'use client'

/**
 * FlowWorkspaceClient
 *
 * Three-column workspace layout for the member view on /dashboard/flows/[id].
 *
 * Desktop (≥ 768px):
 *   [Flows nav 172px] | [Ideas list, flex] | [Idea detail 296px when selected]
 *
 * Mobile (< 768px):
 *   Full-width idea list. When an idea is selected a slide-over panel covers
 *   the screen. Flows nav is hidden (accessible via drawer in mobile header).
 *
 * The component only handles the idea-selection UX. All data is server-fetched
 * and passed in as props. Voting, comments, and admin actions remain in the
 * existing IdeaCard / IdeaComments components.
 */

import { useState } from 'react'
import Link from 'next/link'
import IdeaComments from '@/components/IdeaComments'
import StatusBadge from '@/components/StatusBadge'
import type { Idea } from '@/types/database'

// ── Tokens ──────────────────────────────────────────────────────────────────
const C = {
  border:     'rgba(26,107,191,0.09)',
  ink:        '#0d1f35',
  slate:      '#64748b',
  muted:      '#9ab0c8',
  orange:     '#f97316',
  orangeBg:   'rgba(249,115,22,0.07)',
  surface:    '#ffffff',
  bg:         '#f8fafc',
}

const FLOWS_W  = 172
const DETAIL_W = 296

// ── Accessible flow shape ────────────────────────────────────────────────────
export interface AccessibleFlow {
  id:     string
  name:   string
  status: string
}

// ── Flow nav (left column) ───────────────────────────────────────────────────
function FlowNavItem({ flow, active }: { flow: AccessibleFlow; active: boolean }) {
  return (
    <Link
      href={`/dashboard/flows/${flow.id}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.35rem 0.625rem',
        paddingLeft: active ? 'calc(0.625rem - 2px)' : '0.625rem',
        borderRadius: '7px',
        textDecoration: 'none',
        background: active ? C.orangeBg : 'transparent',
        color: active ? '#c2540a' : C.slate,
        borderLeft: `2px solid ${active ? C.orange : 'transparent'}`,
        fontSize: '0.775rem',
        fontWeight: active ? 700 : 500,
        letterSpacing: '-0.01em',
        transition: 'background 0.12s',
      }}
      className="ws-flow-item"
    >
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {flow.name}
      </span>
      {flow.status === 'draft' && (
        <span style={{
          fontSize: '0.55rem', fontWeight: 700, flexShrink: 0,
          background: 'rgba(249,115,22,0.1)', color: '#c2540a',
          borderRadius: '999px', padding: '0.1rem 0.3rem',
        }}>
          Draft
        </span>
      )}
      {active && (
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.orange, flexShrink: 0 }} />
      )}
    </Link>
  )
}

// ── Compact idea row (center column) ─────────────────────────────────────────
function IdeaRow({ idea, selected, onClick }: {
  idea: Idea; selected: boolean; onClick: () => void
}) {
  const authorName = idea.profiles?.full_name ?? 'Anonymous'

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
        width: '100%', textAlign: 'left',
        padding: '0.75rem 1rem',
        borderBottom: `1px solid ${C.border}`,
        background: selected ? 'rgba(249,115,22,0.025)' : C.surface,
        borderLeft: `2px solid ${selected ? C.orange : 'transparent'}`,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.1s',
      }}
      className="ws-idea-row"
    >
      {/* Like pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.2rem',
        height: '1.625rem', padding: '0 0.55rem',
        background: 'rgba(26,107,191,0.05)',
        border: '1px solid rgba(26,107,191,0.12)',
        borderRadius: '7px',
        fontSize: '0.7rem', fontWeight: 700, color: C.muted,
        flexShrink: 0,
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {idea.likes_count ?? 0}
      </div>

      {/* Idea content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: C.ink, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {idea.title}
          </p>
          {idea.status && idea.status !== 'open' && <StatusBadge status={idea.status} />}
        </div>
        {idea.description && (
          <p style={{
            fontSize: '0.71rem', color: C.slate, lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
          }}>
            {idea.description}
          </p>
        )}
        <p style={{ fontSize: '0.65rem', color: C.muted, marginTop: '0.25rem' }}>
          {authorName}
        </p>
      </div>
    </button>
  )
}

// ── Idea detail panel (right column) ─────────────────────────────────────────
function IdeaDetailPanel({ idea, userId, isAdmin, onClose, isMobileOverlay }: {
  idea: Idea
  userId: string
  isAdmin: boolean
  onClose: () => void
  isMobileOverlay: boolean
}) {
  const [liked, setLiked]           = useState(idea.liked_by_user ?? false)
  const [likesCount, setLikesCount] = useState(idea.likes_count ?? 0)
  const [likeLoading, setLikeLoading] = useState(false)
  const authorName = idea.profiles?.full_name ?? 'Anonymous'

  async function toggleLike() {
    if (likeLoading) return
    setLikeLoading(true)
    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount(c => newLiked ? c + 1 : Math.max(0, c - 1))
    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id, liked: newLiked }),
      })
    } catch {
      // Revert on failure
      setLiked(!newLiked)
      setLikesCount(c => newLiked ? Math.max(0, c - 1) : c + 1)
    } finally {
      setLikeLoading(false)
    }
  }

  const panelStyle: React.CSSProperties = isMobileOverlay
    ? {
        position: 'fixed', inset: 0, zIndex: 40,
        background: C.surface,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }
    : {
        width: DETAIL_W, flexShrink: 0,
        borderLeft: `1px solid ${C.border}`,
        background: C.surface,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOverlay && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 39,
            background: 'rgba(15,23,42,0.4)',
          }}
        />
      )}

      <div style={panelStyle}>
        {/* Header */}
        <div style={{
          padding: '0.875rem 1.125rem 0.75rem',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          position: 'sticky', top: 0,
          background: C.surface, zIndex: 1,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
              {idea.status && <StatusBadge status={idea.status} />}
            </div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
              {idea.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close detail"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1.2rem', padding: 0, lineHeight: 1, flexShrink: 0 }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1rem 1.125rem', flex: 1 }}>
          {/* Vote + author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <button
              onClick={toggleLike}
              disabled={likeLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                height: '2rem', padding: '0 0.65rem',
                background: liked ? 'rgba(249,115,22,0.08)' : 'transparent',
                border: `1.5px solid ${liked ? C.orange : 'rgba(26,107,191,0.14)'}`,
                borderRadius: '8px',
                cursor: likeLoading ? 'default' : 'pointer',
                fontSize: '0.76rem', fontWeight: 700,
                color: liked ? C.orange : C.slate,
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                fontFamily: 'inherit',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likesCount}
            </button>
            {liked && <span style={{ fontSize: '0.7rem', color: C.orange, fontWeight: 600 }}>Liked</span>}
          </div>

          {/* Author + time */}
          <p style={{ fontSize: '0.7rem', color: C.muted, marginBottom: '0.875rem' }}>
            {authorName}
          </p>

          {/* Description */}
          {idea.description && (
            <p style={{
              fontSize: '0.825rem', color: C.slate, lineHeight: 1.65,
              marginBottom: '1.25rem',
              paddingBottom: '1.125rem',
              borderBottom: `1px solid ${C.border}`,
            }}>
              {idea.description}
            </p>
          )}

          {/* Comments */}
          <IdeaComments
            ideaId={idea.id}
            currentUserId={userId}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  ideas:           Idea[]
  accessibleFlows: AccessibleFlow[]
  currentFlowId:   string
  userId:          string
  companyId:       string
  isAdmin:         boolean
  prompt:          string | null
  effectiveStatus: string
  newIdeaForm:     React.ReactNode
}

export default function FlowWorkspaceClient({
  ideas,
  accessibleFlows,
  currentFlowId,
  userId,
  isAdmin,
  prompt,
  effectiveStatus,
  newIdeaForm,
}: Props) {
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)
  const [isMobile, setIsMobile]             = useState(false)

  // Detect mobile after hydration to avoid SSR mismatch
  if (typeof window !== 'undefined' && !isMobile && window.innerWidth < 768) {
    // noop on first render; we use CSS media query approach instead
  }

  const selectedIdea = ideas.find(i => i.id === selectedIdeaId) ?? null

  function handleSelectIdea(id: string) {
    setSelectedIdeaId(prev => (prev === id ? null : id))
  }

  const showFlowsNav = accessibleFlows.length > 1

  return (
    <>
      <style>{`
        .ws-flow-item:hover { background: rgba(0,0,0,0.03) !important; }
        .ws-idea-row:hover  { background: rgba(0,0,0,0.015) !important; }
        @media (max-width: 767px) {
          .ws-flows-col  { display: none !important; }
          .ws-detail-col { display: none !important; }
          .ws-mobile-detail { display: flex !important; }
        }
        @media (min-width: 768px) {
          .ws-mobile-detail { display: none !important; }
        }
      `}</style>

      <div style={{
        display: 'flex',
        height: '100%',
        background: C.bg,
        position: 'relative',
      }}>

        {/* ── Left: flows nav ─────────────────────────────────────────── */}
        {showFlowsNav && (
          <div
            className="ws-flows-col"
            style={{
              width: FLOWS_W, flexShrink: 0,
              background: C.surface,
              borderRight: `1px solid ${C.border}`,
              padding: '0.625rem 0.5rem',
              overflowY: 'auto',
            }}
          >
            <p style={{
              fontSize: '0.56rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.muted,
              padding: '0.2rem 0.375rem', marginBottom: '0.3rem',
            }}>
              IdeaFlows
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {accessibleFlows.map(flow => (
                <FlowNavItem
                  key={flow.id}
                  flow={flow}
                  active={flow.id === currentFlowId}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Center: ideas ────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Prompt */}
          {prompt && (
            <div style={{
              padding: '0.875rem 1rem',
              background: 'rgba(240,245,255,0.5)',
              borderBottom: `1px solid ${C.border}`,
            }}>
              <p style={{ fontSize: '0.63rem', fontWeight: 700, color: C.muted, marginBottom: '0.15rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Question
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: C.ink, lineHeight: 1.5 }}>
                {prompt}
              </p>
            </div>
          )}

          {/* New idea form */}
          {effectiveStatus === 'active' && newIdeaForm && (
            <div style={{
              borderBottom: `1px solid ${C.border}`,
              background: C.surface,
            }}>
              <div style={{ padding: '0.875rem 1rem' }}>
                {newIdeaForm}
              </div>
            </div>
          )}

          {/* Ideas */}
          {effectiveStatus === 'active' ? (
            ideas.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: C.muted }}>
                  No ideas yet. Be the first to share one.
                </p>
              </div>
            ) : (
              <div>
                {ideas.map(idea => (
                  <IdeaRow
                    key={idea.id}
                    idea={idea}
                    selected={selectedIdeaId === idea.id}
                    onClick={() => handleSelectIdea(idea.id)}
                  />
                ))}
              </div>
            )
          ) : (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: C.ink, marginBottom: '0.35rem' }}>
                {effectiveStatus === 'draft' ? 'Coming soon' : 'IdeaFlow closed'}
              </p>
              <p style={{ fontSize: '0.825rem', color: C.muted, lineHeight: 1.6 }}>
                {effectiveStatus === 'draft'
                  ? 'This IdeaFlow is not yet open for submissions.'
                  : 'This IdeaFlow is no longer accepting new ideas.'}
              </p>
            </div>
          )}
        </div>

        {/* ── Right: detail panel (desktop) ───────────────────────────── */}
        {selectedIdea && (
          <div className="ws-detail-col" style={{ display: 'flex' }}>
            <IdeaDetailPanel
              idea={selectedIdea}
              userId={userId}
              isAdmin={isAdmin}
              onClose={() => setSelectedIdeaId(null)}
              isMobileOverlay={false}
            />
          </div>
        )}

        {/* ── Slide-over (mobile) ─────────────────────────────────────── */}
        {selectedIdea && (
          <div className="ws-mobile-detail" style={{ display: 'none' }}>
            <IdeaDetailPanel
              idea={selectedIdea}
              userId={userId}
              isAdmin={isAdmin}
              onClose={() => setSelectedIdeaId(null)}
              isMobileOverlay={true}
            />
          </div>
        )}

      </div>
    </>
  )
}
