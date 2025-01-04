"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BarChart, DollarSign, Users, Utensils, Settings, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <Link href="/" className="flex items-center space-x-2">
            <Utensils className="h-6 w-6" />
            <span className="text-xl font-bold">MenuViz</span>
          </Link>
          <div className="mt-2 text-sm text-gray-500">
            {user?.email}
          </div>
        </div>
        <nav className="mt-8">
          <Link 
            href="/admin" 
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
          >
            <BarChart className="h-5 w-5 mr-2" />
            Dashboard
          </Link>
          <Link 
            href="/admin/menu-management" 
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
          >
            <Utensils className="h-5 w-5 mr-2" />
            Menu Management
          </Link>
          <Link 
            href="/admin/analytics" 
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Analytics
          </Link>
          <Link 
            href="/admin/customers" 
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
          >
            <Users className="h-5 w-5 mr-2" />
            Customers
          </Link>
          <Link 
            href="/admin/settings" 
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
          >
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </Link>
        </nav>
        <div className="absolute bottom-4 left-4">
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
} 