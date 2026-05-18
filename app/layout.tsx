import type { Metadata, Viewport } from 'next'
import './globals.css'
import AnalyticsProvider from '@/components/AnalyticsProvider'
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
    default: 'IdeaFlow — AI-Powered Employee Insight Platform',
    template: '%s · IdeaFlow',
  },
  description:
    "Turn your team's ideas into real impact. IdeaFlow is the AI-powered employee insight platform that surfaces what your team is really thinking — and helps leaders act on it.",
  keywords: [
    'employee ideas', 'idea management', 'team feedback', 'employee engagement',
    'AI insights', 'employee insight platform', 'idea board', 'team collaboration',
    'leadership intelligence', 'company feedback tool',
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
    title: 'IdeaFlow — AI-Powered Employee Insight Platform',
    description:
      "The AI-powered platform that turns employee ideas into leadership intelligence. Collect ideas, surface insights, and act with confidence.",
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'IdeaFlow — AI-Powered Employee Insight Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IdeaFlow — AI-Powered Employee Insight Platform',
    description:
      "Turn your team's ideas into leadership intelligence. Collect, rank, and act on employee insights with AI.",
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
      </body>
    </html>
  )
}
