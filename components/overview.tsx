'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ViewData {
  created_at: string
}

interface OverviewProps {
  data: ViewData[]
}

export function Overview({ data }: OverviewProps) {
  // Process data to get daily views
  const dailyViews = data.reduce((acc: { [key: string]: number }, view) => {
    const date = new Date(view.created_at).toLocaleDateString()
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  // Convert to array format for recharts
  const chartData = Object.entries(dailyViews).map(([date, count]) => ({
    date,
    views: count,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
} 