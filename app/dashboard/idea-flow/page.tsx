import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import IdeaRoundAdmin from '@/components/IdeaRoundAdmin'
import PageContainer from '@/components/PageContainer'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Set Up IdeaFlow — IdeaFlow' }

type RoundStatus = 'draft' | 'active' | 'closed'

type RoundData = {
  idea_round_name: string | null
  idea_round_status: RoundStatus | null
  idea_round_starts_at: string | null
  idea_round_ends_at: string | null
}

export default async function IdeaFlowSetupPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()) as unknown as { data: { company_id: string | null; role: string } | null }

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const { data: roundData } = (await supabase
    .from('companies')
    .select('idea_round_name, idea_round_status, idea_round_starts_at, idea_round_ends_at')
    .eq('id', profile.company_id!)
    .single()) as unknown as { data: RoundData | null }

  return (
    <div>
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(26,107,191,0.09)',
          position: 'sticky',
          top: '3.625rem',
          zIndex: 9,
        }}
      >
        <PageContainer style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
            Management
          </p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
            Set Up IdeaFlow
          </h1>
        </PageContainer>
      </div>
      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div style={{ maxWidth: '40rem' }}>
            <IdeaRoundAdmin
              companyId={profile.company_id!}
              initialName={roundData?.idea_round_name ?? null}
              initialStatus={roundData?.idea_round_status ?? null}
              initialStartsAt={roundData?.idea_round_starts_at ?? null}
              initialEndsAt={roundData?.idea_round_ends_at ?? null}
            />
          </div>
        </PageContainer>
      </main>
    </div>
  )
}
