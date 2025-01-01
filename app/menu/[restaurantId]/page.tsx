"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Utensils, Search, ShoppingCart } from 'lucide-react'

// Mock data for the menu
const menuCategories = [
  {
    name: "Appetizers",
    items: [
      { name: "Bruschetta", description: "Grilled bread rubbed with garlic and topped with olive oil, salt, and tomato", price: 8.99, image: "/placeholder.svg?height=100&width=100" },
      { name: "Calamari", description: "Lightly battered squid served with marinara sauce", price: 10.99, image: "/placeholder.svg?height=100&width=100" },
      { name: "Mozzarella Sticks", description: "Breaded mozzarella cheese, fried and served with marinara sauce", price: 7.99, image: "/placeholder.svg?height=100&width=100" },
    ]
  },
  {
    name: "Main Courses",
    items: [
      { name: "Margherita Pizza", description: "Classic pizza with tomato sauce, mozzarella, and basil", price: 14.99, image: "/placeholder.svg?height=100&width=100" },
      { name: "Chicken Parmesan", description: "Breaded chicken breast topped with tomato sauce and melted mozzarella", price: 16.99, image: "/placeholder.svg?height=100&width=100" },
      { name: "Fettuccine Alfredo", description: "Fettuccine pasta tossed in a rich, creamy Parmesan sauce", price: 15.99, image: "/placeholder.svg?height=100&width=100" },
    ]
  },
  {
    name: "Desserts",
    items: [
      { name: "Tiramisu", description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream", price: 7.99, image: "/placeholder.svg?height=100&width=100" },
      { name: "Cannoli", description: "Crisp pastry shells filled with sweet ricotta cream and chocolate chips", price: 6.99, image: "/placeholder.svg?height=100&width=100" },
      { name: "Gelato", description: "Assorted flavors of traditional Italian ice cream", price: 5.99, image: "/placeholder.svg?height=100&width=100" },
    ]
  },
]

export default function MenuPage({ params }: { params: { restaurantId: string } }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<{ name: string; price: number }[]>([])

  const filteredMenu = menuCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  const addToCart = (item: { name: string; price: number }) => {
    setCart([...cart, item])
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-white shadow-md p-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center space-x-2">
            <Utensils className="h-6 w-6" />
            <h1 className="text-xl font-bold">Restaurant Name</h1>
          </div>
          <Button variant="outline" size="icon">
            <ShoppingCart className="h-4 w-4" />
            <span className="sr-only">Cart</span>
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto w-full p-4">
        <div className="mb-6">
          <Label htmlFor="search" className="sr-only">Search Menu</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search menu..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue={menuCategories[0].name} className="space-y-4">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <TabsList>
              {menuCategories.map((category) => (
                <TabsTrigger key={category.name} value={category.name} className="flex-shrink-0">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {filteredMenu.map((category) => (
            <TabsContent key={category.name} value={category.name}>
              <Card>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>Browse our {category.name.toLowerCase()} selection</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex space-x-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold">${item.price.toFixed(2)}</span>
                          <Button size="sm" onClick={() => addToCart(item)}>Add to Cart</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="bg-white shadow-md mt-8 py-4">
        <div className="max-w-3xl mx-auto px-4 text-center text-sm text-gray-600">
          © 2024 Restaurant Name. Powered by MenuViz.
        </div>
      </footer>
    </div>
  )
}

