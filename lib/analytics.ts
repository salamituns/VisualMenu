import { createClient } from '@/lib/supabase/client'

export type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all'

interface AnalyticsSummaryData {
  total_revenue: number
  total_orders: number
  active_menu_items: number
  average_order_value: number
}

export interface AnalyticsSummary {
  revenue: {
    total: number
    change: number
  }
  orders: {
    total: number
    change: number
  }
  menuItems: {
    total: number
    change: number
  }
  averageOrderValue: {
    value: number
    change: number
  }
}

export interface SalesData {
  date: string
  revenue: number
  orders: number
}

export interface MenuItemPerformance {
  id: string
  name: string
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
}

export interface CustomerData {
  newCustomers: number
  totalCustomers: number
  repeatRate: number
}

function getStartDate(timeRange: TimeRange): Date {
  const now = new Date()
  switch (timeRange) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case 'all':
      return new Date(0)
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
}

export async function getAnalyticsSummary(timeRange: TimeRange): Promise<AnalyticsSummary> {
  const supabase = createClient()
  const startDate = getStartDate(timeRange)
  
  try {
    // Get current period data
    const { data: currentData, error: currentError } = await supabase
      .rpc('get_analytics_summary', {
        start_date: startDate.toISOString()
      })
      .returns<AnalyticsSummaryData>()

    if (currentError) throw currentError

    // Get previous period data for comparison
    const previousStartDate = new Date(startDate.getTime() - (startDate.getTime() - new Date(0).getTime()))
    const { data: previousData, error: previousError } = await supabase
      .rpc('get_analytics_summary', {
        start_date: previousStartDate.toISOString()
      })
      .returns<AnalyticsSummaryData>()

    if (previousError) throw previousError

    // Calculate changes
    const calculateChange = (current: number, previous: number) => 
      previous === 0 ? 0 : ((current - previous) / previous) * 100

    return {
      revenue: {
        total: currentData?.total_revenue || 0,
        change: calculateChange(
          currentData?.total_revenue || 0,
          previousData?.total_revenue || 0
        )
      },
      orders: {
        total: currentData?.total_orders || 0,
        change: calculateChange(
          currentData?.total_orders || 0,
          previousData?.total_orders || 0
        )
      },
      menuItems: {
        total: currentData?.active_menu_items || 0,
        change: calculateChange(
          currentData?.active_menu_items || 0,
          previousData?.active_menu_items || 0
        )
      },
      averageOrderValue: {
        value: currentData?.average_order_value || 0,
        change: calculateChange(
          currentData?.average_order_value || 0,
          previousData?.average_order_value || 0
        )
      }
    }
  } catch (error) {
    console.error('Error fetching analytics summary:', error)
    throw error
  }
}

export async function getSalesData(timeRange: TimeRange): Promise<SalesData[]> {
  const supabase = createClient()
  const startDate = getStartDate(timeRange)

  try {
    const { data, error } = await supabase
      .rpc('get_sales_data', {
        start_date: startDate.toISOString()
      })
      .returns<SalesData[]>()

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching sales data:', error)
    throw error
  }
}

export async function getMenuItemPerformance(timeRange: TimeRange): Promise<MenuItemPerformance[]> {
  const supabase = createClient()
  const startDate = getStartDate(timeRange)

  try {
    const { data, error } = await supabase
      .rpc('get_menu_item_performance', {
        start_date: startDate.toISOString()
      })
      .returns<MenuItemPerformance[]>()

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching menu item performance:', error)
    throw error
  }
}

export async function getCustomerData(timeRange: TimeRange): Promise<CustomerData> {
  const supabase = createClient()
  const startDate = getStartDate(timeRange)

  try {
    const { data, error } = await supabase
      .rpc('get_customer_data', {
        start_date: startDate.toISOString()
      })
      .returns<CustomerData>()

    if (error) throw error

    return data || {
      newCustomers: 0,
      totalCustomers: 0,
      repeatRate: 0
    }
  } catch (error) {
    console.error('Error fetching customer data:', error)
    throw error
  }
} 