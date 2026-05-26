/**
 * /dashboard/sessions/[id] — the session workspace.
 *
 * Server-side: auth + Pro gate. The actual workspace (drag canvas, sidebar,
 * guide panel) is a client component that mounts inside the dashboard shell.
 *
 * NOTE: the session itself is loaded client-side from the mock store so we
 * don't need to round-trip Supabase before the canvas appears. When the real
 * DB is wired, the loader inside SessionWorkspace can be swapped for a
 * server-fetched initialData prop without touching this page.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProLockScreen from '@/components/sessions/ProLockScreen'
import SessionWorkspace from '@/components/sessions/SessionWorkspace'
import { canUseSessions } from '@/lib/plans/planFeatures'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Session — IdeaFlow' }

export default async function SessionWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()) as unknown as { data: { company_id: string | null } | null }

  if (!profile?.company_id) redirect('/dashboard')

  const { data: companyRow } = (await supabase
    .from('companies')
    .select('plan')
    .eq('id', profile.company_id)
    .single()) as unknown as { data: { plan: string } | null }
  const plan = companyRow?.plan ?? 'free'

  if (!canUseSessions(plan)) {
    return (
      <div style={{ paddingTop: '1.25rem' }}>
        <ProLockScreen />
      </div>
    )
  }

  return <SessionWorkspace sessionId={id} userId={user.id} />
}
