import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerData } from '@/lib/analytics'
import { Users, UserPlus, Repeat } from 'lucide-react'

interface CustomerMetricsProps {
  data: CustomerData
}

export function CustomerMetrics({ data }: CustomerMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.newCustomers}</div>
          <p className="text-xs text-muted-foreground">
            First-time customers in this period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalCustomers}</div>
          <p className="text-xs text-muted-foreground">
            Customers who placed orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Repeat Rate</CardTitle>
          <Repeat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.repeatRate.toFixed(1)}%</div>
          <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${data.repeatRate}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Customers who ordered more than once
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 