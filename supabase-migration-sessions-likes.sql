-- ─────────────────────────────────────────────────────────────────────────────
-- Sessions: per-user heart likes on cards
--
-- Used by the new Brainstorm Circle framework — members heart each others'
-- cards so the strongest ideas surface. Generic enough to use on any
-- session_card if we surface hearts in other frameworks later.
--
-- Auth model:
--   • Same-company users can READ all likes for cards in their workspace.
--   • Users can INSERT only their own like (user_id = auth.uid()) and only
--     on cards in their workspace.
--   • Users can DELETE only their own like.
--   • Unique (card_id, user_id) means hearts are toggles, not counters.
--
-- Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.session_card_likes (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.session_cards(id) on delete cascade,
  user_id     uuid not null references auth.users(id)           on delete cascade,
  created_at  timestamptz not null default now(),
  unique (card_id, user_id)
);

create index if not exists session_card_likes_card_id_idx on public.session_card_likes (card_id);
create index if not exists session_card_likes_user_id_idx on public.session_card_likes (user_id);

alter table public.session_card_likes enable row level security;

drop policy if exists session_card_likes_read   on public.session_card_likes;
drop policy if exists session_card_likes_insert on public.session_card_likes;
drop policy if exists session_card_likes_delete on public.session_card_likes;

create policy session_card_likes_read on public.session_card_likes for select to authenticated
  using ( exists (
    select 1
    from public.session_cards c
    join public.sessions s on s.id = c.session_id
    where c.id = session_card_likes.card_id
      and s.company_id = public.get_my_company_id()
  ) );

create policy session_card_likes_insert on public.session_card_likes for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.session_cards c
      join public.sessions s on s.id = c.session_id
      where c.id = session_card_likes.card_id
        and s.company_id = public.get_my_company_id()
    )
  );

create policy session_card_likes_delete on public.session_card_likes for delete to authenticated
  using ( user_id = auth.uid() );

grant select, insert, delete on public.session_card_likes to authenticated;
