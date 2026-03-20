create extension if not exists pgcrypto;

create table if not exists public.racers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  car_name text default '',
  dial text default '',
  image_url text default '',
  bye_used boolean not null default false,
  is_scratched boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.event_state (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'H-Town Hitters',
  subtitle text not null default 'Race Control',
  call_message text not null default 'Round 1 pairings are live',
  current_round integer not null default 1,
  status text not null default 'ready',
  updated_at timestamptz not null default now()
);

create table if not exists public.pairings (
  id uuid primary key default gen_random_uuid(),
  round_number integer not null default 1,
  pair_number integer not null,
  left_racer_id uuid references public.racers(id) on delete set null,
  right_racer_id uuid references public.racers(id) on delete set null,
  winner_racer_id uuid references public.racers(id) on delete set null,
  lane_assignment_left text,
  lane_assignment_right text,
  result text not null default 'pending',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.event_state (title, subtitle, call_message, current_round, status)
select 'H-Town Hitters', 'Race Control', 'Race director connected. Add racers to begin.', 1, 'ready'
where not exists (select 1 from public.event_state);

alter publication supabase_realtime add table public.racers;
alter publication supabase_realtime add table public.event_state;
alter publication supabase_realtime add table public.pairings;

alter table public.racers enable row level security;
alter table public.event_state enable row level security;
alter table public.pairings enable row level security;

create policy "public read racers" on public.racers for select using (true);
create policy "public insert racers" on public.racers for insert with check (true);
create policy "public update racers" on public.racers for update using (true);
create policy "public delete racers" on public.racers for delete using (true);

create policy "public read event_state" on public.event_state for select using (true);
create policy "public insert event_state" on public.event_state for insert with check (true);
create policy "public update event_state" on public.event_state for update using (true);

create policy "public read pairings" on public.pairings for select using (true);
create policy "public insert pairings" on public.pairings for insert with check (true);
create policy "public update pairings" on public.pairings for update using (true);
create policy "public delete pairings" on public.pairings for delete using (true);
