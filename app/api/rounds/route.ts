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
import { checkRateLimit } from '@/lib/ratelimit'

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

    // Filter: members only see rounds they're assigned to (or open-to-all rounds)
    const isAdmin = profile.role === 'admin'
    const enriched = allRounds
      .filter((round: any) => {
        if (isAdmin) return true
        const assigned = memberSetMap[round.id] ?? []
        // If no members assigned → all company members can access
        return assigned.length === 0 || assigned.includes(user.id)
      })
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
      icon?: unknown
      color?: unknown
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

    // icon: single emoji; color: hex string e.g. '#f97316'
    const icon  = (typeof body.icon  === 'string' && body.icon.trim())  ? body.icon.trim()  : null
    const color = (typeof body.color === 'string' && /^#[0-9a-f]{6}$/i.test(body.color.trim())) ? body.color.trim() : null

    const admin = createAdminClient()

    const { data: round, error: insertError } = await (admin as any)
      .from('idea_rounds')
      .insert({
        company_id:  profile.company_id,
        name,
        prompt,
        status,
        created_by:  user.id,
        starts_at:   toDate(body.starts_at),
        ends_at:     toDate(body.ends_at),
        icon,
        color,
      })
      .select('*')
      .single()

    if (insertError) {
      console.error('[POST /api/rounds] insert:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ...round, effectiveStatus: status, ideaCount: 0, memberCount: 0 }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/rounds]', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
