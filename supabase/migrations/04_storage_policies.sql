-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Drop any existing policies
drop policy if exists "Allow all users to upload files" on storage.objects;
drop policy if exists "Allow authenticated users to upload files" on storage.objects;
drop policy if exists "Allow authenticated users to update files" on storage.objects;
drop policy if exists "Allow authenticated users to delete files" on storage.objects;
drop policy if exists "Allow public to read files" on storage.objects;

-- Create a single permissive policy for all operations
create policy "Allow all operations on menu-images"
on storage.objects for all
using ( bucket_id = 'menu-images' )
with check ( bucket_id = 'menu-images' );

-- Create storage policies for menu-items bucket
insert into storage.buckets (id, name, public) 
values ('menu-items', 'menu-items', true);

-- Allow authenticated users to upload files
create policy "Allow authenticated users to upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'menu-items'
  and auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own files
create policy "Allow authenticated users to update files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'menu-items'
  and auth.uid() = owner
)
with check (
  bucket_id = 'menu-items'
  and auth.uid() = owner
);

-- Allow authenticated users to delete their own files
create policy "Allow authenticated users to delete files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'menu-items'
  and auth.uid() = owner
);

-- Allow public to read files
create policy "Allow public to read files"
on storage.objects for select
to public
using (bucket_id = 'menu-items'); 