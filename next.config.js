/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js requires unsafe-inline for styles and unsafe-eval in dev.
              // Tighten script-src once you have nonces wired up.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // Supabase storage for avatars; data: / blob: for local previews
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
              // Supabase API + Stripe JS (checkout redirect, not embedded)
              "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          { key: 'X-Frame-Options',         value: 'DENY' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
