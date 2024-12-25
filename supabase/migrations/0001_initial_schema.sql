-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create user_profiles table
create table if not exists public.user_profiles (
    id uuid references auth.users on delete cascade not null primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    username text unique not null,
    email text,
    full_name text,
    avatar_url text,
    constraint username_length check (char_length(username) >= 3)
);

-- Create stacks table
create table if not exists public.stacks (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references public.user_profiles(id) on delete cascade not null,
    name text not null,
    description text,
    is_public boolean default false,
    constraint name_length check (char_length(name) >= 1)
);

-- Create stack_items table
create table if not exists public.stack_items (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    stack_id uuid references public.stacks(id) on delete cascade not null,
    name text not null,
    description text,
    type text not null,
    dosage text,
    timing text,
    constraint name_length check (char_length(name) >= 1),
    constraint type_check check (type in ('supplement', 'food', 'habit', 'other'))
);

-- Create daily_logs table
create table if not exists public.daily_logs (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references public.user_profiles(id) on delete cascade not null,
    date date not null,
    mood integer,
    energy integer,
    notes text,
    constraint mood_range check (mood between 1 and 10),
    constraint energy_range check (energy between 1 and 10),
    unique(user_id, date)
);

-- Enable Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.stacks enable row level security;
alter table public.stack_items enable row level security;
alter table public.daily_logs enable row level security;

-- Create RLS policies
create policy "Users can view their own profile"
    on public.user_profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.user_profiles for update
    using (auth.uid() = id);

create policy "Users can insert their own profile"
    on public.user_profiles for insert
    with check (auth.uid() = id);

-- Stacks policies
create policy "Users can view their own stacks"
    on public.stacks for select
    using (auth.uid() = user_id);

create policy "Users can create their own stacks"
    on public.stacks for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own stacks"
    on public.stacks for update
    using (auth.uid() = user_id);

create policy "Users can delete their own stacks"
    on public.stacks for delete
    using (auth.uid() = user_id);

-- Stack items policies
create policy "Users can view items in their stacks"
    on public.stack_items for select
    using (
        exists (
            select 1 from public.stacks
            where id = stack_items.stack_id
            and user_id = auth.uid()
        )
    );

create policy "Users can create items in their stacks"
    on public.stack_items for insert
    with check (
        exists (
            select 1 from public.stacks
            where id = stack_items.stack_id
            and user_id = auth.uid()
        )
    );

create policy "Users can update items in their stacks"
    on public.stack_items for update
    using (
        exists (
            select 1 from public.stacks
            where id = stack_items.stack_id
            and user_id = auth.uid()
        )
    );

create policy "Users can delete items in their stacks"
    on public.stack_items for delete
    using (
        exists (
            select 1 from public.stacks
            where id = stack_items.stack_id
            and user_id = auth.uid()
        )
    );

-- Daily logs policies
create policy "Users can view their own logs"
    on public.daily_logs for select
    using (auth.uid() = user_id);

create policy "Users can create their own logs"
    on public.daily_logs for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own logs"
    on public.daily_logs for update
    using (auth.uid() = user_id);

create policy "Users can delete their own logs"
    on public.daily_logs for delete
    using (auth.uid() = user_id); 