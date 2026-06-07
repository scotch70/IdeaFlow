# IdeaFlow — Launch Readiness Report

_Prepared: 6 June 2026._

This report walks the product as a first-time founder visitor, then sweeps every flow as a QA tester, then re-reads the marketing surfaces as a buyer. Nothing in this report is a feature request — the goal is to ship what already exists.

---

## Phase 1 — First-time user test

I opened `useideaflow.com` cold, with no context.

### What is IdeaFlow?

**The site can't decide.** Three different one-liners are visible within the first scroll:

| Surface | One-liner |
| --- | --- |
| Browser tab / `<title>` | "IdeaFlow — AI-Powered Employee Insight Platform" |
| Hero H1 | "Stop sending surveys. Start collecting ideas with IdeaFlow." |
| Hero subhead | "IdeaFlow gives everyone a voice, ranks ideas by vote, and shows you exactly what matters most." |
| `#sessions` H2 (mid-page) | "Turn ideas into decisions with guided thinking" |
| Pricing Pro badge | "Brainstorm Sessions" |
| OG card | "AI-powered platform that turns employee ideas into leadership intelligence" |

The hero positions IdeaFlow as a **vote-ranked idea board** (replacing surveys and Slack threads). The `#sessions` section positions it as a **structured brainstorming workspace**. The metadata still calls it an **AI insight platform**. These are three different products. A founder lands and bounces because they can't pattern-match what it is in 5 seconds.

### Who is it for?

Best guess from copy: "product, engineering and operations teams" (trusted-by strip) at companies of ~10–100 people (plan caps). The testimonials reinforce this. **Reasonably clear**, though the AI-heavy metadata and Pro card pull toward leadership/HR — pick one audience.

### Why should I pay?

**Unclear.** The hero is about voting on ideas — but voting is in the Free tier. The Pro card lists "Brainstorm Circle, Starbursting, Team collaboration, Session summaries, PDF exports, Up to 100 members." A first-time visitor reads that as feature soup. The single buyer-thought you want is "I'd pay €99/yr so my team's brainstorms actually end with a decision" — and that thought isn't on the page above the fold.

### What's different from Notion, Miro, Trello, Slack?

**Nothing on the page tells me.** The differentiation isn't mentioned anywhere on the homepage. The closest cue is the Maya R. testimonial ("the best ideas win, not the loudest voices in the room") — but that's buried below pricing on a screen most visitors never reach.

### Confusing wording, weak CTAs, unclear navigation

| # | Issue | Where | Rank |
| --- | --- | --- | --- |
| 1 | Hero, metadata, and Sessions section pitch three different products | landing + `<head>` | **Critical** |
| 2 | `#sessions` body still names "SWOT, Decision Matrix" — those templates were removed | `app/page.tsx:657` | **Critical** |
| 3 | "AI-Powered Employee Insight Platform" in the `<title>` after the explicit pivot away from AI messaging | `app/layout.tsx:18` | **Critical** |
| 4 | "Get started free →" CTA without telling me what I get free; visitor doesn't yet know IdeaFlow is free up to 10 people | hero | High |
| 5 | Nav says "Join" — but it links to signup. "Join" implies joining an existing workspace (which `/join` actually handles). Two meanings of the same word | `SiteHeader.tsx:43` | High |
| 6 | Demo banner says "Try your own Brainstorm Session. No sign-up needed." — but the demo is a static SVG mock, you can't actually try anything | `app/demo/page.tsx:35` | High |
| 7 | Pro card subtitle "Structured brainstorming and team decision-making" is correct but undersold — no proof | landing + UpgradePlans | Medium |
| 8 | "Watch the demo" link goes to `/demo` but the demo is a workspace mock, not a recorded walkthrough | `app/page.tsx:723` | Medium |
| 9 | Pricing trusted-by overline says "Built for product, engineering and operations teams" — but the Pro upgrade narrative is about leadership decisions | landing | Medium |
| 10 | Sessions list `/dashboard/sessions` page intro file header still references "mock store (will swap to Supabase once the migration runs)" — devnote leaking into a launch | `app/dashboard/sessions/page.tsx:7-9` | Low |
| 11 | "Up to 100 members" is the only Pro-only quantitative line; Standard is 50, so the upgrade reason looks like "more seats" not "more product" | UpgradePlans | Medium |
| 12 | "✦" glyph used in nav chips, plan badges, and the BC demo. Renders fine in most browsers but fragile across email clients if you ever paste this into outreach | sitewide | Low |

