/**
 * buildDigestEmail.ts
 *
 * Builds the premium weekly digest HTML email.
 * Table-based layout — no external CSS, inline styles only.
 * Matches the IdeaFlow design language: warm cream background, navy headings,
 * orange accent bar, clean card containers.
 *
 * Plan differentiation:
 *   Standard — metrics summary + top ideas list
 *   Pro      — + AI insights section + recommendations + upgrade teaser removed
 *   Free     — should not receive this email (guarded at cron level)
 */

import type { DigestMetrics  } from './aggregateDigestMetrics'
import type { DigestInsights } from './generateDigestInsights'

interface BuildDigestEmailParams {
  adminName:    string
  metrics:      DigestMetrics
  insights:     DigestInsights
  appUrl:       string
}

interface DigestEmailResult {
  subject: string
  html:    string
}

// ── HTML escape ────────────────────────────────────────────────────────────────

const ESC: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}
function e(s: string | number | null | undefined): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ESC[c] ?? c)
}

// ── Trend arrow + colour ───────────────────────────────────────────────────────

function trendBadge(delta: number): string {
  if (delta > 0) {
    return `<span style="color:#10b981;font-size:11px;font-weight:700;">↑ +${delta}</span>`
  }
  if (delta < 0) {
    return `<span style="color:#f97316;font-size:11px;font-weight:700;">↓ ${delta}</span>`
  }
  return `<span style="color:#9ab0c8;font-size:11px;">—</span>`
}

// ── Metric cell ───────────────────────────────────────────────────────────────

function metricCell(label: string, value: string | number, badge?: string): string {
  return `
    <td style="padding:0 12px 0 0;vertical-align:top;min-width:90px;">
      <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ab0c8;">${e(label)}</p>
      <p style="margin:0;font-size:22px;font-weight:800;color:#0d1f35;letter-spacing:-0.03em;line-height:1;">
        ${e(value)}${badge ? `&thinsp;${badge}` : ''}
      </p>
    </td>`
}

// ── Section heading ───────────────────────────────────────────────────────────

function sectionHeading(text: string): string {
  return `
  <tr>
    <td style="padding:28px 40px 12px;">
      <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9ab0c8;">${e(text)}</p>
    </td>
  </tr>`
}

// ── Top ideas rows ─────────────────────────────────────────────────────────────

