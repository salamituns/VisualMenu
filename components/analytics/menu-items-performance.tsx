import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MenuItemPerformance } from '@/lib/analytics'

interface MenuItemsPerformanceProps {
  data: MenuItemPerformance[]
}

export function MenuItemsPerformance({ data }: MenuItemsPerformanceProps) {
  // Sort items by total revenue in descending order
  const sortedItems = [...data].sort((a, b) => b.totalRevenue - a.totalRevenue)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu Item Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedItems.map(item => {
            // Calculate the percentage of revenue this item contributes
            const totalRevenue = data.reduce((sum, i) => sum + i.totalRevenue, 0)
            const revenuePercentage = totalRevenue > 0
              ? ((item.totalRevenue / totalRevenue) * 100).toFixed(1)
              : '0'

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.totalOrders} orders · ${item.totalRevenue.toFixed(2)} revenue
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${item.averageOrderValue.toFixed(2)} avg
                  </div>
                </div>
                <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary rounded-full"
                    style={{ width: `${revenuePercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {revenuePercentage}% of total revenue
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 