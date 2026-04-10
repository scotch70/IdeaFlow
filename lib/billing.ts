export function isTrialActive(trialEndsAt: string | null) {
  if (!trialEndsAt) return false
  return new Date(trialEndsAt) > new Date()
}

export function canAddMembers({
  plan,
  trialEndsAt,
  memberCount,
}: {
  plan: string
  trialEndsAt: string | null
  memberCount: number
}) {
  if (plan === 'pro') return true
  if (isTrialActive(trialEndsAt)) return memberCount < 10
  return false
}