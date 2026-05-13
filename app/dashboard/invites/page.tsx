import { redirect } from 'next/navigation'

/**
 * Invites are now managed from within each IdeaFlow.
 * Navigate to a flow's detail page and use the "Members & invites" panel.
 */
export default function InvitesRedirectPage() {
  redirect('/dashboard/flows')
}
