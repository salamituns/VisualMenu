"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Utensils, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'

// Mock data for menu categories and items
const initialCategories = [
  { id: '1', name: 'Appetizers' },
  { id: '2', name: 'Main Courses' },
  { id: '3', name: 'Desserts' },
  { id: '4', name: 'Drinks' },
]

const initialMenuItems = [
  { id: '1', name: 'Bruschetta', description: 'Grilled bread rubbed with garlic and topped with olive oil, salt, and tomato', price: 8.99, category: '1', active: true },
  { id: '2', name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce, mozzarella, and basil', price: 14.99, category: '2', active: true },
  { id: '3', name: 'Tiramisu', description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream', price: 7.99, category: '3', active: true },
  { id: '4', name: 'Espresso', description: 'Strong black coffee brewed by forcing steam through ground coffee beans', price: 3.99, category: '4', active: true },
]

export default function MenuManagementPage() {
  const [categories, setCategories] = useState(initialCategories)
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [newCategory, setNewCategory] = useState('')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('items')

  const addCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, { id: String(categories.length + 1), name: newCategory.trim() }])
      setNewCategory('')
    }
  }

  const addOrUpdateMenuItem = (item: any) => {
    if (editingItem) {
      setMenuItems(menuItems.map(i => i.id === editingItem.id ? item : i))
      setEditingItem(null)
    } else {
      setMenuItems([...menuItems, { ...item, id: String(menuItems.length + 1), active: true }])
    }
  }

  const deleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id))
  }

  const toggleItemActive = (id: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    ))
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Link href="/admin" className="flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Add, edit, or remove menu items</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                addOrUpdateMenuItem({
                  name: formData.get('name'),
                  description: formData.get('description'),
                  price: parseFloat(formData.get('price') as string),
                  category: formData.get('category'),
                })
                e.currentTarget.reset()
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input id="name" name="name" required defaultValue={editingItem?.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" step="0.01" required defaultValue={editingItem?.price} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required defaultValue={editingItem?.description} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingItem?.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">{editingItem ? 'Update' : 'Add'} Item</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Menu Items List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{categories.find(c => c.id === item.category)?.name}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={item.active}
                          onCheckedChange={() => toggleItemActive(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={() => setEditingItem(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => deleteMenuItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Menu Categories</CardTitle>
              <CardDescription>Manage your menu categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button onClick={addCategory}>Add Category</Button>
              </div>
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Items Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{menuItems.filter(item => item.category === category.id).length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

