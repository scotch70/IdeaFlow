import { resend } from '@/lib/supabase/resend'

export async function sendWeeklySummary({
  email,
  companyName,
  stats,
}: {
  email: string
  companyName: string
  stats: {
    totalIdeas: number
    needsReview: number
    implemented: number
  }
}) {
  const html = `
    <div style="font-family: Arial; line-height: 1.6;">
      <h2>${companyName} — Weekly Idea Summary</h2>

      <p>Your team activity this week:</p>

      <ul>
        <li><strong>${stats.totalIdeas}</strong> ideas submitted</li>
        <li><strong>${stats.needsReview}</strong> need your review</li>
        <li><strong>${stats.implemented}</strong> implemented</li>
      </ul>

      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/review"
           style="display:inline-block;padding:10px 16px;background:#111827;color:#fff;border-radius:8px;text-decoration:none;">
          Review ideas
        </a>
      </p>

      <p style="font-size:12px;color:#6b7280;">
        Stay on top of your team’s ideas.
      </p>
    </div>
  `

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: [email],
    subject: `${companyName} — Weekly idea summary`,
    html,
  })
}