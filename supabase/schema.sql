-- Run this in the Supabase Dashboard → SQL Editor for the Stash project.

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  source text not null default '',
  url text not null default '',
  type text not null default 'article',
  subject text not null default '',
  tags text[] not null default '{}',
  status text not null default 'to-read',
  summary text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.items enable row level security;

create policy "Users can view own items"
  on public.items for select
  using (auth.uid() = user_id);

create policy "Users can insert own items"
  on public.items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own items"
  on public.items for update
  using (auth.uid() = user_id);

create policy "Users can delete own items"
  on public.items for delete
  using (auth.uid() = user_id);
