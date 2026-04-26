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

  const memberCount = members?.length ?? 0

  return (
    <div>
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(26,107,191,0.09)',
          position: 'sticky',
          top: 0,
          zIndex: 9,
        }}
      >
        <PageContainer style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                Team
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
                Members
              </h1>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#9ab0c8', fontWeight: 500 }}>
              {memberCount} member{memberCount !== 1 ? 's' : ''}
            </p>
          </div>
        </PageContainer>
      </div>
      <main>
        <PageContainer style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div style={{ maxWidth: '40rem' }}>
            {/* Card wrapper for member list */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid rgba(26,107,191,0.10)',
                padding: '1.5rem',
                boxShadow: '0 2px 12px rgba(6,14,38,0.05)',
              }}
            >
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem' }}>
                  Team members
                </p>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1f35' }}>
                  People in your workspace
                </h2>
              </div>
              <TeamMembers
                members={members ?? []}
                currentUserId={user.id}
                currentUserRole={profile.role}
              />
            </div>

            {/* Invite CTA for admins */}
            {profile.role === 'admin' && (
              <div
                style={{
                  marginTop: '1rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(249,115,22,0.18)',
                  background: 'rgba(249,115,22,0.04)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d1f35', marginBottom: '0.15rem' }}>
                    Add team members
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#9ab0c8', lineHeight: 1.4 }}>
                    Send an invite link to give someone access to the workspace.
                  </p>
                </div>
                <a
                  href="/dashboard/invites"
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: '#c2540a',
                    background: 'rgba(249,115,22,0.09)',
                    border: '1px solid rgba(249,115,22,0.2)',
                    borderRadius: '0.5rem',
                    padding: '0.45rem 0.875rem',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Generate invite →
                </a>
              </div>
            )}
          </div>
        </PageContainer>
      </main>
    </div>
  )
}
