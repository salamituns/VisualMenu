-- First, drop any triggers on menu_items
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;

-- Drop any foreign key constraints that reference menu_items
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT constraint_name 
              FROM information_schema.table_constraints 
              WHERE table_name = 'menu_items' 
              AND constraint_type = 'FOREIGN KEY') 
    LOOP
        EXECUTE 'ALTER TABLE menu_items DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Drop any indexes on menu_items
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT indexname 
              FROM pg_indexes 
              WHERE tablename = 'menu_items' 
              AND indexname != 'menu_items_pkey') 
    LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(r.indexname);
    END LOOP;
END $$;

-- Now we can safely drop and recreate the table
DROP TABLE IF EXISTS menu_items CASCADE;

-- Create the menu_items table with all required columns
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    dietary_info TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    special_offer JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create an update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
