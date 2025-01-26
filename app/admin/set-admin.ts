import { createClient } from '@/lib/supabase/client'

export async function setAdminAccess(email: string) {
  const supabase = createClient()
  console.log('Starting admin access setup for:', email)

  try {
    // First check if the roles table exists and has data
    const { data: rolesCheck, error: rolesCheckError } = await supabase
      .from('roles')
      .select('id', { count: 'exact' })
      .limit(1)

    if (rolesCheckError) {
      console.error('Error checking roles table:', rolesCheckError)
      throw new Error('Failed to check roles table. Error: ' + rolesCheckError.message)
    }

    if (!rolesCheck || rolesCheck.length === 0) {
      throw new Error('Roles table is empty. Please run the migrations first.')
    }

    console.log('Roles table check:', rolesCheck)

    // Get the owner role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id, name, description')
      .eq('name', 'owner')
      .single()

    if (roleError) {
      console.error('Error getting owner role:', roleError)
      throw new Error('Failed to get owner role. Error: ' + roleError.message)
    }

    if (!roleData) {
      throw new Error('Owner role not found. Please run the migrations first.')
    }

    console.log('Found owner role:', roleData)

    // Get the current user's session
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()
    if (sessionError) {
      console.error('Error getting session:', sessionError)
      throw new Error('Failed to get session. Error: ' + sessionError.message)
    }

    if (!user) {
      throw new Error('No authenticated user found. Please log in again.')
    }

    console.log('Got current user:', user)

    // Try to create user record directly
    const { error: createError } = await supabase
      .from('users')
      .upsert([{ 
        id: user.id,
        email: user.email,
        role_id: roleData.id
      }], {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    if (createError) {
      console.error('Error upserting user record:', createError)
      throw new Error('Failed to upsert user record. Error: ' + createError.message)
    }

    console.log('Upserted user record')

    // Update user's metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { 
        role: 'owner',
        role_id: roleData.id,
        isAdmin: true,
        permissions: [
          'menu:create',
          'menu:read',
          'menu:update',
          'menu:delete',
          'orders:create',
          'orders:read',
          'orders:update',
          'analytics:read',
          'users:manage'
        ]
      }
    })

    if (updateError) {
      console.error('Error updating user:', updateError)
      throw new Error('Failed to update user. Error: ' + updateError.message)
    }

    console.log('Updated user metadata')

    // Refresh the session to apply changes
    const { error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError) {
      console.error('Error refreshing session:', refreshError)
      throw new Error('Failed to refresh session. Error: ' + refreshError.message)
    }

    console.log('Successfully refreshed session')

    // Final verification
    const { data: finalCheck, error: finalCheckError } = await supabase.auth.getUser()

    if (finalCheckError) {
      console.error('Error in final verification:', finalCheckError)
      throw new Error('Failed final verification. Error: ' + finalCheckError.message)
    }

    console.log('Final user state:', finalCheck)

    return {
      success: true,
      message: 'Successfully set admin access',
      data: finalCheck
    }
  } catch (error) {
    console.error('Error in setAdminAccess:', error)
    throw error
  }
} 
