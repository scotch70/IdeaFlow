/**
 * Thin Anthropic Messages API wrapper used by Pro AI features.
 *
 * Why fetch-based: avoids adding the @anthropic-ai/sdk dependency and the
 * extra bundle weight. The Messages API is a small, stable REST surface.
 *
 * Behaviour:
 *   - When ANTHROPIC_API_KEY is set in the environment, the helpers call
 *     Anthropic and return the model's text.
 *   - When the key is absent (e.g. self-hosted, dev environments, or a Pro
 *     workspace that hasn't provisioned an API key yet), the helpers return
 *     `null` so callers can render their heuristic fallback. They never
 *     throw — silent graceful degradation is the contract.
 *   - All callers must be server-side. Never import this from a client
 *     component; the key would leak.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

// Haiku is fast + cheap, and the insight prompts are short. Upgrade to
// Sonnet 4 if you need higher-quality outputs at the cost of latency.
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'

export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

interface ClaudeMessageRequest {
  system?:      string
  prompt:       string
  maxTokens?:   number
  temperature?: number
  model?:       string
  /** Soft timeout (ms). Calls that exceed this resolve to null. */
  timeoutMs?:   number
}

/**
 * Send one user-turn prompt and return the assistant's text content.
 * Returns null on missing key, network failure, timeout, or non-200 response.
 */
export async function claudeComplete(req: ClaudeMessageRequest): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), req.timeoutMs ?? 12_000)

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type':       'application/json',
        'x-api-key':          apiKey,
        'anthropic-version':  '2023-06-01',
      },
      body: JSON.stringify({
        model:        req.model ?? DEFAULT_MODEL,
        max_tokens:   req.maxTokens   ?? 600,
        temperature:  req.temperature ?? 0.4,
        system:       req.system,
        messages:     [{ role: 'user', content: req.prompt }],
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      console.warn('[ai/anthropic] non-200 from Anthropic:', res.status)
      return null
    }

    const data = await res.json() as {
      content?: Array<{ type: string; text?: string }>
    }

    // The Messages API returns a content array; the first text block is the
    // model's reply. Concatenate any additional text blocks defensively.
    const text = (data.content ?? [])
      .filter(b => b.type === 'text' && typeof b.text === 'string')
      .map(b => b.text!)
      .join('\n')
      .trim()

    return text || null
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn('[ai/anthropic] request timed out')
    } else {
      console.warn('[ai/anthropic] request failed:', err)
    }
    return null
  } finally {
    clearTimeout(t)
  }
}

// ─── Higher-level: workspace insights ────────────────────────────────────────

export interface IdeaInsightInput {
  title:       string
  description: string | null
  likes:       number
  comments:    number
}

export interface AIWorkspaceInsight {
  /** 1–2 sentence executive summary. */
  headline: string
  /** 2–4 specific observations about the data. */
  observations: string[]
  /** 2–3 concrete recommendations. */
  recommendations: string[]
  /** Up to 4 themes detected in the ideas. */
  themes: string[]
}

/**
 * Ask Claude to synthesize a workspace-level insight from a batch of ideas.
 * Returns null if the API isn't configured or the model output couldn't be
 * parsed — callers should keep their heuristic fallback intact.
 */
export async function summarizeIdeas(args: {
  ideas:        IdeaInsightInput[]
  flowName?:    string | null
  prompt?:      string | null
  memberCount?: number
  activeMembers?: number
}): Promise<AIWorkspaceInsight | null> {
  if (!isAnthropicConfigured()) return null
  if (args.ideas.length === 0)  return null

  const compactIdeas = args.ideas
    .slice(0, 50) // cap so the prompt stays small
    .map((i, idx) => `${idx + 1}. "${i.title}"${i.description ? ' — ' + i.description.slice(0, 200) : ''} (${i.likes} likes, ${i.comments} comments)`)
    .join('\n')

  const context = [
    args.flowName     ? `Flow: ${args.flowName}` : null,
    args.prompt       ? `Question: ${args.prompt}` : null,
    args.memberCount  != null ? `Total members: ${args.memberCount}` : null,
    args.activeMembers != null ? `Active contributors: ${args.activeMembers}` : null,
  ].filter(Boolean).join('\n')

  const text = await claudeComplete({
    system: [
      'You are a concise analyst helping a manager understand internal-team ideas.',
      'Respond strictly with a JSON object — no prose before or after.',
      'Schema: { "headline": string, "observations": string[], "recommendations": string[], "themes": string[] }',
      'Keep observations specific to the ideas (not generic). Recommendations should be concrete actions a manager could take this week.',
    ].join(' '),
    prompt: `${context}\n\nIdeas:\n${compactIdeas}\n\nReturn the JSON object now.`,
    maxTokens: 800,
    temperature: 0.3,
  })

  if (!text) return null

  // Pull the first JSON object out of the response. Claude is reliable about
  // returning bare JSON given the system prompt, but a tolerant parse keeps
  // us safe against an occasional preamble.
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null

  try {
    const parsed = JSON.parse(match[0]) as Partial<AIWorkspaceInsight>
    if (!parsed.headline || !Array.isArray(parsed.observations) || !Array.isArray(parsed.recommendations)) {
      return null
    }
    return {
      headline:        String(parsed.headline),
      observations:    parsed.observations.slice(0, 4).map(String),
      recommendations: parsed.recommendations.slice(0, 3).map(String),
      themes:          (parsed.themes ?? []).slice(0, 4).map(String),
    }
  } catch {
    return null
  }
}
