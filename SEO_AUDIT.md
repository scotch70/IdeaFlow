# IdeaFlow — SEO Audit & Action Plan

_Senior SaaS SEO consultant pass. 6 June 2026._

Scope: every public marketing surface (`/`, `/features`, `/demo`, `/contact`, `/#pricing`, `/privacy`, `/terms`, `/cookies`). Authenticated `/dashboard/*` routes are out of scope.

Target keyword set (provided):

> idea management software · brainstorming software · team brainstorming tool · decision making software · innovation management software · idea collection tool · collaborative brainstorming · brainstorming sessions · team idea management · startup idea management

---

## SECTION 1 — SEO issues found

### Page titles

| Route | Current title | Issue |
| --- | --- | --- |
| `/` | "IdeaFlow — Collect ideas, run sessions, decide together" | Brand + positioning, **zero target keywords**. A user searching "idea management software" sees a result that doesn't match their query language. |
| `/features` | "Features — IdeaFlow" | Generic. The word "features" gets near-zero search volume on its own. |
| `/demo` | "Live Demo — IdeaFlow" | "Live demo" is fine as a UX label but adds no keyword equity. |
| `/contact` | "Contact — IdeaFlow" | Acceptable. Low SEO priority page. |
| `/privacy`, `/terms`, `/cookies` | "Privacy Policy — IdeaFlow" etc. | Fine for legal pages. Not SEO targets. |
| `/auth` | "Sign in · IdeaFlow" + `noindex` | Correct. |

### Meta descriptions

| Route | Current description | Issue |
| --- | --- | --- |
| `/` | "IdeaFlow gives every teammate a voice. Submit and vote on ideas, run structured brainstorm sessions, and end every discussion with a written decision." | Strong narrative, but the keywords "idea management software" and "brainstorming software" don't appear. |
| `/features` | "Explore every IdeaFlow feature: idea capture, voting, status tracking, manager accountability, and team analytics." | Feature-listy. No primary keyword. |
| `/demo` | (not set) | **Critical** — no meta description at all. Google will auto-generate from page chrome. |
| `/contact` | "Get in touch about IdeaFlow, pricing, or Brainstorm Sessions." | Branded only. |

### H1, H2, H3 structure

`/` (homepage):
- **H1** "Stop sending surveys. Start collecting ideas with IdeaFlow." → sharp positioning, **zero target keywords**.
- **H2** "No lost ideas. No loudest voice wins. Just your team's thinking, ranked." → poetic, no keyword.
- **H2** "Every brainstorm should end with a decision." → contains "brainstorm" (partial match for "brainstorming sessions").
- **H2** "One flat rate. Your whole team, always included." → no keyword.
- **H3** "Ranked by real votes, in real time" / "Separate rounds for different questions" → no keywords.

`/features`:
- **H1** "Everything your team needs to make ideas count" → no keyword.
- **H2** "See what your team cares about" → no keyword.

`/demo`:
- **No H1 element at all.** The page renders `<DemoSwitcher>` directly under a banner; the largest heading inside the embedded demo is an `<h1>` for "Should we launch IdeaFlow Pro?" — that's demo content masquerading as the page heading. **Critical structural issue.**

`/contact`:
- **H1** "Get in touch" → fine for a contact page.
- **H2** "Send us a message" / "Anything about IdeaFlow." / "Teams that actually listen to each other." / "Answers before you ask" / "Ready to start brainstorming?" → "brainstorming" present once, good.

### Keyword gap analysis

I grep'd each public page for the 10 target phrases. Hits:

| Keyword | `/` | `/features` | `/demo` | `/contact` |
| --- | --- | --- | --- | --- |
| idea management software | — | — | — | — |
| brainstorming software | — | — | — | — |
| team brainstorming tool | — | — | — | — |
| decision making software | — | — | — | — |
| innovation management software | — | — | — | — |
| idea collection tool | — | — | — | — |
| collaborative brainstorming | — | — | — | — |
| brainstorming sessions | partial ("Brainstorm Sessions") | — | partial | partial |
| team idea management | — | — | — | — |
| startup idea management | — | — | — | — |

