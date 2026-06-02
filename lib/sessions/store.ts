// ─────────────────────────────────────────────────────────────────────────────
// Sessions store — real Supabase persistence.
//
// Drop-in replacement for the previous localStorage mockStore. Every exported
// function keeps the same signature so the components didn't need to change
// shape — only their import path.
//
// Auth model (enforced by RLS in supabase-migration-sessions.sql):
//   • sessions are owned by user_id inside company_id
//   • the owner can read/insert/update/delete
//   • other members of the same company can read but not write
//
// The userId / companyId args remain in the function signatures even though
// RLS would technically allow us to drop some of them — keeping them means:
//   • create-side queries can populate user_id / company_id without an extra
//     auth.getUser() round-trip
//   • we can fail fast in pure data-bug cases instead of leaning on RLS
//     errors for control flow
//
// Errors:
//   • Functions that returned `Promise<X | null>` in the mock still return null
//     on "not found" or known-benign constraint violations (e.g. duplicate
//     connection).
//   • Functions that returned `Promise<X>` (non-null) throw on any DB error,
//     matching the previous "always succeeds" semantics so existing call
//     sites don't have to grow new null-handling code.
//
// Note: the Database type in types/database.ts doesn't yet include the new
// session_* tables (the generated types are stale until you re-generate).
// We cast through `as any` for those queries — the same pattern the rest of
// the project uses for tables added after the last codegen.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/client'
import { STEP_ORDER } from './templates'
import type {
  Session, SessionCard, SessionConnection, SessionStepRow,
  SessionDetail, SessionMember, TemplateType, CardType, StepKey,
} from '@/types/sessions'

// Postgres duplicate-key error
const PG_UNIQUE_VIOLATION = '23505'

function db() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient() as any
}

function throwIfError(err: { message?: string } | null, op: string): void {
  if (!err) return
  // Surface to the dev console — components don't currently render errors,
  // they just optimistically apply state. A console.error keeps debugging
  // possible without changing the UI contract.
  // eslint-disable-next-line no-console
  console.error(`[sessions] ${op} failed:`, err)
  throw new Error(`[sessions] ${op}: ${err.message ?? 'unknown error'}`)
}

// ── Sessions ─────────────────────────────────────────────────────────────────

export async function listSessions(_userId: string, _companyId: string): Promise<Session[]> {
  // RLS already restricts the select to the current company. Filtering by
  // companyId in the query as well is redundant but cheap, and lets the
  // function continue to "work" if a future RLS migration is loosened.
  const { data, error } = await db()
    .from('sessions')
    .select('*')
    .order('updated_at', { ascending: false })
  throwIfError(error, 'listSessions')
  return (data ?? []) as Session[]
}

export async function getSession(userId: string, sessionId: string): Promise<SessionDetail | null> {
  const supabase = db()

  // Fetch session metadata first so we can scope the profiles query to its
  // company. Then in parallel pull every child resource.
  const sessionRes = await supabase
    .from('sessions').select('*').eq('id', sessionId).maybeSingle()
  if (sessionRes.error) throwIfError(sessionRes.error, 'getSession')
  if (!sessionRes.data) return null

  const session = sessionRes.data as Session

  const [cardsRes, connectionsRes, stepsRes, profilesRes] = await Promise.all([
    supabase.from('session_cards').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }),
    supabase.from('session_connections').select('*').eq('session_id', sessionId),
    supabase.from('session_steps').select('*').eq('session_id', sessionId),
    // Workspace member directory — used to render card avatar initials and
    // the "Admin / Member" hint without re-querying per card.
    supabase.from('profiles').select('id, full_name, role').eq('company_id', session.company_id),
  ])

  throwIfError(cardsRes.error,       'getSession.cards')
  throwIfError(connectionsRes.error, 'getSession.connections')
  throwIfError(stepsRes.error,       'getSession.steps')
  throwIfError(profilesRes.error,    'getSession.profiles')

  const members: Record<string, SessionMember> = {}
  type ProfileRow = { id: string; full_name: string | null; role: string }
  for (const row of ((profilesRes.data ?? []) as ProfileRow[])) {
    members[row.id] = { id: row.id, fullName: row.full_name, role: row.role }
  }

  // Likes — one extra query, grouped client-side. Skip entirely on sessions
  // that have no cards.
  const cards = (cardsRes.data ?? []) as SessionCard[]
  const cardIds = cards.map(c => c.id)
  const likeCounts: Record<string, number> = {}
  const myLikes:    Set<string>            = new Set()
  if (cardIds.length > 0) {
    const likesRes = await supabase
      .from('session_card_likes')
      .select('card_id, user_id')
      .in('card_id', cardIds)
    throwIfError(likesRes.error, 'getSession.likes')
    type LikeRow = { card_id: string; user_id: string }
    for (const row of ((likesRes.data ?? []) as LikeRow[])) {
      likeCounts[row.card_id] = (likeCounts[row.card_id] ?? 0) + 1
      if (row.user_id === userId) myLikes.add(row.card_id)
    }
  }

  return {
    session,
    cards,
    connections: (connectionsRes.data ?? []) as SessionConnection[],
    steps:       (stepsRes.data       ?? []) as SessionStepRow[],
    members,
    likeCounts,
    myLikes,
  }
}

