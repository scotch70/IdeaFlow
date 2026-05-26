/**
 * /dashboard/sessions/new — pick a template.
 *
 * Server-side: auth + Pro gate. Client TemplatePicker handles the actual
 * "create + redirect" once the user clicks a template.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/PageContainer'
import ProLockScreen from '@/components/sessions/ProLockScreen'
import TemplatePicker from '@/components/sessions/TemplatePicker'
import { canUseSessions } from '@/lib/plans/planFeatures'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'New session — IdeaFlow' }

export default async function NewSessionPage() {
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

  return (
    <div>
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(26,107,191,0.09)',
          position: 'sticky', top: 0, zIndex: 9,
        }}
      >
        <PageContainer style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Link
              href="/dashboard/sessions"
              style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8', textDecoration: 'none' }}
            >Sessions</Link>
            <span style={{ fontSize: '0.75rem', color: '#c8d6e5' }}>/</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>New</span>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
            Choose a template
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#9ab0c8', marginTop: '0.15rem' }}>
            Each template guides you through Define → Explore → Connect → Prioritize → Action plan.
          </p>
        </PageContainer>
      </div>

      <main>
        <PageContainer style={{ paddingTop: '1.5rem', paddingBottom: '2.5rem' }}>
          {canUseSessions(plan) ? (
            <TemplatePicker userId={user.id} companyId={profile.company_id} />
          ) : (
            <ProLockScreen />
          )}
        </PageContainer>
      </main>
    </div>
  )
}
