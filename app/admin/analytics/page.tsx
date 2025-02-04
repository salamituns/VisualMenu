'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { TimeRange, getAnalyticsSummary, getSalesData, getMenuItemPerformance, getCustomerData } from '@/lib/analytics'
import { SalesChart } from '@/components/analytics/sales-chart'
import { MenuItemsPerformance } from '@/components/analytics/menu-items-performance'
import { CustomerMetrics } from '@/components/analytics/customer-metrics'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    summary: Awaited<ReturnType<typeof getAnalyticsSummary>> | null
    sales: Awaited<ReturnType<typeof getSalesData>> | null
    menuItems: Awaited<ReturnType<typeof getMenuItemPerformance>> | null
    customers: Awaited<ReturnType<typeof getCustomerData>> | null
  }>({
    summary: null,
    sales: null,
    menuItems: null,
    customers: null
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        console.log('Loading analytics data for time range:', timeRange)

        const [summary, sales, menuItems, customers] = await Promise.all([
          getAnalyticsSummary(timeRange),
          getSalesData(timeRange),
          getMenuItemPerformance(timeRange),
          getCustomerData(timeRange)
        ])

        console.log('Successfully loaded analytics data')
        setData({ summary, sales, menuItems, customers })
      } catch (err) {
        console.error('Error loading analytics data:', err)
        setError('Failed to load analytics data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl mt-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const { summary, sales, menuItems, customers } = data

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                {summary?.revenue.change !== undefined && (
                  <span className={`text-xs ${summary.revenue.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {summary.revenue.change.toFixed(1)}%
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary?.revenue.total.toFixed(2) || '0.00'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                {summary?.orders.change !== undefined && (
                  <span className={`text-xs ${summary.orders.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {summary.orders.change.toFixed(1)}%
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.orders.total || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Menu Items</CardTitle>
                {summary?.menuItems.change !== undefined && (
                  <span className={`text-xs ${summary.menuItems.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {summary.menuItems.change.toFixed(1)}%
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.menuItems.total || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                {summary?.averageOrderValue.change !== undefined && (
                  <span className={`text-xs ${summary.averageOrderValue.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {summary.averageOrderValue.change.toFixed(1)}%
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary?.averageOrderValue.value.toFixed(2) || '0.00'}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <SalesChart data={sales || []} />
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <MenuItemsPerformance data={menuItems || []} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <CustomerMetrics data={customers || { newCustomers: 0, totalCustomers: 0, repeatRate: 0 }} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
