'use client'

import { useState } from 'react'
import { MenuItem } from '@/types/menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { MenuItemDialog } from '@/components/menu/menu-item-dialog'
import { Switch } from '@/components/ui/switch'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DIETARY_ICONS, DIETARY_LABELS } from '@/types/menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface MenuItemListProps {
  items: MenuItem[]
  isLoading: boolean
  onItemUpdated?: () => void
}

export function MenuItemList({ items, isLoading, onItemUpdated }: MenuItemListProps) {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const supabase = createClient()
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)

  const { data: categories } = useQuery({
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

  const filteredItems = selectedCategory && selectedCategory !== 'all'
    ? items.filter((item) => item.category_id === selectedCategory)
    : items

  const { mutate: toggleAvailability } = useMutation({
    mutationFn: async (item: MenuItem) => {
      const { error } = await supabase
        .from('menu_items')
        .update({ 
          is_available: !item.is_available,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (error) throw error
      return item
    },
    onMutate: async (updatedItem) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['menu-items'] })

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<MenuItem[]>(['menu-items'])

      // Optimistically update to the new value
      if (previousItems) {
        queryClient.setQueryData<MenuItem[]>(['menu-items'], 
          previousItems.map(item => 
            item.id === updatedItem.id 
              ? { ...item, is_available: !item.is_available }
              : item
          )
        )
      }

      return { previousItems }
    },
    onError: (err, newItem, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousItems) {
        queryClient.setQueryData(['menu-items'], context.previousItems)
      }
      toast.error('Failed to update item availability')
    },
    onSuccess: (item) => {
      toast.success(`${item.name} ${item.is_available ? 'disabled' : 'enabled'}`)
      onItemUpdated?.()
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're up to date
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
    },
  })

  const { mutate: deleteMenuItem } = useMutation({
    mutationFn: async (item: MenuItem) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', item.id)

      if (error) throw error
      return item
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success(`${item.name} deleted successfully`)
      setItemToDelete(null)
    },
    onError: (error: any) => {
      console.error('Delete error:', error)
      toast.error('Failed to delete item')
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-1/3 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-2/3 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No menu items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Add your first menu item to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-6">
        <Select value={selectedCategory ?? undefined} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl">{item.name}</CardTitle>
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={item.is_available}
                  onCheckedChange={() => toggleAvailability(item)}
                />
                <span className="text-sm text-muted-foreground ml-2">
                  {item.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-start gap-6">
                  {item.image_url && (
                    <div className="relative aspect-square w-24 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Price</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-sm text-muted-foreground">
                        {categories?.find(c => c.id === item.category_id)?.name || 'Uncategorized'}
                      </p>
                    </div>
                    {item.dietary_info && item.dietary_info.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Dietary Info</p>
                        <div className="flex gap-1">
                          {item.dietary_info.map((info) => (
                            <span
                              key={info}
                              className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs"
                            >
                              {DIETARY_ICONS[info as keyof typeof DIETARY_ICONS]}
                              {DIETARY_LABELS[info as keyof typeof DIETARY_LABELS]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingItem(item)}
                      >
                        <Icons.edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setItemToDelete(item)}
                      >
                        <Icons.trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MenuItemDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        onSuccess={() => {
          setEditingItem(null)
          onItemUpdated?.()
        }}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {itemToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToDelete && deleteMenuItem(itemToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 