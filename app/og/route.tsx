/**
 * GET /og
 *
 * Dynamic Open Graph image generator.
 * Returns a 1200×630 PNG branded card for social sharing.
 *
 * Query params:
 *   ?title=Custom+Title   — override the headline (optional)
 *   ?tag=Pricing          — small label tag above headline (optional)
 */

import { ImageResponse } from 'next/og'
import { NextRequest }   from 'next/server'

export const runtime = 'edge'

const DEFAULT_TITLE = 'AI-powered employee insight platform'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') || DEFAULT_TITLE
  const tag   = searchParams.get('tag')   || null

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#0d1f35',
          padding: '72px 80px',
          position: 'relative',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {/* Background radial glow top-right */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.18) 0%, transparent 65%)',
          display: 'flex',
        }} />

        {/* Background radial glow bottom-left */}
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-40px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(99,179,237,0.08) 0%, transparent 65%)',
          display: 'flex',
        }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            {/* Mark: simple orange square with rounded corners as a proxy */}
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex',
            }} />
            <span style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '-0.03em',
            }}>
              IdeaFlow
            </span>
          </div>

          {/* Tag label */}
          {tag && (
            <div style={{
              display: 'inline-flex',
              marginBottom: '20px',
            }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(249,115,22,0.9)',
                background: 'rgba(249,115,22,0.12)',
                border: '1px solid rgba(249,115,22,0.25)',
                borderRadius: '999px',
                padding: '4px 14px',
              }}>
                {tag}
              </span>
            </div>
          )}

          {/* Title */}
          <div style={{
            fontSize: title.length > 50 ? '44px' : '52px',
            fontWeight: 800,
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            maxWidth: '800px',
            flex: 1,
          }}>
            {title}
          </div>

          {/* Bottom row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.3)',
              fontWeight: 500,
            }}>
              useideaflow.com
            </span>

            {/* Feature pills */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {['AI Insights', 'Executive Reports', 'Team Analytics'].map(label => (
                <div key={label} style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  display: 'flex',
                }}>
                  {label}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
    },
  )
}
