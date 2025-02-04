-- Add image columns to menu_items table
alter table menu_items
add column if not exists image_url text,
add column if not exists image_path text; 