**The site does not contain a single exact-match target keyword in body copy.** This is the single biggest blocker to organic ranking. The metadata `keywords` array includes these strings, but Google has ignored that signal since ~2009 — they have to appear naturally in headings or first 200 words of body copy.

### Sitemap coverage

Current sitemap (`app/sitemap.ts`):

```
/                 priority 1.0   weekly
/features         priority 0.8   monthly
/contact          priority 0.4   yearly
/privacy          priority 0.3   yearly
/terms            priority 0.3   yearly
/demo             priority 0.7   monthly
/auth             priority 0.6   yearly
/cookies          priority 0.3   yearly
```

Issues:
- **`/auth` is in the sitemap but has `robots: { index: false }`.** Conflicting signal — list and noindex at the same time. Remove from sitemap.
- No SoftwareApplication structured data exists.
- No category-targeted landing pages exist to add.

### Internal linking

Mapped from `SiteHeader`, `SiteFooter`, and inline body links:

```
/  →  /features, /#pricing, /demo, /auth?mode=signup, /contact
/features →  /dashboard or /auth?mode=signup  (single CTA only)
/demo →  /auth?mode=signup, /settings#billing
/contact →  /auth?mode=signup, /
```

- `/features` doesn't link to `/demo` or `/#pricing`. This is the obvious internal link the marketing funnel needs.
- `/demo` doesn't link to `/features`.
- `/contact` doesn't link to `/features` or `/demo`.
- No page links to category pages because they don't exist yet.

Every public page should link to at least two other public pages from body content (not just nav). Currently most pages only link via the global nav, which Google partially discounts.

---

## SECTION 2 — Exact code changes to implement

These are the highest-leverage, lowest-risk edits. Each is a single file change with no new build dependencies.

### 1. Homepage — add primary keyword to the hero subhead

`app/page.tsx` lines 340–351 — the subhead under the H1. Keep the H1 ("Stop sending surveys…") for brand voice; add the keyword to the supporting paragraph so Google sees it in the first 200 words.

**Old:**
```tsx
<p ...>
  Most team feedback gets lost in meetings and Slack threads. IdeaFlow gives everyone a voice, ranks ideas by vote, and shows you exactly what matters most.
</p>
```

**New:**
```tsx
<p ...>
  IdeaFlow is idea management software for teams that want to stop losing good thinking in Slack threads. Collect ideas, vote on what matters, and run brainstorming sessions that end with a written decision.
</p>
```

Wins: places "idea management software", "brainstorming sessions", and "team" in the first paragraph. No keyword stuffing — it reads naturally.

### 2. Homepage — rewrite the "How it works" H2

`app/page.tsx` line 495–500.

**Old:**
```tsx
<h2 ...>
  No lost ideas. No loudest voice wins. Just your team's thinking, ranked.
</h2>
```

**New:**
```tsx
<h2 ...>
  Team idea management without the loudest-voice-wins meeting.
</h2>
```

Wins: "team idea management" verbatim. The poetic original was strong but invisible to search — the rewrite keeps the contrast frame while making the H2 indexable.

### 3. Homepage — rewrite the `#sessions` lead paragraph

`app/page.tsx` line 656–658 — body paragraph under the sessions H2.

**Old:**
```tsx
<p ...>
  Brainstorm Circle gives every team member one card and one vote. Starbursting forces the question from every angle. You leave with a written summary, not another Slack thread.
</p>
```

**New:**
```tsx
<p ...>
  Brainstorm Circle and Starbursting are the two collaborative brainstorming sessions inside IdeaFlow. Brainstorm Circle gives every team member one card and one vote. Starbursting forces the question from every angle. You leave with a written decision, not another Slack thread.
</p>
```

Wins: "collaborative brainstorming sessions" naturally in the lead sentence. Keeps the original cadence in sentences 2–3.

### 4. `/features` — title + description + H1

`app/features/page.tsx` lines 6–10 + line 46.

**Old:**
```tsx
export const metadata = {
  title: 'Features — IdeaFlow',
  description:
    'Explore every IdeaFlow feature: idea capture, voting, status tracking, manager accountability, and team analytics.',
}
```

