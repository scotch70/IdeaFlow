# Ideabox

A minimal SaaS app for capturing and voting on team ideas. Built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- **Authentication** — Sign up / sign in with email & password
- **Companies** — Users belong to a company; ideas are scoped to that company
- **Create ideas** — Post an idea with a title and optional description
- **Like ideas** — One like per user per idea, with optimistic UI
- **Sorted by likes** — Ideas ranked by most-liked first

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Database & Auth | Supabase (Postgres + GoTrue) |
| Styling | Tailwind CSS |
| Language | TypeScript |

## Project Structure

```
ideabox/
├── app/
│   ├── auth/page.tsx          # Sign in / Sign up page
│   ├── dashboard/page.tsx     # Main feed (server component)
│   ├── api/
│   │   ├── ideas/route.ts     # POST /api/ideas
│   │   └── likes/route.ts     # POST /api/likes
│   ├── layout.tsx
│   ├── page.tsx               # Redirects based on auth state
│   └── globals.css
├── components/
│   ├── Header.tsx             # Top nav with sign out
│   ├── IdeaList.tsx           # List of idea cards
│   ├── IdeaCard.tsx           # Single idea with like button
│   └── NewIdeaForm.tsx        # Collapsible idea submission form
├── lib/supabase/
│   ├── client.ts              # Browser client
│   └── server.ts              # Server client (cookies)
├── types/database.ts          # TypeScript types for Supabase tables
├── middleware.ts              # Auth redirect logic
└── supabase-schema.sql        # Full DB schema — run this first!
```

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project.

### 2. Run the schema

In your Supabase dashboard → **SQL Editor**, paste and run the contents of `supabase-schema.sql`.

This creates:
- `companies` table
- `profiles` table (linked to `auth.users`)
- `ideas` table
- `likes` table (unique per user+idea)
- Row-Level Security policies
- Triggers to auto-update `likes_count` and create profiles on sign-up

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials from **Project Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install dependencies & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

### Auth & Company assignment

1. User signs up with email, password, full name, and **company name**
2. The company is upserted by name — teammates entering the same company name join the same workspace
3. A profile row is created automatically via a Supabase trigger; the company_id is then linked client-side after sign-up

### Row-Level Security

- Ideas are only visible to users sharing the same `company_id`
- Likes are user-scoped (only the owner can delete their like)
- The `likes_count` column is updated via database triggers for consistency

### Optimistic UI

The like button updates immediately in the UI and syncs with the server in the background. If the request fails, it reverts.

## Extending

| Feature | Where to add |
|---------|-------------|
| Delete idea | Add `DELETE /api/ideas/[id]` + button in `IdeaCard` |
| Comments | New `comments` table + component |
| Tags/categories | Add `tags` column to `ideas` + filter UI |
| Real-time updates | `supabase.channel()` in a client component |
| Admin panel | New `/admin` route with service role client |
