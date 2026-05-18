import Link from 'next/link'
import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import PageContainer from '@/components/PageContainer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms and conditions governing your use of IdeaFlow.',
}

const LAST_UPDATED = 'May 2025'
const CONTACT_EMAIL = 'legal@useideaflow.com'

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', fontFamily: "'DM Sans', sans-serif" }}>
      <SiteHeader />

      {/* Hero */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '3rem 0 2.5rem' }}>
        <PageContainer>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#c2540a', marginBottom: '0.5rem',
          }}>
            Legal
          </p>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            letterSpacing: '-0.025em',
            color: '#0d1f35',
            lineHeight: 1.2,
            marginBottom: '0.75rem',
          }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#8b96a8' }}>
            Last updated: {LAST_UPDATED}
          </p>
        </PageContainer>
      </div>

      {/* Content */}
      <PageContainer style={{ padding: '3rem 0 6rem' }}>
        <div style={{ maxWidth: '44rem' }}>
          <LegalProse>

            <p style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '0.5rem', padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#5d667a', marginBottom: '2rem' }}>
              By using IdeaFlow, you agree to these Terms of Service. Please read them carefully before creating an account or using the platform.
            </p>

            <Section title="1. Definitions">
              <p><strong>&quot;IdeaFlow&quot;</strong> refers to the platform operated at useideaflow.com and app.useideaflow.com.</p>
              <p><strong>&quot;Workspace&quot;</strong> means an organisational account within IdeaFlow, associated with a company or team.</p>
              <p><strong>&quot;Administrator&quot;</strong> means a user with admin-level access to a Workspace.</p>
              <p><strong>&quot;Content&quot;</strong> means ideas, comments, votes, and other data submitted to the platform.</p>
              <p><strong>&quot;Subscription&quot;</strong> means a paid plan (Standard or Pro) granting access to additional features.</p>
            </Section>

            <Section title="2. Account and workspace">
              <p>To use IdeaFlow, you must create an account using a valid email address. You are responsible for maintaining the security of your account credentials.</p>
              <p>Each Workspace is associated with one organisation. You may not use IdeaFlow to provide services to third parties (i.e. as a white-labelled or resold product) without our explicit written permission.</p>
              <p>Workspace Administrators are responsible for managing members and ensuring that all team members comply with these Terms.</p>
            </Section>

            <Section title="3. Acceptable use">
              <p>You agree not to use IdeaFlow to:</p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Submit content that is defamatory, harassing, discriminatory, or illegal</li>
                <li>Attempt to gain unauthorised access to other workspaces or user accounts</li>
                <li>Reverse-engineer, decompile, or copy the platform software</li>
                <li>Use automated tools to scrape or extract data at scale</li>
                <li>Circumvent any usage limits or plan restrictions</li>
                <li>Upload malware or other harmful code</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts that violate these terms without notice.</p>
            </Section>

            <Section title="4. Subscriptions and billing">
              <p>IdeaFlow offers a free tier and paid Subscriptions (Standard and Pro). Paid Subscriptions are billed annually.</p>
              <p>By purchasing a Subscription, you authorise IdeaFlow to charge your payment method via Stripe at the stated price on a recurring annual basis until cancelled.</p>
              <p><strong>Cancellation:</strong> You may cancel your Subscription at any time via the Settings page. Cancellation takes effect at the end of the current billing period. No refunds are provided for unused time within a billing period.</p>
              <p><strong>Price changes:</strong> We will give at least 30 days&apos; notice of any price changes to existing subscribers before they take effect.</p>
              <p><strong>Plan limits:</strong> Different plans have different usage limits (members, IdeaFlows, features). Using features beyond your plan limits is not permitted.</p>
            </Section>

            <Section title="5. Data ownership and content">
              <p><strong>Your content belongs to you.</strong> You retain all rights to the ideas, comments, and other content your team submits to IdeaFlow. We do not claim ownership of your workspace content.</p>
              <p>You grant IdeaFlow a limited, non-exclusive licence to store, process, and display your content solely for the purpose of providing the platform service to you.</p>
              <p>We do not use your workspace content to train general AI models or share it with third parties except as described in our <Link href="/privacy">Privacy Policy</Link>.</p>
            </Section>

            <Section title="6. AI features">
              <p>The Pro plan includes AI-generated insights, summaries, and recommendations (&quot;AI Features&quot;). These are generated algorithmically using your workspace content and are provided for informational purposes only.</p>
              <p>AI Features are not guaranteed to be accurate, complete, or suitable for any particular business decision. You should apply your own judgement before acting on any AI-generated content.</p>
            </Section>

            <Section title="7. Service availability">
              <p>We aim to provide a reliable service but do not guarantee 100% uptime. IdeaFlow is provided &quot;as is&quot; and we may perform maintenance that temporarily affects availability.</p>
              <p>We will communicate planned maintenance in advance where possible and aim to resolve unplanned outages as quickly as possible.</p>
            </Section>

            <Section title="8. Limitation of liability">
              <p>To the maximum extent permitted by law, IdeaFlow&apos;s liability to you is limited to the amount you paid for the Subscription in the 12 months preceding the claim.</p>
              <p>IdeaFlow is not liable for indirect, incidental, special, consequential, or punitive damages, including loss of profit, data, or business opportunities.</p>
              <p>Some jurisdictions do not allow limitation of liability for consumer rights. If you are a consumer, these limitations may not apply to you.</p>
            </Section>

            <Section title="9. Intellectual property">
              <p>The IdeaFlow platform, its design, code, and branding are owned by IdeaFlow and protected by intellectual property law. You may not copy, modify, or redistribute them without written permission.</p>
              <p>We welcome feedback and suggestions. By sharing feedback with us, you grant us the right to use it without any obligation to compensate you.</p>
            </Section>

            <Section title="10. Termination">
              <p>You may delete your account at any time from the Settings page. Upon deletion, your personal data and workspace content will be permanently removed within 30 days.</p>
              <p>We may suspend or terminate your account if you violate these Terms or if your payment fails and is not resolved within 14 days of notice.</p>
              <p>Upon termination, your right to use the platform ceases immediately.</p>
            </Section>

            <Section title="11. Governing law">
              <p>These Terms are governed by the laws of the Netherlands. Any disputes will be subject to the exclusive jurisdiction of the courts of the Netherlands, unless consumer protection laws in your country provide for local jurisdiction.</p>
            </Section>

            <Section title="12. Changes to these terms">
              <p>We may update these Terms from time to time. When we make material changes, we will notify Workspace Administrators by email at least 14 days before the changes take effect. Your continued use of IdeaFlow after that date constitutes acceptance.</p>
            </Section>

            <Section title="13. Contact">
              <p>For legal questions or notices:</p>
              <p>
                <strong>IdeaFlow</strong><br />
                Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </p>
            </Section>

          </LegalProse>

        </div>
      </PageContainer>
    </div>
  )
}

// ── Shared layout helpers ──────────────────────────────────────────────────────

function LegalProse({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '0.925rem', lineHeight: 1.8, color: '#374151' }}>
      <style>{`
        .legal-prose h4 { font-size: 0.875rem; font-weight: 700; color: #0d1f35; margin: 1rem 0 0.25rem; }
        .legal-prose a { color: #c2540a; text-decoration: none; font-weight: 500; }
        .legal-prose a:hover { text-decoration: underline; }
        .legal-prose ul { padding-left: 1.25rem; margin: 0.5rem 0 1rem; }
        .legal-prose li { margin-bottom: 0.35rem; }
        .legal-prose p { margin: 0 0 0.875rem; }
        .legal-prose strong { color: #0d1f35; font-weight: 600; }
      `}</style>
      <div className="legal-prose">{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2.25rem' }}>
      <h2 style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '1rem',
        fontWeight: 700,
        color: '#0d1f35',
        marginBottom: '0.75rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}
