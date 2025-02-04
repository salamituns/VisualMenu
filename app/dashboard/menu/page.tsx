'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { createClient } from '@/lib/supabase/client'
import { MenuItem, Category } from '@/types/menu'
import { MenuItemDialog } from '@/components/menu/menu-item-dialog'
import { MenuItemList } from '@/components/menu/menu-item-list'
import { CategoryDialog } from '@/components/menu/category-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryList } from '@/components/menu/category-list'

export default function MenuPage() {
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const supabase = createClient()

  const { data: items, isLoading: isLoadingItems } = useQuery<MenuItem[]>({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data
    },
  })

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      return data
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">
            Manage your menu items and categories
          </p>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <TabsContent value="items" className="mt-0">
            <Button onClick={() => setIsMenuItemDialogOpen(true)}>
              <Icons.add className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </TabsContent>
          <TabsContent value="categories" className="mt-0">
            <Button onClick={() => setIsCategoryDialogOpen(true)}>
              <Icons.add className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </TabsContent>
        </div>

        <TabsContent value="items" className="mt-0">
          <MenuItemList items={items ?? []} isLoading={isLoadingItems} />
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <CategoryList categories={categories ?? []} isLoading={isLoadingCategories} />
        </TabsContent>
      </Tabs>
      
      <MenuItemDialog
        open={isMenuItemDialogOpen}
        onOpenChange={setIsMenuItemDialogOpen}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      />
    </div>
  )
} 