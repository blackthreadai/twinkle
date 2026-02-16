-- Twinkle Database Schema
-- Supabase (Postgres) with RLS

-- ============================================================
-- TABLES
-- ============================================================

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

create table public.houses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  description text,
  zip_code text,
  features jsonb default '[]'::jsonb not null,  -- e.g. ["Lights","Music","Animatronics"]
  photos text[] default '{}' not null,           -- max 5, enforced at app level
  season_year int not null default extract(year from now()),
  is_active bool default true not null,
  claimed_by uuid references public.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  score decimal(2,1) not null check (score >= 1.0 and score <= 5.0 and (score * 2) = floor(score * 2)),
  created_at timestamptz default now() not null,
  -- One rating per user per house per season
  unique (house_id, user_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null check (char_length(body) > 0 and char_length(body) <= 2000),
  is_flagged bool default false not null,
  created_at timestamptz default now() not null
);

create table public.routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  house_ids uuid[] not null default '{}',
  duration_minutes int,
  distance_km decimal(8,2),
  polyline text,
  is_public bool default false not null,
  created_at timestamptz default now() not null
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  voted_at date not null default current_date,
  created_at timestamptz default now() not null,
  -- One vote per user per day (across all houses)
  unique (user_id, voted_at)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_houses_season on public.houses(season_year, is_active);
create index idx_houses_location on public.houses(lat, lng);
create index idx_ratings_house on public.ratings(house_id);
create index idx_reviews_house on public.reviews(house_id);
create index idx_routes_user on public.routes(user_id);
create index idx_votes_house on public.votes(house_id);
create index idx_votes_user_date on public.votes(user_id, voted_at);
create index idx_houses_zip on public.houses(zip_code);

-- ============================================================
-- VIEWS
-- ============================================================

create or replace view public.house_stats as
select
  h.id as house_id,
  coalesce(avg(r.score), 0) as avg_rating,
  count(r.id) as rating_count
from public.houses h
left join public.ratings r on r.house_id = h.id
group by h.id;

-- Vote counts per house
create or replace view public.house_vote_counts as
select
  h.id as house_id,
  count(v.id) as vote_count
from public.houses h
left join public.votes v on v.house_id = h.id
group by h.id;

-- National ranking by votes
create or replace view public.national_rankings as
select
  house_id,
  vote_count,
  rank() over (order by vote_count desc) as national_rank
from public.house_vote_counts;

-- Local ranking by votes (within zip code)
create or replace view public.local_rankings as
select
  h.id as house_id,
  h.zip_code,
  coalesce(hvc.vote_count, 0) as vote_count,
  rank() over (partition by h.zip_code order by coalesce(hvc.vote_count, 0) desc) as local_rank
from public.houses h
left join public.house_vote_counts hvc on hvc.house_id = h.id
where h.zip_code is not null;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.houses enable row level security;
alter table public.ratings enable row level security;
alter table public.reviews enable row level security;
alter table public.votes enable row level security;
alter table public.routes enable row level security;

-- Users
create policy "Users are viewable by everyone"
  on public.users for select using (true);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- Houses
create policy "Houses are viewable by everyone"
  on public.houses for select using (true);

create policy "Authenticated users can add houses"
  on public.houses for insert with check (auth.uid() = user_id);

create policy "Users can update own houses"
  on public.houses for update using (auth.uid() = user_id);

create policy "Users can delete own houses"
  on public.houses for delete using (auth.uid() = user_id);

-- Ratings
create policy "Ratings are viewable by everyone"
  on public.ratings for select using (true);

create policy "Authenticated users can rate"
  on public.ratings for insert with check (auth.uid() = user_id);

create policy "Users can update own ratings"
  on public.ratings for update using (auth.uid() = user_id);

create policy "Users can delete own ratings"
  on public.ratings for delete using (auth.uid() = user_id);

-- Reviews
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (is_flagged = false or auth.uid() = user_id);

create policy "Authenticated users can review"
  on public.reviews for insert with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete using (auth.uid() = user_id);

-- Votes
create policy "Votes are viewable by everyone"
  on public.votes for select using (true);

create policy "Authenticated users can vote"
  on public.votes for insert with check (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.votes for delete using (auth.uid() = user_id);

-- Routes
create policy "Public routes are viewable by everyone"
  on public.routes for select using (is_public = true or auth.uid() = user_id);

create policy "Authenticated users can create routes"
  on public.routes for insert with check (auth.uid() = user_id);

create policy "Users can update own routes"
  on public.routes for update using (auth.uid() = user_id);

create policy "Users can delete own routes"
  on public.routes for delete using (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_house_updated
  before update on public.houses
  for each row execute function public.handle_updated_at();
