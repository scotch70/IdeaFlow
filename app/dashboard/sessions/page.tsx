/**
 * /dashboard/sessions — list of the user's IdeaFlow Sessions.
 *
 * Server component: handles auth, fetches the user's plan, gates Pro, then
 * hands off to the client SessionsList component which reads the actual
 * session rows from the mock store (will swap to Supabase once the migration
 * runs in your project).
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/PageContainer'
import ProLockScreen from '@/components/sessions/ProLockScreen'
import SessionsList from '@/components/sessions/SessionsList'
import { canUseSessions } from '@/lib/plans/planFeatures'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sessions — IdeaFlow' }

export default async function SessionsPage() {
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <p
                  style={{
                    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em',
                    textTransform: 'uppercase', color: '#9ab0c8',
                  }}
                >
                  Sessions
                </p>
                <span
                  style={{
                    fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: '#c2540a',
                    background: 'rgba(249,115,22,0.08)',
                    border: '1px solid rgba(249,115,22,0.22)',
                    borderRadius: '999px', padding: '0.12rem 0.42rem',
                  }}
                >
                  ✦ Pro
                </span>
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
                IdeaFlow Sessions
              </h1>
              <p style={{ fontSize: '0.825rem', color: '#9ab0c8', marginTop: '0.15rem' }}>
                Turn messy thoughts into clear direction.
              </p>
            </div>
          </div>
        </PageContainer>
      </div>

      <main>
        <PageContainer style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
          {canUseSessions(plan) ? (
            <SessionsList userId={user.id} companyId={profile.company_id} />
          ) : (
            <ProLockScreen />
          )}
        </PageContainer>
      </main>
    </div>
  )
}
