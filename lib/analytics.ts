import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

export interface AnalyticsData {
  popularItems: {
    name: string
    orderCount: number
    revenue: number
  }[]
  orderPatterns: {
    date: string
    orderCount: number
    revenue: number
    itemsSold: number
    averageOrderValue: number
  }[]
  customerGrowth: {
    date: string
    newCustomers: number
    totalCustomers: number
  }[]
  peakHours: {
    hour: number
    orderCount: number
    revenue: number
    itemsSold: number
  }[]
  categoryPerformance: {
    category: string
    orderCount: number
    revenue: number
    itemsSold: number
  }[]
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const supabase = createClient()

  try {
    // Get popular items
    const { data: popularItems, error: popularItemsError } = await supabase
      .from('orders')
      .select(`
        id,
        quantity,
        menu_item:menu_item_id (
          name,
          price
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (popularItemsError) throw popularItemsError

    // Get daily order patterns
    const { data: orderPatterns, error: orderPatternsError } = await supabase
      .rpc('get_daily_order_patterns', {
        days_ago: 30
      })

    if (orderPatternsError) throw orderPatternsError

    // Get customer growth
    const { data: customerGrowth, error: customerGrowthError } = await supabase
      .from('customers')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (customerGrowthError) throw customerGrowthError

    // Get peak hours analysis
    const { data: peakHours, error: peakHoursError } = await supabase
      .rpc('get_peak_hours')

    if (peakHoursError) throw peakHoursError

    // Get category performance
    const { data: categoryPerformance, error: categoryError } = await supabase
      .rpc('get_category_performance')

    if (categoryError) throw categoryError

    // Process the data
    const processedPopularItems = processPopularItems(popularItems || [])
    const processedOrderPatterns = processOrderPatterns(orderPatterns || [])
    const processedCustomerGrowth = processCustomerGrowth(customerGrowth || [])
    const processedPeakHours = processPeakHours(peakHours || [])
    const processedCategories = processCategories(categoryPerformance || [])

    return {
      popularItems: processedPopularItems,
      orderPatterns: processedOrderPatterns,
      customerGrowth: processedCustomerGrowth,
      peakHours: processedPeakHours,
      categoryPerformance: processedCategories
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    throw error
  }
}

function processPopularItems(items: any[]): AnalyticsData['popularItems'] {
  const itemStats = items.reduce((acc: Record<string, { count: number; revenue: number }>, order) => {
    if (!order.menu_item) return acc

    const itemName = order.menu_item.name
    const price = order.menu_item.price
    const quantity = order.quantity

    if (!acc[itemName]) {
      acc[itemName] = { count: 0, revenue: 0 }
    }

    acc[itemName].count += quantity
    acc[itemName].revenue += price * quantity

    return acc
  }, {})

  return Object.entries(itemStats)
    .map(([name, { count, revenue }]) => ({
      name,
      orderCount: count,
      revenue
    }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 10)
}

function processOrderPatterns(patterns: any[]): AnalyticsData['orderPatterns'] {
  return patterns.map(pattern => ({
    date: pattern.date,
    orderCount: pattern.total_orders,
    revenue: pattern.daily_revenue,
    itemsSold: pattern.items_sold,
    averageOrderValue: pattern.average_order_value
  }))
}

function processCustomerGrowth(customers: any[]): AnalyticsData['customerGrowth'] {
  const dailyCustomers = customers.reduce((acc: Record<string, { new: number }>, customer) => {
    const date = new Date(customer.created_at).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { new: 0 }
    }
    acc[date].new += 1
    return acc
  }, {})

  let totalCustomers = 0
  return Object.entries(dailyCustomers)
    .map(([date, { new: newCustomers }]) => {
      totalCustomers += newCustomers
      return {
        date,
        newCustomers,
        totalCustomers
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

function processPeakHours(hours: any[]): AnalyticsData['peakHours'] {
  return hours.map(hour => ({
    hour: hour.hour_of_day,
    orderCount: hour.total_orders,
    revenue: hour.revenue,
    itemsSold: hour.items_sold
  }))
}

function processCategories(categories: any[]): AnalyticsData['categoryPerformance'] {
  return categories.map(category => ({
    category: category.category,
    orderCount: category.total_orders,
    revenue: category.revenue,
    itemsSold: category.items_sold
  }))
} 