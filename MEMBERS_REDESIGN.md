# Members System Redesign — Audit & Roadmap

Project: IdeaFlow
Author: audit pass
Status: proposal, no code changes yet

---

## 1. Current architecture analysis

The system today has **two separate membership concepts that don't compose cleanly**:

**Workspace membership** lives on `profiles.company_id`. If a user's profile points at a company, they are "in" the workspace. The `role` column (`admin` | `member`) is also stored on `profiles` — meaning role is workspace-wide, not flow-scoped. This is the source of the workspace-wide member list on `/dashboard/members`.

**IdeaFlow membership** lives in `round_members(round_id, user_id, company_id, added_by, created_at)`. But the table is used in a non-obvious way: when zero rows exist for a round, the round is treated as "open to all workspace members". When at least one row exists, the round becomes "restricted" and only listed users can access it. The check is implemented in three places (`app/api/rounds/[id]/route.ts`, `app/api/rounds/[id]/members/route.ts`, `app/dashboard/flows/[id]/page.tsx`) — each reimplementing the same `assigned.length === 0 || assigned.includes(user.id)` logic.

**Invites** live in `invites` and can optionally reference a round via `idea_round_id`. When set, redeeming the invite both updates `profiles.company_id` (workspace join) and inserts a row into `round_members` (flow assignment). When unset, only the workspace join happens.

**Deletion** of a flow (`DELETE /api/rounds/[id]`) cascades ideas → comments → likes → round_members → invites scoped to that flow. It does NOT touch `profiles` — correct for auth safety, but it leaves former-flow-only members visible on the workspace Members page with no remaining flow association.

Tables, FKs and policies relevant to membership:

| Table | Member-relevant columns | Notes |
|---|---|---|
| `profiles` | `company_id`, `role` | "Workspace membership". Role is workspace-wide. |
| `companies` | `plan` | Plan gates member count via `canAddMembers`. |
| `idea_rounds` | `company_id`, `manual_override`, `starts_at`, `ends_at` | One row per flow. |
| `round_members` | `round_id`, `user_id`, `company_id`, `added_by` | **Bridge table — but with implicit "empty = open" semantics.** |
| `invites` | `company_id`, `idea_round_id`, `joined_user_id`, `role`, `used_at` | Used for both workspace and flow invites. |
| `ideas` | `idea_round_id`, `company_id`, `user_id` | Flow-scoped via FK. |

---

## 2. Problems with the current member model

**P1 — "Empty means open" is a leaky convention.** It's not enforced by the schema, can't be expressed in RLS without a subselect, and is reimplemented at every call site. The dashboard, the round detail page, and three API routes each independently filter on `round_members.length === 0 ? open : restricted`. A fourth call site that forgets the convention silently leaks access. There is no `idea_rounds.audience_mode` column to make the intent explicit.

**P2 — Role is workspace-wide only.** A user who is `admin` of the company is admin of every flow — including flows another admin created. There is no concept of a flow owner, no per-flow role, no "viewer". The user explicitly asked for "role per IdeaFlow (admin/member/viewer later)" — the current schema can't express this.

**P3 — The workspace Members page doesn't model the user's actual mental model.** Today it queries `profiles WHERE company_id = X` and renders a flat list. But the user's stated mental model is "Alex is in 'car' and 'house', Morgan is only in 'car'". The page has no awareness of `round_members` at all. So:
- It shows users who are in zero flows as "members" with no signal that they're orphaned.
- It removes a user from the workspace entirely when an admin clicks "Remove" (via `POST /api/members/remove`, which sets `company_id = null`) — this is a much heavier action than the UX implies, and it's the only way to remove someone today.
- There's no per-flow remove from this page.

**P4 — Workspace removal is destructive and not reversible from the UI.** `POST /api/members/remove` nulls out `profiles.company_id`. The user's `round_members` rows are NOT cleaned up, so they become orphan rows pointing at a user who is no longer in the workspace. RLS doesn't break, but the data is messy and the user has no way to be re-invited cleanly (they re-join via invite, which upserts `profiles`).

