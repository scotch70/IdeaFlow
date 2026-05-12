import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'

export const metadata = { title: 'Settings — IdeaFlow' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  type ProfileRow = {
    full_name: string | null
    last_name: string | null
    job_function: string | null
    avatar_url: string | null
    role: string | null
    company_id: string | null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, last_name, job_function, avatar_url, role, company_id')
    .eq('id', user.id)
    .single() as unknown as { data: ProfileRow | null }

  // Fetch company plan so the billing card can show the correct state
  let companyPlan: string = 'free'
  if (profile?.company_id) {
    const { data: company } = await supabase
      .from('companies')
      .select('plan')
      .eq('id', profile.company_id)
      .single() as unknown as { data: { plan: string } | null }
    companyPlan = company?.plan ?? 'free'
  }

  return (
    <SettingsForm
      userId={user.id}
      email={user.email ?? ''}
      initialFirstName={profile?.full_name ?? ''}
      initialLastName={profile?.last_name ?? ''}
      initialJobFunction={profile?.job_function ?? ''}
      initialAvatarUrl={profile?.avatar_url ?? ''}
      role={profile?.role ?? 'member'}
      companyPlan={companyPlan}
    />
  )
}
