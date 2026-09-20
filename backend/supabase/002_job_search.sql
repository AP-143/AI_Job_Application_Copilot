-- Job search: saved search preferences and the merged results returned by
-- the multi-source search pipeline (RemoteOK, Himalayas, Adzuna, Gemini
-- grounding). See backend/app/graphs/job_search.py.

create table if not exists public.job_search_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  job_title text not null,
  location text not null,
  remote_only boolean not null default false,
  target_companies text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null,
  source_url text not null,
  title text not null,
  company text,
  location text,
  remote boolean not null default false,
  salary_text text,
  posted_at date,
  description text,
  fetched_at timestamptz not null default now(),
  hidden boolean not null default false,
  unique (user_id, source_url)
);

create index if not exists job_listings_user_id_idx
  on public.job_listings (user_id);

alter table public.job_search_preferences enable row level security;
alter table public.job_listings enable row level security;

grant select, insert, update, delete on public.job_search_preferences to authenticated;
grant select, insert, update, delete on public.job_listings to authenticated;

create policy "Users can view their own search preferences"
  on public.job_search_preferences for select
  using (auth.uid() = user_id);
create policy "Users can insert their own search preferences"
  on public.job_search_preferences for insert
  with check (auth.uid() = user_id);
create policy "Users can update their own search preferences"
  on public.job_search_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete their own search preferences"
  on public.job_search_preferences for delete
  using (auth.uid() = user_id);

create policy "Users can view their own job listings"
  on public.job_listings for select
  using (auth.uid() = user_id);
create policy "Users can insert their own job listings"
  on public.job_listings for insert
  with check (auth.uid() = user_id);
create policy "Users can update their own job listings"
  on public.job_listings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users can delete their own job listings"
  on public.job_listings for delete
  using (auth.uid() = user_id);

create trigger job_search_preferences_set_updated_at
  before update on public.job_search_preferences
  for each row execute function public.set_updated_at();
