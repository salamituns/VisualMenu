-- Function to create roles table
CREATE OR REPLACE FUNCTION create_roles_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff');
    END IF;

    -- Create roles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name user_role NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );

    -- Add role_id column to auth.users if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'auth'
        AND table_name = 'users'
        AND column_name = 'role_id'
    ) THEN
        ALTER TABLE auth.users ADD COLUMN role_id UUID REFERENCES public.roles(id);
    END IF;
END;
$$;

-- Function to insert owner role
CREATE OR REPLACE FUNCTION insert_owner_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.roles (name, description)
    VALUES ('owner', 'Full access to all features')
    ON CONFLICT (name) DO NOTHING;
END;
$$;

-- Function to set user as owner
CREATE OR REPLACE FUNCTION set_user_as_owner(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE auth.users
    SET role_id = (SELECT id FROM public.roles WHERE name = 'owner')
    WHERE email = user_email;
END;
$$;

-- Function to set admin metadata
CREATE OR REPLACE FUNCTION set_admin_metadata(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        '"admin"'::jsonb
    )
    WHERE email = user_email;
END;
$$;

-- Function to create admin policies
CREATE OR REPLACE FUNCTION create_admin_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create policies for menu_items
    DROP POLICY IF EXISTS "Admin users have full access to menu items" ON menu_items;
    CREATE POLICY "Admin users have full access to menu items"
    ON menu_items
    FOR ALL
    USING (
        (SELECT raw_user_meta_data->>'role' = 'admin'
        FROM auth.users
        WHERE id = auth.uid())
    );

    -- Create policies for orders
    DROP POLICY IF EXISTS "Admin users have full access to orders" ON orders;
    CREATE POLICY "Admin users have full access to orders"
    ON orders
    FOR ALL
    USING (
        (SELECT raw_user_meta_data->>'role' = 'admin'
        FROM auth.users
        WHERE id = auth.uid())
    );

    -- Create policies for customers
    DROP POLICY IF EXISTS "Admin users have full access to customers" ON customers;
    CREATE POLICY "Admin users have full access to customers"
    ON customers
    FOR ALL
    USING (
        (SELECT raw_user_meta_data->>'role' = 'admin'
        FROM auth.users
        WHERE id = auth.uid())
    );
END;
$$; 
