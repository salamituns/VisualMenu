-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create orders table with foreign key to menu_items
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Add some sample menu items
INSERT INTO menu_items (name, price, description) VALUES
('Margherita Pizza', 12.99, 'Classic tomato sauce and mozzarella'),
('Pepperoni Pizza', 14.99, 'Margherita with pepperoni'),
('Caesar Salad', 8.99, 'Romaine lettuce with Caesar dressing'),
('Chicken Wings', 10.99, 'Spicy buffalo wings'),
('Cheeseburger', 11.99, 'Beef patty with cheese and fries'),
('Fish & Chips', 13.99, 'Battered cod with fries'),
('Pasta Carbonara', 15.99, 'Creamy pasta with bacon'),
('Greek Salad', 9.99, 'Mixed greens with feta cheese'),
('Steak Sandwich', 16.99, 'Grilled steak with onions'),
('Veggie Burger', 12.99, 'Plant-based patty with fries');

-- Add some sample customers
INSERT INTO customers (created_at) VALUES
(NOW() - INTERVAL '30 days'),
(NOW() - INTERVAL '25 days'),
(NOW() - INTERVAL '20 days'),
(NOW() - INTERVAL '15 days'),
(NOW() - INTERVAL '10 days'),
(NOW() - INTERVAL '5 days'),
(NOW() - INTERVAL '3 days'),
(NOW() - INTERVAL '2 days'),
(NOW() - INTERVAL '1 day'),
(NOW());

-- Add some sample orders
WITH menu_item_ids AS (
  SELECT id FROM menu_items
)
INSERT INTO orders (menu_item_id, quantity, created_at)
SELECT 
  id,
  FLOOR(RANDOM() * 5 + 1)::INTEGER,
  NOW() - (RANDOM() * INTERVAL '30 days')
FROM menu_item_ids, generate_series(1, 50);

-- Create RLS policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to menu_items" ON menu_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to orders" ON orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to customers" ON customers
  FOR SELECT TO authenticated USING (true); 