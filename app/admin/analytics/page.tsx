"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Area, AreaChart } from 'recharts'
import { getAnalyticsData, AnalyticsData } from '@/lib/analytics'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/modal"
import { Maximize2 } from 'lucide-react'
import { DurationSelector, Duration } from '@/components/analytics/duration-selector'

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

// Format hour for peak hours chart
const formatHour = (hour: number) => {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}${ampm}`
}

interface ExpandableChartProps {
  title: string
  description: string
  children: React.ReactNode
}

function ExpandableChart({ title, description, children }: ExpandableChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Maximize2 className="h-5 w-5 text-gray-500" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 flex items-center justify-center min-h-0">
                <div className="w-full h-full">
                  {children}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [duration, setDuration] = useState<Duration>('30d')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const analyticsData = await getAnalyticsData(duration)
        setData(analyticsData)
      } catch (err) {
        console.error('Error fetching analytics data:', err)
        setError('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [duration])

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <DurationSelector value={duration} onChange={setDuration} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Peak Hours Chart */}
            <ExpandableChart
              title="Peak Hours"
              description="Order distribution throughout the day"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={formatHour} />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') return formatCurrency(value)
                      return value
                    }}
                    labelFormatter={(hour) => `Time: ${formatHour(hour as number)}`}
                  />
                  <Legend />
                  <Bar dataKey="orderCount" name="Orders" fill="#8884d8" />
                  <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </ExpandableChart>

            {/* Category Performance */}
            <ExpandableChart
              title="Category Performance"
              description="Revenue by category"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.categoryPerformance}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ category, revenue }) => 
                      `${category}: ${formatCurrency(revenue)}`
                    }
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </ExpandableChart>

            {/* Customer Growth */}
            <ExpandableChart
              title="Customer Growth"
              description="Daily customer acquisition"
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="totalCustomers" stroke="#8884d8" fill="#8884d8" name="Total Customers" />
                </AreaChart>
              </ResponsiveContainer>
            </ExpandableChart>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="grid gap-4">
            {/* Enhanced Order Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales Performance</CardTitle>
                <CardDescription>Orders, revenue, and average order value trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.orderPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'Revenue' || name === 'Average Order Value') return formatCurrency(value)
                        return value
                      }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="orderCount" name="Orders" stroke="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#82ca9d" />
                    <Line yAxisId="right" type="monotone" dataKey="averageOrderValue" name="Average Order Value" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Popular Items */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Items</CardTitle>
                <CardDescription>Top performing menu items</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.popularItems} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'Revenue') return formatCurrency(value)
                        return value
                      }}
                    />
                    <Legend />
                    <Bar dataKey="orderCount" name="Orders" fill="#8884d8" />
                    <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Details */}
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>Performance metrics by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'Revenue') return formatCurrency(value)
                        return value
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="orderCount" name="Orders" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

