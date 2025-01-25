-- Seed data for menu_items
INSERT INTO menu_items (name, description, price, category, image_url, dietary_info, is_available) VALUES
    ('Bruschetta', 'Grilled bread rubbed with garlic and topped with olive oil, salt, and tomato', 8.99, 'Appetizers', '/placeholder.svg?height=100&width=100', ARRAY['Vegetarian'], true),
    ('Calamari', 'Lightly battered squid served with marinara sauce', 10.99, 'Appetizers', '/placeholder.svg?height=100&width=100', ARRAY[]::text[], true),
    ('Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 14.99, 'Main Courses', '/placeholder.svg?height=100&width=100', ARRAY['Vegetarian'], true),
    ('Chicken Parmesan', 'Breaded chicken breast topped with tomato sauce and melted mozzarella', 16.99, 'Main Courses', '/placeholder.svg?height=100&width=100', ARRAY[]::text[], true),
    ('Tiramisu', 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream', 7.99, 'Desserts', '/placeholder.svg?height=100&width=100', ARRAY['Vegetarian'], true); 