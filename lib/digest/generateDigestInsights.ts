/**
 * generateDigestInsights.ts
 *
 * Heuristic "AI" insight engine for the weekly digest.
 * Produces natural-language insight strings from DigestMetrics without an
 * external AI call — structured so the functions can be swapped for an
 * OpenAI / Claude API call in a future iteration with zero refactoring cost.
 *
 * Insight types:
 *   - Theme extraction  (recurring words weighted by likes)
 *   - Engagement trends (this week vs last week)
 *   - Friction signals  (low participation, no ideas, zero likes)
 *   - Recommendations   (2-3 concrete actions for the admin)
 */

import type { DigestMetrics, DigestTopIdea } from './aggregateDigestMetrics'

export interface DigestInsights {
  /** 1-2 sentence summary of the week */
  headline: string
  /** Array of 2-4 insight strings (bullet points in the email) */
  insights: string[]
  /** Array of 2-3 actionable recommendations */
  recommendations: string[]
  /** Detected themes from idea titles/descriptions (up to 3 labels) */
  themes: string[]
}

// ── Stop words ─────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'be', 'as', 'we', 'our', 'my',
  'this', 'that', 'are', 'was', 'were', 'has', 'have', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must',
  'so', 'if', 'not', 'no', 'all', 'more', 'new', 'how', 'what', 'when',
  'get', 'use', 'make', 'add', 'team', 'idea', 'ideas', 'flow', 'ideaflow',
])

// ── Theme extraction ──────────────────────────────────────────────────────────

function extractThemes(ideas: DigestTopIdea[], allTitles: string[]): string[] {
  // Score words by frequency × like weight
  const wordScore: Map<string, number> = new Map()

  const texts = [
    ...ideas.map(i => `${i.title} ${i.description ?? ''}`),
    ...allTitles,
  ]

  for (const idea of ideas) {
    const words = tokenise(`${idea.title} ${idea.description ?? ''}`)
    const boost = 1 + Math.log1p(idea.likes) // more likes = more weight
    for (const w of words) {
      wordScore.set(w, (wordScore.get(w) ?? 0) + boost)
    }
  }

  // Plain titles with uniform weight
  for (const title of allTitles) {
    for (const w of tokenise(title)) {
      wordScore.set(w, (wordScore.get(w) ?? 0) + 1)
    }
  }

  // Suppress the title-only linting warning
  void texts

  return Array.from(wordScore.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => capitalise(w))
}

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w))
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Trend description helpers ─────────────────────────────────────────────────

function trendPhrase(delta: number, noun: string): string {
  if (delta > 0) return `${delta} more ${noun} than last week`
  if (delta < 0) return `${Math.abs(delta)} fewer ${noun} than last week`
  return `the same number of ${noun} as last week`
}

function participationLabel(rate: number): string {
  if (rate >= 70) return 'strong'
  if (rate >= 40) return 'moderate'
  return 'low'
}

// ── Main export ────────────────────────────────────────────────────────────────

export function generateDigestInsights(
  metrics: DigestMetrics,
  allIdeaTitles: string[] = [],
): DigestInsights {
  const {
    companyName,
    totalIdeas,
    totalMembers,
    ideasThisWeek,
    ideaDelta,
    likesDelta,
    participationRate,
    activeMembers,
    topIdeas,
    currentRoundName,
  } = metrics

  // ── Headline ───────────────────────────────────────────────────────────────
  let headline: string

  if (totalIdeas === 0) {
    headline = `No ideas have been submitted yet for ${currentRoundName ?? 'the current IdeaFlow'}. ` +
      `Send a nudge to get the conversation started!`
  } else if (ideasThisWeek > 0) {
    headline =
      `${companyName} saw ${ideasThisWeek} new idea${ideasThisWeek !== 1 ? 's' : ''} this week — ` +
      `${trendPhrase(ideaDelta, 'ideas')}.`
  } else {
    headline =
      `No new ideas were submitted this week at ${companyName}, ` +
      `though ${totalIdeas} idea${totalIdeas !== 1 ? 's' : ''} remain active in the workspace.`
  }

  // ── Insight strings ────────────────────────────────────────────────────────
  const insights: string[] = []

  // Participation
  const partLabel = participationLabel(participationRate)
  insights.push(
    `Participation is ${partLabel}: ${activeMembers} of ${totalMembers} member${totalMembers !== 1 ? 's' : ''} ` +
    `(${participationRate}%) have shared at least one idea.`,
  )

  // Likes trend
  if (metrics.totalLikes > 0) {
    insights.push(
      `Team engagement generated ${metrics.likesThisWeek} like${metrics.likesThisWeek !== 1 ? 's' : ''} ` +
      `on new ideas this week — ${trendPhrase(likesDelta, 'likes')}.`,
    )
  }

  // Top idea callout
  if (topIdeas.length > 0) {
    const top = topIdeas[0]
    insights.push(
      `"${top.title}" is leading with ${top.likes} like${top.likes !== 1 ? 's' : ''}` +
      (top.comments > 0 ? ` and ${top.comments} comment${top.comments !== 1 ? 's' : ''}` : '') +
      `.`,
    )
  }

  // Low participation signal
  if (participationRate < 40 && totalMembers > 3) {
    insights.push(
      `Only ${participationRate}% of the workspace has contributed. ` +
      `A quick reminder to your team could unlock new perspectives.`,
    )
  }

  // ── Recommendations ────────────────────────────────────────────────────────
  const recommendations: string[] = []

  if (participationRate < 50) {
    recommendations.push(
      `Send a team nudge this week — participation is below 50%. ` +
      `Personalised reminders from managers consistently lift contribution rates.`,
    )
  }

  if (ideasThisWeek === 0 && totalIdeas > 0) {
    recommendations.push(
      `Re-surface the top ideas from this round in your next team meeting. ` +
      `Visibility drives likes and momentum.`,
    )
  } else if (ideasThisWeek > 0 && topIdeas.length > 0) {
    recommendations.push(
      `Review the top ${topIdeas.length} idea${topIdeas.length !== 1 ? 's' : ''} with leadership ` +
      `and consider which ones are ready to move to action.`,
    )
  }

  if (metrics.avgLikesPerIdea !== '0') {
    const avg = parseFloat(metrics.avgLikesPerIdea)
    if (avg < 1) {
      recommendations.push(
        `Encourage voting — average likes per idea is below 1. ` +
        `Voting helps surface the best ideas and shows contributors that their input is valued.`,
      )
    }
  }

  // Always include at least 2 recommendations
  if (recommendations.length < 2) {
    recommendations.push(
      `Keep the momentum going — respond to top ideas with comments or status updates ` +
      `to show the team their contributions are being heard.`,
    )
  }

  // ── Themes ────────────────────────────────────────────────────────────────
  const themes = topIdeas.length > 0
    ? extractThemes(topIdeas, allIdeaTitles)
    : []

  return {
    headline,
    insights:        insights.slice(0, 4),
    recommendations: recommendations.slice(0, 3),
    themes,
  }
}
