-- Create enum for dietary restrictions
CREATE TYPE dietary_type AS ENUM (
  'vegetarian',
  'vegan',
  'gluten_free',
  'dairy_free',
  'nut_free',
  'halal',
  'kosher'
);

-- Create table for portion sizes/variants
CREATE TABLE IF NOT EXISTS portion_sizes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for customization options
CREATE TABLE IF NOT EXISTS customization_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0.00,
  max_selections INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for customization choices
CREATE TABLE IF NOT EXISTS customization_choices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  option_id UUID REFERENCES customization_options(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0.00,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add dietary restrictions to menu items (using an array of the enum)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS dietary_info dietary_type[] DEFAULT '{}';

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_portion_sizes_updated_at
    BEFORE UPDATE ON portion_sizes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customization_options_updated_at
    BEFORE UPDATE ON customization_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customization_choices_updated_at
    BEFORE UPDATE ON customization_choices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE portion_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_choices ENABLE ROW LEVEL SECURITY;

-- Policies for portion sizes
CREATE POLICY "Enable read access for all users" ON portion_sizes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON portion_sizes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON portion_sizes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON portion_sizes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for customization options
CREATE POLICY "Enable read access for all users" ON customization_options
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON customization_options
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON customization_options
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON customization_options
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for customization choices
CREATE POLICY "Enable read access for all users" ON customization_choices
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON customization_choices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON customization_choices
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON customization_choices
  FOR DELETE USING (auth.role() = 'authenticated'); 