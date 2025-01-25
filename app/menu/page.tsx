"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Utensils, Search, ShoppingCart } from 'lucide-react'
import { PreferencesDialog } from '@/components/user/preferences-dialog'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  dietary: string[]
}

export default function MenuPage() {
  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<MenuItem[]>([])
  const { user, preferences } = useAuth()

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('category')

        if (error) throw error
        
        const validatedData = (data || []).map(item => ({
          id: item.id as string,
          name: item.name as string,
          description: item.description as string,
          price: item.price as number,
          category: item.category as string,
          image_url: item.image_url as string,
          dietary: (item.dietary || []) as string[]
        }))
        
        setMenuItems(validatedData)
      } catch (error) {
        console.error('Error loading menu items:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMenuItems()
  }, [])

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDietary = !preferences?.dietary?.length ||
      item.dietary?.some(diet => preferences.dietary.includes(diet))

    return matchesSearch && matchesDietary
  })

  const categories = Array.from(new Set(filteredItems.map(item => item.category)))

  const addToCart = (item: MenuItem) => {
    setCart([...cart, item])
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-md p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-2">
              <Utensils className="h-6 w-6" />
              <h1 className="text-xl font-bold">Loading...</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-white shadow-md p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <Utensils className="h-6 w-6" />
            <h1 className="text-xl font-bold">Menu</h1>
          </div>
          <div className="flex items-center space-x-2">
            <PreferencesDialog />
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="max-w-6xl mx-auto space-y-6">
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

          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-6">
              {categories.map((category) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle>{category}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredItems
                      .filter(item => item.category === category)
                      .map((item) => (
                        <div key={item.id} className="flex space-x-4 p-4 rounded-lg border">
                          <div className="relative w-24 h-24">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="rounded-md object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.description}</p>
                            {item.dietary && item.dietary.length > 0 && (
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
                              <Button
                                size="sm"
                                onClick={() => addToCart(item)}
                              >
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  )
} 