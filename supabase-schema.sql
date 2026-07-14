-- Run this in your Supabase SQL editor (Dashboard → SQL → New query)
-- Safe to re-run: drops and recreates policies if they already exist.

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('technology', 'stat', 'legend', 'reference')),
  item_id text not null,
  author_name text not null check (char_length(author_name) between 1 and 80),
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists comments_item_idx on comments (item_type, item_id, created_at desc);

alter table comments enable row level security;

drop policy if exists "Public read comments" on comments;
create policy "Public read comments"
  on comments for select using (true);

drop policy if exists "Public insert comments" on comments;
create policy "Public insert comments"
  on comments for insert
  with check (
    char_length(author_name) between 1 and 80
    and char_length(content) between 1 and 2000
  );
