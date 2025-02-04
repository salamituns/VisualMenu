-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create roles table
create table if not exists public.roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create permissions table
create table if not exists public.permissions (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create role_permissions junction table
create table if not exists public.role_permissions (
  id uuid primary key default uuid_generate_v4(),
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  created_at timestamptz default now(),
  unique(role_id, permission_id)
);

-- Create user_preferences table
create table if not exists public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  dietary text[] default array[]::text[],
  favorites text[] default array[]::text[],
  dark_mode boolean default false,
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Create menu_items table
create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price decimal(10,2) not null,
  category text,
  image_url text,
  dietary text[] default array[]::text[],
  available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create orders table
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  total_amount decimal(10,2) not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create order_items junction table
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete restrict,
  quantity integer not null default 1,
  price_at_time decimal(10,2) not null,
  notes text,
  created_at timestamptz default now()
);

-- Create users_roles junction table
create table if not exists public.users_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id)
);

-- Insert initial roles
insert into public.roles (name, description) values
  ('admin', 'Full system access'),
  ('user', 'Regular user access'),
  ('guest', 'Limited access')
on conflict (name) do nothing;

-- Insert initial permissions
insert into public.permissions (name, description) values
  ('menu:create', 'Can create menu items'),
  ('menu:read', 'Can view menu items'),
  ('menu:update', 'Can update menu items'),
  ('menu:delete', 'Can delete menu items'),
  ('orders:create', 'Can create orders'),
  ('orders:read', 'Can view orders'),
  ('orders:update', 'Can update orders'),
  ('analytics:read', 'Can view analytics'),
  ('users:manage', 'Can manage users')
on conflict (name) do nothing;

-- Set up role-permission relationships
do $$
declare
  admin_role_id uuid;
  user_role_id uuid;
  guest_role_id uuid;
  perm_record record;
begin
  -- Get role IDs
  select id into admin_role_id from public.roles where name = 'admin';
  select id into user_role_id from public.roles where name = 'user';
  select id into guest_role_id from public.roles where name = 'guest';

  -- Assign all permissions to admin
  for perm_record in select id from public.permissions loop
    insert into public.role_permissions (role_id, permission_id)
    values (admin_role_id, perm_record.id)
    on conflict (role_id, permission_id) do nothing;
  end loop;

  -- Assign basic permissions to user
  insert into public.role_permissions (role_id, permission_id)
  select user_role_id, id from public.permissions 
  where name in ('menu:read', 'orders:create', 'orders:read')
  on conflict (role_id, permission_id) do nothing;

  -- Assign minimal permissions to guest
  insert into public.role_permissions (role_id, permission_id)
  select guest_role_id, id from public.permissions 
  where name in ('menu:read')
  on conflict (role_id, permission_id) do nothing;
end;
$$;

-- Enable Row Level Security
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_preferences enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.users_roles enable row level security;

-- Create RLS Policies

-- Roles policies
create policy "Roles are viewable by all authenticated users"
  on public.roles for select
  to authenticated
  using (true);

-- Permissions policies
create policy "Permissions are viewable by all authenticated users"
  on public.permissions for select
  to authenticated
  using (true);

-- Role permissions policies
create policy "Role permissions are viewable by all authenticated users"
  on public.role_permissions for select
  to authenticated
  using (true);

-- User preferences policies
create policy "Users can view own preferences"
  on public.user_preferences for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  to authenticated
  using (auth.uid() = user_id);

-- Menu items policies
create policy "Menu items are viewable by all users"
  on public.menu_items for select
  to authenticated
  using (true);

create policy "Only admins can modify menu items"
  on public.menu_items for all
  to authenticated
  using (
    exists (
      select 1 from public.users_roles ur
      join public.roles r on r.id = ur.role_id
      where ur.user_id = auth.uid() and r.name = 'admin'
    )
  );

-- Orders policies
create policy "Users can view own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create own orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.orders for update
  to authenticated
  using (auth.uid() = user_id);

-- Order items policies
create policy "Users can view own order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can create order items for own orders"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Create function to calculate order total
create or replace function calculate_order_total(order_id uuid)
returns decimal as $$
begin
  return (
    select coalesce(sum(quantity * price_at_time), 0)
    from public.order_items
    where order_id = calculate_order_total.order_id
  );
end;
$$ language plpgsql security definer;

-- Create trigger to update order total
create or replace function update_order_total()
returns trigger as $$
begin
  update public.orders
  set total_amount = calculate_order_total(new.order_id)
  where id = new.order_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger update_order_total_on_item_change
after insert or update or delete on public.order_items
for each row execute function update_order_total(); 