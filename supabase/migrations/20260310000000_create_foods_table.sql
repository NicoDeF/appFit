-- Food database: shared cache populated by Claude AI estimations
create table if not exists public.foods (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  name_lower   text generated always as (lower(name)) stored,
  cal          integer not null,
  p            numeric(5,1) not null,
  c            numeric(5,1) not null,
  f            numeric(5,1) not null,
  source       text not null default 'claude',
  search_count integer not null default 1,
  created_at   timestamptz not null default now()
);

-- Fast case-insensitive name search
create index if not exists idx_foods_name_lower on public.foods (name_lower);

-- Anyone can read foods (anon key is fine)
alter table public.foods enable row level security;

create policy "foods_read_all" on public.foods
  for select using (true);

-- Only service role (edge function) can insert/update
create policy "foods_insert_service" on public.foods
  for insert with check (true);

create policy "foods_update_service" on public.foods
  for update using (true);
