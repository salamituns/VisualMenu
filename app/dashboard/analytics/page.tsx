'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts'
import { useState } from 'react'
import { addDays, format, subDays, startOfDay, endOfDay } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Add color constants
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']

interface TimeViewData {
  date: string
  views: number
  previousViews: number
}

interface AnalyticsData {
  totalViews: number
  totalItems: number
  activeItems: number
  popularItems: {
    name: string
    views: number
  }[]
  categoryDistribution: {
    name: string
    count: number
    percentage: number
  }[]
  timeViews: TimeViewData[]
  viewsChange: number
}

type TimePeriod = '7days' | '30days' | '90days'

// Add custom tooltip component for the pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-2 shadow-lg rounded-lg border">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {data.count} items ({data.percentage.toFixed(1)}%)
        </p>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7days')
  const supabase = createClient()

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics-overview', timePeriod],
    queryFn: async () => {
      // Get date ranges
      const now = new Date()
      const periodDays = timePeriod === '7days' ? 7 : timePeriod === '30days' ? 30 : 90
      const startDate = startOfDay(subDays(now, periodDays))
      const endDate = endOfDay(now)
      const previousStartDate = startOfDay(subDays(startDate, periodDays))

      // Get menu items and categories
      const [menuItemsResult, categoriesResult, viewsResult, previousViewsResult] = await Promise.all([
        supabase.from('menu_items').select('id, name, is_available, category_id'),
        supabase.from('categories').select('id, name'),
        supabase.from('menu_item_views')
          .select('menu_item_id, viewed_at')
          .gte('viewed_at', startDate.toISOString())
          .lte('viewed_at', endDate.toISOString()),
        supabase.from('menu_item_views')
          .select('menu_item_id, viewed_at')
          .gte('viewed_at', previousStartDate.toISOString())
          .lt('viewed_at', startDate.toISOString())
      ])

      if (menuItemsResult.error) throw menuItemsResult.error
      if (categoriesResult.error) throw categoriesResult.error
      if (viewsResult.error) throw viewsResult.error
      if (previousViewsResult.error) throw previousViewsResult.error

      const menuItems = menuItemsResult.data
      const categories = categoriesResult.data
      const views = viewsResult.data
      const previousViews = previousViewsResult.data

      // Calculate metrics
      const totalItems = menuItems.length
      const activeItems = menuItems.filter(item => item.is_available).length
      const totalViews = views.length
      const previousTotalViews = previousViews.length
      const viewsChange = previousTotalViews === 0 
        ? 100 
        : ((totalViews - previousTotalViews) / previousTotalViews) * 100

      // Calculate popular items
      const itemViews = menuItems.map(item => ({
        name: item.name,
        views: views.filter(v => v.menu_item_id === item.id).length
      })).sort((a, b) => b.views - a.views).slice(0, 5)

      // Calculate category distribution
      const categoryMap = new Map(categories.map(c => [c.id, c.name]))
      const categoryCount = menuItems.reduce((acc, item) => {
        if (!item.category_id) return acc
        const count = acc.get(item.category_id) || 0
        acc.set(item.category_id, count + 1)
        return acc
      }, new Map<string, number>())

      const categoryDistribution = Array.from(categoryCount.entries()).map(([id, count]) => ({
        name: categoryMap.get(id) || 'Uncategorized',
        count
      }))

      const totalCategoryItems = categoryDistribution.reduce((sum, cat) => sum + cat.count, 0)
      const categoryDistributionWithPercentage = categoryDistribution.map(cat => ({
        ...cat,
        percentage: (cat.count / totalCategoryItems) * 100
      }))

      // Calculate time-based views
      const timeViews: TimeViewData[] = []
      for (let i = 0; i < periodDays; i++) {
        const date = subDays(now, periodDays - 1 - i)
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)
        const dayViews = views.filter(v => {
          const viewDate = new Date(v.viewed_at)
          return viewDate >= dayStart && viewDate <= dayEnd
        }).length
        const previousDayViews = previousViews.filter(v => {
          const viewDate = new Date(v.viewed_at)
          return viewDate >= startOfDay(subDays(date, periodDays)) && 
                 viewDate <= endOfDay(subDays(date, periodDays))
        }).length

        timeViews.push({
          date: format(date, 'MMM d'),
          views: dayViews,
          previousViews: previousDayViews
        })
      }

      return {
        totalViews,
        totalItems,
        activeItems,
        popularItems: itemViews,
        categoryDistribution: categoryDistributionWithPercentage,
        timeViews,
        viewsChange
      } as AnalyticsData
    }
  })

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load analytics data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Overview</h1>
        <Select
          value={timePeriod}
          onValueChange={(value) => setTimePeriod(value as TimePeriod)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Icons.chart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics?.totalViews.toLocaleString()}</div>
                <p className={`text-xs ${(analytics?.viewsChange ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(analytics?.viewsChange ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(analytics?.viewsChange ?? 0).toFixed(1)}%
                  <span className="text-muted-foreground"> vs previous period</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Icons.list className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{analytics?.totalItems.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Icons.check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{analytics?.activeItems.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Icons.list className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {analytics?.categoryDistribution.length.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics?.popularItems}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Views', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="views"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Items List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {analytics?.popularItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="font-medium">{item.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics?.categoryDistribution}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {analytics?.categoryDistribution.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analytics?.categoryDistribution.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                          <span className="truncate">{category.name}</span>
                        </div>
                        <div className="flex gap-2 text-muted-foreground">
                          <span>{category.count} items</span>
                          <span>({category.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Views Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-[250px] w-full" />
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analytics?.timeViews}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Views', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Current Period"
                  />
                  <Line
                    type="monotone"
                    dataKey="previousViews"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Previous Period"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 