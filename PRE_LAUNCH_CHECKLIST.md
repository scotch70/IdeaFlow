# IdeaFlow — Pre-Launch Checklist

Items that are easy to overlook but break real user flows at launch.

---

## Auth & Onboarding

- [ ] **Confirm email page copy is correct** — the confirmation email links back to your domain, not Supabase's default. Check the Supabase Auth → Email Templates settings.
- [ ] **`/api/onboard` is the redirect after signup** — verify the Supabase Auth redirect URL is set to `https://yourdomain.com/api/onboard`, not `/dashboard` directly.
- [ ] **`handle_new_user` trigger is deployed** — if the trigger is missing, new signups get no profile row and onboard silently fails. Test with a fresh incognito signup.
- [ ] **`?error=temporary_error` is handled on the auth page** — users redirected back from `/api/onboard` on a transient DB failure see a meaningful "something went wrong, please try again" message rather than a blank error parameter in the URL.
- [ ] **`?error=onboarding_failed` signs the user out correctly** — confirm the auth page detects this param and shows a hard-failure message (not a retry loop).
- [ ] **Password hint is visible** — the "at least 8 characters" hint appears in signup mode. Supabase enforces this server-side; a silent 422 with no hint is a confusing dead end.
- [ ] **Email confirmation link says "opens automatically in your browser"** — not "close this tab" (old copy that leaves users waiting on the wrong screen).

---

## Invites

- [ ] **Invite link is an absolute URL** — the `joinUrl` returned from `/api/invites` must include the full origin. A relative path breaks when copied into email clients or Slack.
- [ ] **Invite expiry is enforced at join time** — not just at creation time. A stale invite from weeks ago should not grant access.
- [ ] **Seat cap is checked at join time** — not just when the invite is created. Parallel invite creation races can push a workspace over its cap without this.
- [ ] **Cross-company join is blocked** — a user already in workspace A cannot consume an invite for workspace B. They must contact their admin first.
- [ ] **Admin consuming their own invite does not lose admin role** — the `nextRole` logic preserves `admin` for same-company joins. Verify this in staging.
- [ ] **Invite retry after network drop completes** — if the browser drops the connection between the atomic claim and the profile upsert, the next retry detects `joined_user_id = user.id` and completes rather than returning `INVITE_USED`.
- [ ] **`invite_code` is unguessable** — confirm it is generated with `crypto.randomUUID()` or equivalent, not a short numeric code.

---

## Idea Submission

- [ ] **Round state is enforced server-side** — `/api/ideas` rejects inserts when `idea_round_status` is `draft` or `closed`. A user bypassing the UI with a direct POST should not succeed.
- [ ] **Silent RLS block returns a 500, not 200** — if `data` is null after insert (RLS rejected the write), the API now returns an error. Confirm the form surfaces this rather than silently closing.
- [ ] **Title length constraint is set in the DB** — a `CHECK (char_length(title) <= 200)` constraint prevents unbounded inserts that bypass the UI's `maxLength`.
- [ ] **`company_id` is never read from the request body** — the server derives it from the authenticated user's profile. A forged `company_id` in the POST body should be ignored.
- [ ] **Empty description is stored as `NULL`, not `""`** — prevents empty strings slipping through the trim-or-null logic and rendering blank whitespace on cards.
- [ ] **`likes_count` trigger is deployed** — the `sync_likes_count()` trigger must be in place or the like counter stays at 0 forever. Run the backfill after deploying.

---

## Admin Review

- [ ] **Status update requires a note for `declined` and `implemented`** — the modal enforces this client-side, but `/api/ideas/status` should also validate and reject updates missing a required note.
- [ ] **Impact fields are required for `implemented`** — `impact_summary` minimum 10 characters is validated in the modal; confirm the API route enforces the same.
- [ ] **Only admins can call `/api/ideas/status`** — the route must check `profile.role === 'admin'` server-side. The "update status" button is hidden in the UI, but the endpoint should not trust that.
- [ ] **Optimistic lock on status update** — the `.eq('status', currentStatus)` guard prevents two admins overwriting each other. Confirm the 409 response is handled gracefully on the client (not a blank error).
- [ ] **Status change notification emails are fire-and-forget** — if Resend fails, the status still updates. Confirm the API returns success and logs the `emailWarning` rather than returning a 500 to the admin.

