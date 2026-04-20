'use client'

import { useState } from 'react'
import type { Idea } from '@/types/database'
import StatusBadge from './StatusBadge'
import StatusModal from './StatusModal'
import InnerPageHeader from './InnerPageHeader'
import PageContainer from './PageContainer'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Status section config ────────────────────────────────────────────────────

const SECTIONS: { status: string; label: string; accentColor: string; emptyMsg: string }[] = [
  {
    status:      'open',
    label:       'Open',
    accentColor: '#6b7280',
    emptyMsg:    'No open ideas at the moment.',
  },
  {
    status:      'under_review',
    label:       'Under review',
    accentColor: '#1d4ed8',
    emptyMsg:    'Nothing under review right now.',
  },
  {
    status:      'planned',
    label:       'Planned',
    accentColor: '#4338ca',
    emptyMsg:    'No ideas in the planning queue.',
  },
  {
    status:      'in_progress',
    label:       'In progress',
    accentColor: '#c2540a',
    emptyMsg:    'Nothing actively in progress.',
  },
]

// Quick-move buttons per status (no note required)
const QUICK_MOVES: Record<string, { label: string; targetStatus: string }[]> = {
  open:         [
    { label: '→ Review',      targetStatus: 'under_review' },
    { label: '→ Plan',        targetStatus: 'planned' },
    { label: '→ In progress', targetStatus: 'in_progress' },
  ],
  under_review: [
    { label: '→ Plan',        targetStatus: 'planned' },
    { label: '→ In progress', targetStatus: 'in_progress' },
  ],
  planned:      [
    { label: '→ In progress', targetStatus: 'in_progress' },
  ],
  in_progress:  [],
}

// ─── Root component ───────────────────────────────────────────────────────────

interface ReviewClientProps {
  ideas: Idea[]
}

