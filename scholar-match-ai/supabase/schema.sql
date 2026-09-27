create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null default '',
  nationality text not null default '',
  current_degree text not null default '',
  current_institution text not null default '',
  target_degree_level text not null default 'master' check (target_degree_level in ('bachelor', 'master', 'phd', 'postdoc')),
  target_field_of_study text not null default '',
  gpa numeric,
  gpa_scale text default '4.0',
  ielts_score numeric,
  toefl_score numeric,
  other_language_scores jsonb not null default '{}'::jsonb,
  research_experience jsonb not null default '[]'::jsonb,
  work_experience jsonb not null default '[]'::jsonb,
  leadership_experience jsonb not null default '[]'::jsonb,
  publications jsonb not null default '[]'::jsonb,
  awards jsonb not null default '[]'::jsonb,
  goals text not null default '',
  constraints jsonb not null default '{"preferred_countries": [], "exclude_countries": [], "language_requirements": [], "funding_type": "any"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = user_id);
create policy "Users can create their own profile"
  on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users can upload their own documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can read their own documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete their own documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);