// ── Likes ────────────────────────────────────────────────────────────────────

/**
 * Toggle the current user's like on a card. If `currentlyLiked` is true the
 * row is deleted; otherwise it's inserted. Returns the new state so the
 * caller can update local state without an extra fetch.
 *
 * Idempotent: if the user double-clicks the heart, the second call's outcome
 * is whatever the unique constraint allows (insert silently ignored, delete
 * removes nothing) — local state stays correct.
 */
export async function toggleLike(args: {
  userId:          string
  cardId:          string
  currentlyLiked:  boolean
}): Promise<{ liked: boolean }> {
  const supabase = db()
  if (args.currentlyLiked) {
    const { error } = await supabase
      .from('session_card_likes')
      .delete()
      .eq('card_id', args.cardId)
      .eq('user_id', args.userId)
    throwIfError(error, 'toggleLike.delete')
    return { liked: false }
  } else {
    const { error } = await supabase
      .from('session_card_likes')
      .insert({ card_id: args.cardId, user_id: args.userId })
    // Duplicate insert (the user already liked) is benign — treat as liked.
    if (error && (error as { code?: string }).code !== PG_UNIQUE_VIOLATION) {
      throwIfError(error, 'toggleLike.insert')
    }
    return { liked: true }
  }
}

export async function createSession(args: {
  userId:       string
  companyId:    string
  title:        string
  templateType: TemplateType
}): Promise<Session> {
  const supabase = db()

  // Insert the session, then seed the 5 step rows in a second insert. Doing
  // both together with a single RPC would be neater but isn't worth a
  // dedicated function for an MVP.
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      company_id:    args.companyId,
      user_id:       args.userId,
      title:         args.title,
      template_type: args.templateType,
      status:        'active',
    })
    .select()
    .single()
  throwIfError(error, 'createSession')
  if (!session) throw new Error('[sessions] createSession returned no row')

  const stepRows = STEP_ORDER.map(key => ({
    session_id: (session as Session).id,
    step_key:   key,
    completed:  false,
  }))
  const { error: stepError } = await supabase.from('session_steps').insert(stepRows)
  throwIfError(stepError, 'createSession.steps')

  return session as Session
}

export async function updateSession(
  _userId: string, sessionId: string,
  patch: Partial<Pick<Session, 'title' | 'status' | 'summary'>>,
): Promise<Session | null> {
  if (Object.keys(patch).length === 0) {
    // Avoid an empty UPDATE — return the current row so callers see the same
    // shape they got from the mock.
    const { data } = await db().from('sessions').select('*').eq('id', sessionId).maybeSingle()
    return (data ?? null) as Session | null
  }
  const { data, error } = await db()
    .from('sessions')
    .update(patch)
    .eq('id', sessionId)
    .select()
    .maybeSingle()
  throwIfError(error, 'updateSession')
  return (data ?? null) as Session | null
}

export async function deleteSession(_userId: string, sessionId: string): Promise<void> {
  const { error } = await db().from('sessions').delete().eq('id', sessionId)
  throwIfError(error, 'deleteSession')
}

// ── Cards ────────────────────────────────────────────────────────────────────

