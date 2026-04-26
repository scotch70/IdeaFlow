import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Extract the real client IP from Next.js / Vercel request headers.
 * x-forwarded-for is set by Vercel's edge network.
 * Falls back to x-real-ip, then a local-dev sentinel.
 */
export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? '127.0.0.1'
}

/**
 * Atomic rate-limit check backed by Supabase (no extra service needed).
 * Calls the check_rate_limit() SQL function which does an INSERT … ON CONFLICT
 * DO UPDATE in a single round-trip, so concurrent requests are serialised at
 * the DB level — no race conditions.
 *
 * Fails OPEN on DB error: a transient Supabase hiccup will never block a
 * legitimate user. The error is logged so it's visible in your dashboard.
 *
 * @param key           Unique string per route + IP, e.g. "invites:1.2.3.4"
 * @param windowSeconds Length of the sliding window in seconds
 * @param maxRequests   Maximum allowed requests within the window
 * @returns true = allowed, false = rate-limit exceeded
 */
export async function checkRateLimit(
  key: string,
  windowSeconds: number,
  maxRequests: number,
): Promise<boolean> {
  const admin = createAdminClient()
  const { data, error } = await (admin as any).rpc('check_rate_limit', {
    p_key:            key,
    p_window_seconds: windowSeconds,
    p_max_requests:   maxRequests,
  })
  if (error) {
    console.error('[ratelimit] check_rate_limit RPC failed:', error.message)
    return true // fail open
  }
  return data === true
}
