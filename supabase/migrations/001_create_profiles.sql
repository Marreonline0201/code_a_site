-- Profiles table extends Supabase auth.users
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  weight numeric default 70,
  unit text default 'kg' check (unit in ('kg', 'lbs')),
  activity_level text default 'moderate'
    check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very-active')),
  climate text default 'temperate'
    check (climate in ('cold', 'temperate', 'hot', 'humid')),
  daily_goal integer default 2500,
  wake_time text default '07:00',
  reminder_interval integer default 60,
  failed_login_attempts integer default 0,
  lock_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: users can only read/update their own profile
alter table profiles enable row level security;
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function public.update_updated_at();
