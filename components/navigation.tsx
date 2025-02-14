'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Utensils } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ThemeToggle } from './theme-toggle'

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b">
      <Link className="flex items-center justify-center" href="/">
        <Utensils className="h-6 w-6 mr-2" />
        <span className="font-bold">MenuViz</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <Link 
          className="text-sm font-medium hover:underline underline-offset-4" 
          href="#"
        >
          Features
        </Link>
        <Link 
          className="text-sm font-medium hover:underline underline-offset-4" 
          href="#"
        >
          Pricing
        </Link>
        <Link 
          className="text-sm font-medium hover:underline underline-offset-4" 
          href="#"
        >
          About
        </Link>
        <Link 
          className="text-sm font-medium hover:underline underline-offset-4" 
          href="#"
        >
          Contact
        </Link>
        <ThemeToggle />
        {user ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </>
        ) : !isLoginPage && (
          <Link href="/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
        )}
      </nav>
    </header>
  )
} 