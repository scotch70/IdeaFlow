import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageContainer from '@/components/PageContainer'
import MembersRelationshipList from '@/components/MembersRelationshipList'
import { getWorkspaceMembersWithFlows } from '@/lib/members/getWorkspaceMembersWithFlows'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Members — IdeaFlow' }

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

  // Server-side join: members × IdeaFlows. Honours audience_mode + the legacy
  // empty-round_members fallback. Closed and deleted flows are excluded.
  const members = await getWorkspaceMembersWithFlows(profile.company_id)

  const totalMembers   = members.length
  const activeMembers  = members.filter(m => m.flows.length > 0).length

  return (
    <div>
      {/* ── Sticky header ───────────────────────────────────────────────── */}
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
              <p style={{
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: '#9ab0c8', marginBottom: '0.2rem',
              }}>
                Team
              </p>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em' }}>
                Members
              </h1>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#9ab0c8', fontWeight: 500 }}>
              {activeMembers} active · {totalMembers} total
            </p>
          </div>
        </PageContainer>
      </div>

      <main>
        <PageContainer style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
          <div style={{ maxWidth: '44rem' }}>
            <MembersRelationshipList
              members={members}
              currentUserId={user.id}
              currentUserRole={profile.role}
            />

            {/* ── Invite CTA for admins ──────────────────────────────────── */}
            {profile.role === 'admin' && (
              <div
                style={{
                  marginTop: '1.25rem',
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
                    Members join the workspace through an IdeaFlow invite — start from any flow.
                  </p>
                </div>
                <a
                  href="/dashboard/flows"
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
                  Invite via IdeaFlow →
                </a>
              </div>
            )}
          </div>
        </PageContainer>
      </main>
    </div>
  )
}
