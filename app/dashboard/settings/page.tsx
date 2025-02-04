'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Icons } from '@/components/ui/icons'
import { useToast } from '@/components/ui/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { QRCodeSVG } from 'qrcode.react'

// Define form schema for restaurant settings
const restaurantFormSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
})

// Define form schema for theme settings
const themeFormSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color hex code'),
  fontFamily: z.enum(['inter', 'manrope', 'system']),
  menuLayout: z.enum(['grid', 'list']),
  showPrices: z.boolean(),
  enableAnimations: z.boolean(),
})

type RestaurantSettings = z.infer<typeof restaurantFormSchema>
type ThemeSettings = z.infer<typeof themeFormSchema>

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('restaurant')
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (error) throw error
      return data
    },
  })

  // Restaurant info form
  const restaurantForm = useForm<RestaurantSettings>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: settings?.restaurant_name || '',
      description: settings?.restaurant_description || '',
      address: settings?.restaurant_address || '',
      phone: settings?.restaurant_phone || '',
      email: settings?.restaurant_email || '',
      website: settings?.restaurant_website || '',
    },
  })

  // Theme settings form
  const themeForm = useForm<ThemeSettings>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      primaryColor: settings?.theme_primary_color || '#3b82f6',
      fontFamily: (settings?.theme_font_family as ThemeSettings['fontFamily']) || 'inter',
      menuLayout: (settings?.theme_menu_layout as ThemeSettings['menuLayout']) || 'grid',
      showPrices: settings?.theme_show_prices ?? true,
      enableAnimations: settings?.theme_enable_animations ?? true,
    },
  })

  // Handle restaurant info submission
  async function onRestaurantSubmit(data: RestaurantSettings) {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          restaurant_name: data.name,
          restaurant_description: data.description,
          restaurant_address: data.address,
          restaurant_phone: data.phone,
          restaurant_email: data.email,
          restaurant_website: data.website,
        })

      if (error) throw error

      toast({
        title: 'Settings updated',
        description: 'Your restaurant information has been saved.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Handle theme settings submission
  async function onThemeSubmit(data: ThemeSettings) {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          theme_primary_color: data.primaryColor,
          theme_font_family: data.fontFamily,
          theme_menu_layout: data.menuLayout,
          theme_show_prices: data.showPrices,
          theme_enable_animations: data.enableAnimations,
        })

      if (error) throw error

      toast({
        title: 'Settings updated',
        description: 'Your theme settings have been saved.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="restaurant">Restaurant Info</TabsTrigger>
          <TabsTrigger value="theme">Theme & Display</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurant">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>
                Manage your restaurant details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...restaurantForm}>
                <form onSubmit={restaurantForm.handleSubmit(onRestaurantSubmit)} className="space-y-4">
                  <FormField
                    control={restaurantForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={restaurantForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          A brief description of your restaurant.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={restaurantForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={restaurantForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={restaurantForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} type="url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={restaurantForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Display Settings</CardTitle>
              <CardDescription>
                Customize how your menu looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...themeForm}>
                <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-4">
                  <FormField
                    control={themeForm.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input {...field} type="text" placeholder="#3b82f6" />
                            <Input
                              type="color"
                              className="w-12 p-1 h-10"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Choose a primary color for your menu theme.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={themeForm.control}
                    name="fontFamily"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Family</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a font family" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="manrope">Manrope</SelectItem>
                            <SelectItem value="system">System Default</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the font family for your menu.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={themeForm.control}
                    name="menuLayout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Menu Layout</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a layout" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid</SelectItem>
                            <SelectItem value="list">List</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose how menu items are displayed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={themeForm.control}
                      name="showPrices"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Show Prices
                            </FormLabel>
                            <FormDescription>
                              Display prices for menu items.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={themeForm.control}
                      name="enableAnimations"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Enable Animations
                            </FormLabel>
                            <FormDescription>
                              Add smooth animations to menu interactions.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>
                Generate and download QR codes for your menu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-8">
                  <QRCodeSVG
                    value={`${window.location.origin}/menu`}
                    size={200}
                    level="H"
                    includeMargin
                  />
                  <p className="text-sm text-muted-foreground">
                    Scan to view menu
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const svg = document.querySelector('.qr-code svg') as SVGElement
                      if (svg) {
                        const svgData = new XMLSerializer().serializeToString(svg)
                        const canvas = document.createElement('canvas')
                        const ctx = canvas.getContext('2d')
                        const img = new Image()
                        img.onload = () => {
                          canvas.width = img.width
                          canvas.height = img.height
                          ctx?.drawImage(img, 0, 0)
                          const pngFile = canvas.toDataURL('image/png')
                          const downloadLink = document.createElement('a')
                          downloadLink.download = 'menu-qr-code.png'
                          downloadLink.href = pngFile
                          downloadLink.click()
                        }
                        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
                      }
                    }}
                  >
                    Download QR Code
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Instructions</h3>
                    <ul className="mt-2 list-disc space-y-2 pl-4 text-sm text-muted-foreground">
                      <li>Print and display the QR code in your restaurant</li>
                      <li>Customers can scan the code to view your menu</li>
                      <li>The menu will always show your latest updates</li>
                      <li>Download the QR code as a PNG file</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Menu URL</h4>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/menu`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/menu`)
                          toast({
                            title: 'Copied',
                            description: 'Menu URL copied to clipboard',
                          })
                        }}
                      >
                        <Icons.copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 