**P5 — Flow deletion leaves "ghost" workspace members.** Exactly the scenario in the brief: delete the "car" flow, Morgan still has `profiles.company_id` set, so she remains on `/dashboard/members`. There's no signal that she has zero flow associations.

**P6 — Two invite kinds blur together.** Workspace invites and flow-scoped invites are both rows in `invites`. The difference is whether `idea_round_id` is set. The list on `/dashboard/invites` doesn't distinguish them visually; the FlowAdminPanel only shows flow invites for *that* flow. There's no place to see "all pending invites for this workspace".

**P7 — `joined_user_id` is recorded, but `last_active_at` is not.** The user asked for "Last active" on the Members page. There's no column to source that from. The nearest signals are `ideas.created_at` and `likes.created_at`, but those are per-flow.

**P8 — Inconsistent permission checks in API routes.** `app/api/members/remove/route.tsx` uses the SSR client to read the caller's profile (correct, RLS-safe) but then the admin client to do the write (correct). `app/api/rounds/[id]/members/route.ts` uses the admin client for both, with a hand-rolled `authorize()` helper. Each route has a slightly different shape. This makes future changes (e.g. adding a flow-owner role) high-risk because each route needs to be updated independently.

**P9 — RLS on `round_members` is generous.** The "Admins can manage round_members" policy lets any workspace admin manage every flow's audience. That's fine today (workspace role only), but blocks future per-flow ownership.

---

## 3. Recommended database structure

The target model is **`profiles` stays the source of truth for workspace identity**, and **`round_members` becomes the source of truth for flow membership and role**, with explicit semantics.

### 3a. Schema changes

```sql
-- ─── idea_rounds: make audience explicit ─────────────────────────────────
alter table public.idea_rounds
  add column if not exists audience_mode text not null default 'workspace'
    check (audience_mode in ('workspace', 'restricted'));

-- 'workspace'  → every workspace member can access (no round_members rows needed)
-- 'restricted' → only round_members rows can access
-- Default keeps legacy "empty = open" rounds behaving identically.

-- Optional: an owner pointer for future per-flow ownership
alter table public.idea_rounds
  add column if not exists owner_id uuid references public.profiles(id) on delete set null;


-- ─── round_members: add role + activity ──────────────────────────────────
alter table public.round_members
  add column if not exists role text not null default 'member'
    check (role in ('owner', 'admin', 'member', 'viewer')),
  add column if not exists last_active_at timestamptz,
  add column if not exists invited_by uuid references public.profiles(id) on delete set null;

-- Index for the Members page join
create index if not exists idx_round_members_user_id on public.round_members (user_id);


-- ─── profiles: workspace-level last-active for the Members overview ──────
alter table public.profiles
  add column if not exists last_active_at timestamptz;
```

### 3b. Semantic rules to lock down

`audience_mode = 'workspace'` means the flow inherits the workspace member list. `round_members` rows are NOT required and any rows that exist are treated as "named participants" (e.g. owner pin) — they don't restrict access. The dashboard banner says "Open to your workspace".

`audience_mode = 'restricted'` means the flow's accessible audience is exactly the set of `round_members.user_id`. Empty set = nobody but admins (today's behavior is the opposite — empty meant open — and you should migrate carefully).

A workspace `admin` retains the right to access and edit every flow regardless of `audience_mode`. Per-flow `owner`/`admin` is additive in the future RBAC sense.

### 3c. Updated RLS sketch (do later, not in V1)

Replace the "Admins can manage round_members" blanket policy with a function:

```sql
create or replace function can_manage_round(p_round_id uuid)
returns boolean language sql security definer stable as $$
  select
    exists (select 1 from profiles p
            join idea_rounds r on r.company_id = p.company_id
            where p.id = auth.uid() and p.role = 'admin' and r.id = p_round_id)
    or exists (select 1 from round_members rm
               where rm.round_id = p_round_id and rm.user_id = auth.uid()
                 and rm.role in ('owner', 'admin'));
$$;
```

This is V2. V1 keeps workspace-admin-only for management.

---

## 4. Files to change

These are the touchpoints. Grouped by phase so you can ship in slices.

### V1 (Members overview becomes flow-aware)

