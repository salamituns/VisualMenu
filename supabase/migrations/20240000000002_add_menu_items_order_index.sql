-- Add order_index column to menu_items table
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Update existing rows to have sequential order_index
WITH indexed_items AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as new_index
  FROM menu_items
)
UPDATE menu_items
SET order_index = indexed_items.new_index
FROM indexed_items
WHERE menu_items.id = indexed_items.id; 