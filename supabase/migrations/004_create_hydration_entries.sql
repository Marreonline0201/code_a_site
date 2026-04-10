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

-- RLS: users can only CRUD their own entries
alter table hydration_entries enable row level security;

create policy "Users can view own entries"
  on hydration_entries for select using (auth.uid() = user_id);
create policy "Users can insert own entries"
  on hydration_entries for insert with check (auth.uid() = user_id);
create policy "Users can delete own entries"
  on hydration_entries for delete using (auth.uid() = user_id);

-- Index for fast per-user date queries
create index idx_hydration_user_date on hydration_entries (user_id, date desc);
