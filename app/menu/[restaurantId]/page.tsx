"use client"

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Utensils, Search, ShoppingCart, Heart } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { PreferencesDialog } from '@/components/user/preferences-dialog'
import { useAuth, type UserPreferences } from '@/lib/context/auth-context'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface MenuItem {
  name: string
  description: string
  price: number
  image: string
  dietary?: string[]
}

interface Category {
  name: string
  items: MenuItem[]
}

interface CartItem extends MenuItem {
  quantity?: number;
}

// Mock data for the menu
const menuCategories = [
  {
    name: "Appetizers",
    items: [
      { 
        name: "Bruschetta", 
        description: "Grilled bread rubbed with garlic and topped with olive oil, salt, and tomato", 
        price: 8.99, 
        image: "/placeholder.svg?height=100&width=100",
        dietary: ["Vegetarian"]
      },
      { 
        name: "Calamari", 
        description: "Lightly battered squid served with marinara sauce", 
        price: 10.99, 
        image: "/placeholder.svg?height=100&width=100",
        dietary: []
      },
      { 
        name: "Mozzarella Sticks", 
        description: "Breaded mozzarella cheese, fried and served with marinara sauce", 
        price: 7.99, 
        image: "/placeholder.svg?height=100&width=100",
        dietary: ["Vegetarian"]
      },
    ]
  },
  {
    name: "Main Courses",
    items: [
      { 
        name: "Margherita Pizza", 
        description: "Classic pizza with tomato sauce, mozzarella, and basil", 
        price: 14.99, 
        image: "/placeholder.svg?height=100&width=100",
        dietary: ["Vegetarian"]
      },
      { 
        name: "Chicken Parmesan", 
        description: "Breaded chicken breast topped with tomato sauce and melted mozzarella", 
        price: 16.99, 
        image: "/placeholder.svg?height=100&width=100",
        dietary: []
      },
      { 
        name: "Fettuccine Alfredo", 
        description: "Fettuccine pasta tossed in a rich, creamy Parmesan sauce", 
        price: 15.99, 
        image: "/placeholder.svg?height=100&width=100",
        dietary: ["Vegetarian"]
      },
    ]
  },
  {
    name: "Desserts",
    items: [
      { 
        name: "Tiramisu", 
        description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream", 
        price: 7.99, 
        image: "/placeholder.svg?height=100&width=100",
        dietary: ["Vegetarian"]
      },
      { 
        name: "Cannoli", 
        description: "Crisp pastry shells filled with sweet ricotta cream and chocolate chips", 
        price: 6.99, 
        image: "/placeholder.svg?height=100&width=100",
        dietary: ["Vegetarian"]
      },
      { 
        name: "Gelato", 
        description: "Assorted flavors of traditional Italian ice cream", 
        price: 5.99, 
        image: "/placeholder.svg?height=100&width=100",
        dietary: ["Vegetarian"]
      },
    ]
  },
]