export async function createCard(args: {
  userId:       string
  sessionId:    string
  type:         CardType
  title?:       string
  content?:     string | null
  x?:           number
  y?:           number
  /** Required when type='custom'; ignored otherwise. */
  customLabel?: string | null
}): Promise<SessionCard> {
  const { data, error } = await db()
    .from('session_cards')
    .insert({
      session_id:   args.sessionId,
      type:         args.type,
      title:        args.title   ?? '',
      content:      args.content ?? null,
      x:            args.x ?? 80 + Math.random() * 200,
      y:            args.y ?? 80 + Math.random() * 200,
      priority:     0,
      custom_label: args.type === 'custom' ? (args.customLabel ?? null) : null,
      // Attribute the card to whoever is creating it. Falls back to null so
      // the row still inserts cleanly even if userId is somehow empty.
      created_by:   args.userId || null,
    })
    .select()
    .single()
  throwIfError(error, 'createCard')
  if (!data) throw new Error('[sessions] createCard returned no row')
  return data as SessionCard
}

/**
 * Duplicate a card — spawns a new card with the same type/title/content and
 * priority, offset slightly from the original so the user can see both at
 * once. The new card is attributed to the duplicating user, not the original
 * author, so card history reflects who pressed the button.
 */
export async function duplicateCard(args: {
  userId:    string
  sessionId: string
  source:    SessionCard
}): Promise<SessionCard> {
  return createCard({
    userId:      args.userId,
    sessionId:   args.sessionId,
    type:        args.source.type,
    title:       args.source.title ? `${args.source.title} (copy)` : '',
    content:     args.source.content,
    x:           args.source.x + 32,
    y:           args.source.y + 32,
    customLabel: args.source.custom_label,
  })
}

export async function updateCard(
  _userId: string, cardId: string,
  patch: Partial<Pick<SessionCard, 'title' | 'content' | 'x' | 'y' | 'priority' | 'type' | 'custom_label'>>,
): Promise<SessionCard | null> {
  if (Object.keys(patch).length === 0) {
    const { data } = await db().from('session_cards').select('*').eq('id', cardId).maybeSingle()
    return (data ?? null) as SessionCard | null
  }
  const { data, error } = await db()
    .from('session_cards')
    .update(patch)
    .eq('id', cardId)
    .select()
    .maybeSingle()
  throwIfError(error, 'updateCard')
  return (data ?? null) as SessionCard | null
}

export async function deleteCard(_userId: string, cardId: string): Promise<void> {
  // session_connections has ON DELETE CASCADE on both source/target columns,
  // so connection rows touching this card get cleaned up automatically.
  const { error } = await db().from('session_cards').delete().eq('id', cardId)
  throwIfError(error, 'deleteCard')
}

// ── Connections ──────────────────────────────────────────────────────────────

export async function createConnection(args: {
  userId:    string
  sessionId: string
  sourceId:  string
  targetId:  string
  label?:    string
}): Promise<SessionConnection | null> {
  if (args.sourceId === args.targetId) return null   // matches the CHECK constraint

  const { data, error } = await db()
    .from('session_connections')
    .insert({
      session_id:     args.sessionId,
      source_card_id: args.sourceId,
      target_card_id: args.targetId,
      label:          args.label ?? null,
    })
    .select()
    .maybeSingle()

  // Duplicate connection — the (session_id, source, target) unique index will
  // reject it. That's a known benign case (user double-clicked); return null.
  if (error && (error as { code?: string }).code === PG_UNIQUE_VIOLATION) return null
  throwIfError(error, 'createConnection')
  return (data ?? null) as SessionConnection | null
}

export async function deleteConnection(_userId: string, connectionId: string): Promise<void> {
  const { error } = await db().from('session_connections').delete().eq('id', connectionId)
  throwIfError(error, 'deleteConnection')
}

// ── Steps ────────────────────────────────────────────────────────────────────

export async function updateStep(
  _userId: string, sessionId: string, key: StepKey, completed: boolean,
): Promise<SessionStepRow | null> {
  // Update the row matching (session_id, step_key). The unique index guarantees
  // at most one row per pair so we don't need a row-id round-trip.
  const { data, error } = await db()
    .from('session_steps')
    .update({ completed })
    .eq('session_id', sessionId)
    .eq('step_key',   key)
    .select()
    .maybeSingle()
  throwIfError(error, 'updateStep')
  return (data ?? null) as SessionStepRow | null
}
