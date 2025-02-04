'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { startOfMonth, subDays, format } from 'date-fns'

export default function DashboardPage() {
  const supabase = createClient()

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const now = new Date()
      const thirtyDaysAgo = subDays(now, 30)
      const startOfCurrentMonth = startOfMonth(now)

      // Fetch all required data in parallel
      const [
        { data: menuItems },
        { data: categories },
        { data: views },
        { data: monthlyViews }
      ] = await Promise.all([
        // Get menu items
        supabase
          .from('menu_items')
          .select('id, name, is_available'),

        // Get categories
        supabase
          .from('categories')
          .select('id, name'),

        // Get views for the last 30 days
        supabase
          .from('menu_item_views')
          .select('menu_item_id, viewed_at')
          .gte('viewed_at', thirtyDaysAgo.toISOString()),

        // Get views for current month
        supabase
          .from('menu_item_views')
          .select('id')
          .gte('viewed_at', startOfCurrentMonth.toISOString())
      ])

      if (!menuItems || !categories || !views || !monthlyViews) {
        throw new Error('Failed to fetch data')
      }

      // Calculate daily views for the chart
      const dailyViews = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(now, 29 - i)
        const dayViews = views.filter(view => {
          const viewDate = new Date(view.viewed_at)
          return viewDate.toDateString() === date.toDateString()
        })
        return {
          date: format(date, 'MMM d'),
          views: dayViews.length
        }
      })

      // Calculate popular items
      const itemViews = menuItems.map(item => ({
        name: item.name,
        views: views.filter(view => view.menu_item_id === item.id).length
      })).sort((a, b) => b.views - a.views)

      return {
        totalViews: monthlyViews.length,
        totalItems: menuItems.length,
        activeItems: menuItems.filter(item => item.is_available).length,
        totalCategories: categories.length,
        dailyViews,
        popularItems: itemViews.slice(0, 5)
      }
    }
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">
          Here's an overview of your restaurant's performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Icons.chart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : dashboardData?.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Menu views this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Icons.list className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : dashboardData?.activeItems.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Active menu items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Icons.list className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : dashboardData?.totalCategories.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Menu categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Codes</CardTitle>
            <Icons.qr className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Active QR codes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[350px] flex items-center justify-center">
                Loading...
              </div>
            ) : dashboardData?.dailyViews.length === 0 ? (
              <div className="h-[350px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-medium">No data yet</p>
                  <p className="text-sm text-muted-foreground">
                    Views will appear here once customers start using your menu
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData?.dailyViews}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading...</div>
            ) : dashboardData?.popularItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium">No data yet</p>
                <p className="text-sm text-muted-foreground">
                  Add menu items to see analytics
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData?.popularItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm truncate flex-1">{item.name}</span>
                    <span className="text-sm font-medium">
                      {item.views.toLocaleString()} views
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 