-- Add is_available column to menu_items table
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Update existing rows to have is_available set to true if null
UPDATE menu_items 
SET is_available = true
WHERE is_available IS NULL; 