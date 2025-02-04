create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(10,2) not null,
  category_id uuid references public.categories(id),
  image_url text,
  is_available boolean not null default true,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;

-- Create policies for categories
create policy "Enable all operations for authenticated users" on public.categories
  for all
  to authenticated
  using (true)
  with check (true);

-- Create policies for menu_items
create policy "Enable all operations for authenticated users" on public.menu_items
  for all
  to authenticated
  using (true)
  with check (true);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger handle_updated_at
  before update on public.categories
  for each row
  execute function public.handle_updated_at();

create trigger handle_updated_at
  before update on public.menu_items
  for each row
  execute function public.handle_updated_at(); 