-- Add order column to menu_items table
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Update existing rows with sequential order based on created_at
WITH ordered_items AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_order
  FROM menu_items
)
UPDATE menu_items
SET "order" = ordered_items.new_order
FROM ordered_items
WHERE menu_items.id = ordered_items.id;

-- Make order column NOT NULL after setting initial values
ALTER TABLE menu_items ALTER COLUMN "order" SET NOT NULL;

-- Add a trigger to automatically set order for new items
CREATE OR REPLACE FUNCTION set_new_menu_item_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."order" IS NULL THEN
        SELECT COALESCE(MAX("order"), 0) + 1
        INTO NEW."order"
        FROM menu_items;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_menu_item_order
    BEFORE INSERT ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION set_new_menu_item_order(); 
