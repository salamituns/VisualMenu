'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { MenuItemForm } from '@/components/menu/menu-item-form'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardShell } from '@/components/dashboard-shell'
import { Skeleton } from '@/components/ui/skeleton'

export default function NewMenuItemPage() {
  const router = useRouter()
  const supabase = createClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      return data || []
    },
  })

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="New Menu Item"
          text="Create a new menu item"
        />
        <div className="grid gap-10">
          <Skeleton className="h-[600px]" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="New Menu Item"
        text="Create a new menu item"
      />
      <div className="grid gap-10">
        <MenuItemForm
          categories={categories || []}
          onSuccess={() => router.push('/dashboard/menu')}
        />
      </div>
    </DashboardShell>
  )
} 