-- Allow authenticated users to insert their own profile row
-- This handles the case where the handle_new_user trigger didn't fire
-- (e.g., user created before trigger existed)
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);
