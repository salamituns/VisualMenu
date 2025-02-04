'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { MenuItemForm } from '@/components/menu/menu-item-form'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardShell } from '@/components/dashboard-shell'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditMenuItemPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const supabase = createClient()

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      return data || []
    },
  })

  // Fetch menu item
  const { data: menuItem, isLoading: menuItemLoading } = useQuery({
    queryKey: ['menuItem', params.id],
    queryFn: async () => {
      const { data: item } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!item) return null

      // Fetch portion sizes
      const { data: portionSizes } = await supabase
        .from('portion_sizes')
        .select('*')
        .eq('menu_item_id', item.id)
        .order('price')

      // Fetch customization options and their choices
      const { data: options } = await supabase
        .from('customization_options')
        .select(`
          *,
          choices:customization_choices(*)
        `)
        .eq('menu_item_id', item.id)
        .order('name')

      return {
        ...item,
        portion_sizes: portionSizes || [],
        customization_options: options?.map(option => ({
          ...option,
          choices: option.choices || [],
        })) || [],
      }
    },
  })

  if (categoriesLoading || menuItemLoading) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Edit Menu Item"
          text="Update your menu item details"
        />
        <div className="grid gap-10">
          <Skeleton className="h-[600px]" />
        </div>
      </DashboardShell>
    )
  }

  if (!menuItem) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Menu Item Not Found"
          text="The menu item you're looking for doesn't exist"
        />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Edit Menu Item"
        text="Update your menu item details"
      />
      <div className="grid gap-10">
        <MenuItemForm
          categories={categories || []}
          initialData={menuItem}
          onSuccess={() => router.push('/dashboard/menu')}
        />
      </div>
    </DashboardShell>
  )
} 