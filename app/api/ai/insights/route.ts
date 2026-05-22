/**
 * POST /api/ai/insights
 *
 * Generates a real Anthropic-backed insight summary for a specific IdeaFlow.
 * Pro-only. Falls back to a 503 with `aiConfigured: false` when the
 * deployment hasn't been provisioned with an ANTHROPIC_API_KEY — the client
 * uses that signal to render the existing heuristic insights instead.
 *
 * Body: { roundId: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSignedIn } from '@/lib/auth/guards'
import { canUseAIInsights } from '@/lib/plans/planFeatures'
import {
  isAnthropicConfigured,
  summarizeIdeas,
  type IdeaInsightInput,
} from '@/lib/ai/anthropic'

type IdeaRow = {
  id:          string
  title:       string
  description: string | null
  likes_count: number | null
  comments?:   { count: number }[]
}

type RoundRow = {
  id:         string
  name:       string | null
  prompt:     string | null
  company_id: string
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSignedIn()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { profile } = auth.value

    // Pro-only feature
    const admin = createAdminClient()
    const { data: companyRow } = await (admin as any)
      .from('companies')
      .select('plan')
      .eq('id', profile.company_id)
      .single() as { data: { plan: string } | null }
    const plan = companyRow?.plan ?? 'free'
    if (!canUseAIInsights(plan)) {
      return NextResponse.json(
        { error: 'AI insights require the Pro plan.', planRequired: 'pro' },
        { status: 403 },
      )
    }

    // Soft-fail when the API key isn't set so the client can render the
    // heuristic fallback. We return 503 (Service Unavailable) so callers
    // can distinguish "not entitled" from "not configured".
    if (!isAnthropicConfigured()) {
      return NextResponse.json(
        { error: 'AI is not configured on this deployment.', aiConfigured: false },
        { status: 503 },
      )
    }

    const body = (await request.json().catch(() => ({}))) as { roundId?: unknown }
    if (typeof body.roundId !== 'string' || !body.roundId) {
      return NextResponse.json({ error: 'roundId is required' }, { status: 400 })
    }

    // Verify the round belongs to the caller's workspace
    const { data: round } = await (admin as any)
      .from('idea_rounds')
      .select('id, name, prompt, company_id')
      .eq('id', body.roundId)
      .eq('company_id', profile.company_id)
      .single() as { data: RoundRow | null }

    if (!round) return NextResponse.json({ error: 'IdeaFlow not found' }, { status: 404 })

    // Pull ideas + comment counts for the model. We deliberately omit
    // per-user data — the model should reason over patterns, not people.
    const { data: ideas } = await (admin as any)
      .from('ideas')
      .select('id, title, description, likes_count, comments(count)')
      .eq('idea_round_id', round.id)
      .order('likes_count', { ascending: false }) as { data: IdeaRow[] | null }

    const compact: IdeaInsightInput[] = (ideas ?? []).map(i => ({
      title:       i.title,
      description: i.description,
      likes:       i.likes_count ?? 0,
      comments:    i.comments?.[0]?.count ?? 0,
    }))

    if (compact.length === 0) {
      return NextResponse.json(
        { error: 'No ideas yet to analyze.', empty: true },
        { status: 200 },
      )
    }

    // Member counts for richer context
    const { count: memberCount } = await (admin as any)
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id)

    const result = await summarizeIdeas({
      ideas:    compact,
      flowName: round.name,
      prompt:   round.prompt,
      memberCount: memberCount ?? undefined,
      activeMembers: compact.length,  // proxy: anyone who posted an idea
    })

    if (!result) {
      // Anthropic call timed out or returned unparseable output.
      return NextResponse.json(
        { error: 'AI service did not return a valid response.', aiConfigured: true, transientFailure: true },
        { status: 502 },
      )
    }

    return NextResponse.json({
      aiConfigured: true,
      ...result,
    })
  } catch (err) {
    console.error('[POST /api/ai/insights]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
