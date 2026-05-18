/**
 * GET /api/reports/summary
 *
 * Returns a print-ready HTML document styled as an IdeaFlow PDF report.
 * The client opens it in a new tab; the page auto-triggers window.print().
 * The browser's native Print → Save as PDF produces the final file.
 *
 * Guards:
 *   - Must be authenticated
 *   - Must be an admin
 *   - Company must be on the 'pro' plan
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyReportData } from '@/lib/reports/getCompanyReportData'

// ── Shared design tokens (mirrors dashboard/demo palette) ────────────────────
const T = {
  ink:        '#0d1f35',
  slate:      '#64748b',
  muted:      '#9ab0c8',
  border:     '#e8ecf0',
  bg:         '#f8fafc',
  surface:    '#ffffff',
  orange:     '#f97316',
  orangeDim:  '#c2540a',
}

// ── Status badge — matches StatusBadge component ─────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  open:    { bg: 'rgba(26,107,191,0.06)',  color: '#1a6bbf', border: 'rgba(26,107,191,0.18)', label: 'Open'    },
  planned: { bg: 'rgba(249,115,22,0.07)',  color: '#c2540a', border: 'rgba(249,115,22,0.20)', label: 'Planned' },
}

function statusBadgeHtml(status: string): string {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.open
  return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;
    background:${s.bg};color:${s.color};border:1px solid ${s.border};
    border-radius:999px;padding:2px 7px;white-space:nowrap;">
    <span style="width:4px;height:4px;border-radius:50%;background:${s.color};display:inline-block;"></span>
    ${s.label}
  </span>`
}

// ── Like pill — heart icon matching IdeaCard component ───────────────────────
function votePillHtml(count: number): string {
  return `<span style="display:inline-flex;align-items:center;gap:4px;
    font-size:11px;font-weight:700;color:${T.slate};
    background:rgba(26,107,191,0.05);border:1.5px solid rgba(26,107,191,0.14);
    border-radius:7px;padding:3px 9px;white-space:nowrap;">
    ♥ ${count}
  </span>`
}

function buildHtml(data: Awaited<ReturnType<typeof getCompanyReportData>>): string {
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(data.reportDate))

  // ── Top ideas rows ──────────────────────────────────────────────────────────
  const topIdeasRows = data.topIdeas.length === 0
    ? `<tr><td colspan="3" style="padding:14px 0;font-size:11.5px;color:${T.muted};font-style:italic;">
        No ideas submitted yet.
       </td></tr>`
    : data.topIdeas.map((idea, i) => `
        <tr style="border-bottom:1px solid ${T.border};">
          <td style="padding:11px 0 11px;vertical-align:top;width:28px;">
            ${votePillHtml(idea.likes_count)}
          </td>
          <td style="padding:11px 12px;vertical-align:top;">
            <p style="font-size:12.5px;font-weight:700;color:${T.ink};margin:0 0 3px;letter-spacing:-0.01em;line-height:1.3;">
              ${escapeHtml(idea.title)}
            </p>
            ${idea.description
              ? `<p style="font-size:11px;color:${T.slate};margin:0;line-height:1.5;">
                   ${escapeHtml(truncate(idea.description, 130))}
                 </p>`
              : ''}
          </td>
          <td style="padding:11px 0;vertical-align:top;text-align:right;">
            ${statusBadgeHtml(idea.status)}
          </td>
        </tr>
      `).join('')

  // ── Participation summary text ──────────────────────────────────────────────
  const participationPct = data.totalMembers > 0
    ? Math.round((data.activeMembers / data.totalMembers) * 100)
    : 0
  const summaryText = [
    `${data.activeMembers} of ${data.totalMembers} member${data.totalMembers !== 1 ? 's' : ''} contributed ideas (${participationPct}% participation).`,
    `${data.totalIdeas} idea${data.totalIdeas !== 1 ? 's' : ''} · ${data.totalLikes} vote${data.totalLikes !== 1 ? 's' : ''} · ${data.avgLikesPerIdea} avg votes per idea.`,
    data.ideasThisWeek > 0
      ? `${data.ideasThisWeek} new idea${data.ideasThisWeek !== 1 ? 's' : ''} this week.`
      : 'No new ideas posted this week.',
  ].join('  ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>IdeaFlow Report — ${escapeHtml(data.companyName)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', system-ui, Arial, sans-serif;
      background: ${T.bg};
      color: ${T.ink};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 15mm 18mm 14mm;
      background: ${T.surface};
    }

    /* ── Header ─────────────────────────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 14px;
      border-bottom: 1px solid ${T.border};
      margin-bottom: 22px;
    }
    .logo-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-mark {
      width: 26px;
      height: 26px;
      background: linear-gradient(135deg, #f97316, #ea580c);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .logo-text {
      font-size: 15px;
      font-weight: 800;
      color: ${T.ink};
      letter-spacing: -0.025em;
    }
    .logo-text span { color: ${T.orange}; }
    .header-meta {
      text-align: right;
      font-size: 10.5px;
      color: ${T.muted};
      line-height: 1.5;
    }
    .header-meta strong {
      display: block;
      font-size: 12px;
      color: ${T.ink};
      font-weight: 700;
      margin-bottom: 1px;
    }

    /* ── Report title ───────────────────────────────────────────────────────── */
    .report-title {
      margin-bottom: 20px;
    }
    .eyebrow {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      color: ${T.muted};
      margin-bottom: 4px;
    }
    .report-title h1 {
      font-size: 20px;
      font-weight: 800;
      color: ${T.ink};
      letter-spacing: -0.025em;
      line-height: 1.2;
    }

    /* ── Stats row ──────────────────────────────────────────────────────────── */
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
      margin-bottom: 24px;
      border: 1px solid ${T.border};
      border-radius: 10px;
      overflow: hidden;
    }
    .stat-cell {
      padding: 13px 16px;
      border-right: 1px solid ${T.border};
    }
    .stat-cell:last-child { border-right: none; }
    .stat-value {
      font-size: 22px;
      font-weight: 800;
      color: ${T.ink};
      letter-spacing: -0.035em;
      line-height: 1;
      margin-bottom: 3px;
    }
    .stat-label {
      font-size: 10px;
      font-weight: 600;
      color: ${T.muted};
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .stat-sub {
      font-size: 9.5px;
      color: ${T.muted};
      margin-top: 1px;
    }

    /* ── Section ────────────────────────────────────────────────────────────── */
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: ${T.muted};
      margin-bottom: 10px;
      padding-bottom: 7px;
      border-bottom: 1px solid ${T.border};
    }

    /* ── Ideas table ────────────────────────────────────────────────────────── */
    .ideas-table {
      width: 100%;
      border-collapse: collapse;
    }
    .ideas-table th {
      text-align: left;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${T.muted};
      padding-bottom: 7px;
      border-bottom: 1px solid ${T.border};
    }
    .ideas-table th:last-child { text-align: right; }

    /* ── Participation summary ──────────────────────────────────────────────── */
    .summary-row {
      border: 1px solid ${T.border};
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
    }
    .summary-row p {
      font-size: 11.5px;
      color: ${T.slate};
      line-height: 1.65;
    }

    /* ── Footer ─────────────────────────────────────────────────────────────── */
    .footer {
      border-top: 1px solid ${T.border};
      padding-top: 10px;
      margin-top: 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 9.5px;
      color: ${T.muted};
    }

    @media print {
      body { background: #fff; }
      .page { margin: 0; padding: 12mm 15mm; box-shadow: none; border-radius: 0; }
    }

    @media screen {
      .page {
        margin: 24px auto;
        box-shadow: 0 2px 20px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
        border-radius: 6px;
      }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <div class="logo-row">
        <div class="logo-mark">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
            <path d="M9 21h6"/>
          </svg>
        </div>
        <span class="logo-text">Idea<span>Flow</span></span>
      </div>
      <div class="header-meta">
        <strong>${escapeHtml(data.companyName)}</strong>
        Generated ${date}
      </div>
    </div>

    <!-- Report title -->
    <div class="report-title">
      <p class="eyebrow">Workspace report</p>
      <h1>${escapeHtml(data.companyName)}</h1>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-cell">
        <div class="stat-value">${data.totalIdeas}</div>
        <div class="stat-label">Ideas</div>
      </div>
      <div class="stat-cell">
        <div class="stat-value">${data.totalLikes}</div>
        <div class="stat-label">Votes</div>
        <div class="stat-sub">${data.avgLikesPerIdea} avg per idea</div>
      </div>
      <div class="stat-cell">
        <div class="stat-value">${data.totalMembers}</div>
        <div class="stat-label">Members</div>
        <div class="stat-sub">${data.activeMembers} contributed</div>
      </div>
      <div class="stat-cell">
        <div class="stat-value">${data.ideasThisWeek}</div>
        <div class="stat-label">This week</div>
      </div>
    </div>

    <!-- Participation summary -->
    <div class="summary-row">
      <p>${summaryText}</p>
    </div>

    <!-- Top ideas -->
    <div class="section">
      <div class="section-title">Top ideas by votes</div>
      <table class="ideas-table">
        <thead>
          <tr>
            <th style="width:56px;">Votes</th>
            <th>Idea</th>
            <th style="text-align:right;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${topIdeasRows}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span>IdeaFlow · ${escapeHtml(data.companyName)}</span>
      <span>useideaflow.com</span>
    </div>

  </div>

  <script>
    window.addEventListener('load', () => { window.print() })
  </script>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str
  return str.slice(0, len).trimEnd() + '…'
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 403 })
    }

    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check plan
    const { data: company } = await (supabase as any)
      .from('companies')
      .select('plan')
      .eq('id', profile.company_id)
      .single()

    const isProPlan = company?.plan === 'pro' || company?.plan === 'pro_plus'
    if (!isProPlan) {
      return NextResponse.json(
        { error: 'PDF executive reports are a Pro feature. Upgrade to Pro to access this.' },
        { status: 403 }
      )
    }

    const reportData = await getCompanyReportData(profile.company_id)
    const html = buildHtml(reportData)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Instruct browser to handle as a document, not a download
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[api/reports/summary]', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
