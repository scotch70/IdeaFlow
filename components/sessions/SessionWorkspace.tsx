'use client'

/**
 * SessionWorkspace — the heart of IdeaFlow Sessions.
 *
 * Owns all state for one open session (cards, connections, current step,
 * connection-draft state, save status). Renders four regions in a single
 * full-height grid:
 *
 *   ┌───────────────── Top bar ─────────────────────────────────────────┐
 *   │ title · template · save status · Export · Finish                  │
 *   ├──────────┬──────────────────────────────────┬──────────────────────┤
 *   │ Sidebar  │                                  │  Guide panel        │
 *   │ steps    │           Dark canvas            │  prompt / tips /    │
 *   │ (light)  │  cards + SVG connections         │  Add Card + AI      │
 *   │          │                                  │  helpers (subtle)   │
 *   └──────────┴──────────────────────────────────┴──────────────────────┘
 *
 * Persistence is delegated to lib/sessions/store (Supabase) — every mutation
 * goes through it. Optimistic updates apply to local state first, then the
 * promise resolves and we flash a "Saved" indicator in the top bar.
 *
 * The workspace is intentionally a single file (~ 400 lines) rather than a
 * dozen tiny files passing 10 props each: most of this is one cohesive state
 * machine and splitting would create more friction than it removes. Canvas
 * rendering, sidebar, guide panel, and summary modal live in their own files.
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createCard, createConnection, deleteCard, deleteConnection,
  duplicateCard,
  getSession, updateCard, updateSession, updateStep,
} from '@/lib/sessions/store'
import { CARD_TYPE_META } from '@/lib/sessions/cardTypes'
import {
  CanvasSize, clampToCanvas, gridResetPositions, isCanvasMeasured, nextCardSpawn,
} from '@/lib/sessions/layout'
import { trackSessionEvent } from '@/lib/analytics/sessions'
import { getTemplate, STEP_LABEL, STEP_ORDER } from '@/lib/sessions/templates'
import type {
  CardType, Session, SessionCard, SessionConnection, SessionMember,
  SessionStepRow, StepKey,
} from '@/types/sessions'
import SessionSidebar from './SessionSidebar'
import SessionCanvas from './SessionCanvas'
import GuidePanel from './GuidePanel'
import SessionSummaryModal from './SessionSummaryModal'

interface Props {
  sessionId: string
  userId:    string
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// Canvas dark surface token — reused by SessionCanvas + SessionCard
export const CANVAS_BG     = '#0e1320'
export const CANVAS_SURFACE = '#161c2e'
export const CANVAS_BORDER = 'rgba(255,255,255,0.07)'
export const CANVAS_DOT    = 'rgba(255,255,255,0.05)'

export default function SessionWorkspace({ sessionId, userId }: Props) {
  const router = useRouter()

  const [session,     setSession]     = useState<Session | null>(null)
  const [cards,       setCards]       = useState<SessionCard[]>([])
  const [connections, setConnections] = useState<SessionConnection[]>([])
  const [steps,       setSteps]       = useState<SessionStepRow[]>([])
  const [members,     setMembers]     = useState<Record<string, SessionMember>>({})
  const [loadError,   setLoadError]   = useState<string | null>(null)

  const [currentStep,      setCurrentStep]      = useState<StepKey>('define')
  const [saveStatus,       setSaveStatus]       = useState<SaveStatus>('idle')
  const [showSummary,      setShowSummary]      = useState(false)
  // Left-sidebar collapse state, persisted across reloads of the same browser.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  // Right Guide-panel collapse state, also persisted. Independent so the
  // user can collapse one side without losing the other.
  const [guideCollapsed,   setGuideCollapsed]   = useState(false)
  // Measured size of the dark canvas — set by SessionCanvas via onMeasure.
  // Drives card spawn positions, drag clamping, and the "reset view" grid.
  const [canvasSize,       setCanvasSize]       = useState<CanvasSize>({ w: 0, h: 0 })
  // The card the user has clicked once — the right Guide panel switches to
  // an inline editor when this is set, and becomes the step guide again
  // when nothing is selected.
  const [selectedCardId,   setSelectedCardId]   = useState<string | null>(null)
  // The card the user has double-clicked (or pressed Enter on) — focuses
  // the inline title input on the canvas card itself.
  const [editingCardId,    setEditingCardId]    = useState<string | null>(null)

  // Connection-draft state — set when the user enters connect mode by
  // clicking the link icon on a card or pressing the "Connect" guide button.
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Persist collapsed state per browser (not per session) — feels like a UI
  // preference, not session data.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const v = window.localStorage.getItem('ideaflow:sessions:sidebarCollapsed')
      if (v === '1') setSidebarCollapsed(true)
    } catch { /* private mode etc. — fine, default to expanded */ }
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    try { window.localStorage.setItem('ideaflow:sessions:sidebarCollapsed', sidebarCollapsed ? '1' : '0') } catch {}
  }, [sidebarCollapsed])

  // Same pattern for the right Guide panel.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const v = window.localStorage.getItem('ideaflow:sessionsGuideCollapsed')
      if (v === '1') setGuideCollapsed(true)
    } catch {}
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    try { window.localStorage.setItem('ideaflow:sessionsGuideCollapsed', guideCollapsed ? '1' : '0') } catch {}
  }, [guideCollapsed])

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true
    getSession(userId, sessionId).then(d => {
      if (!alive) return
      if (!d) { setLoadError('This session could not be found.'); return }
      setSession(d.session)
      setCards(d.cards)
      setConnections(d.connections)
      setSteps(d.steps)
      setMembers(d.members)
      trackSessionEvent('session_started', {
        sessionId:    d.session.id,
        templateType: d.session.template_type,
      })
    })
    return () => { alive = false }
  }, [userId, sessionId])

  // ── Save-status helper ─────────────────────────────────────────────────────
  const flashSaved = useCallback(() => {
    setSaveStatus('saved')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setSaveStatus('idle'), 1600)
  }, [])

  // ── Title rename ───────────────────────────────────────────────────────────
  async function handleRenameTitle(next: string) {
    if (!session) return
    setSession({ ...session, title: next })
    setSaveStatus('saving')
    await updateSession(userId, session.id, { title: next })
    flashSaved()
  }

  // ── Cards ──────────────────────────────────────────────────────────────────
  async function handleAddCard(type: CardType) {
    if (!session) return
    setSaveStatus('saving')
    // Spawn inside the visible canvas. Falls back to (0, 0) clamped (which
    // becomes the pad/pad corner) if the canvas hasn't measured yet — that's
    // OK because the resize effect below will reshuffle once it does.
    const spawn = isCanvasMeasured(canvasSize)
      ? nextCardSpawn(canvasSize, cards.length)
      : { x: 0, y: 0 }
    const newCard = await createCard({
      userId, sessionId: session.id, type,
      title: '',
      x: spawn.x,
      y: spawn.y,
    })
    setCards(c => [...c, newCard])
    setSelectedCardId(newCard.id)
    setEditingCardId(newCard.id)
    flashSaved()
  }

  /**
   * The Guide panel's "Add card" form submits here. Title + details + (if
   * custom) custom_label are persisted in one shot — no separate
   * select-then-edit flow needed.
   */
  async function handleCreateCardFromForm(args: {
    type: CardType
    title: string
    content: string
    customLabel?: string
  }) {
    if (!session) return
    setSaveStatus('saving')
    const spawn = isCanvasMeasured(canvasSize)
      ? nextCardSpawn(canvasSize, cards.length)
      : { x: 0, y: 0 }
    const newCard = await createCard({
      userId, sessionId: session.id,
      type:        args.type,
      title:       args.title,
      content:     args.content || null,
      x:           spawn.x,
      y:           spawn.y,
      customLabel: args.type === 'custom' ? (args.customLabel ?? null) : null,
    })
    setCards(c => [...c, newCard])
    // Select but don't enter inline edit — the form already captured the
    // text, so the user shouldn't have to re-type on the canvas.
    setSelectedCardId(newCard.id)
    flashSaved()
  }

  async function handleChangeCardCustomLabel(id: string, label: string) {
    setCards(cs => cs.map(c => c.id === id ? { ...c, custom_label: label } : c))
    setSaveStatus('saving')
    await updateCard(userId, id, { custom_label: label })
    flashSaved()
  }

  async function handleDuplicateCard(id: string) {
    if (!session) return
    const source = cards.find(c => c.id === id)
    if (!source) return
    setSaveStatus('saving')
    const copy = await duplicateCard({ userId, sessionId: session.id, source })
    setCards(c => [...c, copy])
    setSelectedCardId(copy.id)
    flashSaved()
  }

  async function handleUpdateCardPosition(id: string, x: number, y: number) {
    // Clamp here as the final defence — drag constraints inside the canvas
    // already keep the card visually inside, but a resize during drag or a
    // rounding error could still let it drift.
    const cl = isCanvasMeasured(canvasSize) ? clampToCanvas(x, y, canvasSize) : { x, y }
    setCards(cs => cs.map(c => c.id === id ? { ...c, x: cl.x, y: cl.y } : c))
    setSaveStatus('saving')
    await updateCard(userId, id, { x: cl.x, y: cl.y })
    flashSaved()
  }

  async function handleUpdateCardText(id: string, patch: { title?: string; content?: string }) {
    setCards(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c))
    setSaveStatus('saving')
    await updateCard(userId, id, patch)
    flashSaved()
  }

  // ── Reset view: lay all cards out in a tidy grid inside the canvas ─────────
  async function handleResetView() {
    if (!session) return
    if (!isCanvasMeasured(canvasSize)) return
    if (cards.length === 0) return

    const positions = gridResetPositions(cards.length, canvasSize)
    setCards(prev => prev.map((c, i) => positions[i]
      ? { ...c, x: positions[i].x, y: positions[i].y }
      : c
    ))
    setSaveStatus('saving')
    await Promise.all(cards.map((c, i) => {
      const p = positions[i]
      return p ? updateCard(userId, c.id, { x: p.x, y: p.y }) : Promise.resolve(null)
    }))
    flashSaved()
  }

  // Auto-clamp any out-of-bounds card whenever the canvas resizes (which
  // includes the first measure after load and any sidebar collapse/expand).
  // This rescues cards saved with positions that no longer fit — e.g. cards
  // dragged into the old wider canvas before this fix shipped.
  useEffect(() => {
    if (!isCanvasMeasured(canvasSize)) return
    let didChange = false
    const next = cards.map(c => {
      const cl = clampToCanvas(c.x, c.y, canvasSize)
      if (cl.x === c.x && cl.y === c.y) return c
      didChange = true
      return { ...c, x: cl.x, y: cl.y }
    })
    if (!didChange) return
    setCards(next)
    // Persist the corrections in the background. Avoid awaiting in series —
    // these are independent updates.
    for (const c of next) {
      const original = cards.find(o => o.id === c.id)
      if (!original) continue
      if (original.x === c.x && original.y === c.y) continue
      updateCard(userId, c.id, { x: c.x, y: c.y })
    }
    // Intentionally only depends on canvas size + card count; we don't want
    // every drag-end to retrigger the whole sweep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize.w, canvasSize.h, cards.length])

  async function handleTogglePriority(id: string) {
    const card = cards.find(c => c.id === id)
    if (!card) return
    const next = card.priority > 0 ? 0 : 1
    setCards(cs => cs.map(c => c.id === id ? { ...c, priority: next } : c))
    setSaveStatus('saving')
    await updateCard(userId, id, { priority: next })
    flashSaved()
  }

  async function handleDeleteCard(id: string) {
    setCards(cs => cs.filter(c => c.id !== id))
    setConnections(cn => cn.filter(c => c.source_card_id !== id && c.target_card_id !== id))
    if (selectedCardId === id) setSelectedCardId(null)
    if (editingCardId === id)  setEditingCardId(null)
    setSaveStatus('saving')
    await deleteCard(userId, id)
    flashSaved()
  }

  async function handleChangeCardType(id: string, type: CardType) {
    setCards(cs => cs.map(c => c.id === id ? { ...c, type } : c))
    setSaveStatus('saving')
    await updateCard(userId, id, { type })
    flashSaved()
  }

  // ── Connections ────────────────────────────────────────────────────────────
  function startConnectFrom(id: string) {
    setConnectingFrom(prev => prev === id ? null : id)
  }
  function cancelConnect() { setConnectingFrom(null) }

  async function handleFinishConnect(targetId: string) {
    if (!session || !connectingFrom || connectingFrom === targetId) {
      setConnectingFrom(null); return
    }
    setSaveStatus('saving')
    const conn = await createConnection({
      userId, sessionId: session.id,
      sourceId: connectingFrom, targetId,
    })
    if (conn) setConnections(cn => [...cn, conn])
    setConnectingFrom(null)
    flashSaved()
  }

  async function handleDeleteConnection(id: string) {
    setConnections(cn => cn.filter(c => c.id !== id))
    setSaveStatus('saving')
    await deleteConnection(userId, id)
    flashSaved()
  }

  // ── Steps ──────────────────────────────────────────────────────────────────
  async function handleToggleStep(key: StepKey) {
    if (!session) return
    const step = steps.find(s => s.step_key === key)
    if (!step) return
    const next = !step.completed
    setSteps(ss => ss.map(s => s.step_key === key ? { ...s, completed: next } : s))
    setSaveStatus('saving')
    await updateStep(userId, session.id, key, next)
    flashSaved()
  }

  // ── Finish session ─────────────────────────────────────────────────────────
  async function handleFinish() {
    setShowSummary(true)
  }

  async function handleMarkFinished(summaryMarkdown: string) {
    if (!session) return
    setSaveStatus('saving')
    // Persist the markdown summary alongside the status change so the
    // finished session keeps a snapshot the user can revisit later.
    const updated = await updateSession(userId, session.id, {
      status:  'finished',
      summary: summaryMarkdown,
    })
    if (updated) setSession(updated)
    trackSessionEvent('session_completed', {
      sessionId:        session.id,
      templateType:     session.template_type,
      cardCount:        cards.length,
      connectionCount:  connections.length,
      stepsCompleted:   steps.filter(s => s.completed).length,
      hasPriority:      cards.some(c => c.priority > 0),
    })
    setShowSummary(false)
    flashSaved()
    router.push('/dashboard/sessions')
  }

  // ── Subtle AI helpers (stubs — clearly labelled) ───────────────────────────
  async function handleAISuggestAngles() {
    if (!session) return
    // Suggest 3 idea cards drawn from the template's "Explore" suggestions —
    // intentionally not calling a real LLM here; deterministic suggestions
    // keep the MVP testable and the AI bar subtle, not the headline.
    const tpl = getTemplate(session.template_type)
    const baseTitles: Record<StepKey, string[]> = {
      define:     ['Sharpen the problem', 'Name the audience', 'Pin down "why now"'],
      explore:    ['Tackle root cause', 'A lighter-weight angle', 'Outsource to a partner'],
      connect:    ['Group by cause', 'Group by audience', 'Cluster duplicates'],
      prioritize: ['Highest-impact bet', 'Cheapest experiment', 'Most reversible'],
      action:     ['Draft a one-pager', 'Talk to 3 users', 'Ship a smallest test'],
    }
    const titles = baseTitles[currentStep] ?? baseTitles.explore
    void tpl
    for (let i = 0; i < titles.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const c = await createCard({
        userId, sessionId: session.id, type: 'idea',
        title: titles[i],
        x: 240 + i * 40,
        y: 320 + i * 40,
      })
      setCards(cs => [...cs, c])
    }
    flashSaved()
  }

  async function handleAIFindDuplicates() {
    // Quick lexical similarity (very rough) — flags pairs of cards sharing
    // a noun-ish token. No backend; runs fully client-side, hint-only.
    const lower = cards.map(c => ({ id: c.id, t: c.title.toLowerCase() }))
    const dups: string[] = []
    for (let i = 0; i < lower.length; i++) for (let j = i + 1; j < lower.length; j++) {
      const a = lower[i].t, b = lower[j].t
      if (!a || !b) continue
      const tokensA = new Set(a.split(/\W+/).filter(w => w.length > 4))
      const overlap = [...tokensA].some(w => b.includes(w))
      if (overlap) dups.push(`"${cards[i].title}" ↔ "${cards[j].title}"`)
    }
    alert(
      dups.length === 0
        ? 'No obvious duplicates spotted.'
        : `Possible duplicates:\n\n${dups.slice(0, 6).join('\n')}`
    )
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') cancelConnect()
      // Quick-add idea card with "i"
      const tag = (e.target as HTMLElement | null)?.tagName
      const inField = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement | null)?.isContentEditable
      if (!inField && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault()
        handleAddCard('idea')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length, session?.id])

  // SessionSummaryCard derives Top Insight / Key Decision / Biggest Risk /
  // Next Actions from the raw cards array, so we just pass cards through.

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.4rem' }}>
          {loadError}
        </p>
        <Link href="/dashboard/sessions" style={{ fontSize: '0.875rem', color: '#c2540a', textDecoration: 'underline' }}>
          Back to sessions
        </Link>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: '#9faab8', fontSize: '0.825rem' }}>
        Loading session…
      </div>
    )
  }

  const template     = getTemplate(session.template_type)
  const stepGuide    = template.steps[currentStep]
  const completedSet = new Set(steps.filter(s => s.completed).map(s => s.step_key))

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid rgba(26,107,191,0.09)',
          padding: '0.625rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.85rem',
          flexShrink: 0,
        }}
      >
        <Link
          href="/dashboard/sessions"
          aria-label="Back to sessions"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '2rem', height: '2rem', borderRadius: '0.45rem',
            color: '#5d667a', textDecoration: 'none',
            background: 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.05)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              value={session.title}
              onChange={e => setSession(s => s ? { ...s, title: e.target.value } : s)}
              onBlur={e => handleRenameTitle(e.target.value.trim() || 'Untitled session')}
              aria-label="Session title"
              style={{
                fontSize: '0.95rem', fontWeight: 800, color: '#0d1f35',
                letterSpacing: '-0.01em',
                border: 'none', background: 'transparent', outline: 'none',
                padding: '0.15rem 0.25rem',
                borderRadius: '0.3rem',
                minWidth: 0, flex: 1,
              }}
              onFocus={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.04)' }}
              onMouseEnter={e => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.background = 'rgba(15,23,42,0.025)' }}
              onMouseLeave={e => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.background = 'transparent' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.05rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#9faab8' }}>
              {template.emoji} {template.name}
            </span>
            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cdd5e0' }} />
            <SaveBadge status={saveStatus} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetView}
          disabled={cards.length === 0 || !isCanvasMeasured(canvasSize)}
          title="Lay out all cards in a tidy grid inside the canvas"
          style={{
            ...topBarButtonStyle(),
            opacity: (cards.length === 0 || !isCanvasMeasured(canvasSize)) ? 0.5 : 1,
            cursor:  (cards.length === 0 || !isCanvasMeasured(canvasSize)) ? 'not-allowed' : 'pointer',
          }}
        >
          Reset view
        </button>
        <button
          type="button"
          onClick={() => setShowSummary(true)}
          style={topBarButtonStyle()}
        >
          Export
        </button>
        <button
          type="button"
          onClick={handleFinish}
          style={{ ...topBarButtonStyle(), background: '#0d1f35', color: '#fff', borderColor: '#0d1f35' }}
        >
          Finish session
        </button>
      </div>

      {/* ── Three-pane workspace ───────────────────────────────────────────── */}
      <div
        style={{
          flex: 1, minHeight: 0,
          display: 'grid',
          // Both side panels are independently collapsible. When either
          // collapses the canvas (minmax(0, 1fr)) claims the freed width.
          gridTemplateColumns: `${sidebarCollapsed ? '3.5rem' : '15rem'} minmax(0, 1fr) ${guideCollapsed ? '3.5rem' : '20rem'}`,
          transition: 'grid-template-columns 0.2s ease',
        }}
        className="session-workspace-grid"
      >
        <SessionSidebar
          steps={STEP_ORDER}
          stepLabels={STEP_LABEL}
          currentStep={currentStep}
          completed={completedSet}
          collapsed={sidebarCollapsed}
          onSelect={setCurrentStep}
          onToggleComplete={handleToggleStep}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        />

        <SessionCanvas
          cards={cards}
          connections={connections}
          members={members}
          connectingFrom={connectingFrom}
          selectedCardId={selectedCardId}
          editingCardId={editingCardId}
          canvasSize={canvasSize}
          guideCollapsed={guideCollapsed}
          onMeasure={setCanvasSize}
          onSelectCard={setSelectedCardId}
          onEditCard={setEditingCardId}
          onPositionEnd={handleUpdateCardPosition}
          onChangeText={handleUpdateCardText}
          onTogglePriority={handleTogglePriority}
          onDuplicate={handleDuplicateCard}
          onDelete={handleDeleteCard}
          onStartConnect={startConnectFrom}
          onFinishConnect={handleFinishConnect}
          onDeleteConnection={handleDeleteConnection}
          onCancelConnect={cancelConnect}
          onResetView={handleResetView}
        />

        <GuidePanel
          mode={selectedCardId ? 'card' : 'step'}
          collapsed={guideCollapsed}
          stepKey={currentStep}
          guide={stepGuide}
          selectedCard={selectedCardId ? cards.find(c => c.id === selectedCardId) ?? null : null}
          members={members}
          onToggleCollapse={() => setGuideCollapsed(v => !v)}
          onDeselect={() => setSelectedCardId(null)}
          onChangeCardType={handleChangeCardType}
          onChangeCardCustomLabel={handleChangeCardCustomLabel}
          onChangeCardText={handleUpdateCardText}
          onTogglePriority={handleTogglePriority}
          onDuplicateCard={handleDuplicateCard}
          onDeleteCard={handleDeleteCard}
          onCreateCard={handleCreateCardFromForm}
        />
      </div>

      {showSummary && (
        <SessionSummaryModal
          session={session}
          cards={cards}
          onClose={() => setShowSummary(false)}
          onMarkFinished={handleMarkFinished}
        />
      )}

      {/* Responsive guard — narrow viewports shrink the side panels so the
          canvas stays usable. On phone widths the guide collapses to 0 and
          opens via the right-panel "Back to step" UX. */}
      <style>{`
        @media (max-width: 1100px) {
          .session-workspace-grid { grid-template-columns: ${sidebarCollapsed ? '3.5rem' : '13rem'} minmax(0, 1fr) 17rem !important; }
        }
        @media (max-width: 880px) {
          .session-workspace-grid { grid-template-columns: 3.5rem minmax(0, 1fr) 0 !important; }
        }
      `}</style>
    </div>
  )
}

// ── Bits ────────────────────────────────────────────────────────────────────

function SaveBadge({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  const meta = status === 'saving'
    ? { label: 'Saving…', color: '#94a3b8' }
    : status === 'saved'
    ? { label: 'Saved',    color: '#059669' }
    :                       { label: 'Save failed', color: '#dc2626' }
  return (
    <span style={{ fontSize: '0.7rem', color: meta.color, fontWeight: 500 }}>
      {meta.label}
    </span>
  )
}

function topBarButtonStyle(): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center',
    fontSize: '0.78rem', fontWeight: 700,
    padding: '0.45rem 0.85rem',
    borderRadius: '0.5rem',
    background: '#fff',
    color: '#0d1f35',
    border: '1px solid rgba(26,107,191,0.18)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  }
}
