-- Drop existing policies
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Authenticated users can update their images" on storage.objects;
drop policy if exists "Authenticated users can delete their images" on storage.objects;

-- Recreate storage bucket
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Set up storage policies
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'images' );

create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'images'
  and (storage.foldername(name))[1] = 'menu-items'
);

create policy "Authenticated users can update their images"
on storage.objects for update
to authenticated
using ( bucket_id = 'images' )
with check ( bucket_id = 'images' );

create policy "Authenticated users can delete their images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'images' ); 
