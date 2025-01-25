-- Create the menu-uploads bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-uploads', 'menu-uploads', true);

-- Allow public access to menu-uploads bucket
CREATE POLICY "Menu uploads are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'menu-uploads' );

-- Allow authenticated users to upload menu images
CREATE POLICY "Authenticated users can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'menu-uploads'
    AND auth.role() = 'authenticated'
);

-- Allow users to update their menu images
CREATE POLICY "Users can update their menu images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'menu-uploads'
    AND auth.role() = 'authenticated'
);

-- Allow users to delete their menu images
CREATE POLICY "Users can delete their menu images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'menu-uploads'
    AND auth.role() = 'authenticated'
); 