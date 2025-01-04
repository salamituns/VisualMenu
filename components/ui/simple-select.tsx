import * as React from "react"
import { cn } from "@/lib/utils"

export interface SimpleSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  options: { value: string; label: string }[]
  value?: string | null
}

const SimpleSelect = React.forwardRef<HTMLSelectElement, SimpleSelectProps>(
  ({ className, options, value, ...props }, ref) => {
    return (
      <select
        ref={ref}
        value={value || ''}
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    )
  }
)
SimpleSelect.displayName = "SimpleSelect"

export { SimpleSelect } 