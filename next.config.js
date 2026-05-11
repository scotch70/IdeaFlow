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
          // Redundant with frame-ancestors in CSP, but kept for older browsers
          // that don't parse CSP (IE11, some legacy proxies).
          { key: 'X-Frame-Options',         value: 'DENY' },
          // Stops browsers from sniffing a response body as a different MIME
          // type — prevents drive-by downloads being mis-executed as scripts.
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          // Send full URL only to same-origin requests; strip to origin-only
          // for cross-origin navigations so internal paths aren't leaked.
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          // Opt out of browser features we never use.  Keeps the attack surface
          // small if a third-party script ever runs in our context.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
