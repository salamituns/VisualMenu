-- Create menu_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    dietary_info TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    special_offer JSONB,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add order column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'menu_items'
        AND column_name = 'order'
    ) THEN
        ALTER TABLE menu_items ADD COLUMN "order" INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update existing rows with sequential order based on created_at
WITH ordered_items AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as row_num
    FROM menu_items
    WHERE "order" = 0
)
UPDATE menu_items
SET "order" = ordered_items.row_num
FROM ordered_items
WHERE menu_items.id = ordered_items.id
AND menu_items."order" = 0;

-- Make order column not null
ALTER TABLE menu_items ALTER COLUMN "order" SET NOT NULL;

-- Create function to handle new item order
CREATE OR REPLACE FUNCTION set_new_menu_item_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."order" = 0 THEN
        NEW."order" = COALESCE((SELECT MAX("order") + 1 FROM menu_items), 0);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new item order
DROP TRIGGER IF EXISTS set_menu_item_order ON menu_items;
CREATE TRIGGER set_menu_item_order
    BEFORE INSERT ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION set_new_menu_item_order();

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_items
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Enable read access for all users" ON menu_items;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON menu_items;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON menu_items;
    DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON menu_items;
END $$;

-- Create new policies
CREATE POLICY "Enable read access for all users" 
ON menu_items FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON menu_items FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" 
ON menu_items FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Enable delete for authenticated users only" 
ON menu_items FOR DELETE 
TO authenticated 
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
