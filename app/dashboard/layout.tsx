'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useAuth } from '@/lib/context/auth-context'

interface NavItem {
  title: string
  href: string
  icon: keyof typeof Icons
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'menu',
  },
  {
    title: 'Menu Management',
    href: '/dashboard/menu',
    icon: 'menu',
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: 'chart',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: 'settings',
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r bg-background transition-transform lg:translate-x-0',
          isSidebarOpen && 'translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Icons.logo className="h-6 w-6" />
            <span className="font-bold">MenuViz</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden"
          >
            <Icons.close className="h-4 w-4" />
          </Button>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = Icons[item.icon]
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        'flex-1 transition-margin lg:ml-64',
        !isSidebarOpen && 'ml-0'
      )}>
        <header className="sticky top-0 z-30 border-b bg-background">
          <div className="flex h-16 items-center gap-4 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden"
            >
              <Icons.menu className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="container mx-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 