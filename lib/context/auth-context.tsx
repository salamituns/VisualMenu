"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface UserPreferences {
  dietary: string[]
  favorites: string[]
  darkMode: boolean
  language: string
}

interface AuthContextType {
  user: User | null
  preferences: UserPreferences | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    console.log('Setting up auth state listener')
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user ?? 'No user')
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserPreferences(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user ?? 'No user')
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserPreferences(session.user.id)
      } else {
        setPreferences(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  function setInitialPreferences(): UserPreferences {
    return {
      dietary: [] as string[],
      favorites: [] as string[],
      darkMode: false,
      language: 'en'
    };
  }

  async function loadUserPreferences(userId: string) {
    try {
      console.log('Loading preferences for user:', userId)
      let { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // No preferences found, create new record
        console.log('Creating new preferences for user:', userId)
        const initialPrefs = {
          user_id: userId,
          dietary: [] as string[],
          favorites: [] as string[],
          dark_mode: false,
          language: 'en' as string
        }
        
        const { data: newData, error: insertError } = await supabase
          .from('user_preferences')
          .insert(initialPrefs)
          .select()
          .single()
          
        if (insertError) {
          console.error('Error creating preferences:', insertError)
          throw insertError
        }
        
        data = newData
      } else if (error) {
        console.error('Error loading preferences:', error)
        throw error
      }

      console.log('Loaded/created preferences:', data)
      if (!data) {
        throw new Error('No preferences data available')
      }
      
      setPreferences({
        dietary: Array.isArray(data.dietary) ? data.dietary : [],
        favorites: Array.isArray(data.favorites) ? data.favorites : [],
        darkMode: Boolean(data.dark_mode),
        language: typeof data.language === 'string' ? data.language : 'en'
      })
    } catch (error) {
      console.error('Error in loadUserPreferences:', error)
      setPreferences(setInitialPreferences())
    }
  }

  async function signIn(email: string, password: string) {
    try {
      console.log('Attempting to sign in with:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        // Check for specific error cases
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before signing in.')
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.')
        }
        throw error
      }

      if (!data.user) {
        throw new Error('No user data returned after successful login')
      }

      console.log('Sign in successful:', data.user)
      return data.user
    } catch (error) {
      console.error('Error in signIn function:', error)
      throw error
    }
  }

  async function signUp(email: string, password: string) {
    try {
      console.log('Attempting to sign up:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email: email // Add email to user metadata
          }
        }
      })

      if (error) {
        console.error('Sign up error:', error)
        throw error
      }

      if (!data.user) {
        throw new Error('No user data returned after signup')
      }

      // Check if email confirmation is required
      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error('A user with this email already exists. Please try signing in instead.')
      }

      if (data.user.confirmed_at === null) {
        throw new Error('Please check your email for a confirmation link to complete your registration.')
      }

      console.log('Sign up successful:', data.user)
      return data.user
    } catch (error) {
      console.error('Error in signUp function:', error)
      throw error
    }
  }

  async function signOut() {
    try {
      console.log('Attempting to sign out')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      console.log('Sign out successful')
    } catch (error) {
      console.error('Error in signOut function:', error)
      throw error
    }
  }

  async function updatePreferences(newPreferences: Partial<UserPreferences>) {
    if (!user) return

    try {
      console.log('Updating preferences:', newPreferences)
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...newPreferences,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error updating preferences:', error)
        throw error
      }

      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null)
      console.log('Preferences updated successfully')
    } catch (error) {
      console.error('Error in updatePreferences:', error)
      throw error
    }
  }

  const value = {
    user,
    preferences,
    loading,
    signIn,
    signUp,
    signOut,
    updatePreferences,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 