**New:**
```tsx
export const metadata = {
  title: 'Idea management software features for teams',
  description:
    'Every IdeaFlow feature in one place — idea collection, voting, status tracking, brainstorming sessions, analytics, and team management. Built for startups and scaleups.',
}
```

**Old H1:**
```tsx
<h1 ...>
  Everything your team needs to make ideas count
</h1>
```

**New H1:**
```tsx
<h1 ...>
  Idea management software for teams that want every voice heard
</h1>
```

Wins: primary keyword in title, description, and H1 of the most feature-dense page. The original H1 stays in spirit (the sub-clause "every voice heard" mirrors the brand promise).

### 5. `/demo` — title, description, **visible H1**

`app/demo/page.tsx` line 4.

**Old:**
```tsx
export const metadata = { title: 'Live Demo — IdeaFlow' }
```

**New:**
```tsx
export const metadata = {
  title: 'Try the brainstorming software demo',
  description: 'Click through a live demo of IdeaFlow — the team brainstorming tool that turns ideas into decisions. No sign-up needed.',
}
```

The page also needs a real H1 between the banner and the demo switcher. Add inside the existing wrapper, before `<DemoSwitcher />`:

```tsx
<div style={{ maxWidth: '40rem', margin: '0 auto', padding: '1.5rem 1rem 0.5rem' }}>
  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0d1f35', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
    Try the IdeaFlow demo
  </h1>
  <p style={{ fontSize: '0.95rem', color: '#5d667a', lineHeight: 1.6 }}>
    A live preview of the team brainstorming tool — explore the workspace and run a Brainstorm Circle without signing up.
  </p>
</div>
```

Wins: gives the page a proper indexable H1 (currently it has none); puts "brainstorming software" and "team brainstorming tool" both above the fold.

### 6. `/contact` — meta description

`app/contact/page.tsx` lines 6–9.

**Old:**
```tsx
export const metadata = {
  title: 'Contact — IdeaFlow',
  description: 'Get in touch about IdeaFlow, pricing, or Brainstorm Sessions.',
}
```

**New:**
```tsx
export const metadata = {
  title: 'Contact IdeaFlow — questions, pricing, brainstorming sessions',
  description: 'Talk to the IdeaFlow team about idea management, pricing, or how brainstorming sessions work for your team.',
}
```

Wins: low-priority page but free SEO equity from two of the target keywords. No structural change.

### 7. Sitemap cleanup