Read + modify:
- `app/dashboard/members/page.tsx` — change the data fetch from "profiles" only to "profiles LEFT JOIN round_members LEFT JOIN idea_rounds".
- `components/TeamMembers.tsx` — replace flat list with a grouped/relationship view (member → list of flows). Add orphan badge.
- `types/database.ts` — add `audience_mode`, `last_active_at`, `owner_id` to the relevant types.

Add:
- `lib/members/getWorkspaceMembersWithFlows.ts` — single server-side query helper that returns `{ profile, flows: [{ id, name, status, role }] }[]`. Used by Members page and reused by analytics later.

### V1 (orphan handling on flow delete)

Read + modify:
- `app/api/rounds/[id]/route.ts` (`DELETE`) — after the existing cascade, run a soft "orphan reconciliation": for each user_id whose `round_members` rows are now zero AND whose `profiles.role` is `member` AND who has zero `ideas` in the workspace, mark `profiles.last_active_at` as null. Do NOT delete or detach the profile — the user's stated rule is "show them as inactive/orphaned", not "remove them". The Members page filters/groups orphaned members based on the live `round_members` join, so no profile mutation is required here. The reconciliation step is optional and just for sorting.

### V1 (single-flow page polish — small, high-ROI)

Read + modify:
- `components/FlowAdminPanel.tsx` — three small fixes:
  - When `audience_mode = 'workspace'` show a clear pill "Anyone in the workspace can access" and DISABLE the member toggle list with a "Switch to restricted access" button. Right now the picker appears even though clicks do nothing visible (the "Open to all workspace members" label is text-only).
  - Show the user's role per-flow next to their name once `round_members.role` exists.
  - Show pending invites count and the open invite-link state up at the top with the audience pill, not buried at the bottom.

### V1 (API: deduplicate authorization)

Add:
- `lib/auth/requireWorkspaceAdmin.ts` and `lib/auth/requireRoundAdmin.ts` — single source for the "is the caller allowed to do this" checks. Replace ad-hoc `authorize()` in `app/api/rounds/[id]/members/route.ts`, the inline checks in `app/api/rounds/[id]/route.ts`, `app/api/rounds/[id]/invite/route.ts`, `app/api/invites/route.tsx`, `app/api/invites/[id]/route.tsx`, `app/api/members/remove/route.tsx`.

### V2 (per-flow roles)

- Wire `round_members.role` into all `POST /api/rounds/[id]/members` requests with an optional `{ role: 'member' | 'admin' | 'viewer' }`.
- Update `FlowAdminPanel.tsx` member rows with a role dropdown.

### V2 (invite splitting)

Optional: split `invites` into `workspace_invites` and `flow_invites`, OR keep the single table but require `idea_round_id` to be set on flow invites and add an `invite_kind` enum column. Today's overload is workable; the more interesting change is admin UX, not schema.

### V3 (RLS + flow ownership)

- Add `can_manage_round()` RPC, swap into `round_members` and `idea_rounds` admin policies.
- Set `idea_rounds.owner_id = creator` on insert.

---

## 5. Migration plan

The migration is **additive only** for V1 — no destructive changes.

```sql
-- 1. Schema (idempotent, run in Supabase SQL editor)
alter table public.idea_rounds
  add column if not exists audience_mode text not null default 'workspace'
    check (audience_mode in ('workspace', 'restricted')),
  add column if not exists owner_id uuid references public.profiles(id) on delete set null;

alter table public.round_members
  add column if not exists role text not null default 'member'
    check (role in ('owner', 'admin', 'member', 'viewer')),
  add column if not exists last_active_at timestamptz,
  add column if not exists invited_by uuid references public.profiles(id) on delete set null;

alter table public.profiles
  add column if not exists last_active_at timestamptz;

create index if not exists idx_round_members_user_id on public.round_members (user_id);

-- 2. Data backfill — preserve current behaviour
-- Today's convention: round_members has ≥1 row → restricted; 0 rows → open.
-- Translate that into the explicit audience_mode column.
update public.idea_rounds r
   set audience_mode = 'restricted'
 where exists (select 1 from public.round_members rm where rm.round_id = r.id);

-- 3. Optional: seed owner_id from the creator if you ever recorded it.
-- (idea_rounds doesn't have created_by today — skip until V3.)

-- 4. Backfill last_active_at from existing signals (best-effort)
update public.profiles p
   set last_active_at = greatest(
     coalesce((select max(created_at) from public.ideas    where user_id = p.id), 'epoch'::timestamptz),
     coalesce((select max(created_at) from public.comments where user_id = p.id), 'epoch'::timestamptz),
     coalesce((select max(created_at) from public.likes    where user_id = p.id), 'epoch'::timestamptz)
   )
 where last_active_at is null;
```

