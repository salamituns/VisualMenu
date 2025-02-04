-- Drop existing objects if they exist
drop policy if exists "Allow read access to menu_item_views" on menu_item_views;
drop policy if exists "Allow insert to menu_item_views" on menu_item_views;
drop index if exists menu_item_views_menu_item_id_idx;
drop index if exists menu_item_views_viewed_at_idx;
drop table if exists menu_item_views;

-- Create view tracking table if it doesn't exist
create table if not exists menu_item_views (
  id uuid default gen_random_uuid() primary key,
  menu_item_id uuid references menu_items(id) on delete cascade,
  viewed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Add RLS policies (will fail silently if already exists)
alter table menu_item_views enable row level security;

do $$ 
begin
  -- Create policies if they don't exist
  if not exists (
    select from pg_policies 
    where tablename = 'menu_item_views' and policyname = 'Allow read access to menu_item_views'
  ) then
    create policy "Allow read access to menu_item_views"
      on menu_item_views for select
      using (true);
  end if;

  if not exists (
    select from pg_policies 
    where tablename = 'menu_item_views' and policyname = 'Allow insert to menu_item_views'
  ) then
    create policy "Allow insert to menu_item_views"
      on menu_item_views for insert
      with check (true);
  end if;
end $$;

-- Add indexes if they don't exist
create index if not exists menu_item_views_menu_item_id_idx on menu_item_views(menu_item_id);
create index if not exists menu_item_views_viewed_at_idx on menu_item_views(viewed_at);

-- Insert sample data only if the table is empty
insert into menu_item_views (menu_item_id, viewed_at)
select 
  m.id,
  now() - (random() * interval '7 days')
from 
  menu_items m,
  generate_series(1, 50) -- Generate 50 random views per item
where 
  m.id is not null
  and not exists (select 1 from menu_item_views limit 1); -- Only insert if table is empty 