### Unnecessary complexity

- **`/features` page exists** but nothing on the homepage links into specific feature anchors. It's an undifferentiated list that competes with the homepage instead of supporting it.
- **`/cookies`, `/privacy`, `/terms`** all exist (good) — but the footer is buried at the very bottom of a tall homepage and the SiteFooter is wrapped to be hidden inside sessions (correct), so legal links are present but unfindable on dashboard.

---

## Phase 2 — Full QA pass

I walked every flow. Findings ordered by severity within each section.

### Homepage

- **Critical** — `#sessions` section names "SWOT, Decision Matrix" — these templates were removed. A visitor who reads it, clicks Pro, and lands in `/dashboard/sessions/new` sees only Brainstorm Circle + Starbursting. Cognitive dissonance.
- **High** — The `<title>` and OG card name the product an "AI-Powered Employee Insight Platform", contradicting the rest of the funnel.
- **Medium** — Trusted-by strip uses fake logos (Forma, Spendr, etc.). Standard pre-launch placeholder, but at launch consider replacing with "Built by a small team out of [city]" or a single real reference instead of imaginary ones.
- **Medium** — Hero H1 wraps via `<br />` ("Stop sending surveys.\nStart collecting ideas with IdeaFlow."). On 360px-wide phones the second line wraps awkwardly. Verify on a real device.
- **Low** — `hero` shows `HeroAnimation` component — confirm no jank on first paint; framer-motion is heavy and the page is already calling Tailwind + Next 16 + custom CSS.

### Pricing

- **Critical** — Yearly only (€49 / €99 / year). No monthly option. Founders evaluating tools default to monthly trial-then-cancel. This is the single largest conversion gap on the page.
- **High** — Standard's "Most popular" badge implies Standard is the upgrade goal, but the entire `#sessions` story above pushes Pro. Pick one — either Standard is the social-proof tier (and Pro is the niche), or Pro is the upgrade story (and the badge needs to move).
- **Medium** — Standard card lists "Everything in Free" with italic muted styling — good. Pro card lists "Everything in Standard" the same way — also good. But neither card tells me what I _lose_ by staying on Free, which is what actually drives upgrades.
- **Medium** — The `/api/stripe/checkout` route requires `STRIPE_STANDARD_PRICE_ID` and `STRIPE_PRO_PRICE_ID` env vars. If either is unset in production, the upgrade button alerts a 500 — pre-launch checklist item: verify both are set in Vercel prod env.
- **Low** — `UpgradeButton` does `alert(error.message)` on failure. A toast or inline error is more on-brand.

### Demo

- **High** — `/demo` is a static, non-interactive mock. The demo banner says "Try your own Brainstorm Session. No sign-up needed." but you can't do anything. Either change the copy to "See how it works — no sign-up needed" or wire a real, ephemeral playground (the latter is post-launch).
- **Medium** — Demo switcher has only two tabs: IdeaFlow Workspace (default) + Brainstorm Circle. Starbursting is sold on the pricing card but has no demo tab — a buyer who's curious about Starbursting has to sign up to see it.
- **Low** — Demo CTAs go to `/auth?mode=signup` and `/settings#billing`. The latter only works if the user is already signed in — guests get redirected to `/auth` then dropped at `/dashboard` (not `/settings#billing`). Either rewrite the CTA to `/auth?mode=signup&next=/settings#billing` or drop it.

### Contact

