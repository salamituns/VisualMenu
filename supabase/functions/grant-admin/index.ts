import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email } = await req.json()

    // Get user by email
    const { data: userData, error: userError } = await supabaseClient
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()

    if (userError) {
      throw userError
    }

    if (!userData) {
      throw new Error('User not found')
    }

    // Update user's metadata
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      userData.id,
      {
        user_metadata: {
          role: 'admin',
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
      }
    )

    if (updateError) {
      throw updateError
    }

    // Create RLS policies
    const { error: policyError } = await supabaseClient.rpc('create_admin_policies')
    if (policyError) {
      throw policyError
    }

    return new Response(
      JSON.stringify({ message: 'Admin access granted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 