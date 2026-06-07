# IdeaFlow — Launch Blocker Report

_Final cleanup pass. 6 June 2026._

This report contains **launch blockers only** — what must be true before you press ship. No advice, no nice-to-haves, no rewrites.

---

## Cleanup edits applied this pass

Surgical copy/metadata changes only. No new files, no redesigns.

| File | Change |
| --- | --- |
| `app/layout.tsx` | Title, description, OG, Twitter all set to "Collect ideas, run sessions, decide together." Keywords swapped for the five target SEO categories. |
| `app/og/route.tsx` | OG image `DEFAULT_TITLE` and the three feature pills ("AI Insights / Executive Reports / Team Analytics" → "Ideas / Sessions / Decisions"). |
| `app/page.tsx` | `#sessions` H2 → "Every brainstorm should end with a decision." Body rewritten to remove SWOT + Decision Matrix; names only the two shipping templates. "+ Optional AI helpers" line removed from the Pro card. |
| `app/privacy/page.tsx` | "AI-powered employee insight platform" → product-accurate one-liner. "Generate AI-powered insights" bullet softened to "optional summaries and insights." |
| `components/SiteFooter.tsx` | Footer tagline now matches landing positioning. |
| `components/UpgradePlans.tsx` | "+ Optional AI helpers" line dropped — the Pro card now reads as a pure Sessions tier. |
| `components/sessions/ProLockScreen.tsx` | "7 templates" claim removed (you ship 2). "AI helpers" bullet removed. Bullets now describe Brainstorm Circle + Starbursting honestly. |

`npx tsc --noEmit` passes clean.

---

## Verified flows (read-only)

### Brainstorm Circle

- Layout math (`circleLayout.ts`): admin card same physical size as members; 3×3 grid; gap math floors at `MIN_HG=244 / MIN_VG=152` so admin↔member overlap is structurally impossible on any canvas wide enough to render the layout.
- Seeder (`TemplatePicker.tsx::seedBrainstormCircle`): 1 admin card + 8 members + 8 admin→member connections. Admin title is "Ask the team a question". Members 1–8 seeded with distinct prompts (opportunity / concern / improve / avoid / customers / team / missing / next step).
- Canvas (`SessionCanvas.tsx`): admin styling (ivory + orange border + dark text) is applied via `isAdmin` detection at render time; works for any session whether saved before or after the size change.
- Viewport (`SessionWorkspace.tsx`): on BC mount, force-collapses the three side panels and dispatches `ideaflow:dashboardSidebarForce` so the dashboard rail collapses too. Body gets `data-session-view="1"` which hides `SiteFooter` and locks scroll for all sessions.
- **Action required**: existing BC sessions created before the size change carry old saved positions in the DB. Users must click **Reset view** once. Brand-new sessions seed straight into the new layout. → **Not a blocker** but mention in release notes.

### Starbursting

- Template config (`templates.ts::STARBURSTING_TEMPLATE`) exists with the canonical 6 question lenses (Who/What/When/Where/Why/How).
- Editor: full GuidePanel + add-card form available (Brainstorm Circle hides the form; Starbursting shows it).
- No regressions found in the recent BC work.

### PDF export

- Route: `app/api/sessions/[id]/export/route.ts` — server renders print-ready HTML, page auto-fires `window.print()`, browser handles the actual PDF. No PDF library dependency; nothing can break at runtime from a missing peer dep.
- Reads `session_card_likes` non-fatally — if the table is missing, hearts show as 0 but the export still renders.
- Auth: gated by Supabase server client RLS — only sessions in the requesting user's company are returned.

### Stripe checkout

- Route: `app/api/stripe/checkout/route.ts` — validates `plan ∈ { 'standard', 'pro' }`, env-guards `STRIPE_SECRET_KEY`, `STRIPE_STANDARD_PRICE_ID`, `STRIPE_PRO_PRICE_ID`, `NEXT_PUBLIC_APP_URL` before doing anything.
- Webhook: `app/api/stripe/webhook/route.ts` — uses service-role client (correctly), maps price IDs back to plan slugs via `planFromPriceId`. Verifies signature against `STRIPE_WEBHOOK_SECRET`.
- **Action required**: confirm all five env vars are set in Vercel production. Listed as a launch blocker below.

### Signup flow

- `AuthForm.tsx`: validates name + company name (if not an invite signup), calls `supabase.auth.signUp` with `emailRedirectTo=/auth/callback?next=…`. If signup returns no session → shows email-confirm screen. If it returns a session → forces `window.location.assign(nextUrl)` (not `router.push`) so cookies flush before the next RSC fetch. Both behaviours are correct.
- Admin path: `company_name` lands in `user_metadata`; first dashboard hit redirects to `/api/onboard` which creates the company + profile idempotently.
- Member path: `/join-workspace` handles invite-code or workspace-creation. `app/dashboard/page.tsx` guards against the documented sign-out loop by routing members who lack `company_name` to `/join-workspace` rather than `/api/onboard`.

---

## Found in the codebase (informational)

These are facts about the current state. Most are not blockers — they're listed so you can decide.

### Dev-note comments still in source (internal, not user-visible)

- `app/dashboard/sessions/page.tsx:6-9` and `app/dashboard/sessions/[id]/page.tsx:7` reference "mock store (will swap to Supabase once the migration runs)". Stale — the store *is* Supabase. Internal comment, no user impact.
- `components/sessions/SessionsList.tsx:5` same stale "mock store" reference.
- `lib/sessions/store.ts:4, 21, 224` references the historical mock-store migration. Internal.

### Dashboard / post-login AI references (still present)

