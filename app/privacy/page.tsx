import Link from 'next/link'
import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import PageContainer from '@/components/PageContainer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How IdeaFlow collects, uses, and protects your personal information.',
}

const LAST_UPDATED = 'May 2025'
const CONTACT_EMAIL = 'privacy@useideaflow.com'

export default function PrivacyPage() {
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
            Privacy Policy
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

            <Section title="1. Who we are">
              <p>IdeaFlow (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the platform at <strong>useideaflow.com</strong> and <strong>app.useideaflow.com</strong>. IdeaFlow is an AI-powered employee insight platform that helps organisations collect, surface, and act on team ideas.</p>
              <p>For questions about this policy, contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
            </Section>

            <Section title="2. Information we collect">
              <h4>Account information</h4>
              <p>When you create an account, we collect your email address, name, and the name of your organisation. This information is necessary to provide the service.</p>

              <h4>Workspace content</h4>
              <p>We store the ideas, comments, votes, and other content that you and your team members create inside IdeaFlow. This content belongs to your organisation and is used only to provide the platform functionality.</p>

              <h4>Usage data</h4>
              <p>We collect anonymised usage data to understand how the product is used and to improve it. This includes pages visited, features used, and interaction patterns. We do not sell this data.</p>

              <h4>Payment information</h4>
              <p>Billing is handled by <strong>Stripe</strong>, a certified PCI-compliant payment processor. We never store your full payment card details. We receive a token and subscription status from Stripe.</p>

              <h4>Communications</h4>
              <p>If you contact us by email or via the contact form, we retain that correspondence to help resolve your request.</p>
            </Section>

            <Section title="3. How we use your information">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve the IdeaFlow platform</li>
                <li>Send transactional emails (account confirmation, password reset, IdeaFlow reminders)</li>
                <li>Send weekly digest emails to workspace administrators (paid plans)</li>
                <li>Process billing through Stripe</li>
                <li>Respond to support requests and inquiries</li>
                <li>Generate AI-powered insights and summaries for your workspace (Pro plan)</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
              <p>We do not use your workspace content to train general AI models or share it with third parties for marketing purposes.</p>
            </Section>

            <Section title="4. Legal basis for processing (GDPR)">
              <p>If you are located in the European Economic Area (EEA), we process your personal data on the following legal bases:</p>
              <ul>
                <li><strong>Contract performance</strong> — to provide the IdeaFlow service you&apos;ve signed up for</li>
                <li><strong>Legitimate interests</strong> — to improve the product, ensure security, and communicate service updates</li>
                <li><strong>Consent</strong> — for optional communications such as product newsletters (where you have opted in)</li>
                <li><strong>Legal obligation</strong> — where we are required to retain data by law</li>
              </ul>
            </Section>

            <Section title="5. Data retention">
              <p>We retain your personal data for as long as your account is active or as needed to provide the service. If you delete your account, your personal data is removed within <strong>30 days</strong>, except where we are required by law to retain it for longer (such as billing records, which may be retained for up to 7 years).</p>
              <p>Workspace content (ideas, comments, votes) is deleted upon account or workspace deletion.</p>
            </Section>

            <Section title="6. Data sharing">
              <p>We share your data only with trusted sub-processors needed to operate the platform:</p>
              <ul>
                <li><strong>Supabase</strong> — database and authentication (EU-hosted on AWS Frankfurt)</li>
                <li><strong>Stripe</strong> — payment processing (PCI DSS Level 1 certified)</li>
                <li><strong>Resend</strong> — transactional email delivery</li>
                <li><strong>Vercel</strong> — application hosting and edge network</li>
              </ul>
              <p>We do not sell, rent, or trade your personal information to third parties.</p>
            </Section>

            <Section title="7. International transfers">
              <p>IdeaFlow is hosted in the European Union (Frankfurt, Germany via AWS). If any data is processed outside the EEA, we ensure appropriate safeguards are in place (such as Standard Contractual Clauses) in compliance with GDPR.</p>
            </Section>

            <Section title="8. Your rights">
              <p>If you are located in the EEA or the UK, you have the following rights under data protection law:</p>
              <ul>
                <li><strong>Access</strong> — you can request a copy of the personal data we hold about you</li>
                <li><strong>Rectification</strong> — you can request correction of inaccurate data</li>
                <li><strong>Erasure</strong> — you can request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Portability</strong> — you can request your data in a machine-readable format</li>
                <li><strong>Objection</strong> — you can object to processing based on legitimate interests</li>
                <li><strong>Restriction</strong> — you can request we restrict processing in certain circumstances</li>
              </ul>
              <p>To exercise any of these rights, email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will respond within 30 days.</p>
              <p>You also have the right to lodge a complaint with your local data protection authority (in the Netherlands: <strong>Autoriteit Persoonsgegevens</strong>).</p>
            </Section>

            <Section title="9. Cookies">
              <p>IdeaFlow uses the following types of cookies:</p>
              <ul>
                <li><strong>Essential cookies</strong> — required for authentication sessions and core functionality. These cannot be disabled.</li>
                <li><strong>Preference cookies</strong> — remember your UI preferences (e.g. sidebar state).</li>
              </ul>
              <p>We do not use advertising, tracking, or third-party analytics cookies. For more detail, see our <Link href="/cookies">Cookie Policy</Link>.</p>
            </Section>

            <Section title="10. Security">
              <p>We take security seriously. Our measures include:</p>
              <ul>
                <li>All data transmitted over HTTPS / TLS</li>
                <li>Database access governed by Row Level Security (RLS)</li>
                <li>Service-role keys never exposed to browser clients</li>
                <li>HTTP security headers (CSP, X-Frame-Options, HSTS)</li>
                <li>Stripe webhook signature verification</li>
                <li>Rate limiting on sensitive endpoints</li>
              </ul>
              <p>If you discover a security vulnerability, please disclose it responsibly to <a href="mailto:security@useideaflow.com">security@useideaflow.com</a>.</p>
            </Section>

            <Section title="11. Children">
              <p>IdeaFlow is intended for use by organisations and their employees. We do not knowingly collect personal data from individuals under the age of 16. If you believe a minor has provided us with personal data, please contact us and we will delete it promptly.</p>
            </Section>

            <Section title="12. Changes to this policy">
              <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify workspace administrators by email and update the &quot;Last updated&quot; date above. Your continued use of IdeaFlow after the change takes effect constitutes acceptance of the updated policy.</p>
            </Section>

            <Section title="13. Contact">
              <p>For any questions, requests, or concerns about this Privacy Policy:</p>
              <p>
                <strong>IdeaFlow</strong><br />
                Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </p>
            </Section>

          </LegalProse>

          {/* Footer nav */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Link href="/terms" style={{ fontSize: '0.875rem', color: '#5d667a', textDecoration: 'none' }}>
              Terms of Service →
            </Link>
            <Link href="/cookies" style={{ fontSize: '0.875rem', color: '#5d667a', textDecoration: 'none' }}>
              Cookie Policy →
            </Link>
            <Link href="/" style={{ fontSize: '0.875rem', color: '#b8c0ce', textDecoration: 'none' }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

// ── Shared layout helpers ──────────────────────────────────────────────────────

function LegalProse({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.925rem',
      lineHeight: 1.8,
      color: '#374151',
    }}>
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
