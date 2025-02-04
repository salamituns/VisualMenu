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
import { queryClient } from '@/lib/react-query'

export default function MenuPage() {
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const supabase = createClient()

  const { data: items, isLoading: isLoadingItems } = useQuery<MenuItem[]>({
    queryKey: ['menu-items'],
    queryFn: async () => {
      try {
        // First, get menu items with all fields explicitly specified
        const { data: menuItems, error: menuError } = await supabase
          .from('menu_items')
          .select(`
            id,
            name,
            description,
            price,
            category_id,
            image_url,
            image_path,
            is_available,
            dietary_info,
            created_at,
            updated_at
          `)
          .order('name', { ascending: true })

        if (menuError) {
          console.error('Menu items fetch error:', menuError)
          throw menuError
        }

        // Then get portion sizes for each menu item
        const menuItemsWithRelations = await Promise.all(
          (menuItems || []).map(async (item) => {
            const { data: portionSizes } = await supabase
              .from('portion_sizes')
              .select('*')
              .eq('menu_item_id', item.id)

            const { data: customizationOptions } = await supabase
              .from('customization_options')
              .select(`
                id, name, price_adjustment, max_selections, is_required, menu_item_id
              `)
              .eq('menu_item_id', item.id)

            if (customizationOptions) {
              // Get choices for each customization option
              const optionsWithChoices = await Promise.all(
                customizationOptions.map(async (option) => {
                  const { data: choices } = await supabase
                    .from('customization_choices')
                    .select('*')
                    .eq('option_id', option.id)

                  return {
                    ...option,
                    choices: choices || []
                  }
                })
              )

              return {
                ...item,
                dietary_info: item.dietary_info || [], // Ensure dietary_info is always an array
                portion_sizes: portionSizes || [],
                customization_options: optionsWithChoices
              }
            }

            return {
              ...item,
              dietary_info: item.dietary_info || [], // Ensure dietary_info is always an array
              portion_sizes: portionSizes || [],
              customization_options: []
            }
          })
        )

        return menuItemsWithRelations
      } catch (error) {
        console.error('Error fetching menu items:', error)
        throw error
      }
    },
    staleTime: 1000,
    refetchOnWindowFocus: true,
  })

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching categories:', error)
        throw error
      }
      return data || []
    },
    staleTime: 1000,
    refetchOnWindowFocus: true,
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
          <MenuItemList 
            items={items ?? []} 
            isLoading={isLoadingItems}
            onItemUpdated={() => {
              queryClient.invalidateQueries({ queryKey: ['menu-items'] })
            }}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <CategoryList categories={categories ?? []} isLoading={isLoadingCategories} />
        </TabsContent>
      </Tabs>
      
      <MenuItemDialog
        open={isMenuItemDialogOpen}
        onOpenChange={setIsMenuItemDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['menu-items'] })
        }}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      />
    </div>
  )
} 