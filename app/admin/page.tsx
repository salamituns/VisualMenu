"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, DollarSign, Users, Utensils } from 'lucide-react'

interface DashboardStats {
  totalRevenue: number;
  activeMenus: number;
  totalOrders: number;
  activeCustomers: number;
}

interface Order {
  total_amount: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeMenus: 0,
    totalOrders: 0,
    activeCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Fetching dashboard statistics...'); // Development logging
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      const supabase = createClient();
      console.log('Supabase client created'); // Development logging

      // Fetch menu items count
      const { count: menuCount, error: menuError } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });
      
      if (menuError) {
        console.error('Error fetching menu items:', menuError);
        throw menuError;
      }
      console.log('Menu items count fetched:', menuCount); // Development logging

      // Fetch orders count and total revenue
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount');
      
      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }
      console.log('Orders data fetched:', orders); // Development logging

      // Calculate total revenue
      const totalRevenue = (orders as Order[] || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

      // Fetch active customers count (from auth.users table)
      const { count: customerCount, error: customersError } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true });
      
      if (customersError) {
        console.error('Error fetching customers:', customersError);
        throw customersError;
      }
      console.log('Customers count fetched:', customerCount); // Development logging

      setStats({
        totalRevenue,
        activeMenus: menuCount || 0,
        totalOrders: orders?.length || 0,
        activeCustomers: customerCount || 0
      });

      console.log('Dashboard stats updated successfully'); // Development logging
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Real-time revenue data</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Menu Items</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMenus}</div>
            <p className="text-xs text-muted-foreground">Total active menu items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Orders processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Real-time revenue data and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                Revenue Chart Placeholder
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest order activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* We'll implement real order data in the next iteration */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Order #{1000 + i}</p>
                      <p className="text-sm text-muted-foreground">2 items - $24.00</p>
                    </div>
                    <div className="ml-auto font-medium">Processing</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                Sales Trend Chart Placeholder
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="menus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>Create and manage your restaurant menus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                Menu Management Content Placeholder
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

