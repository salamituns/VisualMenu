"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BarChart, DollarSign, Users, Utensils, Settings, LogOut } from 'lucide-react'

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState('Main Menu')

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <Link href="/" className="flex items-center space-x-2">
            <Utensils className="h-6 w-6" />
            <span className="text-xl font-bold">MenuViz</span>
          </Link>
        </div>
        <nav className="mt-8">
          <a href="#dashboard" className="flex items-center px-4 py-2 text-gray-700 bg-gray-200">
            <BarChart className="h-5 w-5 mr-2" />
            Dashboard
          </a>
          <a href="#menus" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
            <Utensils className="h-5 w-5 mr-2" />
            Menus
          </a>
          <a href="#analytics" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
            <DollarSign className="h-5 w-5 mr-2" />
            Analytics
          </a>
          <a href="#customers" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
            <Users className="h-5 w-5 mr-2" />
            Customers
          </a>
          <a href="#settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Menus</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 published, 1 draft</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,345</div>
              <p className="text-xs text-muted-foreground">+15% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,234</div>
              <p className="text-xs text-muted-foreground">+180 new customers</p>
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
                <CardDescription>You have 12 new orders today.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
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
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                  Sales Trend Chart Placeholder
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {['Margherita Pizza', 'Chicken Alfredo', 'Caesar Salad'].map((item, i) => (
                    <div key={i} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{item}</p>
                        <p className="text-sm text-muted-foreground">{100 - i * 10} orders</p>
                      </div>
                      <div className="ml-auto font-medium">${(20 - i * 2).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="menus" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>Create and manage your restaurant menus.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="menu-select">Select Menu</Label>
                    <Select value={activeMenu} onValueChange={setActiveMenu}>
                      <SelectTrigger id="menu-select">
                        <SelectValue placeholder="Select a menu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Main Menu">Main Menu</SelectItem>
                        <SelectItem value="Lunch Specials">Lunch Specials</SelectItem>
                        <SelectItem value="Dinner Menu">Dinner Menu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-name">Item Name</Label>
                    <Input id="item-name" placeholder="Enter item name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-description">Item Description</Label>
                    <Textarea id="item-description" placeholder="Enter item description" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-price">Price</Label>
                    <Input id="item-price" placeholder="Enter price" type="number" step="0.01" />
                  </div>
                  <Button>Add Item to Menu</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

