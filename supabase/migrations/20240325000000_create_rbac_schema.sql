-- Create enum for role types
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff');

-- Create roles table
CREATE TABLE public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create permissions table
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (role_id, permission_id)
);

-- Add role_id to users table
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
    ('owner', 'Full access to all features'),
    ('manager', 'Access to manage menu, orders, and view analytics'),
    ('staff', 'Access to view menu and manage orders');

-- Insert default permissions
INSERT INTO public.permissions (name, description) VALUES
    ('menu:create', 'Create menu items'),
    ('menu:read', 'View menu items'),
    ('menu:update', 'Update menu items'),
    ('menu:delete', 'Delete menu items'),
    ('orders:create', 'Create orders'),
    ('orders:read', 'View orders'),
    ('orders:update', 'Update order status'),
    ('analytics:read', 'View analytics and reports'),
    ('users:manage', 'Manage user accounts');

-- Assign permissions to roles
-- Owner gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'owner';

-- Manager permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'manager'
AND p.name IN (
    'menu:create', 'menu:read', 'menu:update', 'menu:delete',
    'orders:create', 'orders:read', 'orders:update',
    'analytics:read'
);

-- Staff permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'staff'
AND p.name IN (
    'menu:read',
    'orders:create', 'orders:read', 'orders:update'
);

-- Create RLS policies
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for roles table
CREATE POLICY "Roles are viewable by all authenticated users"
ON public.roles FOR SELECT
TO authenticated
USING (true);

-- Policies for permissions table
CREATE POLICY "Permissions are viewable by all authenticated users"
ON public.permissions FOR SELECT
TO authenticated
USING (true);

-- Policies for role_permissions table
CREATE POLICY "Role permissions are viewable by all authenticated users"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
RETURNS TABLE (permission_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.name
    FROM auth.users u
    JOIN public.roles r ON u.role_id = r.id
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE u.id = user_id;
END;
$$; 