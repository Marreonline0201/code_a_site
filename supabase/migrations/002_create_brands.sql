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

-- RLS: public read-only
alter table brands enable row level security;
create policy "Brands are publicly readable"
  on brands for select using (true);
