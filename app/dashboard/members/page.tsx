import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TeamMembers from '@/components/TeamMembers'
import PageContainer from '@/components/PageContainer'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Members — IdeaFlow' }

type MemberResult = {
  id: string
  full_name: string | null
  role: string
}

export default async function MembersPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()) as unknown as { data: { company_id: string | null; role: string } | null }

  if (!profile?.company_id) redirect('/dashboard')

  const { data: members } = (await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: true })) as unknown as { data: MemberResult[] | null }

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
            Team
          </p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
            Members
          </h1>
        </PageContainer>
      </div>
      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div style={{ maxWidth: '40rem' }}>
            <TeamMembers
              members={members ?? []}
              currentUserId={user.id}
              currentUserRole={profile.role}
            />
          </div>
        </PageContainer>
      </main>
    </div>
  )
}
