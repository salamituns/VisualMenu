import { createClient } from '@/lib/supabase/client'

export async function setupDatabase() {
  const supabase = createClient()
  
  try {
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        role_id UUID REFERENCES public.roles(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'users' AND policyname = 'Users can view their own data'
        ) THEN
          CREATE POLICY "Users can view their own data"
          ON public.users
          FOR SELECT
          USING (auth.uid() = id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'users' AND policyname = 'Users can update their own data'
        ) THEN
          CREATE POLICY "Users can update their own data"
          ON public.users
          FOR UPDATE
          USING (auth.uid() = id);
        END IF;
      END $$;

      -- Create trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create trigger
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger 
          WHERE tgname = 'update_users_updated_at'
        ) THEN
          CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON public.users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;
    `

    // Create roles table if it doesn't exist
    const createRolesTable = `
      CREATE TABLE IF NOT EXISTS public.roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Insert default roles if they don't exist
      INSERT INTO public.roles (name, description)
      VALUES 
        ('owner', 'Full access to all features'),
        ('manager', 'Access to manage menu, orders, and view analytics'),
        ('staff', 'Access to view menu and manage orders')
      ON CONFLICT (name) DO NOTHING;
    `

    // Execute the SQL statements
    const { error: usersError } = await supabase.rpc('execute_sql', { sql_string: createUsersTable })
    if (usersError) {
      console.error('Error creating users table:', usersError)
      throw usersError
    }

    const { error: rolesError } = await supabase.rpc('execute_sql', { sql_string: createRolesTable })
    if (rolesError) {
      console.error('Error creating roles table:', rolesError)
      throw rolesError
    }

    return { success: true, message: 'Database setup completed successfully' }
  } catch (error) {
    console.error('Error setting up database:', error)
    throw error
  }
} 