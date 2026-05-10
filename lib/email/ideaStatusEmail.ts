export type EmailStatus = 'planned'

interface StatusEmailParams {
  authorName: string
  ideaTitle: string
  status: EmailStatus
  note: string | null
  appUrl: string
}

interface StatusEmailResult {
  subject: string
  html: string
}

// ── Per-status copy ────────────────────────────────────────────────────────────

const STATUS_META: Record<
  EmailStatus,
  {
    subject: (title: string) => string
    heading: string
    intro: (name: string) => string
    badgeLabel: string
    badgeBg: string
    badgeColor: string
    noteHeading?: string
    closing: string
  }
> = {
  planned: {
    subject: (title) => `Your idea has been planned: "${title}"`,
    heading: "Your idea is on the roadmap",
    intro: (name) =>
      `Great news, ${name}! Your idea has been reviewed and added to the roadmap.`,
    badgeLabel: 'Planned',
    badgeBg: '#EEF2FF',
    badgeColor: '#4338CA',
    closing: "Thanks for sharing your thinking — it makes a real difference.",
  },
}

// ── HTML builder ───────────────────────────────────────────────────────────────

export function buildStatusEmail({
  authorName,
  ideaTitle,
  status,
  note,
  appUrl,
}: StatusEmailParams): StatusEmailResult {
  const meta = STATUS_META[status]
  const firstName = authorName.split(' ')[0] || authorName

  const noteBlock =
    note && note.trim()
      ? `
        <tr>
          <td style="padding: 0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="
                  background: ${meta.badgeBg};
                  border-left: 3px solid ${meta.badgeColor};
                  border-radius: 4px;
                  padding: 14px 16px;
                ">
                  ${
                    meta.noteHeading
                      ? `<p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${meta.badgeColor};">${meta.noteHeading}</p>`
                      : ''
                  }
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">
                    ${escapeHtml(note.trim())}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
      : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.subject(ideaTitle))}</title>
</head>
<body style="margin: 0; padding: 0; background: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F9FAFB; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px;">

          <!-- Logo row -->
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
              <!-- Orange accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height: 3px; background: linear-gradient(90deg, #F97316, #FB923C);"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Heading -->
                <tr>
                  <td style="padding: 32px 40px 6px;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #0D1F35; line-height: 1.3;">
                      ${escapeHtml(meta.heading)}
                    </h1>
                  </td>
                </tr>

                <!-- Status badge -->
                <tr>
                  <td style="padding: 12px 40px 20px;">
                    <span style="
                      display: inline-block;
                      padding: 3px 10px;
                      border-radius: 5px;
                      font-size: 12px;
                      font-weight: 700;
                      letter-spacing: 0.03em;
                      background: ${meta.badgeBg};
                      color: ${meta.badgeColor};
                    ">${meta.badgeLabel}</span>
                  </td>
                </tr>

                <!-- Intro -->
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.65; color: #374151;">
                      ${escapeHtml(meta.intro(firstName))}
                    </p>
                  </td>
                </tr>

                <!-- Idea title box -->
                <tr>
                  <td style="padding: 0 40px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="
                          background: #F8F9FB;
                          border: 1px solid rgba(0,0,0,0.07);
                          border-radius: 8px;
                          padding: 12px 16px;
                        ">
                          <p style="margin: 0 0 3px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9AB0C8;">Your idea</p>
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0D1F35; line-height: 1.4;">
                            ${escapeHtml(ideaTitle)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Note block (conditional) -->
                ${noteBlock}

                <!-- Closing -->
                <tr>
                  <td style="padding: 0 40px 24px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.65; color: #6B7280;">
                      ${escapeHtml(meta.closing)}
                    </p>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding: 0 40px 36px;">
                    <a
                      href="${appUrl}/dashboard"
                      style="
                        display: inline-block;
                        padding: 10px 20px;
                        background: #F97316;
                        color: #FFFFFF;
                        text-decoration: none;
                        border-radius: 7px;
                        font-size: 13px;
                        font-weight: 700;
                        letter-spacing: 0.01em;
                      "
                    >View in IdeaFlow →</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: #9AB0C8; line-height: 1.6;">
                You received this email because you submitted an idea on IdeaFlow.<br />
                This is an automated notification — please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject: meta.subject(ideaTitle), html }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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
