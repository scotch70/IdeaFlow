import type { Metadata } from 'next'
import './globals.css'
import SiteHeader from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'IdeaFlow — Employee Idea Management',
  description: "Turn your team's ideas into real impact. IdeaFlow is the idea management platform built for teams that care about continuous improvement.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ background: 'var(--page-bg)', color: 'var(--ink)' }}>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}