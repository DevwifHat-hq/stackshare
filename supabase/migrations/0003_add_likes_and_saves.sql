-- Create tables first
create table if not exists stack_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  stack_id uuid references stacks(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, stack_id)
);

create table if not exists stack_saves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  stack_id uuid references stacks(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, stack_id)
);

-- Now that tables exist, we can drop and recreate policies
do $$
begin
  -- Drop existing policies if they exist
  if exists (select 1 from pg_policies where tablename = 'stack_likes') then
    drop policy if exists "Users can view all likes" on stack_likes;
    drop policy if exists "Users can like stacks" on stack_likes;
    drop policy if exists "Users can unlike stacks" on stack_likes;
  end if;

  if exists (select 1 from pg_policies where tablename = 'stack_saves') then
    drop policy if exists "Users can view all saves" on stack_saves;
    drop policy if exists "Users can save stacks" on stack_saves;
    drop policy if exists "Users can unsave stacks" on stack_saves;
  end if;
end$$;

-- Add RLS policies
alter table stack_likes enable row level security;
alter table stack_saves enable row level security;

create policy "Users can view all likes"
  on stack_likes for select
  to authenticated
  using (true);

create policy "Users can like stacks"
  on stack_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unlike stacks"
  on stack_likes for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can view all saves"
  on stack_saves for select
  to authenticated
  using (true);

create policy "Users can save stacks"
  on stack_saves for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can unsave stacks"
  on stack_saves for delete
  to authenticated
  using (auth.uid() = user_id);

-- Drop existing functions if they exist
drop function if exists toggle_stack_like(uuid);
drop function if exists toggle_stack_save(uuid);

-- Create functions to handle likes/saves
create or replace function toggle_stack_like(stack_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  liked boolean;
begin
  -- Check if the user has already liked the stack
  if exists (
    select 1 from stack_likes
    where user_id = auth.uid()
    and stack_id = toggle_stack_like.stack_id
  ) then
    -- Unlike
    delete from stack_likes
    where user_id = auth.uid()
    and stack_id = toggle_stack_like.stack_id;
    liked := false;
  else
    -- Like
    insert into stack_likes (user_id, stack_id)
    values (auth.uid(), toggle_stack_like.stack_id);
    liked := true;
  end if;

  -- Update the likes count in the stacks table
  update stacks
  set likes = (
    select count(*)
    from stack_likes
    where stack_id = toggle_stack_like.stack_id
  )
  where id = toggle_stack_like.stack_id;

  return liked;
end;
$$;

create or replace function toggle_stack_save(stack_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  saved boolean;
begin
  -- Check if the user has already saved the stack
  if exists (
    select 1 from stack_saves
    where user_id = auth.uid()
    and stack_id = toggle_stack_save.stack_id
  ) then
    -- Unsave
    delete from stack_saves
    where user_id = auth.uid()
    and stack_id = toggle_stack_save.stack_id;
    saved := false;
  else
    -- Save
    insert into stack_saves (user_id, stack_id)
    values (auth.uid(), toggle_stack_save.stack_id);
    saved := true;
  end if;

  return saved;
end;
$$; 