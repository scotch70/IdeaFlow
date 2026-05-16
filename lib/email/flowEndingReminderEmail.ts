/**
 * flowEndingReminderEmail.ts
 *
 * Builds the HTML + subject for the "IdeaFlow ending soon" reminder email.
 * Two variants:
 *   '7_days_before' — sent 7 days before the flow ends
 *   '1_day_before'  — sent the day before the flow ends
 *
 * Follows the same template structure as ideaStatusEmail.ts.
 */

export type ReminderType = '7_days_before' | '1_day_before'

interface FlowReminderEmailParams {
  recipientName: string
  flowName:      string
  flowId:        string
  endsAt:        Date
  reminderType:  ReminderType
  appUrl:        string
}

interface FlowReminderEmailResult {
  subject: string
  html:    string
}

// ── Variant-specific copy ─────────────────────────────────────────────────────

const VARIANT: Record<
  ReminderType,
  {
    subject:    (flowName: string) => string
    heading:    string
    timePhrase: string
    urgency:    string
  }
> = {
  '7_days_before': {
    subject:    (name) => `IdeaFlow ends in 7 days: ${name}`,
    heading:    '7 days left to share your ideas',
    timePhrase: 'in 7 days',
    urgency:    'There\'s still plenty of time — add your ideas and vote on your teammates\' suggestions.',
  },
  '1_day_before': {
    subject:    (name) => `IdeaFlow ends tomorrow: ${name}`,
    heading:    'Last chance — IdeaFlow closes tomorrow',
    timePhrase: 'tomorrow',
    urgency:    'This is the last day to submit ideas and cast your votes before the round closes.',
  },
}

// ── Date formatting ────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  }).format(d)
}

// ── HTML builder ──────────────────────────────────────────────────────────────

export function buildFlowReminderEmail({
  recipientName,
  flowName,
  flowId,
  endsAt,
  reminderType,
  appUrl,
}: FlowReminderEmailParams): FlowReminderEmailResult {
  const v          = VARIANT[reminderType]
  const firstName  = recipientName.split(' ')[0] || recipientName
  const closingDate = formatDate(endsAt)
  const flowUrl    = `${appUrl}/dashboard/flows/${flowId}`
  const subject    = v.subject(flowName)

  // Accent colour for the 1-day variant is a slightly warmer orange to signal urgency
  const accentBar  = reminderType === '1_day_before'
    ? 'background: linear-gradient(90deg, #EA580C, #F97316);'
    : 'background: linear-gradient(90deg, #F97316, #FB923C);'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F9FAFB; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom: 24px;">
              <span style="font-size: 16px; font-weight: 800; color: #0D1F35; letter-spacing: -0.02em;">
                Idea<span style="color: #F97316;">Flow</span>
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="
              background: #FFFFFF;
              border-radius: 12px;
              border: 1px solid rgba(0,0,0,0.07);
              box-shadow: 0 1px 4px rgba(0,0,0,0.05);
              overflow: hidden;
            ">
              <!-- Accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height: 3px; ${accentBar}"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Heading -->
                <tr>
                  <td style="padding: 32px 40px 8px;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #0D1F35; line-height: 1.3;">
                      ${escapeHtml(v.heading)}
                    </h1>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding: 16px 40px 0;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.65; color: #374151;">
                      Hi ${escapeHtml(firstName)},
                    </p>
                  </td>
                </tr>

                <!-- Body copy -->
                <tr>
                  <td style="padding: 10px 40px 20px;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.65; color: #374151;">
                      <strong>${escapeHtml(flowName)}</strong> closes ${escapeHtml(v.timePhrase)}.
                      ${escapeHtml(v.urgency)}
                    </p>
                  </td>
                </tr>

                <!-- Flow info box -->
                <tr>
                  <td style="padding: 0 40px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="
                          background: #F8F9FB;
                          border: 1px solid rgba(0,0,0,0.07);
                          border-radius: 8px;
                          padding: 14px 16px;
                        ">
                          <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9AB0C8;">IdeaFlow</p>
                          <p style="margin: 0 0 6px; font-size: 14px; font-weight: 700; color: #0D1F35; line-height: 1.4;">
                            ${escapeHtml(flowName)}
                          </p>
                          <p style="margin: 0; font-size: 12px; color: #6B7280;">
                            Closes on ${escapeHtml(closingDate)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding: 0 40px 36px;">
                    <a
                      href="${flowUrl}"
                      style="
                        display: inline-block;
                        padding: 11px 22px;
                        background: #F97316;
                        color: #FFFFFF;
                        text-decoration: none;
                        border-radius: 7px;
                        font-size: 13px;
                        font-weight: 700;
                        letter-spacing: 0.01em;
                      "
                    >Open IdeaFlow →</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: #9AB0C8; line-height: 1.6;">
                You received this because you are a member of this IdeaFlow.<br />
                This is an automated reminder — please do not reply to this email.
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => HTML_ESCAPE[c] ?? c)
}
