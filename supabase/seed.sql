-- Seed data for menu_items
INSERT INTO menu_items (name, description, price, category, image_url, dietary_info, is_available) VALUES
    ('Bruschetta', 'Grilled bread rubbed with garlic and topped with olive oil, salt, and tomato', 8.99, 'Appetizers', '/placeholder.svg?height=100&width=100', ARRAY['Vegetarian'], true),
    ('Calamari', 'Lightly battered squid served with marinara sauce', 10.99, 'Appetizers', '/placeholder.svg?height=100&width=100', ARRAY[]::text[], true),
    ('Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 14.99, 'Main Courses', '/placeholder.svg?height=100&width=100', ARRAY['Vegetarian'], true),
    ('Chicken Parmesan', 'Breaded chicken breast topped with tomato sauce and melted mozzarella', 16.99, 'Main Courses', '/placeholder.svg?height=100&width=100', ARRAY[]::text[], true),
    ('Tiramisu', 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream', 7.99, 'Desserts', '/placeholder.svg?height=100&width=100', ARRAY['Vegetarian'], true);

-- Insert sample orders with varying dates and times
WITH menu_item_ids AS (
  SELECT id, price FROM menu_items
)
INSERT INTO orders (user_id, status, total_amount, created_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1), -- Using the first user as a sample
  'completed',
  0, -- Will update this after adding order items
  NOW() - (INTERVAL '1 day' * FLOOR(RANDOM() * 30)) - (INTERVAL '1 hour' * FLOOR(RANDOM() * 24))
FROM generate_series(1, 100);

-- Insert order items with realistic quantities and update order totals
WITH order_data AS (
  SELECT o.id as order_id, mi.id as menu_item_id, mi.price,
         FLOOR(RANDOM() * 3 + 1)::int as quantity
  FROM orders o
  CROSS JOIN menu_items mi
  WHERE RANDOM() < 0.4 -- 40% chance of each menu item being in an order
)
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time)
SELECT order_id, menu_item_id, quantity, price
FROM order_data;

-- Update order totals
WITH order_totals AS (
  SELECT order_id, SUM(quantity * price_at_time) as total
  FROM order_items
  GROUP BY order_id
)
UPDATE orders o
SET total_amount = ot.total
FROM order_totals ot
WHERE o.id = ot.order_id; 