-- Function to create admin policy
CREATE OR REPLACE FUNCTION create_admin_policy(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create policy for menu items
    ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admin users have full access" ON menu_items;
    CREATE POLICY "Admin users have full access"
    ON menu_items
    USING (
        (SELECT (raw_user_meta_data->>'role')::text = 'admin' 
        FROM auth.users 
        WHERE id = auth.uid())
    );

    -- Create policy for orders
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admin users have full access" ON orders;
    CREATE POLICY "Admin users have full access"
    ON orders
    USING (
        (SELECT (raw_user_meta_data->>'role')::text = 'admin' 
        FROM auth.users 
        WHERE id = auth.uid())
    );

    -- Create policy for customers
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admin users have full access" ON customers;
    CREATE POLICY "Admin users have full access"
    ON customers
    USING (
        (SELECT (raw_user_meta_data->>'role')::text = 'admin' 
        FROM auth.users 
        WHERE id = auth.uid())
    );
END;
$$; 