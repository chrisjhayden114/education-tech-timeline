-- Run in Supabase SQL editor (safe to re-run).

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  item_type text not null,
  item_id text not null,
  author_name text not null check (char_length(author_name) between 1 and 80),
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- Widen allowed item types (technology, stats, legend, references, sections)
alter table comments drop constraint if exists comments_item_type_check;
alter table comments
  add constraint comments_item_type_check
  check (item_type in ('technology', 'stat', 'legend', 'reference', 'section'));

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

-- Lets the site delete comments this browser posted (Delete button).
drop policy if exists "Public delete comments" on comments;
create policy "Public delete comments"
  on comments for delete using (true);
