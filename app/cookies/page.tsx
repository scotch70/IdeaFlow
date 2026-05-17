import Link from 'next/link'
import type { Metadata } from 'next'
import SiteHeader from '@/components/SiteHeader'
import PageContainer from '@/components/PageContainer'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How IdeaFlow uses cookies and similar technologies.',
}

const LAST_UPDATED = 'May 2025'

export default function CookiesPage() {
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
            Cookie Policy
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#8b96a8' }}>Last updated: {LAST_UPDATED}</p>
        </PageContainer>
      </div>

      <PageContainer style={{ padding: '3rem 0 6rem' }}>
        <div style={{ maxWidth: '44rem' }}>
          <div style={{ fontSize: '0.925rem', lineHeight: 1.8, color: '#374151' }}>
            <style>{`
              .legal-prose a { color: #c2540a; text-decoration: none; font-weight: 500; }
              .legal-prose a:hover { text-decoration: underline; }
              .legal-prose ul { padding-left: 1.25rem; margin: 0.5rem 0 1rem; }
              .legal-prose li { margin-bottom: 0.35rem; }
              .legal-prose p { margin: 0 0 0.875rem; }
              .legal-prose strong { color: #0d1f35; font-weight: 600; }
              .legal-prose table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.875rem; }
              .legal-prose th { text-align: left; padding: 0.625rem 0.875rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: #8b96a8; border-bottom: 1px solid rgba(0,0,0,0.07); }
              .legal-prose td { padding: 0.625rem 0.875rem; border-bottom: 1px solid rgba(0,0,0,0.04); vertical-align: top; }
              .legal-prose tr:last-child td { border-bottom: none; }
            `}</style>
            <div className="legal-prose">

              <p>This Cookie Policy explains how IdeaFlow uses cookies and similar storage technologies on our website and platform.</p>

              <div style={{ marginBottom: '2.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  What are cookies?
                </h2>
                <p>Cookies are small text files that a website places on your device when you visit it. They help the site remember information about your visit, such as your login session or preferences. We also use <strong>localStorage</strong>, a browser storage mechanism that works similarly.</p>
              </div>

              <div style={{ marginBottom: '2.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  Cookies we use
                </h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name / Category</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                      <th>Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>sb-* (Supabase auth)</strong></td>
                      <td>Stores your authentication session so you remain logged in between page loads.</td>
                      <td>Session / 7 days</td>
                      <td>Yes</td>
                    </tr>
                    <tr>
                      <td><strong>ideaflow_onboarding_dismissed</strong> (localStorage)</td>
                      <td>Remembers whether you have dismissed the onboarding checklist, so it doesn&apos;t reappear.</td>
                      <td>Persistent</td>
                      <td>No</td>
                    </tr>
                    <tr>
                      <td><strong>Stripe cookies</strong></td>
                      <td>Set by Stripe during the payment checkout flow to prevent fraud. These are only active during the checkout process.</td>
                      <td>Session</td>
                      <td>For billing only</td>
                    </tr>
                  </tbody>
                </table>

                <p>We do <strong>not</strong> use:</p>
                <ul>
                  <li>Advertising or retargeting cookies</li>
                  <li>Third-party analytics cookies (e.g. Google Analytics)</li>
                  <li>Social media tracking pixels</li>
                  <li>Any cookies that track you across other websites</li>
                </ul>
              </div>

              <div style={{ marginBottom: '2.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  Managing cookies
                </h2>
                <p>You can control cookies through your browser settings. Note that disabling essential authentication cookies will prevent you from logging into IdeaFlow.</p>
                <p>Most browsers allow you to:</p>
                <ul>
                  <li>View and delete cookies stored for a specific site</li>
                  <li>Block third-party cookies</li>
                  <li>Clear all cookies on browser close</li>
                </ul>
                <p>For instructions, visit your browser&apos;s help documentation or <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer">aboutcookies.org</a>.</p>
              </div>

              <div style={{ marginBottom: '2.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  Changes to this policy
                </h2>
                <p>We may update this Cookie Policy when we change how we use cookies. We&apos;ll update the &quot;Last updated&quot; date above when this happens.</p>
              </div>

              <div style={{ marginBottom: '2.25rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1f35', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  Questions
                </h2>
                <p>If you have questions about our use of cookies, contact us at{' '}
                  <a href="mailto:privacy@useideaflow.com">privacy@useideaflow.com</a>.
                </p>
              </div>

            </div>
          </div>

        </div>
      </PageContainer>
    </div>
    <SiteFooter />
  )
}
