/**
 * GET /api/sessions/[id]/export
 *
 * Returns a print-ready HTML document styled as an IdeaFlow Session export.
 * Mirrors the pattern used by /api/reports/summary — the client opens the URL
 * in a new tab; the page auto-triggers window.print(). The browser's native
 * "Save as PDF" produces the final file. No PDF dependency required.
 *
 * Includes:
 *   • Session title, framework/template name, created date, status badge.
 *   • Session outcome — Top Insight / Key Decision / Biggest Risk / Next Actions
 *     (derived from cards via the same logic SessionSummaryCard uses).
 *   • Cards grouped by type (Problem, Audience, Cause, Idea, Risk, Decision,
 *     Task, Custom).
 *   • Connections list as "Source card → Target card".
 *   • Footer: "Exported from IdeaFlow".
 *
 * Draft sessions (status='active') are allowed — the page reads "Draft
 * session" instead of "Finished".
 *
 * Auth: only sessions in the requesting user's company are returned; the same
 * RLS rules apply as in the regular Supabase client path.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CARD_TYPE_META, cardChipLabel } from '@/lib/sessions/cardTypes'
import { getTemplate } from '@/lib/sessions/templates'
import { deriveOutcomes } from '@/components/sessions/SessionSummaryCard'
import type {
  CardType, Session, SessionCard, SessionConnection,
} from '@/types/sessions'

const T = {
  ink:        '#0d1f35',
  slate:      '#3d4758',
  muted:      '#5d667a',
  faint:      '#9faab8',
  border:     '#e8ecf0',
  bg:         '#fbfaf7',
  surface:    '#ffffff',
  orange:     '#c2540a',
  orangeBg:   'rgba(249,115,22,0.06)',
}

// Card display order on the printed page — same as the picker chip order.
const TYPE_ORDER: CardType[] = [
  'problem', 'audience', 'cause', 'idea', 'risk', 'decision', 'task', 'custom',
]

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function slugify(input: string): string {
  const s = (input || 'untitled').toLowerCase().trim()
  const slug = s
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return slug || 'untitled'
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

// ── Page renderers ──────────────────────────────────────────────────────────

function statusBadge(status: Session['status']): string {
  const meta =
    status === 'finished' ? { label: 'Finished',    color: '#065f46', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.22)' } :
    status === 'archived' ? { label: 'Archived',    color: '#475569', bg: 'rgba(0,0,0,0.04)',      border: 'rgba(0,0,0,0.10)' } :
                            { label: 'Draft session', color: '#c2540a', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.22)' }
  return `<span style="display:inline-flex;align-items:center;gap:6px;
    font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;
    background:${meta.bg};color:${meta.color};border:1px solid ${meta.border};
    border-radius:999px;padding:3px 9px;white-space:nowrap;">
    ${meta.label}
  </span>`
}

function chip(text: string, accent: string, bg: string, ink: string): string {
  return `<span style="display:inline-block;font-size:9.5px;font-weight:800;
    letter-spacing:0.08em;text-transform:uppercase;
    background:${bg};color:${ink};border:1px solid ${accent}33;
    padding:2px 7px;border-radius:999px;">${escapeHtml(text)}</span>`
}

function cardBlock(card: SessionCard, likeCount: number): string {
  const meta  = CARD_TYPE_META[card.type]
  const label = cardChipLabel(card)
  const star  = card.priority > 0
    ? `<span style="display:inline-block;color:#b45309;font-weight:800;margin-left:6px;">★</span>`
    : ''
  const heart = likeCount > 0
    ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:700;
        color:#c2540a;background:rgba(249,115,22,0.08);
        border:1px solid rgba(249,115,22,0.22);border-radius:999px;padding:2px 7px;margin-left:auto;">
        <span style="color:#f97316;">♥</span> ${likeCount}
      </span>`
    : ''
  const content = card.content?.trim()
    ? `<p style="margin:6px 0 0 0;font-size:11.5px;color:${T.muted};line-height:1.6;">${escapeHtml(card.content)}</p>`
    : ''
  return `<div style="border:1px solid ${T.border};border-left:3px solid ${meta.accent};
    border-radius:6px;padding:10px 12px;margin-bottom:8px;background:${T.surface};break-inside:avoid;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
      ${chip(label, meta.accent, meta.bg, meta.ink)}
      ${star}
      ${heart}
    </div>
    <p style="margin:0;font-size:12.5px;font-weight:700;color:${T.ink};line-height:1.4;">
      ${escapeHtml(card.title || '(untitled)')}
    </p>
    ${content}
  </div>`
}

function outcomeBlock(card: SessionCard | null, emptyHint: string, accent = false): string {
  if (!card) {
    return `<p style="margin:0;font-size:11.5px;color:${T.faint};font-style:italic;">${emptyHint}</p>`
  }
  const detail = card.content?.trim()
    ? `<p style="margin:4px 0 0 0;font-size:11px;color:${T.muted};line-height:1.55;">${escapeHtml(card.content)}</p>`
    : ''
  return `<div style="background:${accent ? T.orangeBg : 'rgba(15,23,42,0.025)'};
    border:1px solid ${accent ? 'rgba(249,115,22,0.18)' : 'rgba(15,23,42,0.06)'};
    border-radius:6px;padding:9px 11px;">
    <p style="margin:0;font-size:12px;font-weight:700;color:${T.ink};line-height:1.4;">
      ${escapeHtml(card.title || '(untitled)')}
    </p>
    ${detail}
  </div>`
}

function nextActionsBlock(tasks: SessionCard[]): string {
  if (tasks.length === 0) {
    return `<p style="margin:0;font-size:11.5px;color:${T.faint};font-style:italic;">
      No tasks yet — add some in the Action plan step.
    </p>`
  }
  return `<ul style="list-style:none;padding:0;margin:0;display:block;">
    ${tasks.map(t => `
      <li style="background:rgba(15,23,42,0.025);
        border:1px solid rgba(15,23,42,0.06);
        border-radius:6px;padding:7px 10px;margin-bottom:6px;
        display:flex;gap:8px;align-items:flex-start;">
        <span style="flex-shrink:0;margin-top:3px;width:11px;height:11px;
          border:1px solid rgba(15,23,42,0.25);border-radius:2px;display:inline-block;"></span>
        <div>
          <p style="margin:0;font-size:12px;font-weight:600;color:${T.ink};line-height:1.4;">
            ${escapeHtml(t.title || '(untitled)')}
          </p>
          ${t.content?.trim()
            ? `<p style="margin:3px 0 0 0;font-size:11px;color:${T.muted};line-height:1.55;">${escapeHtml(t.content)}</p>`
            : ''}
        </div>
      </li>`).join('')}
  </ul>`
}

function sectionHeader(label: string): string {
  return `<p style="margin:0 0 8px 0;font-size:9.5px;font-weight:800;letter-spacing:0.12em;
    text-transform:uppercase;color:${T.faint};">${escapeHtml(label)}</p>`
}

// ─── Route handler ──────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // The new tables are not in the generated Database type — mirrors the cast
  // pattern in lib/sessions/store.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  // 1. Session — RLS already scopes by company.
  const sessionRes = await sb.from('sessions').select('*').eq('id', id).maybeSingle()
  if (sessionRes.error) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
  if (!sessionRes.data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const session = sessionRes.data as Session

  // 2. Children in parallel.
  const [cardsRes, connectionsRes] = await Promise.all([
    sb.from('session_cards').select('*').eq('session_id', id).order('created_at', { ascending: true }),
    sb.from('session_connections').select('*').eq('session_id', id),
  ])

  const cards       = (cardsRes.data       ?? []) as SessionCard[]
  const connections = (connectionsRes.data ?? []) as SessionConnection[]
  const outcomes    = deriveOutcomes(cards)
  const template    = getTemplate(session.template_type)

  // 3. Likes — fetched once, grouped client-side. Shown as ♥ + count next to
  //    each card, and used to sort Brainstorm Circle members by popularity.
  const likeCounts: Record<string, number> = {}
  if (cards.length > 0) {
    const likesRes = await sb
      .from('session_card_likes')
      .select('card_id')
      .in('card_id', cards.map(c => c.id))
    type LikeRow = { card_id: string }
    for (const row of ((likesRes.data ?? []) as LikeRow[])) {
      likeCounts[row.card_id] = (likeCounts[row.card_id] ?? 0) + 1
    }
  }
  const isCircle = session.template_type === 'brainstorm-circle'

  // 3. Build the HTML page.
  const filename = `ideaflow-session-${slugify(session.title)}.pdf`
  const exportedAt = new Date().toLocaleString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const cardLookup = new Map(cards.map(c => [c.id, c]))
  // For Brainstorm Circle the most useful ordering is "most-liked first" so
  // the reader sees the team's favourite ideas at the top. For other
  // templates we keep creation order so the narrative reads naturally.
  function rowsFor(type: CardType): SessionCard[] {
    const rows = cards.filter(c => c.type === type)
    if (isCircle && type === 'custom') {
      return [...rows].sort((a, b) => (likeCounts[b.id] ?? 0) - (likeCounts[a.id] ?? 0))
    }
    return rows
  }
  const grouped: Array<{ type: CardType; rows: SessionCard[] }> = TYPE_ORDER
    .map(type => ({ type, rows: rowsFor(type) }))
    .filter(g => g.rows.length > 0)

  const connectionsList = connections
    .map(c => {
      const a = cardLookup.get(c.source_card_id)
      const b = cardLookup.get(c.target_card_id)
      if (!a || !b) return null
      const aLabel = a.title?.trim() || cardChipLabel(a)
      const bLabel = b.title?.trim() || cardChipLabel(b)
      return `<li style="margin:0 0 6px 0;font-size:11.5px;color:${T.slate};line-height:1.55;">
        <span style="color:${T.ink};font-weight:600;">${escapeHtml(aLabel)}</span>
        <span style="color:${T.faint};margin:0 6px;">→</span>
        <span style="color:${T.ink};font-weight:600;">${escapeHtml(bLabel)}</span>
        ${c.label ? `<span style="color:${T.faint};margin-left:6px;">(${escapeHtml(c.label)})</span>` : ''}
      </li>`
    })
    .filter(Boolean)
    .join('')

  const html = /* html */`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(filename)}</title>
  <style>
    @page { size: A4; margin: 18mm 16mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    body {
      margin: 0; padding: 0;
      font-family: 'DM Sans', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      color: ${T.ink};
      background: ${T.bg};
    }
    .page { max-width: 820px; margin: 0 auto; padding: 24px 32px 40px; }
    h1 { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 28px; letter-spacing: -0.02em; margin: 0; line-height: 1.15; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: ${T.faint}; margin: 0 0 10px 0; font-weight: 800; }
    .meta { color: ${T.muted}; font-size: 11.5px; }
    .row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    section { margin-top: 28px; break-inside: avoid; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 720px) { .grid-2 { grid-template-columns: 1fr; } }
    .topbar {
      background: ${T.surface};
      border: 1px solid ${T.border};
      border-radius: 10px;
      padding: 16px 18px;
    }
    .footer {
      margin-top: 40px; padding-top: 14px; border-top: 1px solid ${T.border};
      font-size: 10.5px; color: ${T.faint}; display: flex; justify-content: space-between; gap: 12px;
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:${T.surface};border-bottom:1px solid ${T.border};padding:8px 16px;text-align:center;font-size:11.5px;color:${T.muted};">
    Press <strong style="color:${T.ink};">Cmd/Ctrl + P</strong> and choose <strong style="color:${T.ink};">Save as PDF</strong>. The print dialog should open automatically.
  </div>

  <div class="page">

    <div class="topbar">
      <div class="row" style="margin-bottom: 10px;">
        ${statusBadge(session.status)}
        <span style="font-size:11px;color:${T.faint};">${template.emoji} ${escapeHtml(template.name)} session</span>
        <span style="font-size:11px;color:${T.faint};">·</span>
        <span style="font-size:11px;color:${T.faint};">Created ${fmtDate(session.created_at)}</span>
      </div>
      <h1>${escapeHtml(session.title || 'Untitled session')}</h1>
    </div>

    <section>
      <h2>Session outcome</h2>
      <div class="grid-2">
        <div>
          <p style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.orange};margin:0 0 6px 0;">Top insight</p>
          ${outcomeBlock(outcomes.topInsight, 'Star an Idea card to feature it here.', true)}
        </div>
        <div>
          <p style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.faint};margin:0 0 6px 0;">Key decision</p>
          ${outcomeBlock(outcomes.keyDecision, 'No decision yet.')}
        </div>
        <div>
          <p style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.faint};margin:0 0 6px 0;">Biggest risk</p>
          ${outcomeBlock(outcomes.biggestRisk, 'No risks flagged.')}
        </div>
        <div>
          <p style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.faint};margin:0 0 6px 0;">Next actions</p>
          ${nextActionsBlock(outcomes.nextActions)}
        </div>
      </div>
    </section>

    ${grouped.length === 0 ? '' : `
    <section>
      <h2>Cards</h2>
      ${grouped.map(g => `
        <div style="margin-bottom: 16px;">
          ${sectionHeader(CARD_TYPE_META[g.type].label)}
          ${g.rows.map(c => cardBlock(c, likeCounts[c.id] ?? 0)).join('')}
        </div>
      `).join('')}
    </section>`}

    ${connectionsList ? `
    <section>
      <h2>Connections</h2>
      <ul style="list-style:none;padding:0;margin:0;">
        ${connectionsList}
      </ul>
    </section>` : ''}

    <div class="footer">
      <span>Exported from IdeaFlow</span>
      <span>${escapeHtml(exportedAt)}</span>
    </div>
  </div>

  <script>
    // Open the print dialog automatically on load so the user can choose
    // "Save as PDF" without an extra click. The Content-Disposition header
    // is "inline" so the page renders in the browser tab.
    window.addEventListener('load', () => { window.print() })
  </script>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Inline rather than attachment — the page must render in the tab so
      // window.print() works. Save filename via the document title.
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