---

## Billing Limits

- [ ] **Trial end date is set at company creation** — the `trial_ends_at` value is written during `/api/onboard`. Verify it is `Date.now() + 14 days`, not `null`.
- [ ] **Trial expiry is checked in `canAddMembers()`** — a workspace on the free plan whose trial has ended should hit the seat cap immediately, not after the next billing cycle.
- [ ] **Stripe webhook secret is set in production env** — `STRIPE_WEBHOOK_SECRET` missing in `.env` causes all webhook events to return 400 and never upgrade companies.
- [ ] **`checkout.session.completed` missing `company_id` now returns 400** — Stripe will retry the event. Confirm this does not cause duplicate upgrades by checking idempotency (the `plan: 'pro'` update is safe to apply twice).
- [ ] **Subscription cancellation downgrades immediately** — `customer.subscription.deleted` sets `plan: 'free'`. Test by cancelling a test subscription in Stripe and verifying the dashboard reflects the change within seconds.
- [ ] **Stripe test mode keys are not in production** — `STRIPE_SECRET_KEY` must start with `sk_live_` in production, not `sk_test_`.

---

## Error Handling

- [ ] **`PostgrestError` is never swallowed by `instanceof Error`** — all catch blocks use `String(err)` or `err?.message ?? String(err)` rather than `err instanceof Error ? err.message : 'Something went wrong'`.
- [ ] **Failed comment load is surfaced to the user** — the current silent `catch(() => {})` in `IdeaComments` means users see no comments with no explanation. Add a `loadFailed` state with a retry link before launch.
- [ ] **Like errors use inline state, not `alert()`** — `alert()` is blocked by some browsers and Safari PWAs. Replace with an inline error beneath the like button.
- [ ] **All fetch calls in components have loading and error states** — no action button should be clickable while a request is in flight (prevents double-submits).

---

## Edge Cases

- [ ] **First user with no ideas sees the form auto-open** — `defaultOpen={ideas.length === 0}` is set on `NewIdeaForm`. Verify this prop reaches the component after the empty-state render path.
- [ ] **Draft round shows a banner, not a locked form with no explanation** — `roundStatus === 'draft'` is included in `showRoundBanner` and renders the orange "coming soon" banner.
- [ ] **Single-member workspace sees the invite nudge** — the trial banner shows "Invite your team →" when `memberCount <= 1`. Confirm this renders for brand-new workspaces.
- [ ] **Invite form requires both name and email** — the `required` attribute on the email field is present, but the `handleGenerateInvite` function validates both fields before calling the API. Confirm neither can be bypassed.
- [ ] **Deleting an idea with open comments does not orphan comment rows** — the `ideas` table should have `ON DELETE CASCADE` on the `comments.idea_id` foreign key, or comments must be deleted explicitly in the route.

---

## Security

- [ ] **`profiles_update_own` RLS policy has a `WITH CHECK` clause** — prevents users from setting `role = 'admin'` or changing their `company_id` via a direct Supabase client call.
- [ ] **Service role client (`createAdminClient`) is only used in server-side route handlers** — never imported in components, client utilities, or anything bundled for the browser.
- [ ] **`SUPABASE_SERVICE_ROLE_KEY` is not exposed to the client bundle** — confirm it is not prefixed with `NEXT_PUBLIC_` anywhere in the codebase.
- [ ] **Webhook endpoint validates the Stripe signature before reading the body** — the `constructEvent` call is the first thing that runs after reading `req.text()`. Nothing is written to the DB before signature verification.
- [ ] **Invite codes are single-use and hard to enumerate** — `used_at IS NOT NULL` check plus UUID-based codes. Confirm there is no endpoint that lists all active invite codes without admin auth.
- [ ] **Rate limiting is in place on auth and invite endpoints** — Supabase Auth has built-in rate limits, but `/api/invites` (invite creation) and `/api/join` (invite consumption) should have their own limits or be behind Vercel's edge rate limiting.
- [ ] **`Content-Security-Policy` header is set** — prevents XSS via injected scripts. At minimum, restrict `script-src` to `'self'` in `next.config.js` headers.
- [ ] **All user-supplied URLs (e.g. `impact_link`) are validated before rendering as `<a href>`** — accept only `https://` to prevent `javascript:` injection.
