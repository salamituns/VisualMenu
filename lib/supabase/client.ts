import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

class SupabaseClientSingleton {
  private static instance: SupabaseClient | null = null
  private static isInitializing = false

  static getInstance(): SupabaseClient {
    if (typeof window === 'undefined') {
      throw new Error('Supabase client cannot be used on the server side')
    }

    if (!this.instance && !this.isInitializing) {
      this.isInitializing = true
      this.instance = createSupabaseClient(supabaseUrl as string, supabaseAnonKey as string, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'visual-menu-auth',
          storage: window.localStorage
        }
      })
      this.isInitializing = false
    }

    return this.instance as SupabaseClient
  }
}

export function createClient(): SupabaseClient {
  return SupabaseClientSingleton.getInstance()
} 