// Loading skeleton component for menu items
function MenuItemSkeleton() {
  return (
    <div className="flex space-x-4 animate-pulse">
      <div className="w-[100px] h-[100px] bg-gray-200 rounded-md" />
      <div className="flex-grow space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="flex justify-between items-center mt-2">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  )
}

// Lazy loaded menu item component
function MenuItem({ item, onAddToCart }: { item: MenuItem; onAddToCart: (item: MenuItem) => void }) {
  const { user, preferences, updatePreferences } = useAuth()
  const defaultPreferences: UserPreferences = { dietary: [], favorites: [], dark_mode: false, language: 'en' }
  const userPreferences = preferences || defaultPreferences
  const isFavorite = userPreferences.favorites?.includes(item.name) ?? false

  const toggleFavorite = (name: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites')
      return
    }

    const currentFavorites = userPreferences.favorites || []
    const isFavorite = currentFavorites.includes(name)
    
    const newFavorites = isFavorite
      ? currentFavorites.filter((favItem: string) => favItem !== name)
      : [...currentFavorites, name]
    
    updatePreferences({ favorites: newFavorites })
  }

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Filter out items that don't match dietary preferences
  const matchesDietary = !userPreferences.dietary?.length || 
    (item.dietary?.some(diet => userPreferences.dietary?.includes(diet)) ?? false)

  const handleDietaryChange = (dietary: string[]) => {
    updatePreferences({ dietary })
  }

  if (userPreferences.dietary?.length && !matchesDietary) {
    return null
  }

  return (
    <div ref={ref} className="flex space-x-4">
      {inView ? (
        <>
          <div className="relative w-[100px] h-[100px]">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="100px"
              className="rounded-md object-cover"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIB4gHh4gIB4dHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
            {user && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => toggleFavorite(item.name)}
              >
                <Heart
                  className={cn("h-4 w-4", {
                    "fill-red-500 text-red-500": isFavorite,
                    "text-gray-500": !isFavorite,
                  })}
                />
              </Button>
            )}
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
            {item.dietary && (
              <div className="flex gap-1 mt-1">
                {item.dietary.map((diet) => (
                  <span
                    key={diet}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {diet}
                  </span>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center mt-2">
              <span className="font-bold">${item.price.toFixed(2)}</span>
              <Button size="sm" onClick={() => onAddToCart(item)}>Add to Cart</Button>
            </div>
          </div>
        </>
      ) : (
        <MenuItemSkeleton />
      )}
    </div>
  )
}

// Category component with lazy loading
function CategorySection({ category, onAddToCart }: { category: Category; onAddToCart: (item: MenuItem) => void }) {
  return (
    <TabsContent value={category.name}>
      <Card>
        <CardHeader>
          <CardTitle>{category.name}</CardTitle>
          <CardDescription>Browse our {category.name.toLowerCase()} selection</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid gap-6">
              {category.items.map((item, index) => (
                <Suspense key={index} fallback={<MenuItemSkeleton />}>
                  <MenuItem item={item} onAddToCart={onAddToCart} />
                </Suspense>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

type PageProps = {
  params: Promise<{
    restaurantId: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function MenuPage({
  params,
  searchParams,
}: PageProps) {
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState<string>('')
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{ [key: string]: string | string[] | undefined }>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [menuData, setMenuData] = useState(menuCategories)
  const { preferences, loading: authLoading } = useAuth()
  const defaultPreferences: UserPreferences = { dietary: [], favorites: [], dark_mode: false, language: 'en' }
  const userPreferences = preferences || defaultPreferences

  // Handle async props
  useEffect(() => {
    const resolveProps = async () => {
      const [resolvedParams, resolvedSearch] = await Promise.all([
        params,
        searchParams
      ])
      setRestaurantId(resolvedParams.restaurantId)
      setResolvedSearchParams(resolvedSearch)
      
      // Initialize search term from URL if present
      if (resolvedSearch.q) {
        setSearchTerm(Array.isArray(resolvedSearch.q) ? resolvedSearch.q[0] : resolvedSearch.q)
      }
    }
    resolveProps()
  }, [params, searchParams])

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredCategories = menuCategories
    .map(category => ({
      ...category,
      items: category.items.filter(item => {
        const matchesSearch = searchTerm
          ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
          : true

        const matchesDietary = !userPreferences.dietary?.length ||
          (item.dietary?.some(diet => userPreferences.dietary?.includes(diet)) ?? false)

        return matchesSearch && matchesDietary
      }),
    }))
    .filter(category => category.items.length > 0)

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.name === item.name)
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.name === item.name
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  if (loading || authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="sticky top-0 z-10 bg-white shadow-md p-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-10 w-10" />
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-12 w-full" />
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <MenuItemSkeleton key={j} />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-white shadow-md p-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center space-x-2">
            <Utensils className="h-6 w-6" />
            <h1 className="text-xl font-bold">
              {restaurantId ? `Restaurant ${restaurantId}` : 'Loading...'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <PreferencesDialog />
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue={filteredCategories[0]?.name} className="w-full">
            <ScrollArea className="w-full">
              <TabsList className="w-full justify-start">
                {filteredCategories.map((category) => (
                  <TabsTrigger key={category.name} value={category.name}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            {filteredCategories.map((category) => (
              <CategorySection
                key={category.name}
                category={category}
                onAddToCart={addToCart}
              />
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  )
}

