-- ============================================
-- MINERAL WATER SITE — COMBINED SQL MIGRATION
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
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

alter table profiles enable row level security;
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

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

-- ============================================
-- 2. BRANDS TABLE
-- ============================================
create table brands (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  origin text not null,
  type text not null check (type in ('still', 'sparkling', 'both')),
  calcium numeric default 0,
  magnesium numeric default 0,
  sodium numeric default 0,
  potassium numeric default 0,
  bicarbonate numeric default 0,
  sulfate numeric default 0,
  chloride numeric default 0,
  silica numeric default 0,
  fluoride numeric default 0,
  tds numeric default 0,
  ph numeric default 7,
  amazon_asin text not null,
  image text default '',
  tasting_notes text default '',
  rating numeric default 0,
  price_range text default '$$' check (price_range in ('$', '$$', '$$$'))
);

alter table brands enable row level security;
create policy "Brands are publicly readable"
  on brands for select using (true);

-- ============================================
-- 3. MINERALS TABLE
-- ============================================
create table minerals (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  symbol text not null,
  unit text default 'mg/L',
  daily_value numeric not null,
  benefits text[] not null default '{}',
  high_threshold numeric not null,
  low_threshold numeric not null
);

alter table minerals enable row level security;
create policy "Minerals are publicly readable"
  on minerals for select using (true);

-- ============================================
-- 4. HYDRATION ENTRIES TABLE
-- ============================================
create table hydration_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  logged_at timestamptz default now() not null,
  date date default current_date not null,
  amount integer not null check (amount between 1 and 5000),
  brand_slug text,
  activity text check (activity is null or char_length(activity) <= 50),
  note text default '' check (char_length(note) <= 200),
  created_at timestamptz default now()
);

alter table hydration_entries enable row level security;

create policy "Users can view own entries"
  on hydration_entries for select using (auth.uid() = user_id);
create policy "Users can insert own entries"
  on hydration_entries for insert with check (auth.uid() = user_id);
create policy "Users can delete own entries"
  on hydration_entries for delete using (auth.uid() = user_id);

create index idx_hydration_user_date on hydration_entries (user_id, date desc);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Check if account is locked
create or replace function public.check_login_lockout(user_uuid uuid)
returns json as $$
declare
  profile_row profiles%rowtype;
begin
  select * into profile_row from profiles where id = user_uuid;

  if profile_row is null then
    return json_build_object('locked', false, 'attempts', 0);
  end if;

  if profile_row.lock_until is not null and profile_row.lock_until > now() then
    return json_build_object('locked', true, 'lock_until', profile_row.lock_until);
  end if;

  return json_build_object('locked', false, 'attempts', profile_row.failed_login_attempts);
end;
$$ language plpgsql security definer;

-- Record a failed login attempt (locks after 5 failures)
create or replace function public.record_failed_login(user_uuid uuid)
returns void as $$
declare
  current_attempts integer;
begin
  select failed_login_attempts into current_attempts
  from profiles where id = user_uuid;

  if current_attempts + 1 >= 5 then
    update profiles set
      failed_login_attempts = current_attempts + 1,
      lock_until = now() + interval '15 minutes'
    where id = user_uuid;
  else
    update profiles set
      failed_login_attempts = current_attempts + 1
    where id = user_uuid;
  end if;
end;
$$ language plpgsql security definer;

-- Reset login attempts on successful login
create or replace function public.record_successful_login(user_uuid uuid)
returns void as $$
begin
  update profiles set
    failed_login_attempts = 0,
    lock_until = null,
    last_login_at = now()
  where id = user_uuid;
end;
$$ language plpgsql security definer;

-- Daily hydration stats aggregation
create or replace function public.get_hydration_stats(
  p_user_id uuid,
  p_days integer default 7
)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'total_entries', count(*),
    'total_ml', coalesce(sum(amount), 0),
    'avg_daily_ml', coalesce(
      sum(amount) / nullif(count(distinct date), 0), 0
    ),
    'days_tracked', count(distinct date),
    'daily_breakdown', (
      select json_agg(row_to_json(d))
      from (
        select date, sum(amount) as total_ml, count(*) as entries
        from hydration_entries
        where user_id = p_user_id
          and date >= current_date - p_days
        group by date
        order by date desc
      ) d
    )
  ) into result
  from hydration_entries
  where user_id = p_user_id
    and date >= current_date - p_days;

  return result;
end;
$$ language plpgsql security definer;
