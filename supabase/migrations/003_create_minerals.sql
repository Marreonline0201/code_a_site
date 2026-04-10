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

-- RLS: public read-only
alter table minerals enable row level security;
create policy "Minerals are publicly readable"
  on minerals for select using (true);
