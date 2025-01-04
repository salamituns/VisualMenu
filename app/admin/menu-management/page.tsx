"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Upload } from 'lucide-react'
import { getMenus, createMenu, updateMenu, deleteMenu, getCategories, createCategory, updateCategory, deleteCategory, getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '@/lib/db'
import type { Menu, Category, MenuItem } from '@/types/database'
import { supabase } from '@/lib/supabase'

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewMenuForm, setShowNewMenuForm] = useState(false)
  const [newMenuName, setNewMenuName] = useState('')
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  })
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showNewItemForm, setShowNewItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    is_available: true,
    image_url: '',
    allergens: [] as string[],
    dietary_info: [] as string[]
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    loadMenus()
  }, [])

  useEffect(() => {
    if (selectedMenu) {
      loadCategories(selectedMenu)
    }
  }, [selectedMenu])

  useEffect(() => {
    if (editingCategory) {
      setCategoryFormData({
        name: editingCategory.name,
        description: editingCategory.description || ''
      })
    } else {
      setCategoryFormData({
        name: '',
        description: ''
      })
    }
  }, [editingCategory])

  useEffect(() => {
    if (selectedCategory) {
      loadMenuItems(selectedCategory)
    }
  }, [selectedCategory])

  useEffect(() => {
    if (editingItem) {
      setItemFormData({
        name: editingItem.name,
        description: editingItem.description || '',
        price: editingItem.price.toString(),
        is_available: editingItem.is_available,
        image_url: editingItem.image_url || '',
        allergens: editingItem.allergens || [],
        dietary_info: editingItem.dietary_info || []
      })
    } else {
      setItemFormData({
        name: '',
        description: '',
        price: '',
        is_available: true,
        image_url: '',
        allergens: [],
        dietary_info: []
      })
    }
  }, [editingItem])

  async function loadMenus() {
    try {
      const data = await getMenus()
      setMenus(data)
      if (data.length > 0 && !selectedMenu) {
        setSelectedMenu(data[0].id)
      }
    } catch (err) {
      console.error('Error loading menus:', err)
      setError('Failed to load menus')
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories(menuId: string) {
    try {
      const data = await getCategories(menuId)
      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
      setError('Failed to load categories')
    }
  }

  async function handleCreateMenu(e: React.FormEvent) {
    e.preventDefault()
    if (!newMenuName.trim()) return

    try {
      console.log('Creating new menu:', { name: newMenuName.trim() })
      const newMenu = await createMenu({
        name: newMenuName.trim(),
        description: '',
        is_active: true,
        restaurant_id: '9c72570d-16d4-4a8c-bb38-55191c0bc4fc'
      })
      console.log('Menu created successfully:', newMenu)
      setMenus([...menus, newMenu])
      setSelectedMenu(newMenu.id)
      setNewMenuName('')
      setShowNewMenuForm(false)
    } catch (err) {
      console.error('Detailed error creating menu:', err)
      setError(err instanceof Error ? err.message : 'Failed to create menu')
    }
  }

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryFormData.name.trim() || !selectedMenu) return

    try {
      if (editingCategory) {
        const updatedCategory = await updateCategory(editingCategory.id, {
          name: categoryFormData.name.trim(),
          description: categoryFormData.description,
          menu_id: selectedMenu
        })
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ))
      } else {
        const newCategory = await createCategory({
          name: categoryFormData.name.trim(),
          description: categoryFormData.description,
          menu_id: selectedMenu,
          display_order: categories.length
        })
        setCategories([...categories, newCategory])
      }
      setShowNewCategoryForm(false)
      setEditingCategory(null)
      setCategoryFormData({ name: '', description: '' })
    } catch (err) {
      console.error('Error saving category:', err)
      setError('Failed to save category')
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!confirm('Are you sure you want to delete this category? All menu items in this category will also be deleted.')) return

    try {
      await deleteCategory(categoryId)
      setCategories(categories.filter(cat => cat.id !== categoryId))
    } catch (err) {
      console.error('Error deleting category:', err)
      setError('Failed to delete category')
    }
  }

  async function loadMenuItems(categoryId: string) {
    try {
      const data = await getMenuItems(categoryId)
      setMenuItems(data)
    } catch (err) {
      console.error('Error loading menu items:', err)
      setError('Failed to load menu items')
    }
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!itemFormData.name.trim() || !selectedCategory) return

    try {
      const itemData = {
        name: itemFormData.name.trim(),
        description: itemFormData.description,
        price: parseFloat(itemFormData.price),
        is_available: itemFormData.is_available,
        category_id: selectedCategory,
        image_url: itemFormData.image_url,
        allergens: itemFormData.allergens,
        dietary_info: itemFormData.dietary_info,
        display_order: menuItems.length
      }

      if (editingItem) {
        const updatedItem = await updateMenuItem(editingItem.id, itemData)
        setMenuItems(menuItems.map(item => 
          item.id === editingItem.id ? updatedItem : item
        ))
      } else {
        const newItem = await createMenuItem(itemData)
        setMenuItems([...menuItems, newItem])
      }
      setShowNewItemForm(false)
      setEditingItem(null)
      setItemFormData({
        name: '',
        description: '',
        price: '',
        is_available: true,
        image_url: '',
        allergens: [],
        dietary_info: []
      })
    } catch (err) {
      console.error('Error saving menu item:', err)
      setError('Failed to save menu item')
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      await deleteMenuItem(itemId)
      setMenuItems(menuItems.filter(item => item.id !== itemId))
    } catch (err) {
      console.error('Error deleting menu item:', err)
      setError('Failed to delete menu item')
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      setError(null)

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB')
      }

      // Create a preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewImage(objectUrl)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      console.log('Attempting to upload file:', {
        fileName,
        fileType: file.type,
        fileSize: file.size
      })

      const { data, error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(`${fileName}`, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        throw new Error(uploadError.message)
      }

      console.log('Upload successful:', data)

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName)

      console.log('Public URL generated:', publicUrl)

      // Update form data with the image URL
      setItemFormData(prev => ({
        ...prev,
        image_url: publicUrl
      }))
    } catch (err) {
      console.error('Detailed error uploading image:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      // Clean up preview if upload failed
      if (previewImage) {
        URL.revokeObjectURL(previewImage)
        setPreviewImage(null)
      }
    } finally {
      setUploadingImage(false)
    }
  }

  const menuOptions = menus.map(menu => ({
    value: menu.id,
    label: menu.name
  }))

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="menu-select">Select Menu</Label>
            <Select value={selectedMenu || ''} onValueChange={setSelectedMenu}>
              <SelectTrigger id="menu-select">
                <SelectValue placeholder="Select a menu" />
              </SelectTrigger>
              <SelectContent>
                {menuOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowNewMenuForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Menu
          </Button>
        </div>

        {showNewMenuForm && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Create New Menu</CardTitle>
              <CardDescription>Add a new menu to your restaurant</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateMenu} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="menu-name">Menu Name</Label>
                  <Input
                    id="menu-name"
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                    placeholder="Enter menu name"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Menu</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowNewMenuForm(false)
                      setNewMenuName('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedMenu && (
        <div className="space-y-4">
          <Tabs defaultValue="items" className="w-full">
            <TabsList>
              <TabsTrigger value="items">Menu Items</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="items">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Menu Items</CardTitle>
                    <CardDescription>Add, edit, or remove menu items</CardDescription>
                  </div>
                  {categories.length > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <Select value={selectedCategory || ''} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedCategory && (
                        <Button onClick={() => setShowNewItemForm(true)} className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Item
                        </Button>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {categories.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      First, create some categories to organize your menu items
                    </div>
                  ) : !selectedCategory ? (
                    <div className="text-center text-gray-500 py-8">
                      Select a category to manage its menu items
                    </div>
                  ) : (
                    <>
                      {(showNewItemForm || editingItem) && (
                        <div className="mb-6 border rounded-lg p-4">
                          <form onSubmit={handleItemSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="item-name">Item Name</Label>
                              <Input
                                id="item-name"
                                value={itemFormData.name}
                                onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                                placeholder="Enter item name"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="item-description">Description (Optional)</Label>
                              <Input
                                id="item-description"
                                value={itemFormData.description}
                                onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                                placeholder="Enter item description"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="item-price">Price</Label>
                              <Input
                                id="item-price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={itemFormData.price}
                                onChange={(e) => setItemFormData({ ...itemFormData, price: e.target.value })}
                                placeholder="Enter price"
                                required
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="item-available"
                                checked={itemFormData.is_available}
                                onCheckedChange={(checked) => setItemFormData({ ...itemFormData, is_available: checked })}
                              />
                              <Label htmlFor="item-available">Available</Label>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="item-image">Item Image</Label>
                              <div className="flex flex-col gap-4">
                                {(previewImage || itemFormData.image_url) && (
                                  <div className="relative w-40 h-40">
                                    <img
                                      src={previewImage || itemFormData.image_url}
                                      alt="Preview"
                                      className="w-full h-full object-cover rounded-md"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-2 right-2"
                                      onClick={() => {
                                        setPreviewImage(null)
                                        setItemFormData(prev => ({ ...prev, image_url: '' }))
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                                <div className="flex items-center gap-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={uploadingImage}
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    className="flex items-center gap-2"
                                  >
                                    <Upload className="h-4 w-4" />
                                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                  </Button>
                                  <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit">
                                {editingItem ? 'Update' : 'Create'} Item
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                  setShowNewItemForm(false)
                                  setEditingItem(null)
                                  setItemFormData({
                                    name: '',
                                    description: '',
                                    price: '',
                                    is_available: true,
                                    image_url: '',
                                    allergens: [],
                                    dietary_info: []
                                  })
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}

                      {menuItems.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          No items in this category yet. Click the button above to add your first item.
                        </div>
                      ) : (
                        <div className="relative overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-50">
                              <tr>
                                <th className="px-6 py-3">Item Name</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Available</th>
                                <th className="px-6 py-3">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {menuItems.map((item) => (
                                <tr key={item.id} className="bg-white border-b">
                                  <td className="px-6 py-4">{item.name}</td>
                                  <td className="px-6 py-4">{item.description || '-'}</td>
                                  <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                                  <td className="px-6 py-4">
                                    <Switch
                                      checked={item.is_available}
                                      onCheckedChange={async (checked) => {
                                        try {
                                          const updatedItem = await updateMenuItem(item.id, {
                                            ...item,
                                            is_available: checked
                                          })
                                          setMenuItems(menuItems.map(i => 
                                            i.id === item.id ? updatedItem : i
                                          ))
                                        } catch (err) {
                                          console.error('Error updating item availability:', err)
                                          setError('Failed to update item availability')
                                        }
                                      }}
                                    />
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="icon"
                                        onClick={() => setEditingItem(item)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="icon"
                                        onClick={() => handleDeleteItem(item.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Menu Categories</CardTitle>
                    <CardDescription>Manage your menu categories</CardDescription>
                  </div>
                  <Button onClick={() => setShowNewCategoryForm(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                </CardHeader>
                <CardContent>
                  {(showNewCategoryForm || editingCategory) && (
                    <div className="mb-6 border rounded-lg p-4">
                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="category-name">Category Name</Label>
                          <Input
                            id="category-name"
                            value={categoryFormData.name}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                            placeholder="Enter category name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category-description">Description (Optional)</Label>
                          <Input
                            id="category-description"
                            value={categoryFormData.description}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                            placeholder="Enter category description"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">
                            {editingCategory ? 'Update' : 'Create'} Category
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowNewCategoryForm(false)
                              setEditingCategory(null)
                              setCategoryFormData({ name: '', description: '' })
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {categories.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No categories yet. Click the button above to add your first category.
                    </div>
                  ) : (
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-gray-50">
                          <tr>
                            <th className="px-6 py-3">Category Name</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((category) => (
                            <tr key={category.id} className="bg-white border-b">
                              <td className="px-6 py-4">{category.name}</td>
                              <td className="px-6 py-4">{category.description || '-'}</td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => setEditingCategory(category)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => handleDeleteCategory(category.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