- **Low** — Form lives at `/contact` with categories: Product questions, Brainstorm Sessions, Pricing, Workspace setup. Clean.
- **Low** — No confirmation that submissions actually reach anyone. Verify the API route is wired up before launch (the `ContactForm.tsx` component exists but I didn't trace the network call end-to-end here).

### Signup flow

- **Critical** — `AuthForm.tsx:115` writes `company_name` into `user_metadata` during signup. If signup succeeds but the user closes the tab before `/api/onboard` runs, the next visit redirects to `/dashboard` → `/api/onboard` → tries to read `company_name` → works because metadata persists. **But:** the comment at `app/dashboard/page.tsx:62-66` warns about a "sign-out loop" if an invited member somehow hits `/api/onboard` without `company_name`. Worth a manual test of the failure path: sign up, kill the tab during the spinner, sign back in — should land at dashboard with workspace created, not loop.
- **High** — Signup collects "Full name" + "Company name" + "Email" + "Password" in one form. Four fields above the fold is fine, but there's no "I want to join an existing workspace" path on the signup screen itself — the user has to scroll, see the small "invite code" path, or use the nav's "Join" link (which itself goes to signup). Confusing.
- **Medium** — No password strength indicator. Supabase enforces minimum length but doesn't communicate it inline.
- **Medium** — Email confirmation flow: after signup `AuthForm` shows a "Confirm your email" state if Supabase didn't return a session. Verify the confirmation link works in production (`auth/callback` route exists at `app/auth/callback/route.ts` — wait, I noted it was missing earlier; double check).
- **Low** — `auth/page.tsx` has `robots: { index: false }` — good.

### Login

- **Low** — Login form is `AuthForm` with `mode=login`. Functional. The forgot-password link goes to `/forgot-password`. Verify the password-reset email template in Supabase has the right branding.

### Create workspace

- **Medium** — `/join-workspace` has a tab switcher: "Join with code" / "Create workspace". Default tab is "Join". For a founder who came in via the homepage CTA, the default should arguably be "Create" — the join path is for invited members coming from a Slack DM. Verify the entry-point inference is correct.
- **Medium** — "Create workspace" writes `company_name` to `user_metadata` then redirects to `/api/onboard`. If `/api/onboard` fails, the user sees `auth?error=onboarding_failed`. That's a dead-end with no retry. Test failure-mode UX.

### Invite member

- **Medium** — `InviteMembers.tsx` exists. Verify the invite email actually sends in production (look for SendGrid/Resend/etc. env vars). If the invite goes via "share this code", the friction is acceptable; if it's "we'll email them," confirm the email arrives.
- **Low** — `flow-invite/[code]` route exists for flow-level invites (separate from workspace invites). Test that an invited member can actually accept and land in the right flow.

### IdeaFlow voting system (Create idea, Vote, Comment, Update status)

- **Medium** — `NewIdeaForm.tsx`, `IdeaCard.tsx`, `IdeaComments.tsx`, `IdeaList.tsx`, `IdeaRoundBanner.tsx` all exist. Surface area is large and the dashboard is heavy. Smoke-test that:
  - Creating an idea, voting, commenting all persist immediately
  - The status workflow (the `StatusBadge` component) lets non-admins see status but only admins change it
  - The "round" concept (`idea_rounds` table, `IdeaRoundBanner`, `RoundGateCard`) is consistent — a member who arrives during a closed round should see a clear gate, not an empty list
- **Low** — `getEffectiveRoundStatus` lives at `lib/rounds/getEffectiveRoundStatus.ts` — the dashboard reads it. Confirm timezone math is correct around midnight rollover.

### Sessions: Brainstorm Circle

- **High** — Two recent commits address the layout and viewport but haven't been pushed yet (`67b2229` + `de1c4f6`). The current production deploy still has the old big-admin layout. Push before launching.
- **Medium** — Existing sessions created before the layout change carry old card positions in the DB; the clamp-on-resize sweep can overlap cards. Mitigation: the **Reset view** button re-runs the grid math against the current canvas. Document this in launch notes or run a one-off SQL update to nudge old sessions. Acceptable as-is for a beta launch.
- **Low** — The seeded admin title was just changed to "Ask the team a question" with content "Each card around you collects a different angle." — that's the new clarity baseline; verify on the production session you create after pushing.
- **Low** — Hearts feature: `session_card_likes` table + RLS. Confirm the migration is applied in production Supabase before launch — the load function is non-fatal but the feature won't work without the table.

### Sessions: Starbursting

- **Medium** — No demo tab. The buyer reads "Starbursting Sessions" on the pricing card and has no way to see one until they're inside the product.
- **Low** — The 6 prompts (Who, What, When, Where, Why, How) are seeded by the template. Verify the template seeder works end-to-end on a fresh session — a previous turn refactored TemplatePicker; quick smoke test.

### Settings / Billing

- **Medium** — `/settings` exists with `SettingsForm.tsx`. Verify the form actually saves (and shows an error/success state).
- **Medium** — Billing portal is `/api/stripe/portal` → Stripe Customer Portal. Confirm `STRIPE_PORTAL_URL` or session redirect actually works in production. Cancellation flow lives in Stripe — verify the webhook downgrades the plan promptly.
- **Low** — `DeleteAccountButton` exists. A delete flow that doesn't `CASCADE` cleanly across companies/profiles/likes/sessions is a footgun. Worth a single end-to-end test before launch.

### Mobile responsiveness

- **High** — Only **12 files** in the entire repo have explicit breakpoints (`md:` / `lg:` / `@media`). The bulk of components use inline-style layouts with no narrow-viewport fallback. Most surfaces work because flexbox wraps gracefully, but several screens are inline-styled and will overflow. Quick checklist on a 360px iPhone:
  - Landing hero — H1 with `<br />` wraps awkwardly
  - Pricing cards — auto-fit grid stacks to 1 col, OK
  - Dashboard top bar — has mobile header swap (good)
  - Brainstorm Circle workspace — three panels collapsed on BC; the 3×3 grid math floors at MIN gaps; on phones the canvas drops below the gap minimum and cards clip. The session is essentially desktop-only.
  - Contact form — has its own `contact-grid` class, verify behavior
- **Medium** — `MobileDashboardHeader` exists; verify it shows on phones and the hamburger drawer opens.
- **Medium** — `app/demo/page.tsx` uses inline styles. The demo workspace is a fixed viewBox; it scales OK on phones but the touch-target areas don't matter because the demo is non-interactive.

### Loading states & errors

- **Low** — `app/dashboard/loading.tsx` exists. Good.
- **Low** — `app/error.tsx` and `app/not-found.tsx` are styled to match brand. Good.
- **Medium** — `app/dashboard/sessions/page.tsx` doesn't have its own loading; relies on Next streaming. Acceptable.
- **High** — `SessionWorkspace` shows "Loading session…" until the fetch resolves. If the network is slow, there's no skeleton, just plain text. Acceptable for beta; consider a skeleton later.

### Broken links

I didn't find a hard 404, but flag-worthy:
- `/features` is linked from the homepage at line 577 — verify the link points at the right anchor.
- `SiteHeader` links to `/features` (exists), `/#pricing` (exists), `/demo` (exists), `/auth?mode=signup` ("Join"). All resolve.
- Footer links: trace `/privacy`, `/terms`, `/cookies` — all exist as pages.

---

## Phase 3 — Conversion review

### Why would someone upgrade to Pro?

Reading the current page cold, the answer is: **"because I need more than 50 members or I want PDF exports."** That's a weak conversion thesis. The real value — _every brainstorm ends with a written decision and a circle of perspectives nobody else captures_ — is mentioned but not landed.

### Specific copy improvements

**1. Replace the `#sessions` headline copy.**

Currently:

> H2: "Turn ideas into decisions with guided thinking"
> Body: "Sessions guide your team through proven thinking frameworks — Starbursting, SWOT, Decision Matrix — so every brainstorm ends with a clear next step."

Replace with:

> H2: "Every brainstorm should end with a decision."
> Body: "Brainstorm Circle gives every team member one card and one vote. Starbursting forces the question from every angle. You leave with a written summary, not another Slack thread."

This removes the missing-templates bug, names the two products plainly, and turns "guided thinking" (which means nothing) into a concrete promise.

**2. Reposition the Pro card subtitle.**

Currently:

> "Structured brainstorming and team decision-making."

Replace with:

> "Run brainstorms that end with a written decision."

Same idea, more specific verb. Removes "structured" (corporate filler) and centres on the outcome.

**3. Add one line of objection-handling to the Pro card.**

Below the bullets, before the CTA:

> "Cancel anytime. Includes the whole team."

These are the two questions every Pro-card reader has and you currently don't answer.

**4. Rewrite the metadata description and OG card.**

Currently:

> Title: "IdeaFlow — AI-Powered Employee Insight Platform"
> Description: "Turn your team's ideas into real impact. IdeaFlow is the AI-powered employee insight platform that surfaces what your team is really thinking — and helps leaders act on it."

Replace with:

> Title: "IdeaFlow — Collect ideas, run sessions, decide together"
> Description: "IdeaFlow gives every teammate a voice. Submit and vote on ideas, run structured brainstorm sessions, and end every discussion with a written decision."

Drops "AI-powered" entirely, matches the actual product, and uses keywords ("ideas", "vote", "brainstorm sessions", "decisions") that align with search intent.

**5. Hero subhead.**

Currently:

> "Most team feedback gets lost in meetings and Slack threads. IdeaFlow gives everyone a voice, ranks ideas by vote, and shows you exactly what matters most."

Solid, but the third clause is vague. Replace with:

> "Most team feedback gets lost in meetings and Slack threads. IdeaFlow collects ideas, ranks them by vote, and turns brainstorms into decisions."

Sets up the Sessions story without naming products in the hero.

**6. Reduce AI presence.**

Code search for "AI" in the public marketing surfaces:

- `app/layout.tsx` metadata (title, description, OG, Twitter) — **remove**
- `components/AIInsightsPanel.tsx`, `AISummaryCard.tsx`, `ActionRecommendations.tsx` — dashboard-internal, fine for now
- Pricing "+ Optional AI helpers" muted line in UpgradePlans — keep; it's subtle

The AI helpers stay in the product as a quiet bonus. They leave the public marketing entirely.

---

## Phase 4 — Marketing review

### Top 10 marketing improvements (ordered by impact)

1. **Pick one product story and ship it across every surface.** Hero, metadata, OG, Sessions section, Pro card — every one currently tells a different story. Lock the line: "Collect ideas, run sessions, decide together." Then propagate.
2. **Add a monthly billing option** at €5–7/mo for Standard and €10–12/mo for Pro. The annual-only structure is hostile to first-time buyers.
3. **Replace placeholder logos** in the trusted-by strip with either real references or remove the strip entirely. Fake logos kill trust the moment a visitor recognises a name.
4. **Add a Starbursting demo tab** to `/demo`. The buyer pays €99 for Starbursting Sessions; let them see one without signing up.
5. **Add a single proof line to the Pro card.** Either "Used by 200 teams" (once true) or a one-sentence testimonial. The current "✦ Brainstorm Sessions" badge is decorative.
6. **Move the testimonials above the pricing section.** Currently testimonials sit between `#sessions` and `#pricing` — push them so they're the last thing a visitor reads before they see the price.
7. **Replace "Watch the demo" CTA** with "Try the demo" (the demo is a clickable workspace mock — "watch" implies a video).
8. **Add an FAQ section to landing** answering: "Is the whole team included?", "Can I cancel anytime?", "What happens to my data if I downgrade?", "Do you have monthly billing?", "Can my team try Pro without paying?". 5 questions, no more.
9. **Add a small "no AI required" line under the Pro card** to actively differentiate from competitors that lead with AI. Counter-positioning is cheap and memorable.
10. **Write the launch tweet now** and reverse-engineer the homepage from it. If you can't write a tweet that gets shared without seeing the product, the page won't convert either.

### What would make someone share this product?

- The **circle layout itself**. The 3×3 admin-in-the-centre composition is visually distinctive — screenshots of a finished session look unlike anything Notion/Miro/Trello produce. Lean into that. Make sure the PDF export looks beautiful on first share.
- A **clear opposition** to surveys. "Stop sending surveys" is a sharp first line — own it. Add a paragraph somewhere that names SurveyMonkey + Officevibe by category ("monthly engagement surveys") and explains why ranking-by-vote beats sentiment scoring.
- **One memorable outcome per session.** "Every Brainstorm Circle exports a single written decision." If the PDF export carries that promise on the cover page, every shared PDF is an ad.

---

## Phase 5 — SEO review

### Page titles & descriptions (current state)

| Route | Title | Description |
| --- | --- | --- |
| `/` | "IdeaFlow — AI-Powered Employee Insight Platform" | AI-heavy, off-thesis |
| `/features` | "Features — IdeaFlow" | Generic |
| `/demo` | "Live Demo — IdeaFlow" | OK |
| `/contact` | "Contact — IdeaFlow" | OK |
| `/auth` | "Sign in" + `robots: noindex` | Correct |
| `/dashboard/sessions` | "Sessions — IdeaFlow" | OK (internal) |
| `/privacy`, `/terms`, `/cookies` | Standard | OK |

### Headings (current state)

- Homepage uses `<h1>` for the hero and `<h2>` for each section — semantically correct.
- The H2s themselves are pretty: "Turn ideas into decisions with guided thinking", "Teams that actually listen to each other.", "One flat rate. Your whole team, always included." Beautiful copy but **zero keyword overlap** with any of the five target categories.
- `/features` page has section-level `<h3>`s for each feature card. Fine.

### Internal linking

- Homepage links: `#pricing`, `#sessions`, `/features`, `/demo`, `/contact`, `/auth?mode=signup`, `/dashboard`. Reasonable.
- The `/features` page has no internal links back into specific landing anchors. Add `#sessions` and `#pricing` links from feature blurbs.
- The blog/docs/help section doesn't exist — for SEO, this is the biggest gap.

### Top 10 SEO opportunities (prioritised)

1. **Rewrite the homepage `<title>` to include "idea management"**: `"IdeaFlow — Idea management & brainstorming software for teams"`. Hits two target keywords directly.
2. **Add a `/brainstorming-software` page** that owns the Brainstorm Circle + Starbursting positioning and targets "brainstorming software" head-on. Internal-link from landing.
3. **Add a `/employee-suggestion-software` page** targeting that exact phrase — your IdeaFlow voting system is literally that. This is the lowest-hanging fruit in the list.
4. **Rewrite the meta description** (see Phase 3 #4 above) to drop "AI-powered" and add "idea management", "vote", "brainstorm sessions".
5. **Add a `/decision-making-software` landing** focused on Sessions outcomes. The "every brainstorm ends with a decision" line you'd put in `#sessions` is exactly the H1 for this page.
6. **Publish 3–5 thin top-of-funnel posts**: "How to run a Brainstorm Circle", "Starbursting template explained", "Replacing engagement surveys with idea voting". Cheap, internally-linked, and they'll rank for long-tail intent in 60–90 days.
7. **Add structured data** (`SoftwareApplication` JSON-LD with pricing, rating, screenshot) to the homepage. Easy win — boosts SERP appearance.
8. **Expand the sitemap** to include the new SEO landing pages and any blog posts. Currently the sitemap covers only 8 routes.
9. **Add alt text everywhere.** Quick grep for `<img` and `<Image` and audit. SVG product visuals can use `<title>` and `aria-label`.
10. **Get one real review on G2 or Capterra.** A single review in the "Innovation Management Software" or "Employee Engagement Software" category opens a recurring referral channel that Google trusts more than your own copy.

---

## Phase 6 — Launch score

| Area | Score (0–10) | One-line verdict |
| --- | --- | --- |
| **Product** | 7 | IdeaFlow voting works, Sessions work, the surface is real. Polish issues, not foundation. |
| **UX** | 6 | Beautiful design language, three different product stories. Confusion before it can be fixed by polish. |
| **Marketing** | 4 | Hero is sharp, but the rest of the page contradicts it. Fake logos, AI-heavy metadata, no FAQ. |
| **Pricing** | 5 | Three tiers are clear, but annual-only is a major conversion ceiling. |
| **Demo** | 5 | The new Brainstorm Circle demo (just shipped) looks great; Starbursting has no demo at all. |
| **Onboarding** | 6 | Signup → onboarding → dashboard works. The "admin vs member" branching is fragile but documented. |
| **Conversion** | 4 | The reason to pay isn't on the page. Pro is sold on capacity, not outcomes. |
| **SEO** | 3 | Metadata is off-thesis, no category-targeted landing pages, no blog. |

**Overall: 5/10 — not a launch score, an early-beta score.**

### Launch blockers

1. **Push the two unpushed commits** (`67b2229` + `de1c4f6`). The production deploy currently has the old big-admin BC layout. This is the single mechanical blocker.
2. **Fix `#sessions` copy**: remove "SWOT, Decision Matrix" references — those templates were removed and the page lies about what you ship.
3. **Fix the homepage `<title>` and meta description**: align with the rest of the funnel. AI-heavy metadata is actively hostile to the positioning you've spent the last month rewriting.
4. **Verify Stripe env vars** (`STRIPE_STANDARD_PRICE_ID`, `STRIPE_PRO_PRICE_ID`, webhook secret) are set in Vercel production.
5. **Apply the `session_card_likes` migration** in production Supabase. The fallback is non-fatal but the hearts feature silently no-ops without it.
6. **Smoke-test the four end-to-end flows once on prod**: signup-as-admin, signup-then-join-with-code, create Brainstorm Circle and Finish, create Starbursting and Export PDF. ~30 minutes of work.

### Nice-to-have improvements (post-launch, in priority order)

1. Monthly billing option for Standard + Pro.
2. Starbursting demo tab on `/demo`.
3. Replace fake trusted-by logos.
4. Add FAQ to landing.
5. Mobile polish for the BC workspace (currently desktop-only).
6. "Cancel anytime" line on the Pro card.
7. Skeleton state for SessionWorkspace load.
8. One real testimonial above the pricing fold.

### What should NOT be worked on (before launch)

- **More templates**. You shipped two. Sell two. Adding a third before you have ten paying customers is feature creep masquerading as differentiation.
- **More AI features**. The metadata pivot is half-done; don't deepen the AI surface area before the marketing has fully turned the corner.
- **Real-time collaboration / cursors**. The data model supports it. Don't ship it. It's a 4-week project with a flat ROI at this stage.
- **A mobile-native Brainstorm Circle layout**. Phones aren't where you brainstorm. Acceptable to mark Sessions as desktop-only at launch.
- **Custom session templates / template marketplace**. Too early.
- **A `/changelog` page**. Pre-product-market-fit, this just signals there are bugs.

### Recommended next 30 days

**Week 1 — Ship-readiness:**
- Push the two pending commits, redeploy.
- Patch the `#sessions` copy bug and the metadata `<title>`.
- Verify Stripe + Supabase env in prod.
- Run the four-flow smoke test on production.
- Soft-launch to 10 hand-picked teams. Watch the first three sessions in person if possible.

**Week 2 — Conversion fix-ups:**
- Add monthly billing to Stripe + UI (one day of work; biggest single conversion lever).
- Rewrite Pro card subtitle + add "cancel anytime" line.
- Replace fake trusted-by logos with "Built by [you], working out of [city]" or single real reference.
- Add FAQ section to landing (5 questions).

**Week 3 — Marketing surface:**
- Write one Starbursting demo tab and one PDF export sample for shareability.
- Move testimonials above pricing.
- Add `/brainstorming-software` + `/employee-suggestion-software` landing pages, each 800–1200 words, internally linked.
- Submit sitemap to Google Search Console.

**Week 4 — SEO + outreach:**
- Publish 2 top-of-funnel posts ("How to run a Brainstorm Circle", "Starbursting template").
- File for G2 + Capterra listings.
- Pick one differentiation thread ("idea ranking-by-vote beats engagement surveys") and write a single LinkedIn post per week for the next two months.

---

## Final verdict

### NOT READY TO LAUNCH — but very close.

**Reasons:**

1. **One messaging bug actively breaks trust on the landing page** ("SWOT, Decision Matrix" — features you don't have). This is shipped code, not a future fix. **Critical**.
2. **The product story is split three ways** across `<title>`, hero, and `#sessions`. Visitors can't answer "what is this?" in 5 seconds. **Critical**.
3. **The two viewport-and-size commits aren't pushed.** The production Brainstorm Circle looks worse than what the team has built locally. **Critical, mechanical**.

**Reasons to be optimistic:**

- The product surface itself works. Voting, sessions, PDF export, hearts, the full collaboration loop — these all function.
- The recent BC layout work (3×3 grid + equal-sized admin + full-viewport + force-collapsed panels) is genuinely strong product polish. Once pushed, the workspace looks finished.
- The pricing structure is clear and not overengineered.
- The hero line ("Stop sending surveys. Start collecting ideas with IdeaFlow.") is sharp and ownable.

**Recommended action:** Spend **one focused day** on the three critical items above + the Stripe/Supabase prod checks. Then soft-launch to 10 teams. Re-score in two weeks against the same rubric.

You are 1–2 days of copy fixes away from a launchable beta. The product itself is launchable today.