export default function ReviewClient({ ideas: initialIdeas }: ReviewClientProps) {

  // Local idea map — lets us do optimistic updates for quick transitions
  const [ideaMap, setIdeaMap] = useState<Map<string, Idea>>(
    () => new Map(initialIdeas.map((i) => [i.id, i])),
  )

  // In-flight request IDs
  const [pending, setPending] = useState<Set<string>>(new Set())
  // Per-idea error messages
  const [errors, setErrors] = useState<Map<string, string>>(new Map())

  // StatusModal (for implemented / declined — require notes)
  const [modalIdea, setModalIdea]               = useState<Idea | null>(null)
  const [modalPreselect, setModalPreselect]     = useState<string>('implemented')

  // Inline note editing
  const [editingNoteId, setEditingNoteId]       = useState<string | null>(null)
  const [noteValue, setNoteValue]               = useState('')
  const [savingNoteId, setSavingNoteId]         = useState<string | null>(null)
  const [noteError, setNoteError]               = useState<string | null>(null)

  const allIdeas = Array.from(ideaMap.values())

  // ── Quick status transition (no note required) ──────────────────────────────

  async function quickTransition(idea: Idea, targetStatus: string) {
    const id = idea.id
    if (pending.has(id)) return

    // Preserve existing note so the API doesn't wipe it
    const existingNote = idea.status_note ?? ''

    // Optimistic update
    setIdeaMap((m) => new Map(m).set(id, { ...idea, status: targetStatus as Idea['status'] }))
    setPending((p) => new Set(p).add(id))
    setErrors((e) => { const n = new Map(e); n.delete(id); return n })

    try {
      const res = await fetch('/api/ideas/status', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: id, status: targetStatus, note: existingNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update status')
      // Sync server response into local state
      setIdeaMap((m) => new Map(m).set(id, { ...idea, ...data }))
    } catch (err) {
      // Revert optimistic update
      setIdeaMap((m) => new Map(m).set(id, idea))
      setErrors((e) => new Map(e).set(id, err instanceof Error ? err.message : 'Failed'))
    } finally {
      setPending((p) => { const n = new Set(p); n.delete(id); return n })
    }
  }

  // ── Inline note save ────────────────────────────────────────────────────────

  async function saveNote(idea: Idea) {
    const trimmed = noteValue.trim()
    setSavingNoteId(idea.id)
    setNoteError(null)

    try {
      const res = await fetch('/api/ideas/status', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id, status: idea.status, note: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save note')
      setIdeaMap((m) => new Map(m).set(idea.id, { ...idea, status_note: trimmed || null }))
      setEditingNoteId(null)
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingNoteId(null)
    }
  }

  // ── Open modal pre-selecting a target status ────────────────────────────────

  function openModal(idea: Idea, preselect: 'implemented' | 'declined') {
    setModalIdea(idea)
    setModalPreselect(preselect)
  }

  // ── Derived counts ──────────────────────────────────────────────────────────

  const totalActive = allIdeas.length

  const headerRight = (
    <span style={{ fontSize: '0.8rem', color: '#9ab0c8', fontWeight: 500 }}>
      {totalActive} active idea{totalActive !== 1 ? 's' : ''}
    </span>
  )

  return (
    <div style={{ background: 'var(--page-bg)', minHeight: '100%' }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <InnerPageHeader
        title="Review inbox"
        backHref="/dashboard"
        backLabel="Dashboard"
        right={headerRight}
      />

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

          {/* All-caught-up state */}
          {totalActive === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              borderRadius: '1rem',
              border: '1px dashed rgba(26,107,191,0.15)',
              background: '#ffffff',
            }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>✓</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.375rem' }}>
                You&apos;re all caught up
              </p>
              <p style={{ fontSize: '0.825rem', color: '#9ab0c8', lineHeight: 1.6, maxWidth: '22rem', margin: '0 auto' }}>
                No ideas need attention right now.
              </p>
            </div>
          )}

          {/* ── Status sections ─────────────────────────────────────────────── */}
          {SECTIONS.map(({ status, label, accentColor, emptyMsg }) => {
            const sectionIdeas = allIdeas.filter((i) => i.status === status)
            return (
              <section key={status} style={{ marginBottom: '2.75rem' }}>

                {/* Section header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  paddingLeft: '0.125rem',
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: accentColor, flexShrink: 0,
                    opacity: sectionIdeas.length === 0 ? 0.3 : 1,
                  }} />
                  <h2 style={{
                    fontSize: '0.69rem',
                    fontWeight: 700,
                    letterSpacing: '0.13em',
                    textTransform: 'uppercase',
                    color: sectionIdeas.length === 0 ? '#c5d5e8' : '#9ab0c8',
                    margin: 0,
                  }}>
                    {label}
                  </h2>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: sectionIdeas.length === 0 ? '#c5d5e8' : accentColor,
                    background: sectionIdeas.length === 0 ? 'transparent' : `color-mix(in srgb, ${accentColor} 10%, transparent)`,
                    borderRadius: '999px',
                    padding: '0.1rem 0.45rem',
                  }}>
                    {sectionIdeas.length}
                  </span>
                </div>

                {/* Empty state */}
                {sectionIdeas.length === 0 && (
                  <div style={{
                    borderRadius: '0.75rem',
                    border: '1px dashed rgba(26,107,191,0.10)',
                    padding: '1rem 1.25rem',
                    fontSize: '0.8rem',
                    color: '#c5d5e8',
                    fontStyle: 'italic',
                  }}>
                    {emptyMsg}
                  </div>
                )}

                {/* Idea cards */}
                {sectionIdeas.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {sectionIdeas.map((idea) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        accentColor={accentColor}
                        isPending={pending.has(idea.id)}
                        error={errors.get(idea.id)}
                        isEditingNote={editingNoteId === idea.id}
                        noteValue={editingNoteId === idea.id ? noteValue : (idea.status_note ?? '')}
                        isSavingNote={savingNoteId === idea.id}
                        noteError={editingNoteId === idea.id ? noteError : null}
                        onQuickMove={(target) => quickTransition(idea, target)}
                        onOpenModal={(preselect) => openModal(idea, preselect)}
                        onStartEditNote={() => {
                          setEditingNoteId(idea.id)
                          setNoteValue(idea.status_note ?? '')
                          setNoteError(null)
                        }}
                        onNoteChange={setNoteValue}
                        onSaveNote={() => saveNote(idea)}
                        onCancelNote={() => { setEditingNoteId(null); setNoteError(null) }}
                      />
                    ))}
                  </div>
                )}
              </section>
            )
          })}

        </PageContainer>
      </main>

      {/* ── StatusModal (implement / decline) ───────────────────────────────── */}
      {modalIdea && (
        <StatusModal
          ideaId={modalIdea.id}
          ideaTitle={modalIdea.title}
          currentStatus={modalPreselect}
          onClose={() => setModalIdea(null)}
        />
      )}
    </div>
  )
}

