'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Icons } from '@/components/ui/icons'
import { createClient } from '@/lib/supabase/client'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MenuItem } from '@/types/menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { useRouter } from 'next/navigation'
import { uploadMenuItemImage, deleteMenuItemImage } from '@/lib/supabase/storage'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
  category_id: z.string().optional(),
  image_url: z.string().optional().nullable(),
  image_path: z.string().optional().nullable(),
  is_available: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface MenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: MenuItem | null
}

export function MenuItemDialog({ open, onOpenChange, item }: MenuItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const supabase = createClient()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_id: undefined,
      image_url: null,
      image_path: null,
      is_available: true,
    },
  })

  // Reset form with item data when editing
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category_id: item.category_id || undefined,
        image_url: item.image_url || null,
        image_path: item.image_path || null,
        is_available: item.is_available,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        category_id: undefined,
        image_url: null,
        image_path: null,
        is_available: true,
      })
    }
  }, [form, item])

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

  const { mutate: saveMenuItem } = useMutation({
    mutationFn: async (values: FormValues) => {
      if (item) {
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: values.name,
            description: values.description,
            price: values.price,
            category_id: values.category_id,
            image_url: values.image_url,
            image_path: values.image_path,
            is_available: values.is_available,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert({
            name: values.name,
            description: values.description,
            price: values.price,
            category_id: values.category_id,
            image_url: values.image_url,
            image_path: values.image_path,
            is_available: values.is_available,
          })

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success(item ? 'Item updated' : 'Item created')
      onOpenChange(false)
      if (!item) {
        form.reset() // Only reset form on create, not on edit
      }
      router.refresh()
    },
    onError: (error) => {
      console.error('Save error:', error)
      toast.error(item ? 'Failed to update item' : 'Failed to create item')
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      await saveMenuItem(values)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (result: { url: string; path: string } | null) => {
    if (result) {
      form.setValue('image_url', result.url)
      form.setValue('image_path', result.path)
    }
  }

  const handleImageRemove = async () => {
    if (item?.image_path) {
      try {
        await deleteMenuItemImage(item.image_path)
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }
    form.setValue('image_url', null)
    form.setValue('image_path', null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle>
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </DialogTitle>
          <DialogDescription>
            {item
              ? 'Update the menu item details below.'
              : 'Add a new item to your menu.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={isLoading} className="h-20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        value={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || undefined}
                        onChange={handleImageUpload}
                        onRemove={handleImageRemove}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_available"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Available</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        This item will be shown on the menu
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {item ? 'Update' : 'Create'} Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 