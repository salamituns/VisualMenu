-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create tables
create table if not exists public.user_roles (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    role text check (role in ('admin', 'user')) not null default 'user',
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    unique(user_id)
);

create table if not exists public.user_preferences (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    dietary text[] default '{}',
    favorites text[] default '{}',
    dark_mode boolean default false,
    language text default 'en',
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null,
    unique(user_id)
);

create table if not exists public.menu_items (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    price decimal(10,2) not null,
    category text not null default 'Uncategorized',
    image_url text,
    dietary text[] default '{}',
    is_available boolean default true,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.user_roles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.menu_items enable row level security;

-- User Roles Policies
create policy "Users can view their own role"
    on public.user_roles
    for select
    using (auth.uid() = user_id);

create policy "Only super admin can manage roles"
    on public.user_roles
    for all
    using (
        auth.uid() in (
            select user_id from public.user_roles
            where role = 'admin'
        )
    );

-- User Preferences Policies
create policy "Users can view their own preferences"
    on public.user_preferences
    for select
    using (auth.uid() = user_id);

create policy "Users can update their own preferences"
    on public.user_preferences
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can insert their own preferences"
    on public.user_preferences
    for insert
    with check (auth.uid() = user_id);

-- Menu Items Policies
create policy "Anyone can view menu items"
    on public.menu_items
    for select
    to authenticated
    using (true);

create policy "Only admins can manage menu items"
    on public.menu_items
    for all
    using (
        auth.uid() in (
            select user_id from public.user_roles
            where role = 'admin'
        )
    );

-- Insert initial admin user (replace 'USER-UUID' with the actual user ID)
-- You'll need to set this after creating your first user
-- insert into public.user_roles (user_id, role)
-- values ('USER-UUID', 'admin');

-- Create function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
    before update on public.user_roles
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.user_preferences
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.menu_items
    for each row
    execute function public.handle_updated_at();

-- Insert sample menu items
insert into public.menu_items (name, description, price, category, dietary)
values 
    ('Classic Burger', 'Juicy beef patty with lettuce, tomato, and cheese', 12.99, 'Burgers', array['dairy']),
    ('Veggie Burger', 'Plant-based patty with fresh vegetables', 11.99, 'Burgers', array['vegetarian', 'vegan']),
    ('Caesar Salad', 'Crisp romaine lettuce with parmesan and croutons', 9.99, 'Salads', array['dairy']),
    ('Greek Salad', 'Fresh vegetables with feta cheese and olives', 10.99, 'Salads', array['dairy', 'vegetarian']); 