// ─── Idea card ────────────────────────────────────────────────────────────────

interface IdeaCardProps {
  idea:           Idea
  accentColor:    string
  isPending:      boolean
  error:          string | undefined
  isEditingNote:  boolean
  noteValue:      string
  isSavingNote:   boolean
  noteError:      string | null
  onQuickMove:    (target: string) => void
  onOpenModal:    (preselect: 'implemented' | 'declined') => void
  onStartEditNote: () => void
  onNoteChange:   (val: string) => void
  onSaveNote:     () => void
  onCancelNote:   () => void
}

function IdeaCard({
  idea,
  accentColor,
  isPending,
  error,
  isEditingNote,
  noteValue,
  isSavingNote,
  noteError,
  onQuickMove,
  onOpenModal,
  onStartEditNote,
  onNoteChange,
  onSaveNote,
  onCancelNote,
}: IdeaCardProps) {

  const authorName = idea.profiles?.full_name ?? 'Anonymous'
  const days       = daysSince(idea.created_at)
  const isStale    = (idea.status === 'open' || idea.status === 'under_review') && days >= 7
  const quickMoves = QUICK_MOVES[idea.status] ?? []

  return (
    <div
      style={{
        background: '#ffffff',
        border: isStale ? '1px solid rgba(245,158,11,0.22)' : '1px solid rgba(26,107,191,0.09)',
        borderLeft: isStale ? `3px solid #f59e0b` : `3px solid ${accentColor}22`,
        borderRadius: '0.75rem',
        padding: '0.9rem 1rem 0.8rem',
        opacity: isPending ? 0.7 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >

      {/* ── Title + badge row ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
        <p style={{
          flex: 1, minWidth: 0,
          fontSize: '0.875rem', fontWeight: 600, color: '#0d1f35', lineHeight: 1.4,
          margin: 0,
        }}>
          {idea.title}
        </p>
        <StatusBadge status={idea.status} />
      </div>

      {/* ── Meta row ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        flexWrap: 'wrap', fontSize: '0.72rem', color: '#9ab0c8',
        marginBottom: '0.6rem',
      }}>
        <span style={{ fontWeight: 500, color: '#5a7fa8' }}>{authorName}</span>
        <Dot />
        <span>{formatDate(idea.created_at)}</span>
        {(idea.likes_count ?? 0) > 0 && (
          <>
            <Dot />
            <span>
              {idea.likes_count} like{idea.likes_count !== 1 ? 's' : ''}
            </span>
          </>
        )}
        {isStale && (
          <>
            <Dot />
            <span style={{
              fontSize: '0.67rem', fontWeight: 600, color: '#d97706',
              background: 'rgba(245,158,11,0.09)',
              border: '1px solid rgba(245,158,11,0.22)',
              borderRadius: '999px', padding: '0.1rem 0.45rem',
            }}>
              {days}d no update
            </span>
          </>
        )}
      </div>

      {/* ── Note area ─────────────────────────────────────────────────────── */}
      {isEditingNote ? (
        <div style={{ marginBottom: '0.75rem' }}>
          <textarea
            autoFocus
            value={noteValue}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Add an admin note visible to the submitter…"
            className="input"
            style={{
              width: '100%', minHeight: '4.5rem', resize: 'vertical',
              fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: '0.375rem',
            }}
          />
          {noteError && (
            <p style={{ fontSize: '0.72rem', color: '#dc2626', marginBottom: '0.375rem' }}>
              {noteError}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button
              onClick={onSaveNote}
              disabled={isSavingNote}
              style={{
                fontSize: '0.75rem', fontWeight: 600,
                color: '#fff', background: '#0d1f35',
                border: 'none', borderRadius: '0.4rem',
                padding: '0.3rem 0.75rem', cursor: isSavingNote ? 'default' : 'pointer',
                opacity: isSavingNote ? 0.6 : 1,
              }}
            >
              {isSavingNote ? 'Saving…' : 'Save note'}
            </button>
            <button
              onClick={onCancelNote}
              disabled={isSavingNote}
              style={{
                fontSize: '0.75rem', fontWeight: 500,
                color: '#9ab0c8', background: 'none',
                border: '1px solid rgba(0,0,0,0.09)', borderRadius: '0.4rem',
                padding: '0.3rem 0.75rem', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '0.75rem' }}>
          {idea.status_note ? (
            <div
              onClick={onStartEditNote}
              title="Click to edit note"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
                cursor: 'pointer', padding: '0.4rem 0.5rem',
                borderRadius: '0.4rem', background: 'rgba(26,107,191,0.04)',
                border: '1px solid rgba(26,107,191,0.07)',
              }}
            >
              <p style={{
                flex: 1, margin: 0,
                fontSize: '0.775rem', lineHeight: 1.55,
                color: '#6b7280', fontStyle: 'italic',
              }}>
                &ldquo;{idea.status_note}&rdquo;
              </p>
              <PencilIcon />
            </div>
          ) : (
            <button
              onClick={onStartEditNote}
              style={{
                fontSize: '0.72rem', fontWeight: 500, color: '#9ab0c8',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px',
              }}
            >
              + Add note
            </button>
          )}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <p style={{
          fontSize: '0.72rem', color: '#dc2626',
          background: 'rgba(220,38,38,0.05)',
          border: '1px solid rgba(220,38,38,0.15)',
          borderRadius: '0.375rem', padding: '0.3rem 0.6rem',
          marginBottom: '0.75rem',
        }}>
          {error}
        </p>
      )}

      {/* ── Action buttons row ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        flexWrap: 'wrap',
        paddingTop: '0.6rem',
        borderTop: '1px solid rgba(26,107,191,0.07)',
      }}>

        {/* Quick-move buttons (left group) */}
        {quickMoves.map(({ label, targetStatus }) => (
          <button
            key={targetStatus}
            onClick={() => onQuickMove(targetStatus)}
            disabled={isPending}
            style={{
              fontSize: '0.72rem', fontWeight: 600,
              color: '#5a7fa8', background: 'rgba(26,107,191,0.06)',
              border: '1px solid rgba(26,107,191,0.12)',
              borderRadius: '0.4rem', padding: '0.28rem 0.625rem',
              cursor: isPending ? 'default' : 'pointer',
              opacity: isPending ? 0.5 : 1,
            }}
          >
            {label}
          </button>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Terminal action: Implement */}
        <button
          onClick={() => onOpenModal('implemented')}
          disabled={isPending}
          style={{
            fontSize: '0.72rem', fontWeight: 600,
            color: '#059669', background: 'rgba(16,185,129,0.07)',
            border: '1px solid rgba(16,185,129,0.20)',
            borderRadius: '0.4rem', padding: '0.28rem 0.625rem',
            cursor: isPending ? 'default' : 'pointer',
            opacity: isPending ? 0.5 : 1,
          }}
        >
          ✓ Implement
        </button>

        {/* Terminal action: Decline */}
        <button
          onClick={() => onOpenModal('declined')}
          disabled={isPending}
          style={{
            fontSize: '0.72rem', fontWeight: 600,
            color: '#b91c1c', background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.18)',
            borderRadius: '0.4rem', padding: '0.28rem 0.625rem',
            cursor: isPending ? 'default' : 'pointer',
            opacity: isPending ? 0.5 : 1,
          }}
        >
          ✗ Decline
        </button>

      </div>
    </div>
  )
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Dot() {
  return <span style={{ color: 'rgba(154,176,200,0.5)', fontSize: '0.6rem' }}>●</span>
}

function PencilIcon() {
  return (
    <svg
      width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="#9ab0c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: '2px' }}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
