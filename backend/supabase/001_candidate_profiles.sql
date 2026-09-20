-- Candidate profiles: structured CV data produced by the Profile Extractor.
-- One row per user (a user re-uploads/re-extracts to replace it, keeping
-- history simple for now — revisit if versioning is needed later).

create table if not exists public.candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_filename text not null,
  profile jsonb not null,           -- CandidateProfile, see backend/app/models/profile.py
  warnings jsonb not null default '[]'::jsonb,
  raw_text_length integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists candidate_profiles_user_id_idx
  on public.candidate_profiles (user_id);

alter table public.candidate_profiles enable row level security;

create policy "Users can view their own profile"
  on public.candidate_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.candidate_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.candidate_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on public.candidate_profiles for delete
  using (auth.uid() = user_id);

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger candidate_profiles_set_updated_at
  before update on public.candidate_profiles
  for each row execute function public.set_updated_at();
