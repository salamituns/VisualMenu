import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type Duration = '24h' | '7d' | '30d' | '90d' | '1y' | 'all'

interface DurationSelectorProps {
  value: Duration
  onChange: (value: Duration) => void
}

export function DurationSelector({ value, onChange }: DurationSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select duration" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="24h">Last 24 Hours</SelectItem>
        <SelectItem value="7d">Last 7 Days</SelectItem>
        <SelectItem value="30d">Last 30 Days</SelectItem>
        <SelectItem value="90d">Last 90 Days</SelectItem>
        <SelectItem value="1y">Last Year</SelectItem>
        <SelectItem value="all">All Time</SelectItem>
      </SelectContent>
    </Select>
  )
} 