`app/sitemap.ts` — remove the `/auth` entry (it's `noindex`), bump priorities slightly so the homepage and category pages dominate, and prepare entries for the new landing pages from Section 3.

**Replace the full sitemap return with:**

```tsx
return [
  { url: SITE_URL,                              lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
  { url: `${SITE_URL}/features`,                lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  { url: `${SITE_URL}/demo`,                    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${SITE_URL}/contact`,                 lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
  { url: `${SITE_URL}/privacy`,                 lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${SITE_URL}/terms`,                   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${SITE_URL}/cookies`,                 lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  // Add as soon as each lands:
  // { url: `${SITE_URL}/idea-management-software`,        priority: 0.9 },
  // { url: `${SITE_URL}/brainstorming-software`,          priority: 0.9 },
  // { url: `${SITE_URL}/decision-making-software`,        priority: 0.8 },
  // { url: `${SITE_URL}/innovation-management-software`,  priority: 0.8 },
  // { url: `${SITE_URL}/startup-idea-management`,         priority: 0.7 },
]
```

Wins: removes the noindex conflict, sets up the category routes for later, signals clearer priority to Google.

### 8. Internal-link improvements

Two single-line additions:

**a.** `app/features/page.tsx` — at the bottom of the feature grid section, add a contextual link to the demo and pricing:

```tsx
<p style={{ fontSize: '0.875rem', color: '#5d667a', marginTop: '2rem' }}>
  Want to see it live? <Link href="/demo" style={{ color: '#0d1f35', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>Try the brainstorming software demo</Link> or <Link href="/#pricing" style={{ color: '#0d1f35', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>see pricing</Link>.
</p>
```

**b.** `app/demo/page.tsx` — at the bottom of the embedded demo, link back to `/features` with anchor text that carries a keyword:

```tsx
<p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#5d667a', padding: '1rem' }}>
  Like what you see? <Link href="/features" style={{ color: '#0d1f35', fontWeight: 600, textDecoration: 'underline' }}>See every idea management feature</Link>.
</p>
```

Wins: link equity flows between marketing pages with descriptive anchor text. Google reads "brainstorming software demo" and "idea management feature" as topic signals.

### 9. JSON-LD structured data on homepage

Add inside `app/page.tsx` just before `</section>` of the hero, or at the top of `<main>`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'IdeaFlow',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: 'https://useideaflow.com',
      description: 'Idea management and team brainstorming software. Collect ideas, run brainstorming sessions, decide together.',
      offers: [
        { '@type': 'Offer', name: 'Free',     price: '0',  priceCurrency: 'EUR' },
        { '@type': 'Offer', name: 'Standard', price: '49', priceCurrency: 'EUR' },
        { '@type': 'Offer', name: 'Pro',      price: '99', priceCurrency: 'EUR' },
      ],
    }),
  }}
/>
```

Wins: makes the homepage eligible for rich SERP results (price box, software category chip). Costs nothing at runtime; visible to Googlebot only.

---

## SECTION 3 — New page opportunities

Five SEO landing pages, each targeting one primary keyword. Each is a single Next.js page file at `app/<slug>/page.tsx`, mirrors the visual language of `/features`, runs ~800–1200 words. No new components required.

### 1. `/idea-management-software`

- **Primary keyword:** idea management software
- **Secondary:** team idea management
- **Search intent:** Commercial investigation — someone evaluating tools in the category.
- **Recommended H1:** *Idea management software your team will actually use*
- **Page structure:** H1 → 2-sentence positioning → 3 H2 sections ("Collect every idea", "Rank by vote, not by volume", "End discussions with a decision") → comparison table (IdeaFlow vs. surveys vs. Slack vs. spreadsheets) → pricing teaser → CTA to `/auth?mode=signup`.
- **Internal-link targets:** `/features`, `/demo`, `/#pricing`, `/brainstorming-software`.

### 2. `/brainstorming-software`

- **Primary keyword:** brainstorming software
- **Secondary:** team brainstorming tool, collaborative brainstorming
- **Search intent:** Commercial — comparing brainstorming tools (Miro, Mural, FigJam, Stormboard).
- **Recommended H1:** *Brainstorming software for teams that need to make decisions*
- **Page structure:** H1 → opening on the Miro-style "infinite canvas" problem (great for ideation, bad for decisions) → H2 "Brainstorm Circle: one question, eight perspectives" → H2 "Starbursting: every angle of an idea" → H2 "Every session ends with a PDF" → CTA.
- **Internal-link targets:** `/demo`, `/features`, `/decision-making-software`.

### 3. `/decision-making-software`

- **Primary keyword:** decision making software
- **Secondary:** team decision making, brainstorming sessions
- **Search intent:** Commercial — leadership team looking to operationalise decisions.
- **Recommended H1:** *Decision-making software that turns brainstorms into written outcomes*
- **Page structure:** H1 → problem ("Most brainstorms produce ideas, not decisions") → H2 "Run a session, leave with a summary" → H2 "Document the why, not just the what" → H2 "Decisions you can revisit later" → CTA.
- **Internal-link targets:** `/brainstorming-software`, `/features`, `/demo`, `/#pricing`.

### 4. `/innovation-management-software`

- **Primary keyword:** innovation management software
- **Secondary:** idea collection tool
- **Search intent:** Enterprise/scaleup — bigger company looking for structured innovation pipelines.
- **Recommended H1:** *Innovation management software for startups and scaleups*
- **Page structure:** H1 → context ("Innovation is everyone's job, not just R&D") → H2 "Open idea collection across the team" → H2 "Voting that surfaces what's worth building" → H2 "Sessions that turn ideas into roadmaps" → comparison ("Why not a Notion database?") → CTA.
- **Internal-link targets:** `/idea-management-software`, `/features`, `/demo`.

### 5. `/startup-idea-management`

- **Primary keyword:** startup idea management
- **Secondary:** idea collection tool, team idea management
- **Search intent:** Founder/small-team — looking for something lighter than enterprise tools.
- **Recommended H1:** *Idea management for startups — free up to 10 people*
- **Page structure:** H1 → opening "Built for the first 10–50 people in a startup" → H2 "Collect ideas as fast as Slack" → H2 "Vote without a meeting" → H2 "Brainstorm Sessions when you need a decision" → testimonial pull (once real ones exist) → CTA to free signup.
- **Internal-link targets:** `/idea-management-software`, `/demo`, `/#pricing`.

Add each new page to `sitemap.ts` (commented entries above) and link them in `SiteFooter`'s Product column.

---

## SECTION 4 — Highest-impact SEO improvements ranked by priority

| Rank | Change | Expected impact | Effort |
| --- | --- | --- | --- |
| 1 | Implement edits #1, #2, #3, #4 (homepage + features keyword injection) | High — gets the existing top pages eligible for category queries within 4–8 weeks of next crawl | 30 min |
| 2 | Ship `/idea-management-software` landing page (Section 3 #1) | High — primary target keyword has the largest commercial volume; owned page is the only way to rank | Half a day |
| 3 | Add a real H1 + meta description to `/demo` (edit #5) | High — page is in the sitemap with priority 0.7 but currently has no H1; Google can't tell what it's about | 10 min |
| 4 | Ship `/brainstorming-software` and `/decision-making-software` landing pages | High — covers the next two highest-volume target terms with distinct buyer intent | One day each |
| 5 | Remove `/auth` from sitemap (edit #7) | Medium — fixes a contradictory signal that's hurting crawl budget | 1 min |
| 6 | Add JSON-LD SoftwareApplication block (edit #9) | Medium — opens up rich-result eligibility (price, category) on the homepage SERP | 15 min |
| 7 | Add internal links from `/features` → `/demo` + `/#pricing` and from `/demo` → `/features` (edit #8) | Medium — link equity flow + keyword-bearing anchor text | 10 min |
| 8 | Ship `/innovation-management-software` and `/startup-idea-management` | Medium — lower volume than the top three but lower competition; long-tail wins | One day each |
| 9 | Get one G2 review live (separate from this audit) and add the G2 review badge to the homepage hero edge | Medium — third-party trust signal Google weighs in B2B SaaS | Half a day (review submission + waiting) |
| 10 | Publish 2–3 top-of-funnel blog posts targeting "how to run a brainstorm circle", "what is starbursting", "alternatives to Miro for team decisions" | Medium — long-tail organic traffic that internally links to the category pages | 2–3 days each |

---

## Notes on what NOT to do

- **Do not add an exact-match keyword to the H1 "Stop sending surveys".** That headline carries the brand position. Inject keywords into the supporting copy and the H2/H3 below it; let the H1 do the emotional job.
- **Do not add a keyword cloud or hidden-text block.** Google's spam classifiers are aggressive and the existing copy is high quality — don't compromise it.
- **Do not start a blog before the category pages exist.** Blog posts that link into category pages compound. Blog posts that link into a nonexistent landing waste link equity.
- **Do not chase "idea management" without the qualifier "software".** The unqualified term is heavily contaminated by Notion / Trello content; with "software" you're already in the buyer-intent funnel.

---

## What success looks like, 60 days out

If you ship Section 2 edits this week and Section 3 pages within 30 days:

- The homepage starts ranking on page 2 for "idea management software" within 4–6 weeks of being recrawled (your domain is new — expect movement, not domination).
- `/idea-management-software` and `/brainstorming-software` enter the top 50 for their primary keywords within 6–10 weeks.
- One G2 review + the homepage JSON-LD makes you eligible for the "Compare" carousel that appears for category queries.
- Internal-link density across the marketing site doubles, which Google reads as "topically authoritative on idea management".

That's a realistic, no-spam path to the first 1,000 organic clicks/month within a quarter.
