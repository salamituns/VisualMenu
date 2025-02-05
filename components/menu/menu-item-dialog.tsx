'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Icons } from '@/components/ui/icons'
import { createClient } from '@/lib/supabase/client'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DietaryType, MenuItem, DIETARY_LABELS } from '@/types/menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { useRouter } from 'next/navigation'
import { uploadMenuItemImage, deleteMenuItemImage } from '@/lib/supabase/storage'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
  category_id: z.string().optional(),
  image_url: z.string().nullable(),
  image_path: z.string().nullable(),
  is_available: z.boolean().default(true),
  dietary_info: z.array(z.string()),
  portion_sizes: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.number().min(0, 'Price must be positive'),
    is_default: z.boolean().default(false),
  })),
  customization_options: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    price_adjustment: z.number().default(0),
    max_selections: z.number().min(1, 'At least one selection required'),
    is_required: z.boolean().default(false),
    choices: z.array(z.object({
      name: z.string().min(1, 'Name is required'),
      price_adjustment: z.number().default(0),
      is_default: z.boolean().default(false),
    })),
  })),
})

type FormValues = z.infer<typeof formSchema>

interface MenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: MenuItem | null
  onSuccess?: () => void
}

export function MenuItemDialog({ open, onOpenChange, item, onSuccess }: MenuItemDialogProps) {
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
      dietary_info: [],
      portion_sizes: [],
      customization_options: [],
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
        dietary_info: item.dietary_info || [],
        portion_sizes: item.portion_sizes || [],
        customization_options: item.customization_options || [],
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
        dietary_info: [],
        portion_sizes: [],
        customization_options: [],
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
      try {
        if (item) {
          // Update existing menu item
          const { error: updateError } = await supabase
            .from('menu_items')
            .update({
              name: values.name,
              description: values.description || null,
              price: values.price,
              category_id: values.category_id || null,
              image_url: values.image_url || null,
              image_path: values.image_path || null,
              is_available: values.is_available,
              dietary_info: values.dietary_info,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id)

          if (updateError) throw updateError

          // Update portion sizes
          if (values.portion_sizes.length > 0) {
            // Delete existing portion sizes
            await supabase
              .from('portion_sizes')
              .delete()
              .eq('menu_item_id', item.id)

            // Insert new portion sizes
            const { error: sizesError } = await supabase
              .from('portion_sizes')
              .insert(
                values.portion_sizes.map(size => ({
                  ...size,
                  menu_item_id: item.id,
                }))
              )
            if (sizesError) throw sizesError
          }

          // Update customization options
          // First delete existing options and their choices
          const { data: existingOptions } = await supabase
            .from('customization_options')
            .select('id')
            .eq('menu_item_id', item.id)

          if (existingOptions) {
            for (const option of existingOptions) {
              await supabase
                .from('customization_choices')
                .delete()
                .eq('option_id', option.id)
            }
            await supabase
              .from('customization_options')
              .delete()
              .eq('menu_item_id', item.id)
          }

          // Then insert new options and choices
          for (const option of values.customization_options) {
            const { data: newOption, error: optionError } = await supabase
              .from('customization_options')
              .insert({
                menu_item_id: item.id,
                name: option.name,
                price_adjustment: option.price_adjustment,
                max_selections: option.max_selections,
                is_required: option.is_required,
              })
              .select()
              .single()

            if (optionError) throw optionError

            if (option.choices && option.choices.length > 0) {
              const { error: choicesError } = await supabase
                .from('customization_choices')
                .insert(
                  option.choices.map(choice => ({
                    ...choice,
                    option_id: newOption.id,
                  }))
                )
              if (choicesError) throw choicesError
            }
          }
        } else {
          // Create new menu item
          const { data: newItem, error: itemError } = await supabase
            .from('menu_items')
            .insert({
              name: values.name,
              description: values.description,
              price: values.price,
              category_id: values.category_id,
              image_url: values.image_url,
              image_path: values.image_path,
              is_available: values.is_available,
              dietary_info: values.dietary_info,
            })
            .select()
            .single()

          if (itemError) throw itemError

          // Create portion sizes
          if (values.portion_sizes.length > 0) {
            const { error: sizesError } = await supabase
              .from('portion_sizes')
              .insert(values.portion_sizes.map(size => ({
                ...size,
                menu_item_id: newItem.id,
              })))
            if (sizesError) throw sizesError
          }

          // Create customization options
          for (const option of values.customization_options) {
            const { data: newOption, error: optionError } = await supabase
              .from('customization_options')
              .insert({
                menu_item_id: newItem.id,
                name: option.name,
                price_adjustment: option.price_adjustment,
                max_selections: option.max_selections,
                is_required: option.is_required,
              })
              .select()
              .single()

            if (optionError) throw optionError

            if (option.choices.length > 0) {
              const { error: choicesError } = await supabase
                .from('customization_choices')
                .insert(option.choices.map(choice => ({
                  ...choice,
                  option_id: newOption.id,
                })))
              if (choicesError) throw choicesError
            }
          }
        }
      } catch (error) {
        console.error('Error saving menu item:', error)
        throw error
      }
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      toast.success(item ? 'Menu item updated successfully' : 'Menu item created successfully')
      onOpenChange(false)
      if (!item) {
        form.reset()
      }
      onSuccess?.()
    },
    onError: (error: any) => {
      console.error('Mutation error:', error)
      toast.error(error.message || 'Failed to save menu item')
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true)
      await saveMenuItem(values)
    } catch (error) {
      console.error('Submit error:', error)
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
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
        <DialogHeader>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="dietary">Dietary</TabsTrigger>
                <TabsTrigger value="portions">Portions</TabsTrigger>
                <TabsTrigger value="customization">Customization</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
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
                        <Textarea {...field} disabled={isLoading} />
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
                        <FormLabel>Base Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
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
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                          value={field.value === null ? undefined : field.value}
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Available
                        </FormLabel>
                        <FormDescription>
                          This item will be shown on the menu
                        </FormDescription>
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
              </TabsContent>

              <TabsContent value="dietary" className="mt-4">
                <FormField
                  control={form.control}
                  name="dietary_info"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Dietary Information</FormLabel>
                        <FormDescription>
                          Select all dietary options that apply to this item
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {(Object.keys(DIETARY_LABELS) as DietaryType[]).map((type) => (
                          <FormField
                            key={type}
                            control={form.control}
                            name="dietary_info"
                            render={({ field }) => (
                              <FormItem
                                key={type}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(type)}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || []
                                      return checked
                                        ? field.onChange([...value, type])
                                        : field.onChange(
                                            value.filter((val) => val !== type)
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {DIETARY_LABELS[type]}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="portions" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Portion Sizes</h4>
                    <p className="text-sm text-muted-foreground">
                      Add different sizes with their prices
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentSizes = form.getValues('portion_sizes')
                      form.setValue('portion_sizes', [
                        ...currentSizes,
                        { name: '', price: 0, is_default: false },
                      ])
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                </div>

                {form.watch('portion_sizes').map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Size {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentSizes = form.getValues('portion_sizes')
                            form.setValue(
                              'portion_sizes',
                              currentSizes.filter((_, i) => i !== index)
                            )
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`portion_sizes.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Small, Medium, Large" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`portion_sizes.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`portion_sizes.${index}.is_default`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Default Size</FormLabel>
                              <FormDescription>
                                This will be the default size option
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="customization" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Customization Options</h4>
                    <p className="text-sm text-muted-foreground">
                      Add customization options with choices
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentOptions = form.getValues('customization_options')
                      form.setValue('customization_options', [
                        ...currentOptions,
                        {
                          name: '',
                          price_adjustment: 0,
                          max_selections: 1,
                          is_required: false,
                          choices: [],
                        },
                      ])
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>

                {form.watch('customization_options').map((_, optionIndex) => (
                  <Card key={optionIndex}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Option {optionIndex + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentOptions = form.getValues('customization_options')
                            form.setValue(
                              'customization_options',
                              currentOptions.filter((_, i) => i !== optionIndex)
                            )
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`customization_options.${optionIndex}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Toppings, Cooking Preference" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`customization_options.${optionIndex}.max_selections`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Selections</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`customization_options.${optionIndex}.is_required`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Required</FormLabel>
                                <FormDescription>
                                  Customer must select an option
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium">Choices</h5>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentOptions = form.getValues('customization_options')
                              const currentChoices = currentOptions[optionIndex].choices
                              form.setValue(`customization_options.${optionIndex}.choices`, [
                                ...currentChoices,
                                {
                                  name: '',
                                  price_adjustment: 0,
                                  is_default: false,
                                },
                              ])
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Choice
                          </Button>
                        </div>

                        {form.watch(`customization_options.${optionIndex}.choices`).map((_, choiceIndex) => (
                          <Card key={choiceIndex}>
                            <CardContent className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <h6 className="text-sm font-medium">Choice {choiceIndex + 1}</h6>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const currentOptions = form.getValues('customization_options')
                                    const currentChoices = currentOptions[optionIndex].choices
                                    form.setValue(
                                      `customization_options.${optionIndex}.choices`,
                                      currentChoices.filter((_, i) => i !== choiceIndex)
                                    )
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>

                              <FormField
                                control={form.control}
                                name={`customization_options.${optionIndex}.choices.${choiceIndex}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`customization_options.${optionIndex}.choices.${choiceIndex}.price_adjustment`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Price Adjustment</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`customization_options.${optionIndex}.choices.${choiceIndex}.is_default`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Default Choice</FormLabel>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : item ? (
                  'Update Item'
                ) : (
                  'Create Item'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 