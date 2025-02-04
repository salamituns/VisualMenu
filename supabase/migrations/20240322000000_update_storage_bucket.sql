-- Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Drop existing policies
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Authenticated users can update their images" on storage.objects;
drop policy if exists "Authenticated users can delete their images" on storage.objects;

-- Allow public access to images
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'images' );

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own images
create policy "Authenticated users can update their images"
on storage.objects for update
to authenticated
using (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
)
with check (bucket_id = 'images');

-- Allow authenticated users to delete their own images
create policy "Authenticated users can delete their images"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
); 