After the migration is live, every call site that currently does `if (assigned.length === 0) { /* open */ } else { /* check */ }` should switch to reading `idea_rounds.audience_mode`. Plan to keep the old check working as a fallback for one deploy cycle so a half-deployed build still behaves correctly.

---

## 6. UX improvements list (single-IdeaFlow page + Members page)

Grouped by surface. Don't try to ship them all — see section 7 for ROI ranking.

### Members page (`/dashboard/members`)

1. **Grouped relationship view.** Header card per member, child rows for each flow they're in. This is the core ask in the brief.
2. **Orphaned-member section.** Members with zero flow associations get a separate collapsible row at the bottom. "Reassign to a flow" CTA per row.
3. **Last active.** Show "active 3 days ago" using `profiles.last_active_at`. Greyed out when unknown.
4. **Per-flow role pill.** Next to each flow chip, show the user's role on that flow (owner/admin/member/viewer).
5. **Bulk add to flow.** Multi-select members → "Add to flow…" dropdown.
6. **Invitations sub-tab.** Show pending workspace and flow invites in one place with resend/revoke/copy-link actions.
7. **Search + filter.** Filter by flow, role, and active state.

### Inside an IdeaFlow (`/dashboard/flows/[id]`)

8. **Question section.** The current "Question" card is fine but it should be inline-editable for admins (click-to-edit, no jump to admin panel).
9. **Idea submission.** The form has both a NewIdeaForm header and a prompt banner above when `round.prompt` exists — there's redundant scaffolding. Collapse into one composer with the question rendered as the placeholder.
10. **Sorting and voting.** Today the list orders by `likes_count DESC, created_at DESC` only. Add "New / Top / My ideas" tabs. Voting is implicit — add a clear up-arrow with a count, animated on click. Show "you voted" state explicitly.
11. **Comments.** Two-level threading is plenty. Add inline comment counts on the idea card; clicking expands without a route change. Show "X new since you last viewed" badge.
12. **Admin panel.**
    - Make it collapsible on mobile (currently it's hidden behind the layout break entirely).
    - Group sections with a left rail TOC: Settings / Status / Members / Invites / Danger. Linear-style.
    - The "Members" picker should not appear when `audience_mode = 'workspace'` — replace with a single button "Restrict access to specific people".
    - The reusable join link should sit *next to* the email-invite form, not below the pending list. Both are creation actions for the same audience.
13. **Flow status.** The segmented control is good. Add a hover tooltip explaining what "manual override" actually does — today it's unclear to non-power-admins.
14. **Insights / analytics.** Per-flow analytics tab (currently dashboard-wide). Top contributors *for this flow*, ideas-over-time, voting heatmap.
15. **Onboarding.** First-time admin who lands on a fresh flow page gets a 3-step inline checklist: name your flow → write the question → invite people. Dismiss-only-once.
16. **Empty states.** The "No ideas yet" copy is generic. Make it actionable: when the flow is open, show the admin a "Share invite link" button right inside the empty card so they're not hunting for the panel.
17. **Mobile UX.** The admin panel sticky position breaks below the grid breakpoint; admins on phone today can't see the panel at all. Make it a drawer triggered from a header button.
18. **Member management UX.** Combine the per-flow Members list with the Invite & access section into a single "People" tab. Today "Members" lists workspace members; "Invite" creates invites; they should live together.
19. **Delete UX.** The current confirm UI is good. Add a "what will be deleted" summary — "12 ideas, 34 comments, 4 invites, 2 round-member assignments" — sourced from a `GET /api/rounds/[id]/delete-preview` call. Cuts the gut-check on confirm.
20. **Archived flows.** No archive state today, only delete. Add `status='archived'` (already supported as 'closed' conceptually — consider renaming or adding a true archive). Archived flows appear under a collapsed "Archive" section in the left nav.
21. **Permissions.** Once per-flow role exists, show a small lock pill on the header for restricted flows. Members get a "Who can see this?" tooltip listing all assigned users.
22. **Flow lifecycle.** Make Draft → Active → Closed transitions trigger lightweight notifications (in-app toast and optional email): "Your IdeaFlow 'X' is now open" / "closes in 24h" / "closed — view results".

---

## 7. Highest ROI

These are the moves with the largest UX delta per unit of engineering.

**Tier S (ship first, week 1)**
- Grouped Members page (#1) — directly answers the user's stated complaint.
- Explicit `audience_mode` column + migration — unblocks everything else and removes the leaky convention.
- "Restricted vs workspace" pill in FlowAdminPanel (#12 sub-point) — five-minute UX win once `audience_mode` exists.
- Centralised `requireWorkspaceAdmin` / `requireRoundAdmin` helpers — pure refactor, prevents future bugs.

**Tier A (week 2)**
- Last active (#3) — column + backfill + display.
- Pending invites overview on Members page (#6).
- Per-flow analytics tab (#14) — uses existing AnalyticsPanel with a new server query.
- Mobile drawer for the admin panel (#17).

**Tier B (week 3+)**
- Per-flow roles (#4) — schema is ready after V1, UI is a small change.
- Inline-editable question (#8) and "New/Top/My" tabs (#10).
- Delete-preview summary (#19).

**Tier C (later)**
- Per-flow RLS / can_manage_round() (#3c).
- Archive state and lifecycle notifications (#20, #22).
- Bulk operations (#5).

If you can only do one thing this week: ship `audience_mode` + the grouped Members page. They unlock everything else and make the data model honest.

---

## 8. Safe rollout strategy

The migration is additive, so the rollout is mostly about call-site discipline.

**Phase 1 (one deploy):** Run the migration in Supabase. Existing rounds get `audience_mode = 'workspace'`; rounds with any `round_members` get `audience_mode = 'restricted'`. No code changes are pushed in this phase. Verify nothing broke.

**Phase 2 (next deploy):** Push code that *reads* `audience_mode` but keeps the legacy "empty means open" fallback as a belt-and-suspenders check. Every server-side access decision becomes: `audience_mode === 'restricted' AND user not in round_members → deny`. Members page starts using the new grouped query. FlowAdminPanel shows the new pill. Centralised auth helpers go in.

**Phase 3 (after a quiet week):** Drop the legacy fallback. Any place still relying on "length === 0 means open" stops working — but by then it has been dead code for a week.

**Phase 4 (incremental):** Per-flow role UI, last-active display, invites overview, analytics tab, mobile drawer. Each is a self-contained PR.

**Feature flag.** If you want belt-and-braces, gate the Members-page redesign behind a per-user flag for the first 24 hours so you can roll back without a deploy.

**Backups.** Before Phase 1, snapshot the Supabase project. The migration is reversible (drop columns) but data loss in `round_members.role` after a write would be annoying.

---

## 9. TypeScript considerations

`types/database.ts` needs to grow:
- `idea_rounds.Row` gains `audience_mode: 'workspace' | 'restricted'` and `owner_id: string | null`.
- `round_members.Row` gains `role: 'owner' | 'admin' | 'member' | 'viewer'`, `last_active_at: string | null`, `invited_by: string | null`.
- `profiles.Row` gains `last_active_at: string | null`.

Today the codebase uses a lot of `(supabase as any)` and `(admin as any)` because the generated types are partially manual. Two cleanups go well with this work:

1. Replace `(admin as any).from('round_members').select(...)` with a typed select that compiles. The hand-written `types/database.ts` already covers the table — the cast is mostly defensive scar tissue.
2. Introduce a discriminated union for "audience". Something like:

```ts
type FlowAudience =
  | { mode: 'workspace' }
  | { mode: 'restricted'; userIds: string[] }
```

so call sites are forced to handle both branches. Today the same call site reads `.length === 0` and that's the entire branching logic — easy to forget.

Add a small `lib/members/types.ts`:

```ts
export type FlowSummary = {
  id: string
  name: string | null
  status: 'draft' | 'active' | 'closed'
  roleInFlow: 'owner' | 'admin' | 'member' | 'viewer' | null  // null = inherits workspace
}

export type WorkspaceMemberWithFlows = {
  id: string
  fullName: string | null
  role: 'admin' | 'member'      // workspace role
  flows: FlowSummary[]           // empty array = orphaned
  lastActiveAt: string | null
}
```

This becomes the contract between server and the redesigned Members page.

---

## 10. Suggested API contract changes

### New

- `GET /api/members` — returns `WorkspaceMemberWithFlows[]`. Replaces the inline query on the Members page. Cached for 5s on the server, revalidated on flow-membership mutations.
- `POST /api/rounds/[id]/members/bulk` — `{ userIds: string[], role?: FlowRole }`. Used by the "Add to flow…" bulk action.
- `GET /api/rounds/[id]/delete-preview` — returns `{ ideas: number, comments: number, invites: number, members: number }`. Used to populate the delete confirmation summary.

### Changed

- `POST /api/rounds/[id]/members` — accept optional `{ userId, role }`. Defaults to `member`. Returns the inserted row including the role.
- `PATCH /api/rounds/[id]` — accept `audience_mode: 'workspace' | 'restricted'`. When flipping from `restricted → workspace`, do NOT delete `round_members` rows (preserve role assignments in case the admin flips back). When flipping from `workspace → restricted` with zero `round_members`, return a 400 with a clear "Add at least one member first" error.
- `POST /api/members/remove` — rename to `POST /api/workspace/members/remove` and add `{ memberId, mode: 'workspace' | 'flow', roundId? }` so admins can remove someone from a single flow without nuking their workspace access. The flow-only variant deletes the `round_members` row; the workspace variant does the existing destructive operation.

### Deprecated

- The bare `POST /api/members/remove` shape (without `mode`) — accept it for one release for backwards compatibility, then remove.

### Errors

Establish a small shared error code set so the UI can render specific messages:
`AUDIENCE_EMPTY`, `LAST_ADMIN`, `INVITE_EXPIRED`, `WORKSPACE_LIMIT_REACHED`, `FLOW_NOT_FOUND`. Today error strings are bespoke per route — a brittle pattern.

---

## Appendix — file index for the implementation pass

Database / migrations
- `schema.sql`
- `supabase-migration-multi-flow.sql` (existing — already adds `round_members`, `manual_override`, `starts_at`, `ends_at`)
- `supabase-migration-flow-invites.sql` (existing — `invites.idea_round_id`)
- *new* `supabase-migration-members-redesign.sql`

Types
- `types/database.ts`
- *new* `lib/members/types.ts`

Server data access
- *new* `lib/members/getWorkspaceMembersWithFlows.ts`
- *new* `lib/auth/requireWorkspaceAdmin.ts`
- *new* `lib/auth/requireRoundAdmin.ts`

API routes (all read-modify)
- `app/api/rounds/[id]/route.ts`
- `app/api/rounds/[id]/members/route.ts`
- `app/api/rounds/[id]/invite/route.ts`
- `app/api/invites/route.tsx`
- `app/api/invites/[id]/route.tsx`
- `app/api/members/remove/route.tsx` (rename)
- `app/api/join/route.tsx`
- *new* `app/api/members/route.ts`
- *new* `app/api/rounds/[id]/members/bulk/route.ts`
- *new* `app/api/rounds/[id]/delete-preview/route.ts`

UI
- `app/dashboard/members/page.tsx`
- `components/TeamMembers.tsx` (likely a rewrite)
- `app/dashboard/flows/[id]/page.tsx`
- `components/FlowAdminPanel.tsx`
- *new* `components/MembersRelationshipList.tsx`
- *new* `components/FlowAudienceSwitch.tsx`
