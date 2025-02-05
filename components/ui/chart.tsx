"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie } from 'recharts'
import { ReactElement, JSXElementConstructor } from 'react'

export {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
}

interface ChartContainerProps {
  children: ReactElement<any, string | JSXElementConstructor<any>>
}

export function ChartContainer({ children }: ChartContainerProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      {children}
    </ResponsiveContainer>
  )
}

interface TooltipContentProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    [key: string]: any;
  }>;
  label?: string;
}

export function ChartTooltipContent({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload) return null;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {label}
          </span>
          <span className="font-bold text-muted-foreground">
            {payload[0]?.value}
          </span>
        </div>
      </div>
    </div>
  )
} 