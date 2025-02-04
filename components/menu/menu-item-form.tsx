'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DietaryType, DIETARY_LABELS, MenuItem, PortionSize, CustomizationOption } from '@/types/menu'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Trash, Plus, Minus } from 'lucide-react'

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  price: z.number().min(0, 'Price must be positive'),
  category_id: z.string().min(1, 'Category is required'),
  is_available: z.boolean().default(true),
  dietary_info: z.array(z.string()),
  image_url: z.string().nullable(),
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

type MenuItemFormValues = z.infer<typeof menuItemSchema>

interface MenuItemFormProps {
  categories: { id: string; name: string }[]
  initialData?: Partial<MenuItem>
  onSuccess?: () => void
}

export function MenuItemForm({ categories, initialData, onSuccess }: MenuItemFormProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      category_id: initialData?.category_id || '',
      is_available: initialData?.is_available ?? true,
      dietary_info: initialData?.dietary_info || [],
      image_url: initialData?.image_url || null,
      portion_sizes: initialData?.portion_sizes || [],
      customization_options: initialData?.customization_options || [],
    },
  })

  async function onSubmit(data: MenuItemFormValues) {
    try {
      setIsLoading(true)
      
      // First, create or update the menu item
      const menuItemData = {
        name: data.name,
        description: data.description,
        price: data.price,
        category_id: data.category_id,
        is_available: data.is_available,
        dietary_info: data.dietary_info,
        image_url: data.image_url,
      }

      let menuItemId = initialData?.id
      if (initialData?.id) {
        const { error } = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', initialData.id)

        if (error) throw error
      } else {
        const { data: newItem, error } = await supabase
          .from('menu_items')
          .insert(menuItemData)
          .select()
          .single()

        if (error) throw error
        menuItemId = newItem.id
      }

      // Handle portion sizes
      if (menuItemId) {
        // Delete existing portion sizes
        await supabase
          .from('portion_sizes')
          .delete()
          .eq('menu_item_id', menuItemId)

        // Insert new portion sizes
        if (data.portion_sizes.length > 0) {
          const portionSizesData = data.portion_sizes.map(size => ({
            ...size,
            menu_item_id: menuItemId,
          }))
          const { error } = await supabase
            .from('portion_sizes')
            .insert(portionSizesData)
          if (error) throw error
        }

        // Handle customization options
        await supabase
          .from('customization_options')
          .delete()
          .eq('menu_item_id', menuItemId)

        for (const option of data.customization_options) {
          const { data: newOption, error: optionError } = await supabase
            .from('customization_options')
            .insert({
              menu_item_id: menuItemId,
              name: option.name,
              price_adjustment: option.price_adjustment,
              max_selections: option.max_selections,
              is_required: option.is_required,
            })
            .select()
            .single()

          if (optionError) throw optionError

          if (option.choices.length > 0) {
            const choicesData = option.choices.map(choice => ({
              ...choice,
              option_id: newOption.id,
            }))
            const { error: choicesError } = await supabase
              .from('customization_choices')
              .insert(choicesData)
            if (choicesError) throw choicesError
          }
        }
      }

      toast({
        title: 'Success',
        description: `Menu item ${initialData?.id ? 'updated' : 'created'} successfully.`,
      })
      
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error saving menu item:', error)
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
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

        <FormField
          control={form.control}
          name="dietary_info"
          render={() => (
            <FormItem>
              <FormLabel>Dietary Information</FormLabel>
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
                                : field.onChange(value.filter((val) => val !== type))
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Portion Sizes</h3>
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
                        <Input {...field} />
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
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Customization Options</h3>
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
                        <Input {...field} />
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
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Choices</h5>
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
                          <h6 className="font-medium">Choice {choiceIndex + 1}</h6>
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
        </div>

        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Available</FormLabel>
                <FormDescription>
                  This item will be visible to customers
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Menu Item' : 'Create Menu Item'}
        </Button>
      </form>
    </Form>
  )
} 