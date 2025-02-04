-- Create a view in the public schema that safely exposes auth.users
create or replace view public.users as
select 
  id,
  email,
  raw_user_meta_data,
  created_at
from auth.users;

-- Grant access to the authenticated role
grant select on public.users to authenticated;

-- Enable RLS on auth.users
alter table auth.users enable row level security;

-- Create policy to allow users to see their own data
create policy "Users can view own data"
on auth.users for select
to authenticated
using (
  auth.uid() = id
);

-- Create policy to allow users to update their own data
create policy "Users can update own data"
on auth.users for update
to authenticated
using (
  auth.uid() = id
)
with check (
  auth.uid() = id
);

-- Recreate storage policies with proper auth checks
drop policy if exists "Authenticated users can upload images" on storage.objects;
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'images'
  and auth.role() = 'authenticated'
); 