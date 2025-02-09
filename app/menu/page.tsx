"use client"

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DIETARY_ICONS, DIETARY_LABELS } from '@/types/menu'
import { ThemeToggle } from '@/components/theme-toggle'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  is_available: boolean
  category_id: string
  dietary_info?: string[]
  portion_sizes?: { id: string; name: string; price: number }[]
}

interface Category {
  id: string
  name: string
  description: string | null
}

interface Filters {
  category: string | null
  dietary: string[]
  priceRange: {
    min: number | null
    max: number | null
  }
}

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Filters>({
    category: null,
    dietary: [],
    priceRange: {
      min: null,
      max: null
    }
  })
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
  })).filter(category => category.items.length > 0) // Only show categories with matching items

  // Filter menu items
  const filteredMenuItems = menuItemsByCategory?.map(category => ({
    ...category,
    items: category.items.filter(item => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory = !filters.category || item.category_id === filters.category

      // Dietary filter
      const matchesDietary = filters.dietary.length === 0 ||
        filters.dietary.every(diet => item.dietary_info?.includes(diet))

      // Price range filter
      const matchesPriceRange =
        (!filters.priceRange.min || item.price >= filters.priceRange.min) &&
        (!filters.priceRange.max || item.price <= filters.priceRange.max)

      return matchesSearch && matchesCategory && matchesDietary && matchesPriceRange
    })
  })).filter(category => category.items.length > 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Our Menu</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-sm text-muted-foreground">
              Powered by MenuViz
            </div>
          </div>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="mb-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={filters.category || ""}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  category: e.target.value || null
                }))}
              >
                <option value="">All Categories</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Dietary Preferences</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DIETARY_LABELS).map(([key, label]) => (
                <Badge
                  key={key}
                  variant={filters.dietary.includes(key) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      dietary: prev.dietary.includes(key)
                        ? prev.dietary.filter(d => d !== key)
                        : [...prev.dietary, key]
                    }))
                  }}
                >
                  {DIETARY_ICONS[key as keyof typeof DIETARY_ICONS]} {label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Price Range</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Min $</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Min"
                  value={filters.priceRange.min || ""}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: {
                      ...prev.priceRange,
                      min: e.target.value ? parseFloat(e.target.value) : null
                    }
                  }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Max $</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Max"
                  value={filters.priceRange.max || ""}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: {
                      ...prev.priceRange,
                      max: e.target.value ? parseFloat(e.target.value) : null
                    }
                  }))}
                />
              </div>
            </div>
          </div>

          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Found {filteredMenuItems?.reduce((acc, cat) => acc + cat.items.length, 0)} items
            </p>
          )}
        </div>

        {menuItemsByCategory?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No menu items found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredMenuItems?.map(category => (
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
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold">${item.price.toFixed(2)}</p>
                            {item.dietary_info && item.dietary_info.length > 0 && (
                              <div className="flex gap-1">
                                {item.dietary_info.map((info) => (
                                  <span
                                    key={info}
                                    className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs"
                                    title={DIETARY_LABELS[info as keyof typeof DIETARY_LABELS]}
                                  >
                                    {DIETARY_ICONS[info as keyof typeof DIETARY_ICONS]}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {item.portion_sizes && item.portion_sizes.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Portion Sizes</p>
                              <div className="flex flex-wrap gap-2">
                                {item.portion_sizes.map((size) => (
                                  <Badge key={size.id} variant="outline">
                                    {size.name} - ${size.price.toFixed(2)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function MenuSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Our Menu</h1>
          <div className="text-sm text-muted-foreground">
            Powered by MenuViz
          </div>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-full" />
        </div>
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