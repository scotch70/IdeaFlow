import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InviteMembers from '@/components/InviteMembers'
import ActiveInvites from '@/components/ActiveInvites'
import PageContainer from '@/components/PageContainer'
import type { Database } from '@/types/database'

type InviteResult = Database['public']['Tables']['invites']['Row']

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Generate Invite — IdeaFlow' }

export default async function InvitesPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/auth')

  const { data: profile } = (await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single()) as unknown as { data: { company_id: string | null; role: string } | null }

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const { data: invites } = (await supabase
    .from('invites')
    .select('id, invite_code, role, used_at, created_at, name, email, expires_at, joined_user_id, profiles!invites_joined_user_id_fkey(full_name)')
    .eq('company_id', profile.company_id!)
    .order('created_at', { ascending: false })) as unknown as {
    data: (InviteResult & { profiles?: { full_name: string | null } | null })[] | null
  }

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
            Generate Invite
          </h1>
        </PageContainer>
      </div>
      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '40rem' }}>
            <InviteMembers />
            <ActiveInvites invites={invites ?? []} />
          </div>
        </PageContainer>
      </main>
    </div>
  )
}