function topIdeaRow(
  idea: { title: string; description: string | null; author: string; likes: number; comments: number },
  rank: number,
): string {
  return `
  <tr>
    <td style="padding:0 40px 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#f8f9fb;border:1px solid rgba(0,0,0,0.07);border-radius:8px;padding:12px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:top;padding-right:12px;">
                  <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#b0bac8;">#${rank}</p>
                  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0d1f35;line-height:1.4;">${e(idea.title)}</p>
                  ${idea.description ? `<p style="margin:0 0 6px;font-size:12px;color:#5d667a;line-height:1.5;">${e(idea.description.slice(0, 120))}${idea.description.length > 120 ? '…' : ''}</p>` : ''}
                  <p style="margin:0;font-size:11px;color:#9ab0c8;">by ${e(idea.author)}</p>
                </td>
                <td style="vertical-align:top;text-align:right;white-space:nowrap;min-width:60px;">
                  <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#0d1f35;">
                    ♥&thinsp;${e(idea.likes)}
                  </p>
                  ${idea.comments > 0 ? `<p style="margin:0;font-size:11px;color:#9ab0c8;">💬&thinsp;${e(idea.comments)}</p>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

// ── AI insight row ─────────────────────────────────────────────────────────────

function insightRow(text: string): string {
  return `
  <tr>
    <td style="padding:0 40px 10px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:top;padding-right:10px;width:18px;">
            <span style="font-size:12px;color:rgba(249,115,22,0.7);">✦</span>
          </td>
          <td>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;">${e(text)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

// ── Recommendation row ─────────────────────────────────────────────────────────

function recommendationRow(text: string, index: number): string {
  const colors = ['#f97316', '#3b82f6', '#10b981']
  const color  = colors[index % colors.length]
  return `
  <tr>
    <td style="padding:0 40px 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:#fff;border:1px solid rgba(0,0,0,0.07);border-left:3px solid ${color};border-radius:6px;padding:10px 14px;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;">${e(text)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

// ── Standard upgrade teaser (shown to Standard admins) ────────────────────────

function standardUpgradeTeaser(appUrl: string): string {
  return `
  <tr>
    <td style="padding:8px 40px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="
            background:linear-gradient(135deg,#1a2035 0%,#0f1726 100%);
            border-radius:10px;
            padding:18px 20px;
          ">
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(249,115,22,0.8);">✦ Pro AI</p>
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:rgba(255,255,255,0.92);line-height:1.4;">
              Unlock AI insights &amp; recommendations
            </p>
            <p style="margin:0 0 14px;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.6;">
              Pro members receive AI-generated theme analysis, engagement trend narratives,
              and concrete action recommendations in every digest.
            </p>
            <a href="${appUrl}/settings?tab=billing"
              style="
                display:inline-block;
                padding:8px 16px;
                background:rgba(249,115,22,0.9);
                color:#fff;
                text-decoration:none;
                border-radius:6px;
                font-size:12px;
                font-weight:700;
                letter-spacing:0.01em;
              ">Upgrade to Pro AI →</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

// ── Main builder ───────────────────────────────────────────────────────────────

export function buildDigestEmail({
  adminName,
  metrics,
  insights,
  appUrl,
}: BuildDigestEmailParams): DigestEmailResult {
  const firstName   = adminName.split(' ')[0] || adminName
  const isProPlan   = metrics.plan === 'pro' || metrics.plan === 'pro_plus'
  const roundLabel  = metrics.currentRoundName
    ? `IdeaFlow: ${metrics.currentRoundName}`
    : 'Your IdeaFlow workspace'

  const subject = isProPlan
    ? `✦ Your weekly AI digest — ${metrics.companyName} (${metrics.weekLabel})`
    : `Weekly digest — ${metrics.companyName} (${metrics.weekLabel})`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${e(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Logo row -->
          <tr>
            <td style="padding-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size:16px;font-weight:800;color:#0d1f35;letter-spacing:-0.02em;">
                      Idea<span style="color:#f97316;">Flow</span>
                    </span>
                  </td>
                  <td align="right">
                    ${isProPlan
                      ? `<span style="font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:rgba(249,115,22,0.9);background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.2);border-radius:999px;padding:3px 9px;">✦ Pro AI Digest</span>`
                      : `<span style="font-size:10px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#9ab0c8;">Weekly Digest</span>`
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="
              background:#ffffff;
              border-radius:14px;
              border:1px solid rgba(0,0,0,0.07);
              box-shadow:0 1px 6px rgba(0,0,0,0.06);
              overflow:hidden;
            ">

              <!-- Accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height:3px;background:linear-gradient(90deg,#f97316,#fb923c);"></td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Heading -->
                <tr>
                  <td style="padding:32px 40px 4px;">
                    <h1 style="margin:0;font-size:20px;font-weight:800;color:#0d1f35;letter-spacing:-0.03em;line-height:1.3;">
                      Weekly workspace digest
                    </h1>
                  </td>
                </tr>

                <!-- Subheading -->
                <tr>
                  <td style="padding:6px 40px 0;">
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">
                      Hi ${e(firstName)},<br />
                      Here's what happened in <strong>${e(metrics.companyName)}</strong> this week.
                    </p>
                  </td>
                </tr>

                <!-- Round label -->
                ${metrics.currentRoundName ? `
                <tr>
                  <td style="padding:10px 40px 0;">
                    <span style="
                      display:inline-block;
                      font-size:11px;font-weight:700;
                      color:#f97316;
                      background:rgba(249,115,22,0.08);
                      border:1px solid rgba(249,115,22,0.18);
                      border-radius:999px;
                      padding:3px 10px;
                    ">${e(roundLabel)}</span>
                  </td>
                </tr>` : ''}

                <!-- ── METRICS SECTION ── -->
                ${sectionHeading('This week')}

                <!-- Metrics grid -->
                <tr>
                  <td style="padding:0 40px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        ${metricCell('Ideas', metrics.totalIdeas, trendBadge(metrics.ideaDelta))}
                        ${metricCell('Members', metrics.totalMembers)}
                        ${metricCell('Participation', `${metrics.participationRate}%`)}
                        ${metricCell('Avg likes', metrics.avgLikesPerIdea)}
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Headline insight -->
                <tr>
                  <td style="padding:0 40px 20px;">
                    <p style="
                      margin:0;
                      font-size:13px;
                      line-height:1.7;
                      color:#374151;
                      background:#f8f9fb;
                      border-left:3px solid #f97316;
                      border-radius:0 6px 6px 0;
                      padding:10px 14px;
                    ">${e(insights.headline)}</p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr><td style="padding:0 40px;"><div style="height:1px;background:rgba(0,0,0,0.06);"></div></td></tr>

                <!-- ── TOP IDEAS SECTION ── -->
                ${metrics.topIdeas.length > 0 ? `
                  ${sectionHeading('Top ideas')}
                  ${metrics.topIdeas.map((idea, i) => topIdeaRow(idea, i + 1)).join('')}
                ` : `
                  ${sectionHeading('Top ideas')}
                  <tr>
                    <td style="padding:0 40px 20px;">
                      <p style="margin:0;font-size:13px;color:#9ab0c8;font-style:italic;">
                        No ideas have been submitted yet this round.
                      </p>
                    </td>
                  </tr>
                `}

                <!-- ── AI INSIGHTS (Pro only) ── -->
                ${isProPlan && insights.insights.length > 0 ? `
                  <!-- Divider -->
                  <tr><td style="padding:0 40px;"><div style="height:1px;background:rgba(0,0,0,0.06);"></div></td></tr>

                  <tr>
                    <td style="padding:20px 40px 12px;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td>
                            <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9ab0c8;display:inline;">AI Insights</p>
                            &nbsp;<span style="font-size:9px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:rgba(249,115,22,0.85);background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.2);border-radius:999px;padding:2px 7px;">✦ Pro</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  ${insights.insights.map(text => insightRow(text)).join('')}

                  ${insights.themes.length > 0 ? `
                  <tr>
                    <td style="padding:0 40px 16px;">
                      <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9ab0c8;">Recurring themes</p>
                      <p style="margin:0;">
                        ${insights.themes.map(t => `<span style="display:inline-block;font-size:11px;font-weight:700;color:#0d1f35;background:#f0f4ff;border:1px solid rgba(59,130,246,0.15);border-radius:999px;padding:3px 10px;margin:0 4px 4px 0;">${e(t)}</span>`).join('')}
                      </p>
                    </td>
                  </tr>` : ''}
                ` : ''}

                <!-- ── RECOMMENDATIONS (Pro only) ── -->
                ${isProPlan && insights.recommendations.length > 0 ? `
                  <!-- Divider -->
                  <tr><td style="padding:0 40px;"><div style="height:1px;background:rgba(0,0,0,0.06);"></div></td></tr>

                  ${sectionHeading('Recommended actions')}
                  ${insights.recommendations.map((r, i) => recommendationRow(r, i)).join('')}
                ` : ''}

                <!-- ── STANDARD UPGRADE TEASER ── -->
                ${!isProPlan ? `
                  <!-- Divider -->
                  <tr><td style="padding:8px 40px 0;"><div style="height:1px;background:rgba(0,0,0,0.06);"></div></td></tr>
                  ${standardUpgradeTeaser(appUrl)}
                ` : ''}

                <!-- CTA -->
                <tr>
                  <td style="padding:${isProPlan ? '8px' : '0'} 40px 36px;">
                    <a href="${appUrl}/dashboard"
                      style="
                        display:inline-block;
                        padding:11px 22px;
                        background:#f97316;
                        color:#fff;
                        text-decoration:none;
                        border-radius:7px;
                        font-size:13px;
                        font-weight:700;
                        letter-spacing:0.01em;
                      ">Open workspace →</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ab0c8;line-height:1.6;">
                You're receiving this as an admin of <strong>${e(metrics.companyName)}</strong> on IdeaFlow.
              </p>
              <p style="margin:0;font-size:12px;color:#b0bac8;">
                IdeaFlow · Weekly digest · ${e(metrics.weekLabel)}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`

  return { subject, html }
}
