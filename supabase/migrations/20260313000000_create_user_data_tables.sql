-- User profiles (one row per user)
create table if not exists public.profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  weight         numeric(5,1),
  target_weight  numeric(5,1),
  height         numeric(5,1),
  age            integer,
  gender         text,
  activity_level text,
  goal           text,
  tdee           integer,
  body_fat       numeric(4,1),
  target_bf      numeric(4,1),
  protein_per_kg numeric(4,2),
  unit_system    text default 'metric',
  language       text default 'es',
  updated_at     timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_owner_select" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles_owner_insert" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_owner_update" on public.profiles
  for update using (auth.uid() = user_id);

-- Body log (one row per user per date)
create table if not exists public.body_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  weight     numeric(5,1),
  bf         numeric(4,1),
  waist      numeric(5,1),
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.body_log enable row level security;

create policy "body_log_owner_select" on public.body_log
  for select using (auth.uid() = user_id);

create policy "body_log_owner_insert" on public.body_log
  for insert with check (auth.uid() = user_id);

create policy "body_log_owner_update" on public.body_log
  for update using (auth.uid() = user_id);

-- Weekly plan (one row per user, stored as JSONB)
create table if not exists public.weekly_plans (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  plan       jsonb not null default '[]',
  updated_at timestamptz default now()
);

alter table public.weekly_plans enable row level security;

create policy "weekly_plans_owner_select" on public.weekly_plans
  for select using (auth.uid() = user_id);

create policy "weekly_plans_owner_insert" on public.weekly_plans
  for insert with check (auth.uid() = user_id);

create policy "weekly_plans_owner_update" on public.weekly_plans
  for update using (auth.uid() = user_id);
