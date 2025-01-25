-- Add dietary_info column to menu_items table
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS dietary_info TEXT[] DEFAULT '{}';

-- Update existing rows to have an empty array if dietary_info is null
UPDATE menu_items 
SET dietary_info = '{}'
WHERE dietary_info IS NULL; 