-- Function to generate random number between 1 and 10
create or replace function random_score()
returns integer as $$
begin
  return floor(random() * 9 + 1)::integer;
end;
$$ language plpgsql;

-- Function to generate mock data for the last 30 days
do $$
declare
  v_user_id uuid;
  log_date timestamp;
begin
  -- Get the first user from the system (for demo purposes)
  select id into v_user_id 
  from auth.users 
  where id is not null 
  limit 1;

  -- Exit if no user found
  if v_user_id is null then
    raise notice 'No users found in the system';
    return;
  end if;
  
  -- Generate data for the last 30 days
  for i in 0..29 loop
    log_date := current_timestamp - (i || ' days')::interval;
    
    -- Insert daily metrics log
    insert into daily_logs (
      user_id,
      date,
      mood,
      energy,
      focus,
      stress,
      sleep_quality,
      notes,
      created_at,
      action,
      metadata
    ) values (
      v_user_id,
      log_date::date,
      random_score(),
      random_score(),
      random_score(),
      random_score(),
      random_score(),
      case 
        when random() < 0.3 then 'Feeling great today! High energy and productivity.'
        when random() < 0.6 then 'Average day, maintaining steady progress.'
        else 'Need to improve sleep schedule and reduce stress.'
      end,
      log_date,
      'log_metrics',
      jsonb_build_object(
        'mood_score', random_score(),
        'energy_score', random_score(),
        'focus_score', random_score(),
        'stress_score', random_score(),
        'sleep_score', random_score(),
        'summary', case 
          when random() < 0.3 then 'Great day overall! Feeling energized and focused.'
          when random() < 0.6 then 'Steady progress with my daily routines.'
          else 'Room for improvement in sleep and stress management.'
        end
      )
    )
    on conflict (user_id, date) do update set
      mood = excluded.mood,
      energy = excluded.energy,
      focus = excluded.focus,
      stress = excluded.stress,
      sleep_quality = excluded.sleep_quality,
      notes = excluded.notes,
      action = excluded.action,
      metadata = excluded.metadata;
  end loop;

  raise notice 'Successfully generated mock data for user %', v_user_id;
end;
$$; 