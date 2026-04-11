import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWeeklySummary } from '@/lib/email/weeklySummary'
export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createAdminClient()

  // 1. Get all companies
  const { data: companies } = await (supabase as any)
    .from('companies')
    .select('id, name')

  for (const company of companies ?? []) {
    // 2. Get admins for company
    const { data: admins } = await (supabase as any)
      .from('profiles')
      .select('id')
      .eq('company_id', company.id)
      .eq('role', 'admin')

    // 3. Get ideas
    const { data: ideas } = await (supabase as any)
      .from('ideas')
      .select('created_at, status')
      .eq('company_id', company.id)

    const now = Date.now()
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000

    const recentIdeas =
      ideas?.filter(
        (i: any) =>
          now - new Date(i.created_at).getTime() < ONE_WEEK
      ) ?? []

    const needsReview =
      ideas?.filter(
        (i: any) =>
          i.status === 'open' || i.status === 'under_review'
      ).length ?? 0

    const implemented =
      recentIdeas.filter((i: any) => i.status === 'implemented')
        .length ?? 0

    // 4. Send to each admin
    for (const admin of admins ?? []) {
      const { data: user } =
        await supabase.auth.admin.getUserById(admin.id)

      if (!user?.user?.email) continue

      await sendWeeklySummary({
        email: user.user.email,
        companyName: company.name,
        stats: {
          totalIdeas: recentIdeas.length,
          needsReview,
          implemented,
        },
      })
    }
  }

  return NextResponse.json({ success: true })
}