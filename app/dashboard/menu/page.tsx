'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MenuItemList } from '@/components/menu/menu-item-list'
import { CategoryList } from '@/components/menu/category-list'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { MenuScanner } from '@/components/ocr/MenuScanner'
import { ResultsPreview } from '@/components/ocr/ResultsPreview'
import { Dialog, DialogContent } from '@/components/ui/modal'
import { useToast } from '@/components/ui/use-toast'
import { Camera } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category_id: string
  image_url: string | null
  is_available: boolean
  dietary_info: string[]
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
  description: string | null
  order_index: number
}

export default function MenuPage() {
  const [isMenuItemDialogOpen, setIsMenuItemDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isOCRDialogOpen, setIsOCRDialogOpen] = useState(false)
  const [scannedItems, setScannedItems] = useState<Array<{
    name: string;
    description?: string;
    price: number;
    category?: string;
  }> | null>(null)
  
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: items, isLoading: isLoadingItems } = useQuery<MenuItem[]>({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false })

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

  const handleScanComplete = (items: Array<{
    name: string;
    description?: string;
    price: number;
    category?: string;
  }>) => {
    setScannedItems(items)
  }

  const handleScanError = (error: Error) => {
    toast({
      title: 'Scan failed',
      description: error.message,
      variant: 'destructive',
    })
    setIsOCRDialogOpen(false)
  }

  const handleConfirmScannedItems = async (items: Array<{
    name: string;
    description?: string;
    price: number;
    category?: string;
  }>) => {
    try {
      // First, ensure all categories exist
      const categoryPromises = items
        .filter(item => item.category)
        .map(async (item) => {
          if (!item.category) return

          const { data: existingCategory } = await supabase
            .from('categories')
            .select('id')
            .eq('name', item.category)
            .single()

          if (!existingCategory) {
            const { data: newCategory, error } = await supabase
              .from('categories')
              .insert([
                {
                  name: item.category,
                  order_index: 0,
                },
              ])
              .select()
              .single()

            if (error) throw error
            return newCategory
          }

          return existingCategory
        })

      await Promise.all(categoryPromises)

      // Then insert menu items
      const { error } = await supabase.from('menu_items').insert(
        items.map(item => ({
          name: item.name,
          description: item.description || '',
          price: item.price,
          category_id: item.category || null,
          is_available: true,
          dietary_info: [],
        }))
      )

      if (error) throw error

      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })

      toast({
        title: 'Items added successfully',
        description: `Added ${items.length} items to your menu`,
      })

      setScannedItems(null)
      setIsOCRDialogOpen(false)
    } catch (error) {
      console.error('Error adding scanned items:', error)
      toast({
        title: 'Failed to add items',
        description: 'There was an error adding the scanned items to your menu',
        variant: 'destructive',
      })
    }
  }

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
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsOCRDialogOpen(true)}>
              <Camera className="mr-2 h-4 w-4" />
              Scan Menu
            </Button>
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

      <Dialog open={isOCRDialogOpen} onOpenChange={setIsOCRDialogOpen}>
        <DialogContent className="max-w-3xl">
          {scannedItems ? (
            <ResultsPreview
              results={scannedItems}
              onConfirm={handleConfirmScannedItems}
              onEdit={(index, item) => {
                const newItems = [...scannedItems]
                newItems[index] = item
                setScannedItems(newItems)
              }}
              onCancel={() => {
                setScannedItems(null)
                setIsOCRDialogOpen(false)
              }}
            />
          ) : (
            <MenuScanner
              onScanComplete={handleScanComplete}
              onError={handleScanError}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 