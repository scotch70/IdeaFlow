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

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending:     'Pending review',
    reviewed:    'Reviewed',
    approved:    'Approved',
    implemented: 'Implemented',
    rejected:    'Not moving forward',
  }
  return map[status] ?? status
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    implemented: '#059669',
    approved:    '#0e52a8',
    reviewed:    '#7c3aed',
    rejected:    '#dc2626',
    pending:     '#6b7280',
  }
  return map[status] ?? '#6b7280'
}

function buildHtml(data: Awaited<ReturnType<typeof getCompanyReportData>>): string {
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(data.reportDate))

  const topIdeasRows = data.topIdeas.length === 0
    ? '<tr><td colspan="4" style="color:#6b7280;font-style:italic;padding:12px 0;">No ideas submitted yet.</td></tr>'
    : data.topIdeas.map((idea, i) => `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:12px 0;font-size:11px;color:#9ab0c8;font-weight:700;min-width:24px;">${i + 1}</td>
          <td style="padding:12px 8px;">
            <p style="font-size:13px;font-weight:600;color:#0d1f35;margin:0 0 2px;">${escapeHtml(idea.title)}</p>
            ${idea.description ? `<p style="font-size:11.5px;color:#5a7fa8;margin:0;line-height:1.5;">${escapeHtml(truncate(idea.description, 120))}</p>` : ''}
          </td>
          <td style="padding:12px 8px;white-space:nowrap;">
            <span style="font-size:11px;font-weight:600;color:${statusColor(idea.status)};background:${statusColor(idea.status)}18;border-radius:4px;padding:2px 7px;">
              ${statusLabel(idea.status)}
            </span>
          </td>
          <td style="padding:12px 0;text-align:right;white-space:nowrap;">
            <span style="font-size:12px;font-weight:700;color:#f97316;">
              ♥ ${idea.likes_count}
            </span>
          </td>
        </tr>
      `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>IdeaFlow Report — ${escapeHtml(data.companyName)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', Arial, sans-serif;
      background: #f8f9fb;
      color: #0d1f35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 16mm 18mm 16mm;
      background: #ffffff;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 2px solid #f97316;
      margin-bottom: 28px;
    }
    .logo-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-mark {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #f97316, #ea580c);
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-text {
      font-size: 16px;
      font-weight: 800;
      color: #0d1f35;
      letter-spacing: -0.02em;
    }
    .logo-text span { color: #f97316; }
    .header-meta {
      text-align: right;
      font-size: 11px;
      color: #9ab0c8;
    }
    .header-meta strong {
      display: block;
      font-size: 12px;
      color: #0d1f35;
      font-weight: 700;
    }

    /* Report title */
    .report-title {
      margin-bottom: 24px;
    }
    .report-title .eyebrow {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #9ab0c8;
      margin-bottom: 4px;
    }
    .report-title h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0d1f35;
      letter-spacing: -0.025em;
    }

    /* Stats grid */
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: #f8f9fb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 14px 16px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 800;
      color: #0d1f35;
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 10.5px;
      font-weight: 500;
      color: #5a7fa8;
    }
    .stat-sub {
      font-size: 10px;
      color: #9ab0c8;
      margin-top: 2px;
    }

    /* Section */
    .section {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #9ab0c8;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }

    /* Ideas table */
    .ideas-table {
      width: 100%;
      border-collapse: collapse;
    }
    .ideas-table th {
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #9ab0c8;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .ideas-table th:last-child { text-align: right; }

    /* Summary */
    .summary-box {
      background: linear-gradient(135deg, #fff7ed, #ffedd5);
      border: 1px solid rgba(249,115,22,0.2);
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    .summary-box p {
      font-size: 12.5px;
      color: #7c2d12;
      line-height: 1.6;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
      margin-top: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      color: #9ab0c8;
    }

    @media print {
      body { background: #fff; }
      .page { margin: 0; padding: 12mm 16mm; box-shadow: none; }
    }

    @media screen {
      .page {
        margin: 24px auto;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        border-radius: 4px;
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
      <h1>${escapeHtml(data.companyName)} — Idea Report</h1>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${data.totalIdeas}</div>
        <div class="stat-label">Total ideas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.totalMembers}</div>
        <div class="stat-label">Team members</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.totalLikes}</div>
        <div class="stat-label">Total likes</div>
        <div class="stat-sub">${data.avgLikesPerIdea} avg per idea</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.ideasThisWeek}</div>
        <div class="stat-label">Ideas this week</div>
      </div>
    </div>

    <!-- Analytics summary -->
    <div class="summary-box">
      <p>
        ${data.activeMembers} out of ${data.totalMembers} member${data.totalMembers !== 1 ? 's' : ''} have contributed ideas.
        The team has submitted <strong>${data.totalIdeas} idea${data.totalIdeas !== 1 ? 's' : ''}</strong> in total,
        collecting <strong>${data.totalLikes} like${data.totalLikes !== 1 ? 's' : ''}</strong>.
        ${data.ideasThisWeek > 0
          ? `This week alone, <strong>${data.ideasThisWeek} new idea${data.ideasThisWeek !== 1 ? 's' : ''}</strong> have been submitted.`
          : 'No new ideas have been posted this week.'}
      </p>
    </div>

    <!-- Top ideas -->
    <div class="section">
      <div class="section-title">Top 3 ideas by likes</div>
      <table class="ideas-table">
        <thead>
          <tr>
            <th style="width:24px;">#</th>
            <th>Idea</th>
            <th>Status</th>
            <th style="text-align:right;">Likes</th>
          </tr>
        </thead>
        <tbody>
          ${topIdeasRows}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span>IdeaFlow Pro Report · ${escapeHtml(data.companyName)}</span>
      <span>useideaflow.com</span>
    </div>

  </div>

  <script>
    // Auto-print when opened in a new tab. After printing the tab can be closed.
    window.addEventListener('load', () => {
      window.print()
    })
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

    if (company?.plan !== 'pro') {
      return NextResponse.json(
        { error: 'PDF reports are a Pro feature. Upgrade to access this.' },
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
