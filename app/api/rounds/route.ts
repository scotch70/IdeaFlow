/**
 * GET  /api/rounds   — list all IdeaFlows for the caller's company
 * POST /api/rounds   — create a new IdeaFlow (admin only)
 *
 * Member access rule:
 *   If round_members has ≥1 row for a round, only listed users see it.
 *   If round has zero members, every company member sees it (implicit-all).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient }      from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveRoundStatus } from '@/lib/rounds/getEffectiveRoundStatus'
import { isRoundAccessible } from '@/lib/auth/guards'
import { checkRateLimit } from '@/lib/ratelimit'
import { canCreateFlow }   from '@/lib/billing'
import { logEvent, logError } from '@/lib/monitoring/events'

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = (await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()) as unknown as { data: { company_id: string | null; role: string } | null }

    if (!profile?.company_id) return NextResponse.json({ error: 'No workspace' }, { status: 403 })

    const admin = createAdminClient()

    // Fetch all rounds for the company (idea_rounds has no RLS — always use admin client)
    const { data: rounds, error: roundsError } = await (admin as any)
      .from('idea_rounds')
      .select('*')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })

    if (roundsError) {
      console.error('[GET /api/rounds]', roundsError)
      return NextResponse.json({ error: roundsError.message }, { status: 500 })
    }

    const allRounds: any[] = rounds ?? []

    if (allRounds.length === 0) return NextResponse.json([])

    // Fetch idea counts per round in one query
    const roundIds = allRounds.map((r: any) => r.id)

    const { data: ideaRows } = await (admin as any)
      .from('ideas')
      .select('idea_round_id')
      .in('idea_round_id', roundIds)

    const { data: memberRows } = await (admin as any)
      .from('round_members')
      .select('round_id, user_id')
      .in('round_id', roundIds)

    // Build lookup maps
    const ideaCountMap: Record<string, number> = {}
    for (const row of ideaRows ?? []) {
      ideaCountMap[row.idea_round_id] = (ideaCountMap[row.idea_round_id] ?? 0) + 1
    }

    const memberCountMap: Record<string, number>  = {}
    const memberSetMap:   Record<string, string[]> = {}
    for (const row of memberRows ?? []) {
      memberCountMap[row.round_id] = (memberCountMap[row.round_id] ?? 0) + 1
      if (!memberSetMap[row.round_id]) memberSetMap[row.round_id] = []
      memberSetMap[row.round_id].push(row.user_id)
    }

    // Filter: members only see rounds they're allowed to access.
    // Honours audience_mode when present, falls back to legacy "empty = open".
    const isAdmin = profile.role === 'admin'
    const enriched = allRounds
      .filter((round: any) => isRoundAccessible({
        userId: user.id,
        isAdmin,
        round: { id: round.id, audience_mode: round.audience_mode ?? null },
        assignedUserIds: memberSetMap[round.id] ?? [],
      }))
      .map((round: any) => ({
        ...round,
        effectiveStatus: getEffectiveRoundStatus({
          raw_status:      round.status,
          manual_override: round.manual_override ?? null,
          opens_at:        round.starts_at ?? null,
          closes_at:       round.ends_at   ?? null,
        }),
        ideaCount:   ideaCountMap[round.id]   ?? 0,
        memberCount: memberCountMap[round.id] ?? 0,
      }))

    return NextResponse.json(enriched)
  } catch (err) {
    console.error('[GET /api/rounds]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = (await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single()) as unknown as { data: { company_id: string | null; role: string } | null }

    if (!profile?.company_id) return NextResponse.json({ error: 'No workspace' }, { status: 403 })
    if (profile.role !== 'admin') return NextResponse.json({ error: 'Admins only' }, { status: 403 })

    // Rate limit: 5 round creations per minute per admin
    const allowed = await checkRateLimit(`rounds:create:${user.id}`, 60, 5)
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = (await request.json()) as {
      name?: unknown
      prompt?: unknown
      status?: unknown
      starts_at?: unknown
      ends_at?: unknown
    }

    const name = (typeof body.name === 'string' && body.name.trim()) ? body.name.trim() : 'New IdeaFlow'

    const prompt = (typeof body.prompt === 'string' && body.prompt.trim())
      ? body.prompt.trim()
      : null

    const VALID_STATUSES = ['draft', 'active', 'closed']
    const status = VALID_STATUSES.includes(body.status as string)
      ? (body.status as string)
      : 'draft'

    const toDate = (v: unknown): string | null => {
      if (!v || typeof v !== 'string') return null
      const d = new Date(v)
      return isNaN(d.getTime()) ? null : d.toISOString()
    }

    const admin = createAdminClient()

    // ── Plan gate: Free plan allows up to 2 active IdeaFlows ─────────────────
    if (status === 'active') {
      const { data: companyRow } = await (admin as any)
        .from('companies')
        .select('plan')
        .eq('id', profile.company_id)
        .single() as { data: { plan: string } | null }

      const { count: activeCount } = await (admin as any)
        .from('idea_rounds')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .eq('status', 'active')

      if (!canCreateFlow({ plan: companyRow?.plan ?? 'free', activeFlowCount: activeCount ?? 0 })) {
        return NextResponse.json(
          { error: 'Free plan allows up to 2 active IdeaFlows. Upgrade to Pro to create more.' },
          { status: 403 },
        )
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Pre-migration safety: do NOT include the new members-redesign columns
    // (audience_mode, owner_id) in the insert. Their DB defaults handle
    // them once the migration is applied; omitting them lets the insert
    // succeed against a database that doesn't yet have those columns.
    const { data: round, error: insertError } = await (admin as any)
      .from('idea_rounds')
      .insert({
        company_id: profile.company_id,
        name,
        prompt,
        status,
        created_by: user.id,
        starts_at:  toDate(body.starts_at),
        ends_at:    toDate(body.ends_at),
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('[POST /api/rounds] insert:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    if (status === 'active') {
      logEvent('flow_launched', { companyId: profile.company_id, userId: user.id })
    }
    return NextResponse.json({ ...round, effectiveStatus: status, ideaCount: 0, memberCount: 0 }, { status: 201 })
  } catch (err) {
    logError('rounds/POST', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
