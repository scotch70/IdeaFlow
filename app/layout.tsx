import type { Metadata, Viewport } from 'next'
import './globals.css'
import AnalyticsProvider from '@/components/AnalyticsProvider'
import RememberMeWatcher from '@/components/RememberMeWatcher'
import SiteFooter from '@/components/SiteFooter'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.useideaflow.com'
const SITE_URL = 'https://useideaflow.com'

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'IdeaFlow — Collect ideas, run sessions, decide together',
    template: '%s · IdeaFlow',
  },
  description:
    "IdeaFlow gives every teammate a voice. Submit and vote on ideas, run structured brainstorm sessions, and end every discussion with a written decision.",
  keywords: [
    'idea management', 'brainstorming software', 'employee suggestion software',
    'innovation management', 'decision making software', 'team feedback',
    'employee engagement', 'idea board', 'team collaboration',
    'brainstorm sessions',
  ],
  authors: [{ name: 'IdeaFlow' }],
  creator: 'IdeaFlow',
  publisher: 'IdeaFlow',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'IdeaFlow',
    title: 'IdeaFlow — Collect ideas, run sessions, decide together',
    description:
      "Collect ideas, vote on what matters, and run structured brainstorm sessions that end with a written decision.",
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'IdeaFlow — Collect ideas, run sessions, decide together',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IdeaFlow — Collect ideas, run sessions, decide together',
    description:
      "Collect ideas, vote on what matters, and run brainstorm sessions that end with a written decision.",
    images: ['/og'],
    creator: '@useideaflow',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to font origins for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className="antialiased"
        style={{
          background: 'var(--page-bg)',
          color: 'var(--ink)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {children}
        <SiteFooter />
        <AnalyticsProvider />
        <RememberMeWatcher />
      </body>
    </html>
  )
}
