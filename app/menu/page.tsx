"use client"

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  is_available: boolean
  category_id: string
}

interface Category {
  id: string
  name: string
  description: string | null
}

export default function MenuPage() {
  const supabase = createClient()

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      return data || []
    },
  })

  // Fetch menu items
  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .order('name')
      return data || []
    },
  })

  // Track page view
  useEffect(() => {
    const trackView = async () => {
      await supabase.from('views').insert([
        {
          page: 'menu',
          created_at: new Date().toISOString(),
        },
      ])
    }
    trackView()
  }, [supabase])

  if (categoriesLoading || menuItemsLoading) {
    return <MenuSkeleton />
  }

  const menuItemsByCategory = categories?.map(category => ({
    ...category,
    items: menuItems?.filter(item => item.category_id === category.id) || []
  }))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <h1 className="text-2xl font-bold">Our Menu</h1>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="space-y-8">
          {menuItemsByCategory?.map(category => (
            <section key={category.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">{category.name}</h2>
                  {category.description && (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  )}
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map(item => (
                  <Card key={item.id} className={cn(!item.is_available && "opacity-60")}>
                    {item.image_url && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{item.name}</CardTitle>
                        <Badge variant={item.is_available ? "default" : "secondary"}>
                          {item.is_available ? "Available" : "Sold Out"}
                        </Badge>
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">${item.price.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

function MenuSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Skeleton className="h-8 w-32" />
        </div>
      </header>
      
      <main className="container py-6">
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <section key={i} className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(j => (
                  <Card key={j}>
                    <CardHeader>
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
} 