The user instruction was to remove AI-first messaging from **public marketing pages**. The following are post-login product surfaces and were not modified, but they remain inconsistent with the public positioning:

- `components/AISummaryCard.tsx` — full "Unlock AI workspace insights" upsell card.
- `components/AIInsightsPanel.tsx` — internal Pro feature panel; the feature itself works.
- `components/ActionRecommendations.tsx` — header comment still references "AI-powered insight platform" positioning.
- `components/UpgradeCheckout.tsx:111` — Pro plan one-liner says "€99/yr · 100 members · AI insights".
- `components/OnboardingChecklist.tsx:84, 163` — "AI-powered insight workspace" / "AI insights unlock once ideas come in".
- `app/api/cron/weekly-digest/route.ts:4` — docstring "AI-powered workspace digest".

**Recommendation:** sweep these in a single follow-up commit before any post-launch marketing push. Not a public-launch blocker.

### Placeholder marketing content

- `app/page.tsx:428-431` trusted-by strip uses invented logos (Forma, Spendr, Kantu, Lumio).
- `app/page.tsx:754-772` testimonials use invented people (Sander T., Maya R., Lotte V.) at the invented companies.
- This isn't broken code, but if these names map to real people they should consent; if they don't, this is fake social proof, which is a credibility risk on launch day. → See blockers.

### Debug logging in client code

- `components/ResetPasswordForm.tsx:64, 91, 111` — three `console.log` calls in the password-reset flow. Not blockers but they leak in production browser consoles.

### Failure-mode UX

- `components/UpgradePlans.tsx:57` and `components/UpgradeButton.tsx:41` use `alert(...)` on upgrade failure. Functional, ugly. Not a blocker.

---

## Launch blockers

Three categories. Everything below is must-fix before you ship.

### Code / deploy blockers

1. **Push pending commits** — local branch `feature/sessions-collab-ux` has commits `67b2229` (BC viewport + size) and `de1c4f6` (demo sync) that haven't been pushed. Production currently runs without them. Until pushed and Vercel redeploys, the live BC layout is the old big-admin overlapping version.
   ```
   git push --set-upstream origin feature/sessions-collab-ux
   ```
   Then merge to `main` (or whatever your production branch is) and confirm the deploy succeeded.

2. **Commit the launch-cleanup edits** — this session's edits to `app/layout.tsx`, `app/og/route.tsx`, `app/page.tsx`, `app/privacy/page.tsx`, `components/SiteFooter.tsx`, `components/UpgradePlans.tsx`, `components/sessions/ProLockScreen.tsx`, `app/demo/DemoBrainstormCircle.tsx`. Currently uncommitted. Without these, the live site still says "AI-Powered Employee Insight Platform" in the `<title>` and lists SWOT/Decision Matrix as features.

### Production environment blockers

3. **Stripe env vars set in Vercel production**:
   - `STRIPE_SECRET_KEY` (live key)
   - `STRIPE_STANDARD_PRICE_ID`
   - `STRIPE_PRO_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL` (canonical app URL, e.g. `https://app.useideaflow.com`)
   - The Stripe webhook URL (`/api/stripe/webhook`) must be registered in Stripe with the matching secret.
   If any single one is unset, the upgrade button alerts a 500 to the user and conversion is dead on arrival.

4. **Supabase migrations applied in production**:
   - `session_card_likes` table + RLS (hearts feature; non-fatal but silently no-ops without it)
   - `custom` card type + `custom_label` column on `session_cards` (required for both Brainstorm Circle seeding and Starbursting custom cards)
   - All baseline migrations (companies, profiles, ideas, idea_rounds, sessions, session_cards, session_connections, session_steps, likes, comments, invites)
   Verify each table exists in prod with `SELECT 1 FROM <table> LIMIT 1`.

5. **Email delivery wired up** — invite emails (`app/api/invites/route.tsx`), weekly digest cron, password reset, and Supabase signup confirmation all need a working SMTP / transactional email provider. Verify the Resend (or whatever) API key is set and at least one test email arrives.

### Trust / credibility blockers

6. **Fake social proof on the homepage** — both the trusted-by strip (`Forma, Spendr, Kantu, Lumio`) and the three testimonials (`Sander T. / Maya R. / Lotte V.`) are invented. Two options before launch:
   - **(a) Remove them.** Drop the entire trusted-by strip + testimonial grid. The page works without them.
   - **(b) Replace with one or two real references.** A single real customer quote is more valuable than three fake ones.
   Shipping with invented logos and quotes is a launch-day credibility risk that's hard to recover from if anyone notices.

7. **Smoke-test the four end-to-end flows on production** after deploy:
   - Sign up as a new admin → create workspace → land on dashboard
   - Sign up as a new member → enter invite code → land on dashboard
   - Create Brainstorm Circle → finish session → export PDF
   - Create Starbursting session → connect cards → export PDF
   - Click "Upgrade to Pro" → Stripe checkout opens → cancel → return to settings
   - Click "Upgrade to Pro" → complete a real test transaction → webhook downgrades the plan in DB
   ~45 minutes of manual testing. Cannot be skipped.

---

## Final readiness verdict

The product code is in launchable shape. The remaining work is mechanical:

1. Commit + push the cleanup edits in this session.
2. Push the two existing BC commits already on local.
3. Set the Stripe env vars in Vercel.
4. Verify Supabase migrations and email delivery.
5. Resolve the fake-logo / fake-testimonial issue (remove or replace).
6. Run the four end-to-end smoke tests on production.

Once those six items are done you can ship. None of them require building anything; they are all deploy / verify / decide actions.

**Status: 1 day of mechanical work between current state and launchable.**
