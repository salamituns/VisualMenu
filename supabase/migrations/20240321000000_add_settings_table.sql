-- Create settings table
create table if not exists settings (
  id uuid default gen_random_uuid() primary key,
  restaurant_name text not null,
  restaurant_description text,
  restaurant_address text,
  restaurant_phone text,
  restaurant_email text,
  restaurant_website text,
  theme_primary_color text default '#3b82f6',
  theme_font_family text default 'inter',
  theme_menu_layout text default 'grid',
  theme_show_prices boolean default true,
  theme_enable_animations boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table settings enable row level security;

create policy "Allow read access to settings"
  on settings for select
  using (true);

create policy "Allow update to settings"
  on settings for update
  using (true);

-- Insert default settings if table is empty
insert into settings (restaurant_name)
select 'My Restaurant'
where not exists (select 1 from settings); 