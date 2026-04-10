-- Function to check if account is locked and increment failed attempts
create or replace function public.check_login_lockout(user_uuid uuid)
returns json as $$
declare
  profile_row profiles%rowtype;
begin
  select * into profile_row from profiles where id = user_uuid;

  if profile_row is null then
    return json_build_object('locked', false, 'attempts', 0);
  end if;

  -- Check if currently locked
  if profile_row.lock_until is not null and profile_row.lock_until > now() then
    return json_build_object('locked', true, 'lock_until', profile_row.lock_until);
  end if;

  return json_build_object('locked', false, 'attempts', profile_row.failed_login_attempts);
end;
$$ language plpgsql security definer;

-- Function to record a failed login attempt
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

-- Function to reset login attempts on successful login
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
