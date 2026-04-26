'use client'

import { useState } from 'react'
import type { Idea } from '@/types/database'
import StatusBadge from './StatusBadge'
import StatusModal from './StatusModal'
import PageContainer from './PageContainer'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ageLabel(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function isStale(idea: Idea): boolean {
  const days = Math.floor((Date.now() - new Date(idea.created_at).getTime()) / 86_400_000)
  return (idea.status === 'open' || idea.status === 'under_review') && days >= 7
}

/** Sort priority: stale open → stale under_review → rest (oldest first) */
function sortIdeas(ideas: Idea[]): Idea[] {
  return [...ideas].sort((a, b) => {
    const aPriority = isStale(a) ? (a.status === 'open' ? 0 : 1) : 2
    const bPriority = isStale(b) ? (b.status === 'open' ? 0 : 1) : 2
    if (aPriority !== bPriority) return aPriority - bPriority
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}

// ─── Action config ────────────────────────────────────────────────────────────

// Quick transitions available from each status (excludes implement/decline which need a modal)
const QUICK_ACTIONS: Record<string, { label: string; target: string }[]> = {
  open:         [
    { label: 'Review',      target: 'under_review' },
    { label: 'Plan',        target: 'planned'      },
    { label: 'In progress', target: 'in_progress'  },
  ],
  under_review: [
    { label: 'Plan',        target: 'planned'     },
    { label: 'In progress', target: 'in_progress' },
  ],
  planned: [
    { label: 'In progress', target: 'in_progress' },
  ],
  in_progress: [],
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function ReviewClient({ ideas: initialIdeas }: { ideas: Idea[] }) {

  const [ideaMap, setIdeaMap] = useState<Map<string, Idea>>(
    () => new Map(initialIdeas.map((i) => [i.id, i])),
  )
  const [pending,      setPending]      = useState<Set<string>>(new Set())
  const [errors,       setErrors]       = useState<Map<string, string>>(new Map())
  const [modalIdea,    setModalIdea]    = useState<Idea | null>(null)
  const [modalPresel,  setModalPresel]  = useState<'implemented' | 'declined'>('implemented')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteValue,     setNoteValue]    = useState('')
  const [savingNoteId,  setSavingNoteId] = useState<string | null>(null)
  const [noteError,     setNoteError]    = useState<string | null>(null)

  const sorted = sortIdeas(Array.from(ideaMap.values()))

  // ── Quick transition ──────────────────────────────────────────────────────

  async function quickTransition(idea: Idea, target: string) {
    if (pending.has(idea.id)) return
    const existingNote = idea.status_note ?? ''

    setIdeaMap((m) => new Map(m).set(idea.id, { ...idea, status: target as Idea['status'] }))
    setPending((p) => new Set(p).add(idea.id))
    setErrors((e) => { const n = new Map(e); n.delete(idea.id); return n })

    try {
      const res  = await fetch('/api/ideas/status', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ideaId: idea.id, status: target, note: existingNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update')
      setIdeaMap((m) => new Map(m).set(idea.id, { ...idea, ...data }))
    } catch (err) {
      setIdeaMap((m) => new Map(m).set(idea.id, idea))
      setErrors((e) => new Map(e).set(idea.id, err instanceof Error ? err.message : 'Failed'))
    } finally {
      setPending((p) => { const n = new Set(p); n.delete(idea.id); return n })
    }
  }

  // ── Note save ─────────────────────────────────────────────────────────────

  async function saveNote(idea: Idea) {
    setSavingNoteId(idea.id)
    setNoteError(null)
    try {
      const res  = await fetch('/api/ideas/status', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ideaId: idea.id, status: idea.status, note: noteValue.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save note')
      setIdeaMap((m) => new Map(m).set(idea.id, { ...idea, status_note: noteValue.trim() || null }))
      setEditingNoteId(null)
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingNoteId(null)
    }
  }

  const totalActive = sorted.length

  return (
    <div style={{ background: 'var(--page-bg)', minHeight: '100%' }}>

      {/* ── Sticky page header ── */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(26,107,191,0.09)',
          position: 'sticky',
          top: 0,
          zIndex: 9,
        }}
      >
        <PageContainer style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                Management
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Needs attention
              </h1>
            </div>
            {totalActive > 0 && (
              <span style={{ fontSize: '0.825rem', color: '#9ab0c8', fontWeight: 500 }}>
                {totalActive} active idea{totalActive !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </PageContainer>
      </div>

      <main>
        <PageContainer style={{ paddingTop: '1.75rem', paddingBottom: '3rem' }}>

          {/* ── Empty state ── */}
          {totalActive === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              borderRadius: '1rem',
              border: '1px dashed rgba(26,107,191,0.15)',
              background: '#ffffff',
            }}>
              <div style={{
                width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', color: '#059669',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.375rem' }}>
                Nothing needs attention right now.
              </p>
              <p style={{ fontSize: '0.825rem', color: '#9ab0c8', maxWidth: '22rem', margin: '0 auto', lineHeight: 1.6 }}>
                All ideas are handled. Check back when new ones come in.
              </p>
            </div>
          )}

          {/* ── Flat idea list ── */}
          {totalActive > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {sorted.map((idea) => (
                <IdeaRow
                  key={idea.id}
                  idea={idea}
                  isPending={pending.has(idea.id)}
                  error={errors.get(idea.id)}
                  isEditingNote={editingNoteId === idea.id}
                  noteValue={editingNoteId === idea.id ? noteValue : (idea.status_note ?? '')}
                  isSavingNote={savingNoteId === idea.id}
                  noteError={editingNoteId === idea.id ? noteError : null}
                  onQuickMove={(target) => quickTransition(idea, target)}
                  onOpenModal={(p) => { setModalIdea(idea); setModalPresel(p) }}
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

        </PageContainer>
      </main>

      {/* ── Modal (implement / decline) ── */}
      {modalIdea && (
        <StatusModal
          ideaId={modalIdea.id}
          ideaTitle={modalIdea.title}
          currentStatus={modalPresel}
          onClose={() => setModalIdea(null)}
        />
      )}
    </div>
  )
}

// ─── Idea row ─────────────────────────────────────────────────────────────────

interface IdeaRowProps {
  idea:            Idea
  isPending:       boolean
  error:           string | undefined
  isEditingNote:   boolean
  noteValue:       string
  isSavingNote:    boolean
  noteError:       string | null
  onQuickMove:     (target: string) => void
  onOpenModal:     (preselect: 'implemented' | 'declined') => void
  onStartEditNote: () => void
  onNoteChange:    (v: string) => void
  onSaveNote:      () => void
  onCancelNote:    () => void
}

function IdeaRow({
  idea, isPending, error,
  isEditingNote, noteValue, isSavingNote, noteError,
  onQuickMove, onOpenModal,
  onStartEditNote, onNoteChange, onSaveNote, onCancelNote,
}: IdeaRowProps) {

  const stale      = isStale(idea)
  const quickMoves = QUICK_ACTIONS[idea.status] ?? []
  const authorName = idea.profiles?.full_name ?? 'Anonymous'
  const likes      = idea.likes_count ?? 0

  return (
    <div
      style={{
        background: '#ffffff',
        border: stale ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(26,107,191,0.09)',
        borderLeft: stale ? '3px solid #f59e0b' : '3px solid rgba(26,107,191,0.18)',
        borderRadius: '0.875rem',
        padding: '1rem 1.125rem 0.875rem',
        opacity: isPending ? 0.65 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Title + badge */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
        <p style={{ flex: 1, minWidth: 0, margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#0d1f35', lineHeight: 1.4 }}>
          {idea.title}
        </p>
        <StatusBadge status={idea.status} />
      </div>

      {/* Meta: author · age · likes · stale warning */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.72rem', color: '#9ab0c8', marginBottom: '0.875rem' }}>
        <span style={{ fontWeight: 600, color: '#5a7fa8' }}>{authorName}</span>
        <Dot />
        <span>{ageLabel(idea.created_at)}</span>
        {likes > 0 && (
          <>
            <Dot />
            <span>{likes} like{likes !== 1 ? 's' : ''}</span>
          </>
        )}
        {stale && (
          <>
            <Dot />
            <span style={{
              fontWeight: 600, color: '#d97706',
              background: 'rgba(245,158,11,0.09)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '999px', padding: '0.1rem 0.45rem',
            }}>
              Waiting {Math.floor((Date.now() - new Date(idea.created_at).getTime()) / 86_400_000)}d
            </span>
          </>
        )}
      </div>

      {/* Note area */}
      {isEditingNote ? (
        <div style={{ marginBottom: '0.875rem' }}>
          <textarea
            autoFocus
            value={noteValue}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Add an admin note visible to the submitter…"
            className="input"
            style={{ width: '100%', minHeight: '4rem', resize: 'vertical', fontSize: '0.8rem', boxSizing: 'border-box', marginBottom: '0.4rem' }}
          />
          {noteError && (
            <p style={{ fontSize: '0.72rem', color: '#dc2626', marginBottom: '0.35rem' }}>{noteError}</p>
          )}
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button onClick={onSaveNote} disabled={isSavingNote}
              style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', background: '#0d1f35', border: 'none', borderRadius: '0.4rem', padding: '0.3rem 0.75rem', cursor: isSavingNote ? 'default' : 'pointer', opacity: isSavingNote ? 0.6 : 1 }}>
              {isSavingNote ? 'Saving…' : 'Save note'}
            </button>
            <button onClick={onCancelNote} disabled={isSavingNote}
              style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ab0c8', background: 'none', border: '1px solid rgba(0,0,0,0.09)', borderRadius: '0.4rem', padding: '0.3rem 0.75rem', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        idea.status_note ? (
          <div
            onClick={onStartEditNote}
            title="Click to edit note"
            style={{
              marginBottom: '0.875rem', cursor: 'pointer',
              display: 'flex', alignItems: 'flex-start', gap: '0.4rem',
              padding: '0.4rem 0.625rem', borderRadius: '0.4rem',
              background: 'rgba(26,107,191,0.04)', border: '1px solid rgba(26,107,191,0.08)',
            }}
          >
            <p style={{ flex: 1, margin: 0, fontSize: '0.775rem', color: '#6b7280', fontStyle: 'italic', lineHeight: 1.5 }}>
              &ldquo;{idea.status_note}&rdquo;
            </p>
            <PencilIcon />
          </div>
        ) : null
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize: '0.72rem', color: '#dc2626', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '0.375rem', padding: '0.3rem 0.6rem', marginBottom: '0.75rem' }}>
          {error}
        </p>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid rgba(26,107,191,0.07)' }}>

        {/* Quick-move buttons */}
        {quickMoves.map(({ label, target }) => (
          <button key={target} onClick={() => onQuickMove(target)} disabled={isPending}
            style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5a7fa8', background: 'rgba(26,107,191,0.06)', border: '1px solid rgba(26,107,191,0.13)', borderRadius: '0.4rem', padding: '0.3rem 0.65rem', cursor: isPending ? 'default' : 'pointer', opacity: isPending ? 0.5 : 1 }}>
            {label}
          </button>
        ))}

        {/* Add note — secondary, only when no note and not editing */}
        {!isEditingNote && !idea.status_note && (
          <button onClick={onStartEditNote}
            style={{ fontSize: '0.7rem', fontWeight: 500, color: '#b0c4d8', background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem 0.25rem' }}>
            + note
          </button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Implement */}
        <button onClick={() => onOpenModal('implemented')} disabled={isPending}
          style={{ fontSize: '0.72rem', fontWeight: 600, color: '#059669', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.4rem', padding: '0.3rem 0.65rem', cursor: isPending ? 'default' : 'pointer', opacity: isPending ? 0.5 : 1 }}>
          ✓ Implement
        </button>

        {/* Decline */}
        <button onClick={() => onOpenModal('declined')} disabled={isPending}
          style={{ fontSize: '0.72rem', fontWeight: 600, color: '#b91c1c', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '0.4rem', padding: '0.3rem 0.65rem', cursor: isPending ? 'default' : 'pointer', opacity: isPending ? 0.5 : 1 }}>
          ✗ Decline
        </button>

      </div>
    </div>
  )
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Dot() {
  return <span style={{ color: 'rgba(154,176,200,0.45)', fontSize: '0.55rem' }}>●</span>
}

function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="#9ab0c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: '2px' }}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
