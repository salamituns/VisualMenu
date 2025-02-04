'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface MenuItem {
  id: string
  name: string
  price: number
  views: {
    count: number
  }[]
}

interface MenuItemWithViewCount extends Omit<MenuItem, 'views'> {
  views: {
    count: number
  }
}

export function RecentSales() {
  const supabase = createClient()

  const { data: popularItems } = useQuery<MenuItemWithViewCount[]>({
    queryKey: ['popularItems'],
    queryFn: async () => {
      const { data } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          price,
          views:views(count)
        `)
        .order('views(count)', { ascending: false })
        .limit(5)
      
      return (data as MenuItem[])?.map(item => ({
        ...item,
        views: {
          count: item.views[0]?.count || 0
        }
      })) || []
    },
  })

  return (
    <div className="space-y-8">
      {popularItems?.map((item) => (
        <div key={item.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {item.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              ${item.price.toFixed(2)}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {item.views.count} views
          </div>
        </div>
      ))}
    </div>
  )
} 