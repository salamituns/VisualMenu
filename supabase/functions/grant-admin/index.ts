// @deno-types="https://deno.land/std@0.177.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
// @deno-types="https://esm.sh/@supabase/supabase-js@2.7.1"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const { userId } = (await req.json()) as RequestBody

    if (!userId) {
      throw new Error('userId is required')
    }

    // Update user's role to admin
    const { error } = await supabaseClient
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' })

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'Successfully granted admin role' }),
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