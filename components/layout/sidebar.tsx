'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Icons.chart,
  },
  {
    title: 'Menu Management',
    items: [
      {
        title: 'Menu Items',
        href: '/dashboard/menu',
        icon: Icons.menu,
      },
    ],
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: Icons.chart,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Icons.settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12">
      <div className="space-y-4 py-4">
        {menuItems.map((item) => {
          if (item.items) {
            return (
              <div key={item.title} className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  {item.title}
                </h2>
                <div className="space-y-1">
                  {item.items.map((subItem) => (
                    <Button
                      key={subItem.href}
                      variant={pathname === subItem.href ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={subItem.href}>
                        {subItem.icon && (
                          <subItem.icon className="mr-2 h-4 w-4" />
                        )}
                        {subItem.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            )
          }

          return (
            <div key={item.href} className="px-3 py-2">
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.title}
                </Link>
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
} 