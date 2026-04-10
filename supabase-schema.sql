-- ============================================================
-- Ideabox — Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Companies table
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- 2. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  full_name text,
  created_at timestamptz not null default now()
);

-- 3. Ideas table
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Likes table (one per user per idea)
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, idea_id)
);

-- ============================================================
-- Row-Level Security
-- ============================================================

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.likes enable row level security;

-- Companies: anyone can read, only service role inserts
create policy "Companies are viewable by all authenticated users"
  on public.companies for select
  to authenticated
  using (true);

create policy "Allow company insert during signup"
  on public.companies for insert
  to authenticated
  with check (true);

-- Profiles: users can read/update their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Ideas: users can read all ideas within their company; insert/delete own ideas
create policy "Users can view ideas in their company"
  on public.ideas for select
  to authenticated
  using (
    company_id = (
      select company_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can create ideas in their company"
  on public.ideas for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and company_id = (
      select company_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can delete their own ideas"
  on public.ideas for delete
  to authenticated
  using (user_id = auth.uid());

-- Likes: users can like/unlike; see likes within their company's ideas
create policy "Users can view likes"
  on public.likes for select
  to authenticated
  using (true);

create policy "Users can insert their own likes"
  on public.likes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can delete their own likes"
  on public.likes for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- Auto-increment likes_count on ideas when a like is added/removed
create or replace function public.handle_like_insert()
returns trigger language plpgsql security definer as $$
begin
  update public.ideas set likes_count = likes_count + 1 where id = NEW.idea_id;
  return NEW;
end;
$$;

create or replace function public.handle_like_delete()
returns trigger language plpgsql security definer as $$
begin
  update public.ideas set likes_count = greatest(likes_count - 1, 0) where id = OLD.idea_id;
  return OLD;
end;
$$;

drop trigger if exists on_like_insert on public.likes;
create trigger on_like_insert
  after insert on public.likes
  for each row execute procedure public.handle_like_insert();

drop trigger if exists on_like_delete on public.likes;
create trigger on_like_delete
  after delete on public.likes
  for each row execute procedure public.handle_like_delete();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (NEW.id, NEW.raw_user_meta_data->>'full_name');
  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
