-- Function to grant admin access
CREATE OR REPLACE FUNCTION grant_admin_access(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create policies for menu_items
    ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admin users have full access to menu items" ON menu_items;
    CREATE POLICY "Admin users have full access to menu items"
    ON menu_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

    -- Create policies for orders
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admin users have full access to orders" ON orders;
    CREATE POLICY "Admin users have full access to orders"
    ON orders
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

    -- Create policies for customers
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Admin users have full access to customers" ON customers;
    CREATE POLICY "Admin users have full access to customers"
    ON customers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

    -- Grant the user admin access in their metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        '"admin"'
    )
    WHERE id = target_user_id;
END;
$$; 