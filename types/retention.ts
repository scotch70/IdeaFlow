// ─────────────────────────────────────────────────────────────────────────────
// Retention feature types — Phase 2 architecture for digest & recurring reports.
//
// Not yet fully implemented. This file establishes the data contract so that
// future work can be dropped in without restructuring existing components.
//
// Intended integrations:
//   • Slack digest via incoming webhooks
//   • Teams digest via Adaptive Cards + webhooks
//   • Scheduled email reports (weekly / monthly / on-flow-close)
//   • PDF export scheduling
// ─────────────────────────────────────────────────────────────────────────────

export type DigestFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'
export type DigestFormat    = 'email' | 'slack' | 'teams' | 'pdf'

// ── Email digest config ───────────────────────────────────────────────────────
export interface WeeklyDigestConfig {
  companyId:              string
  enabled:                boolean
  frequency:              DigestFrequency
  recipientEmails:        string[]
  includeTopIdeas:        boolean
  includeParticipation:   boolean
  includeAISummary:       boolean
  includeActionItems:     boolean
  /** Cron expression, e.g. '0 9 * * 1' = Monday 9 AM */
  cronExpression:         string
  timezone:               string
}

export interface EmailSummaryConfig {
  companyId:       string
  enabled:         boolean
  frequency:       DigestFrequency
  recipientEmails: string[]
  /** Optional brand colour for email templates */
  brandColor?:     string
  logoUrl?:        string
}

// ── Recurring report config ───────────────────────────────────────────────────
export interface RecurringReportConfig {
  companyId:         string
  roundId:           string | null
  outputFormats:     DigestFormat[]
  frequency:         DigestFrequency
  autoSendOnClose:   boolean
  includePdfExport:  boolean
}

// ── Digest content payload ────────────────────────────────────────────────────
export interface DigestContent {
  generatedAt:     string           // ISO timestamp
  periodStart:     string
  periodEnd:       string
  topIdeas:        Array<{ title: string; likes: number }>
  participationRate: number         // 0–100
  newIdeasCount:   number
  aiSummary?:      string
  actionItems?:    string[]
  themes?:         string[]
  engagementLevel: 'strong' | 'good' | 'early' | 'none'
}

// ── Slack integration (future) ────────────────────────────────────────────────
export interface SlackIntegrationConfig {
  companyId:          string
  slackWorkspaceId:   string
  channelId:          string
  /** Stored encrypted server-side; never in client bundle */
  botTokenRef:        string
  enabled:            boolean
  frequency:          DigestFrequency
  includeTopIdeas:    boolean
  includeParticipation: boolean
  includeAISummary:   boolean
}

export interface SlackBlock {
  type:      string
  text?:     { type: 'mrkdwn' | 'plain_text'; text: string }
  elements?: unknown[]
  fields?:   unknown[]
}

export interface SlackDigestPayload {
  channel: string
  blocks:  SlackBlock[]
  text:    string  // fallback plain-text notification
}

// ── Teams integration (future) ────────────────────────────────────────────────
export interface TeamsIntegrationConfig {
  companyId:   string
  /** Stored encrypted server-side */
  webhookRef:  string
  enabled:     boolean
  frequency:   DigestFrequency
}

export interface TeamsAdaptiveCard {
  type:     'AdaptiveCard'
  version:  string
  body:     unknown[]
  actions?: unknown[]
}

export interface TeamsDigestPayload {
  type:        'message'
  attachments: Array<{
    contentType: 'application/vnd.microsoft.card.adaptive'
    content:     TeamsAdaptiveCard
  }>
}
