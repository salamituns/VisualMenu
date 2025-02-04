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
}

export function MenuItemList({ items, isLoading }: MenuItemListProps) {
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
        .update({ is_available: !item.is_available })
        .eq('id', item.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success('Item availability updated')
    },
    onError: () => {
      toast.error('Failed to update item availability')
    },
  })

  const { mutate: deleteMenuItem } = useMutation({
    mutationFn: async (item: MenuItem) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', item.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success('Item deleted')
      setItemToDelete(null)
    },
    onError: () => {
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
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>{item.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.is_available}
                    onCheckedChange={() => toggleAvailability(item)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingItem(item)}
                >
                  <Icons.edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setItemToDelete(item)}
                  className="text-destructive"
                >
                  <Icons.trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  {item.category_id && (
                    <div>
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-sm text-muted-foreground">
                        {categories?.find((c) => c.id === item.category_id)?.name ?? 'Unknown'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MenuItemDialog
        open={!!editingItem}
        onOpenChange={(open: boolean) => !open && setEditingItem(null)}
        item={editingItem}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={(open: boolean) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {itemToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteMenuItem(itemToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 